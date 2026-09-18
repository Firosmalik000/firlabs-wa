<?php

namespace Tests\Feature;

use App\Enums\TenantRole;
use App\Enums\WhatsappConnectionStatus;
use App\Enums\WhatsappMessageDirection;
use App\Models\BotRule;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WhatsappConversation;
use App\Models\WhatsappDevice;
use App\Models\WhatsappMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_contains_tenant_scoped_operational_data(): void
    {
        $tenant = Tenant::factory()->create(['device_limit' => 3]);
        $user = User::factory()->create([
            'current_tenant_id' => $tenant->id,
        ]);

        $tenant->users()->attach($user, [
            'role' => TenantRole::Owner->value,
        ]);

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $user->id,
            'display_name' => 'Customer Care',
            'connection_status' => WhatsappConnectionStatus::Connected->value,
        ]);

        $conversation = WhatsappConversation::factory()
            ->for($tenant)
            ->create([
                'whatsapp_device_id' => $device->id,
            ]);

        WhatsappMessage::factory()->for($tenant)->create([
            'whatsapp_device_id' => $device->id,
            'whatsapp_contact_id' => $conversation->whatsapp_contact_id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => WhatsappMessageDirection::Inbound->value,
            'body' => 'Hello support',
        ]);

        BotRule::factory()->for($tenant)->create([
            'whatsapp_device_id' => $device->id,
            'is_active' => true,
        ]);

        Tenant::factory()->create()->devices()->save(
            WhatsappDevice::factory()->make(),
        );

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('tenant.id', $tenant->id)
                ->where('stats.devices', 1)
                ->where('stats.connected_devices', 1)
                ->where('stats.conversations', 1)
                ->where('stats.messages_today', 1)
                ->where('stats.active_bot_rules', 1)
                ->has('recentDevices', 1)
                ->where('recentDevices.0.display_name', 'Customer Care')
                ->has('recentConversations', 1)
                ->where('recentConversations.0.latest_message', 'Hello support')
                ->where('canCreateDevice', true),
            );
    }

    public function test_dashboard_reports_device_limit_reached(): void
    {
        $tenant = Tenant::factory()->create(['device_limit' => 1]);
        $user = User::factory()->create([
            'current_tenant_id' => $tenant->id,
        ]);

        $tenant->users()->attach($user, [
            'role' => TenantRole::Owner->value,
        ]);

        WhatsappDevice::factory()->for($tenant)->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('canCreateDevice', false)
                ->where('stats.devices', 1),
            );
    }
}
