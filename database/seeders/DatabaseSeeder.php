<?php

namespace Database\Seeders;

use App\Enums\GlobalRole;
use App\Enums\TenantRole;
use App\Enums\TenantStatus;
use App\Enums\UserStatus;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $admin = User::query()->updateOrCreate(
                ['email' => 'admin@admin.com'],
                [
                    'name' => 'Firlabs Admin',
                    'email_verified_at' => now(),
                    'password' => 'password',
                    'global_role' => GlobalRole::SuperAdmin,
                    'status' => UserStatus::Active,
                ],
            );

            $tenant = Tenant::query()->firstOrCreate(
                ['slug' => 'firlabs-demo'],
                [
                    'ulid' => Str::lower((string) Str::ulid()),
                    'name' => 'Firlabs Demo',
                    'status' => TenantStatus::Active,
                    'created_by' => $admin->id,
                    'device_limit' => 3,
                ],
            );

            $tenant->update([
                'name' => 'Firlabs Demo',
                'status' => TenantStatus::Active,
                'created_by' => $admin->id,
                'device_limit' => 3,
            ]);

            $tenant->users()->syncWithoutDetaching([
                $admin->id => ['role' => TenantRole::Owner->value],
            ]);

            $tenant->users()->updateExistingPivot($admin->id, [
                'role' => TenantRole::Owner->value,
            ]);

            $admin->update(['current_tenant_id' => $tenant->id]);
        });
    }
}
