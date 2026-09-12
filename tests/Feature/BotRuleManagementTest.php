<?php

namespace Tests\Feature;

use App\Enums\BotRuleMatchType;
use App\Enums\GlobalRole;
use App\Enums\TenantRole;
use App\Enums\WhatsappMessageDirection;
use App\Enums\WhatsappMessageStatus;
use App\Jobs\ProcessIncomingWhatsappMessage;
use App\Jobs\SendWhatsappMessage;
use App\Models\BotRule;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WebhookLog;
use App\Models\WhatsappDevice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BotRuleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_workspace_owner_can_create_a_bot_rule(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'display_name' => 'Sales',
        ]);

        $response = $this->actingAs($owner)->post(route('bot-rules.store'), [
            'whatsapp_device_id' => $device->id,
            'name' => 'Greeting rule',
            'match_type' => BotRuleMatchType::Contains->value,
            'trigger_text' => 'hello',
            'response_text' => 'Hi there!',
            'priority' => 10,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('bot-rules.index', absolute: false));

        $this->assertDatabaseHas('bot_rules', [
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'name' => 'Greeting rule',
            'match_type' => BotRuleMatchType::Contains->value,
            'trigger_text' => 'hello',
            'response_text' => 'Hi there!',
            'priority' => 10,
            'is_active' => true,
        ]);
    }

    public function test_workspace_owner_can_update_active_state_from_html_checkbox_values(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
        ]);
        $botRule = BotRule::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'is_active' => false,
        ]);

        $payload = [
            'whatsapp_device_id' => $device->id,
            'name' => 'Updated greeting',
            'match_type' => BotRuleMatchType::Exact->value,
            'trigger_text' => 'hello',
            'response_text' => 'Hello there',
            'priority' => 5,
        ];

        $this->actingAs($owner)
            ->put(route('bot-rules.update', $botRule), [
                ...$payload,
                'is_active' => 'on',
            ])
            ->assertRedirect(route('bot-rules.index', absolute: false))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('bot_rules', [
            'id' => $botRule->id,
            'is_active' => true,
        ]);

        $this->actingAs($owner)
            ->put(route('bot-rules.update', $botRule), [
                ...$payload,
                'is_active' => '0',
            ])
            ->assertRedirect(route('bot-rules.index', absolute: false))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('bot_rules', [
            'id' => $botRule->id,
            'is_active' => false,
        ]);
    }

    public function test_users_cannot_access_bot_rules_from_other_tenants(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $otherTenant = Tenant::factory()->create();
        $otherDevice = WhatsappDevice::factory()->for($otherTenant)->create();
        $otherRule = BotRule::factory()->create([
            'tenant_id' => $otherTenant->id,
            'whatsapp_device_id' => $otherDevice->id,
        ]);

        $this->actingAs($owner)
            ->get(route('bot-rules.edit', $otherRule))
            ->assertForbidden();

        $this->actingAs($owner)
            ->delete(route('bot-rules.destroy', $otherRule))
            ->assertForbidden();
    }

    public function test_super_admins_can_access_tenant_bot_rules(): void
    {
        $tenant = Tenant::factory()->create();
        $superAdmin = User::factory()->create([
            'global_role' => GlobalRole::SuperAdmin->value,
            'current_tenant_id' => $tenant->id,
        ]);

        BotRule::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => WhatsappDevice::factory()->for($tenant)->create()->id,
        ]);

        $this->actingAs($superAdmin)
            ->get(route('bot-rules.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('bot-rules/index')
                ->where('tenant.id', $tenant->id)
                ->has('devices', 1)
                ->has('rules', 1),
            );
    }

    public function test_first_matching_rule_by_priority_queues_one_bot_response(): void
    {
        Bus::fake();

        [$tenant, $owner] = $this->createTenantOwner();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
        ]);

        BotRule::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'name' => 'Lower priority',
            'match_type' => BotRuleMatchType::Contains->value,
            'trigger_text' => 'hello',
            'response_text' => 'Matched second',
            'priority' => 20,
            'is_active' => true,
        ]);

        BotRule::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'name' => 'Higher priority',
            'match_type' => BotRuleMatchType::Contains->value,
            'trigger_text' => 'hello',
            'response_text' => 'Matched first',
            'priority' => 1,
            'is_active' => true,
        ]);

        $payload = $this->webhookPayload(
            $device->gowa_device_id,
            'msg-priority-001',
            'Customer One',
            '08123456789',
            'Hello team',
        );

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
            'external_message_id' => 'msg-priority-001',
            'direction' => WhatsappMessageDirection::Inbound->value,
            'status' => WhatsappMessageStatus::Received->value,
        ]);

        $this->assertDatabaseHas('whatsapp_messages', [
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'direction' => WhatsappMessageDirection::Outbound->value,
            'status' => WhatsappMessageStatus::Queued->value,
            'body' => 'Matched first',
        ]);

        $this->assertDatabaseCount('whatsapp_messages', 2);

        Bus::assertDispatchedTimes(SendWhatsappMessage::class, 1);
    }

    public function test_bot_rules_are_isolated_per_device(): void
    {
        Bus::fake();

        [$tenant, $owner] = $this->createTenantOwner();
        $firstDevice = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'display_name' => 'Sales',
        ]);
        $secondDevice = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'display_name' => 'Support',
        ]);

        BotRule::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $firstDevice->id,
            'name' => 'Sales greeting',
            'match_type' => BotRuleMatchType::Exact->value,
            'trigger_text' => 'hello',
            'response_text' => 'Sales reply',
            'priority' => 1,
            'is_active' => true,
        ]);

        $payload = $this->webhookPayload(
            $secondDevice->gowa_device_id,
            'msg-isolated-001',
            'Customer Two',
            '08123456780',
            'hello',
        );

        $log = WebhookLog::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $secondDevice->id,
            'payload' => $payload,
            'sanitized_payload' => $payload,
        ]);

        app()->call([new ProcessIncomingWhatsappMessage($log->id), 'handle']);

        $this->assertDatabaseHas('whatsapp_messages', [
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $secondDevice->id,
            'external_message_id' => 'msg-isolated-001',
            'direction' => WhatsappMessageDirection::Inbound->value,
        ]);

        $this->assertDatabaseCount('whatsapp_messages', 1);
        Bus::assertNotDispatched(SendWhatsappMessage::class);
    }

    public function test_self_messages_are_ignored(): void
    {
        Bus::fake();

        [$tenant, $owner] = $this->createTenantOwner();
        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
        ]);

        BotRule::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'name' => 'Greeting',
            'match_type' => BotRuleMatchType::Contains->value,
            'trigger_text' => 'hello',
            'response_text' => 'Should not send',
            'priority' => 1,
            'is_active' => true,
        ]);

        $payload = $this->webhookPayload(
            $device->gowa_device_id,
            'msg-self-001',
            'Bot Account',
            '08123456789',
            'hello',
        );

        data_set($payload, 'message.from_me', true);

        $log = WebhookLog::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'payload' => $payload,
            'sanitized_payload' => $payload,
        ]);

        app()->call([new ProcessIncomingWhatsappMessage($log->id), 'handle']);

        $this->assertDatabaseCount('whatsapp_messages', 0);
        $this->assertDatabaseHas('webhook_logs', [
            'id' => $log->id,
            'status' => 'ignored_self_message',
        ]);
        Bus::assertNotDispatched(SendWhatsappMessage::class);
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

    /**
     * Build a webhook payload for the fake GOWA endpoint.
     *
     * @return array<string, mixed>
     */
    private function webhookPayload(
        string $deviceId,
        string $messageId,
        string $contactName,
        string $phoneNumber,
        ?string $body,
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
}
