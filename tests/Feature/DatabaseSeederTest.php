<?php

namespace Tests\Feature;

use App\Enums\GlobalRole;
use App\Enums\TenantRole;
use App\Enums\TenantStatus;
use App\Enums\UserStatus;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_idempotent_admin_workspace(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $admin = User::query()
            ->where('email', 'admin@admin.com')
            ->firstOrFail();
        $tenant = Tenant::query()
            ->where('slug', 'firlabs-demo')
            ->firstOrFail();

        $this->assertSame(1, User::query()->count());
        $this->assertSame(1, Tenant::query()->count());
        $this->assertSame(GlobalRole::SuperAdmin, $admin->global_role);
        $this->assertSame(UserStatus::Active, $admin->status);
        $this->assertNotNull($admin->email_verified_at);
        $this->assertTrue(Hash::check('password', $admin->password));
        $this->assertSame($tenant->id, $admin->current_tenant_id);
        $this->assertSame(TenantStatus::Active, $tenant->status);
        $this->assertTrue($admin->ownsTenant($tenant));
        $this->assertDatabaseHas('tenant_user', [
            'tenant_id' => $tenant->id,
            'user_id' => $admin->id,
            'role' => TenantRole::Owner->value,
        ]);
    }
}
