<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WhatsappContact;

class WhatsappContactPolicy
{
    /**
     * Allow super admins to bypass contact checks.
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
    public function view(User $user, WhatsappContact $whatsappContact): bool
    {
        return $user->belongsToTenant($whatsappContact->tenant);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->currentTenant !== null && $user->canManageTenant($user->currentTenant);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, WhatsappContact $whatsappContact): bool
    {
        return $user->canManageTenant($whatsappContact->tenant);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, WhatsappContact $whatsappContact): bool
    {
        return $user->canManageTenant($whatsappContact->tenant);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, WhatsappContact $whatsappContact): bool
    {
        return $user->canManageTenant($whatsappContact->tenant);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, WhatsappContact $whatsappContact): bool
    {
        return $user->canManageTenant($whatsappContact->tenant);
    }
}
