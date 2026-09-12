<?php

namespace Tests\Feature;

use App\Enums\TenantRole;
use App\Enums\WhatsappMessageDirection;
use App\Enums\WhatsappMessageStatus;
use App\Jobs\ProcessIncomingWhatsappMessage;
use App\Jobs\SendWhatsappMessage;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WebhookLog;
use App\Models\WhatsappConversation;
use App\Models\WhatsappDevice;
use App\Models\WhatsappMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WhatsappInboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_inbox_lists_only_the_current_tenant_conversations(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $conversation = WhatsappConversation::factory()->for($tenant)->create();
        WhatsappConversation::factory()->for(Tenant::factory())->create();

        $this->actingAs($owner)
            ->get(route('inbox.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inbox/index')
                ->where('conversationCount', 1)
                ->has('devices', 1)
                ->has('conversations', 1)
                ->where('conversations.0.ulid', $conversation->ulid),
            );
    }

    public function test_users_cannot_view_other_tenants_conversations(): void
    {
        [, $owner] = $this->createTenantOwner();
        $otherConversation = WhatsappConversation::factory()->for(Tenant::factory())->create();

        $this->actingAs($owner)
            ->get(route('inbox.show', $otherConversation))
            ->assertForbidden();
    }

    public function test_users_can_view_their_own_conversation_thread(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $conversation = WhatsappConversation::factory()->for($tenant)->create();
        $message = WhatsappMessage::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => WhatsappMessageDirection::Inbound,
            'status' => WhatsappMessageStatus::Received,
            'body' => 'Hello from customer',
            'kind' => 'text',
        ]);
        $reply = WhatsappMessage::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => WhatsappMessageDirection::Outbound,
            'status' => WhatsappMessageStatus::Sent,
            'body' => 'Hello from the bot',
            'kind' => 'text',
            'metadata' => [
                'source' => 'bot_rule',
            ],
        ]);

        $this->actingAs($owner)
            ->get(route('inbox.show', $conversation))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inbox/show')
                ->where('conversation.ulid', $conversation->ulid)
                ->has('conversations', 1)
                ->has('messages', 2)
                ->where('messages.0.ulid', $message->ulid)
                ->where('messages.1.ulid', $reply->ulid),
            );
    }

    public function test_users_can_queue_text_replies_from_the_inbox(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $conversation = WhatsappConversation::factory()->for($tenant)->create();

        Bus::fake();

        $this->actingAs($owner)
            ->post(route('conversations.messages.store', $conversation), [
                'body' => 'Thanks for reaching out.',
            ])
            ->assertRedirect();

        $message = WhatsappMessage::query()
            ->where('whatsapp_conversation_id', $conversation->id)
            ->where('tenant_id', $tenant->id)
            ->where('direction', WhatsappMessageDirection::Outbound)
            ->where('status', WhatsappMessageStatus::Queued)
            ->where('body', 'Thanks for reaching out.')
            ->firstOrFail();

        Bus::assertDispatched(SendWhatsappMessage::class, function (SendWhatsappMessage $job) use ($message): bool {
            return $job->whatsappMessageId === $message->id;
        });
    }

    public function test_users_can_queue_media_replies_from_the_inbox(): void
    {
        Storage::fake('public');

        [$tenant, $owner] = $this->createTenantOwner();
        $conversation = WhatsappConversation::factory()->for($tenant)->create();

        Bus::fake();

        $this->actingAs($owner)
            ->post(route('conversations.messages.store', $conversation), [
                'body' => null,
                'media_type' => 'document',
                'media' => UploadedFile::fake()->create(
                    'brochure.pdf',
                    120,
                    'application/pdf',
                ),
            ])
            ->assertRedirect();

        $message = WhatsappMessage::query()
            ->where('whatsapp_conversation_id', $conversation->id)
            ->where('tenant_id', $tenant->id)
            ->where('direction', WhatsappMessageDirection::Outbound)
            ->where('status', WhatsappMessageStatus::Queued)
            ->where('kind', 'document')
            ->firstOrFail();

        Storage::disk('public')->assertExists($message->media_path);

        $this->assertSame('brochure.pdf', $message->media_original_name);
        $this->assertSame('application/pdf', $message->media_mime_type);
        $this->assertNotNull($message->media_size);

        Bus::assertDispatched(SendWhatsappMessage::class, function (SendWhatsappMessage $job) use ($message): bool {
            return $job->whatsappMessageId === $message->id;
        });
    }

    public function test_failed_messages_can_be_retried(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $conversation = WhatsappConversation::factory()->for($tenant)->create();
        $message = WhatsappMessage::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => WhatsappMessageDirection::Outbound,
            'status' => WhatsappMessageStatus::Failed,
            'body' => 'Retry me',
            'error_message' => 'Temporary gateway error',
        ]);

        Bus::fake();

        $this->actingAs($owner)
            ->post(route('messages.retry', $message))
            ->assertRedirect();

        $message->refresh();

        $this->assertSame(WhatsappMessageStatus::Queued, $message->status);
        $this->assertNull($message->failed_at);
        $this->assertNull($message->error_message);

        Bus::assertDispatched(SendWhatsappMessage::class, function (SendWhatsappMessage $job) use ($message): bool {
            return $job->whatsappMessageId === $message->id;
        });
    }

    public function test_incoming_media_payloads_are_recognized(): void
    {
        $tenant = Tenant::factory()->create();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'gowa_device_id' => 'dev_testmedia01',
        ]);
        $payload = [
            'event' => 'message.received',
            'device_id' => $device->gowa_device_id,
            'message' => [
                'id' => 'msg-media-001',
                'from' => '08123456789',
                'type' => 'image',
                'media' => [
                    'url' => 'https://cdn.example.test/photo.jpg',
                    'name' => 'photo.jpg',
                    'mime_type' => 'image/jpeg',
                    'size' => 4242,
                ],
            ],
            'contact' => [
                'id' => '08123456789',
                'name' => 'Customer',
                'phone_number' => '08123456789',
            ],
        ];

        $log = WebhookLog::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'payload' => $payload,
            'sanitized_payload' => $payload,
        ]);

        app()->call([new ProcessIncomingWhatsappMessage($log->id), 'handle']);

        $this->assertDatabaseHas('whatsapp_messages', [
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'external_message_id' => 'msg-media-001',
            'direction' => WhatsappMessageDirection::Inbound->value,
            'kind' => 'image',
            'body' => null,
            'media_path' => 'https://cdn.example.test/photo.jpg',
            'media_original_name' => 'photo.jpg',
            'media_mime_type' => 'image/jpeg',
            'media_size' => 4242,
            'status' => WhatsappMessageStatus::Received->value,
        ]);
    }

    /**
     * @return array{0: Tenant, 1: User}
     */
    private function createTenantOwner(): array
    {
        $tenant = Tenant::factory()->create();

        $user = User::factory()->create([
            'current_tenant_id' => $tenant->id,
        ]);

        $tenant->users()->attach($user->id, [
            'role' => TenantRole::Owner->value,
        ]);

        return [$tenant, $user];
    }
}
