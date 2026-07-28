<?php

namespace Tests\Feature;

use App\Enums\GlobalRole;
use App\Enums\TenantRole;
use App\Enums\TenantStatus;
use App\Enums\UserStatus;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_suspended_users_cannot_authenticate_or_access_protected_routes(): void
    {
        $tenant = Tenant::factory()->create();

        $user = User::factory()->create([
            'status' => UserStatus::Suspended->value,
            'current_tenant_id' => $tenant->id,
        ]);

        $tenant->users()->attach($user->id, [
            'role' => TenantRole::Owner->value,
        ]);

        $loginResponse = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $loginResponse->assertRedirect();
        $this->assertGuest();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertForbidden();
    }

    public function test_suspended_tenants_cannot_access_tenant_pages(): void
    {
        $tenant = Tenant::factory()->create([
            'status' => TenantStatus::Suspended->value,
        ]);

        $user = User::factory()->create([
            'current_tenant_id' => $tenant->id,
        ]);

        $tenant->users()->attach($user->id, [
            'role' => TenantRole::Owner->value,
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertForbidden();
    }

    public function test_super_admins_can_access_the_admin_placeholder(): void
    {
        $superAdmin = User::factory()->create([
            'global_role' => GlobalRole::SuperAdmin->value,
            'current_tenant_id' => null,
        ]);

        $this->actingAs($superAdmin)
            ->get(route('admin.index'))
            ->assertOk();
    }

    public function test_regular_users_cannot_access_the_admin_placeholder(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.index'))
            ->assertForbidden();
    }
}
