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

class TenantRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_create_a_tenant_and_owner_membership(): void
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'tenant-owner@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticated();

        $user = User::query()
            ->where('email', 'tenant-owner@example.com')
            ->firstOrFail();

        $tenant = Tenant::query()
            ->where('created_by', $user->id)
            ->firstOrFail();

        $this->assertSame(GlobalRole::User, $user->global_role);
        $this->assertSame(UserStatus::Active, $user->status);
        $this->assertSame($tenant->id, $user->current_tenant_id);
        $this->assertSame(TenantStatus::Active, $tenant->status);

        $this->assertDatabaseHas('tenant_user', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'role' => TenantRole::Owner->value,
        ]);
    }
}
