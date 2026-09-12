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
use App\Models\WhatsappContact;
use App\Models\WhatsappConversation;
use App\Models\WhatsappDevice;
use App\Models\WhatsappMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WhatsappMessagingTest extends TestCase
{
    use RefreshDatabase;

    public function test_invalid_webhook_signatures_are_rejected(): void
    {
        Config::set('services.gowa.webhook_secret', 'test-secret');

        $payload = $this->webhookPayload('dev_missing', 'msg-001');

        $this->withHeader('X-Gowa-Signature', 'invalid-signature')
            ->postJson(route('gowa.webhooks.store', absolute: false), $payload)
            ->assertUnauthorized();

        $this->assertDatabaseCount('webhook_logs', 0);
    }

    public function test_unknown_devices_are_handled_safely(): void
    {
        Config::set('services.gowa.webhook_secret', 'test-secret');
        Bus::fake();

        $payload = $this->webhookPayload('dev_missing', 'msg-002');

        $this->withHeader('Authorization', 'Bearer secret-token')
            ->withHeader('X-Gowa-Signature', $this->webhookSignature($payload))
            ->postJson(route('gowa.webhooks.store', absolute: false), $payload)
            ->assertAccepted();

        $webhookLog = WebhookLog::query()->firstOrFail();

        $this->assertSame(['[redacted]'], $webhookLog->headers['authorization'] ?? null);
        $this->assertSame(['[redacted]'], $webhookLog->headers['x-gowa-signature'] ?? null);

        $this->assertDatabaseHas('webhook_logs', [
            'status' => 'unknown_device',
            'tenant_id' => null,
            'whatsapp_device_id' => null,
        ]);

        Bus::assertNotDispatched(ProcessIncomingWhatsappMessage::class);
    }

    public function test_webhooks_are_rate_limited_after_the_configured_limit(): void
    {
        Config::set('services.gowa.webhook_secret', 'test-secret');
        Config::set('services.gowa.webhook_rate_limit', 1);

        $payload = $this->webhookPayload('dev_missing', 'msg-rate-limit');
        $signature = $this->webhookSignature($payload);

        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->withHeader('X-Gowa-Signature', $signature)
            ->postJson(route('gowa.webhooks.store', absolute: false), $payload)
            ->assertAccepted();

        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->withHeader('X-Gowa-Signature', $signature)
            ->postJson(route('gowa.webhooks.store', absolute: false), $payload)
            ->assertTooManyRequests();

        $this->assertDatabaseCount('webhook_logs', 1);
    }

    public function test_incoming_messages_are_stored_once(): void
    {
        Config::set('services.gowa.webhook_secret', 'test-secret');

        $tenant = Tenant::factory()->create();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'gowa_device_id' => 'dev_test0001',
        ]);

        $payload = $this->webhookPayload($device->gowa_device_id, 'msg-duplicate', 'Contact One', '08123456789', 'Incoming hello');

        $firstLog = WebhookLog::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'event_type' => 'message.received',
            'payload' => $payload,
            'sanitized_payload' => $payload,
        ]);

        $secondLog = WebhookLog::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'event_type' => 'message.received',
            'payload' => $payload,
            'sanitized_payload' => $payload,
        ]);

        app()->call([new ProcessIncomingWhatsappMessage($firstLog->id), 'handle']);
        app()->call([new ProcessIncomingWhatsappMessage($secondLog->id), 'handle']);

        $this->assertDatabaseCount('whatsapp_messages', 1);
        $this->assertDatabaseHas('whatsapp_messages', [
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'external_message_id' => 'msg-duplicate',
            'direction' => WhatsappMessageDirection::Inbound->value,
            'status' => WhatsappMessageStatus::Received->value,
            'body' => 'Incoming hello',
        ]);

        $this->assertDatabaseHas('webhook_logs', [
            'id' => $firstLog->id,
            'status' => 'processed',
        ]);

        $this->assertDatabaseHas('webhook_logs', [
            'id' => $secondLog->id,
            'status' => 'duplicate',
        ]);
    }

    public function test_gowa_v9_message_webhooks_are_verified_and_stored(): void
    {
        Config::set('services.gowa.webhook_secret', 'test-secret');
        Config::set('queue.default', 'sync');

        $tenant = Tenant::factory()->create();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'gowa_device_id' => 'dev_gowa_v9',
        ]);
        $payload = [
            'event' => 'message',
            'device_id' => $device->gowa_device_id,
            'payload' => [
                'id' => 'gowa-v9-message',
                'chat_id' => '628123456789@s.whatsapp.net',
                'from' => '628123456789@s.whatsapp.net',
                'from_name' => 'GOWA Contact',
                'timestamp' => '2026-07-31T08:36:23Z',
                'is_from_me' => false,
                'body' => 'Halo dari GOWA v9',
            ],
        ];

        $this->withHeader('X-Hub-Signature-256', 'sha256='.$this->webhookSignature($payload))
            ->postJson(route('gowa.webhooks.store', absolute: false), $payload)
            ->assertAccepted();

        $this->assertDatabaseHas('whatsapp_contacts', [
            'tenant_id' => $tenant->id,
            'external_id' => '628123456789@s.whatsapp.net',
            'display_name' => 'GOWA Contact',
            'phone_number' => '628123456789',
        ]);
        $this->assertDatabaseHas('whatsapp_messages', [
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'external_message_id' => 'gowa-v9-message',
            'direction' => WhatsappMessageDirection::Inbound->value,
            'status' => WhatsappMessageStatus::Received->value,
            'body' => 'Halo dari GOWA v9',
        ]);
        $this->assertDatabaseHas('webhook_logs', [
            'event_type' => 'message',
            'status' => 'processed',
        ]);
    }

    public function test_non_message_webhooks_are_logged_without_dispatching_message_processing(): void
    {
        Config::set('services.gowa.webhook_secret', 'test-secret');
        Bus::fake();

        $tenant = Tenant::factory()->create();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'gowa_device_id' => 'dev_presence',
        ]);
        $payload = [
            'event' => 'chat_presence',
            'device_id' => $device->gowa_device_id,
            'payload' => [
                'chat_id' => '628123456789@s.whatsapp.net',
                'state' => 'composing',
            ],
        ];

        $this->withHeader('X-Hub-Signature-256', 'sha256='.$this->webhookSignature($payload))
            ->postJson(route('gowa.webhooks.store', absolute: false), $payload)
            ->assertAccepted();

        $this->assertDatabaseHas('webhook_logs', [
            'whatsapp_device_id' => $device->id,
            'event_type' => 'chat_presence',
            'status' => 'ignored_event',
        ]);
        $this->assertNotNull(WebhookLog::query()->firstOrFail()->processed_at);
        Bus::assertNotDispatched(ProcessIncomingWhatsappMessage::class);
    }

    public function test_queued_text_messages_are_sent_to_gowa(): void
    {
        Config::set('services.gowa.base_url', 'http://gowa.test');
        Config::set('services.gowa.username', null);
        Config::set('services.gowa.password', null);
        Http::preventStrayRequests();
        Http::fake([
            'http://gowa.test/send/message' => Http::response([
                'results' => [
                    'message_id' => 'gowa-sent-message',
                ],
            ]),
        ]);

        $tenant = Tenant::factory()->create();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'gowa_device_id' => 'dev_sender',
        ]);
        $contact = WhatsappContact::factory()->for($tenant)->create([
            'external_id' => '628123456789@s.whatsapp.net',
        ]);
        $conversation = WhatsappConversation::factory()->for($tenant)->create([
            'whatsapp_device_id' => $device->id,
            'whatsapp_contact_id' => $contact->id,
        ]);
        $message = WhatsappMessage::factory()->for($tenant)->create([
            'whatsapp_device_id' => $device->id,
            'whatsapp_contact_id' => $contact->id,
            'whatsapp_conversation_id' => $conversation->id,
            'external_message_id' => null,
            'status' => WhatsappMessageStatus::Queued,
            'body' => 'Balasan otomatis',
        ]);

        app()->call([new SendWhatsappMessage($message->id), 'handle']);

        Http::assertSent(function (Request $request) use ($device): bool {
            return $request->url() === 'http://gowa.test/send/message'
                && $request->hasHeader('X-Device-Id', $device->gowa_device_id)
                && $request['phone'] === '628123456789@s.whatsapp.net'
                && $request['message'] === 'Balasan otomatis';
        });
        $this->assertDatabaseHas('whatsapp_messages', [
            'id' => $message->id,
            'external_message_id' => 'gowa-sent-message',
            'status' => WhatsappMessageStatus::Sent->value,
        ]);
    }

    public function test_outgoing_messages_are_queued_and_tenant_scoped(): void
    {
        $tenant = Tenant::factory()->create();
        [$ownerTenant, $owner] = $this->createTenantOwner($tenant);
        $conversation = WhatsappConversation::factory()->for($tenant)->create();

        Bus::fake();

        $this->actingAs($owner)
            ->post(route('conversations.messages.store', $conversation, absolute: false), [
                'body' => 'Hello team',
            ])
            ->assertRedirect();

        $message = WhatsappMessage::query()
            ->where('whatsapp_conversation_id', $conversation->id)
            ->where('direction', WhatsappMessageDirection::Outbound)
            ->where('status', WhatsappMessageStatus::Queued)
            ->where('body', 'Hello team')
            ->firstOrFail();

        Bus::assertDispatched(SendWhatsappMessage::class, function (SendWhatsappMessage $job) use ($message): bool {
            return $job->whatsappMessageId === $message->id;
        });
    }

    public function test_users_cannot_queue_messages_for_other_tenants(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $otherConversation = WhatsappConversation::factory()->for(Tenant::factory())->create();

        $this->actingAs($owner)
            ->post(route('conversations.messages.store', $otherConversation, absolute: false), [
                'body' => 'Blocked',
            ])
            ->assertForbidden();
    }

    public function test_media_validation_rejects_unsupported_file_types(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $conversation = WhatsappConversation::factory()->for($tenant)->create();

        $this->actingAs($owner)
            ->post(route('conversations.messages.store', $conversation, absolute: false), [
                'body' => null,
                'media_type' => 'document',
                'media' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
            ])
            ->assertSessionHasErrors(['media']);

        $this->assertDatabaseCount('whatsapp_messages', 0);
    }

    /**
     * @return array{0: Tenant, 1: User}
     */
    private function createTenantOwner(?Tenant $tenant = null): array
    {
        $tenant ??= Tenant::factory()->create();

        $user = User::factory()->create([
            'current_tenant_id' => $tenant->id,
        ]);

        $tenant->users()->attach($user->id, [
            'role' => TenantRole::Owner->value,
        ]);

        return [$tenant, $user];
    }

    /**
     * Build a webhook payload for the fake GOWA endpoint.
     *
     * @return array<string, mixed>
     */
    private function webhookPayload(
        string $deviceId,
        string $messageId,
        string $contactName = 'Test Contact',
        string $phoneNumber = '08123456789',
        ?string $body = 'Hello'
    ): array {
        return [
            'event' => 'message.received',
            'device_id' => $deviceId,
            'message' => [
                'id' => $messageId,
                'from' => $phoneNumber,
                'body' => $body,
            ],
            'contact' => [
                'id' => $phoneNumber,
                'name' => $contactName,
                'phone_number' => $phoneNumber,
            ],
        ];
    }

    /**
     * Compute the webhook signature for the configured secret.
     *
     * @param  array<string, mixed>  $payload
     */
    private function webhookSignature(array $payload): string
    {
        return hash_hmac('sha256', json_encode($payload), (string) Config::get('services.gowa.webhook_secret'));
    }
}
