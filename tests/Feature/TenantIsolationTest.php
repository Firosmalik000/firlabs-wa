<?php

namespace Tests\Feature;

use App\Enums\TenantRole;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_cannot_access_other_tenants(): void
    {
        $ownTenant = Tenant::factory()->create();
        $otherTenant = Tenant::factory()->create();

        $user = User::factory()->create([
            'current_tenant_id' => $ownTenant->id,
        ]);

        $ownTenant->users()->attach($user->id, [
            'role' => TenantRole::Owner->value,
        ]);

        $response = $this->actingAs($user)->get(route('tenants.show', $otherTenant));

        $response->assertForbidden();
    }

    public function test_users_can_access_their_own_tenant(): void
    {
        $tenant = Tenant::factory()->create();

        $user = User::factory()->create([
            'current_tenant_id' => $tenant->id,
        ]);

        $tenant->users()->attach($user->id, [
            'role' => TenantRole::Owner->value,
        ]);

        $response = $this->actingAs($user)->get(route('tenants.show', $tenant));

        $response->assertOk();
    }
}
