<?php

namespace App\Actions\Fortify;

use App\Enums\GlobalRole;
use App\Enums\TenantRole;
use App\Enums\TenantStatus;
use App\Enums\UserStatus;
use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'global_role' => GlobalRole::User->value,
                'status' => UserStatus::Active->value,
            ]);

            $tenantName = $input['name'].' Workspace';
            $tenantUlid = Str::lower((string) Str::ulid());
            $tenantSlug = Str::slug($tenantName).'-'.$tenantUlid;

            $tenant = Tenant::create([
                'ulid' => $tenantUlid,
                'name' => $tenantName,
                'slug' => $tenantSlug,
                'status' => TenantStatus::Active->value,
                'created_by' => $user->id,
            ]);

            $user->forceFill([
                'current_tenant_id' => $tenant->id,
            ])->save();

            $tenant->users()->attach($user->id, [
                'role' => TenantRole::Owner->value,
            ]);

            return $user->fresh();
        });
    }
}
