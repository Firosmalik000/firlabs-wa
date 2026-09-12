<?php

namespace App\Policies;

use App\Models\BotRule;
use App\Models\User;

class BotRulePolicy
{
    /**
     * Allow super admins to bypass bot rule checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->currentTenant !== null;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, BotRule $botRule): bool
    {
        return $user->canManageTenant($botRule->tenant);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->currentTenant !== null
            && $user->canManageTenant($user->currentTenant);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, BotRule $botRule): bool
    {
        return $user->canManageTenant($botRule->tenant);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, BotRule $botRule): bool
    {
        return $user->canManageTenant($botRule->tenant);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, BotRule $botRule): bool
    {
        return $user->canManageTenant($botRule->tenant);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, BotRule $botRule): bool
    {
        return $user->canManageTenant($botRule->tenant);
    }
}
