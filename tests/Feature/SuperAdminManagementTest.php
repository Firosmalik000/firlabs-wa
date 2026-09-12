<?php

namespace Tests\Feature;

use App\Enums\GlobalRole;
use App\Enums\TenantRole;
use App\Enums\TenantStatus;
use App\Enums\UserStatus;
use App\Enums\WhatsappDeviceStatus;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WebhookLog;
use App\Models\WhatsappDevice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SuperAdminManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_all_admin_sections(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create([
            'current_tenant_id' => $tenant->id,
        ]);

        $tenant->users()->attach($owner->id, [
            'role' => TenantRole::Owner->value,
        ]);

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'status' => WhatsappDeviceStatus::Active->value,
        ]);

        WebhookLog::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
            'status' => 'processed',
        ]);

        $superAdmin = User::factory()->create([
            'global_role' => GlobalRole::SuperAdmin->value,
            'current_tenant_id' => null,
        ]);

        $this->actingAs($superAdmin)
            ->get(route('admin.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/index')
                ->where('summary.users', 2)
                ->where('summary.active_users', 2)
                ->where('summary.tenants', 1)
                ->where('summary.active_tenants', 1)
                ->where('summary.devices', 1)
                ->where('summary.active_devices', 1)
                ->where('summary.webhook_logs', 1)
                ->where('summary.failed_jobs', 0)
                ->has('sections', 6)
                ->has('recentWebhookLogs', 1),
            );

        $this->actingAs($superAdmin)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users')
                ->has('users', 2),
            );

        $this->actingAs($superAdmin)
            ->get(route('admin.tenants.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/tenants')
                ->has('tenants', 1),
            );

        $this->actingAs($superAdmin)
            ->get(route('admin.devices.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/devices')
                ->has('devices', 1),
            );

        $this->actingAs($superAdmin)
            ->get(route('admin.webhook-logs.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/webhook-logs')
                ->has('logs', 1),
            );

        $this->actingAs($superAdmin)
            ->get(route('admin.audit-logs.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/audit-logs')
                ->where('message', __('Audit logging is not implemented yet. This page is reserved for the next phase.')),
            );

        $this->actingAs($superAdmin)
            ->get(route('admin.failed-jobs.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/failed-jobs')
                ->has('jobs', 0),
            );
    }

    public function test_regular_users_cannot_access_admin_sections(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();
        $device = WhatsappDevice::factory()->for($tenant)->create();
        WebhookLog::factory()->create([
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $device->id,
        ]);

        $this->actingAs($owner)->get(route('admin.index'))->assertForbidden();
        $this->actingAs($owner)->get(route('admin.users.index'))->assertForbidden();
        $this->actingAs($owner)->get(route('admin.tenants.index'))->assertForbidden();
        $this->actingAs($owner)->get(route('admin.devices.index'))->assertForbidden();
        $this->actingAs($owner)->get(route('admin.webhook-logs.index'))->assertForbidden();
        $this->actingAs($owner)->get(route('admin.audit-logs.index'))->assertForbidden();
        $this->actingAs($owner)->get(route('admin.failed-jobs.index'))->assertForbidden();
    }

    public function test_super_admin_can_suspend_and_reactivate_users(): void
    {
        $superAdmin = User::factory()->create([
            'global_role' => GlobalRole::SuperAdmin->value,
        ]);
        $user = User::factory()->create();

        $this->actingAs($superAdmin)
            ->patch(route('admin.users.status.update', $user), [
                'status' => UserStatus::Suspended->value,
            ])
            ->assertRedirect();

        $this->assertSame(UserStatus::Suspended, $user->refresh()->status);

        $this->actingAs($superAdmin)
            ->patch(route('admin.users.status.update', $user), [
                'status' => UserStatus::Active->value,
            ])
            ->assertRedirect();

        $this->assertSame(UserStatus::Active, $user->refresh()->status);
    }

    public function test_super_admin_cannot_suspend_their_own_account(): void
    {
        $superAdmin = User::factory()->create([
            'global_role' => GlobalRole::SuperAdmin->value,
        ]);

        $this->actingAs($superAdmin)
            ->patch(route('admin.users.status.update', $superAdmin), [
                'status' => UserStatus::Suspended->value,
            ])
            ->assertUnprocessable();

        $this->assertSame(UserStatus::Active, $superAdmin->refresh()->status);
    }

    public function test_super_admin_can_suspend_and_reactivate_tenants(): void
    {
        $superAdmin = User::factory()->create([
            'global_role' => GlobalRole::SuperAdmin->value,
        ]);
        $tenant = Tenant::factory()->create();

        $this->actingAs($superAdmin)
            ->patch(route('admin.tenants.status.update', $tenant), [
                'status' => TenantStatus::Suspended->value,
            ])
            ->assertRedirect();

        $this->assertSame(TenantStatus::Suspended, $tenant->refresh()->status);

        $this->actingAs($superAdmin)
            ->patch(route('admin.tenants.status.update', $tenant), [
                'status' => TenantStatus::Active->value,
            ])
            ->assertRedirect();

        $this->assertSame(TenantStatus::Active, $tenant->refresh()->status);
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
