<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;

class WhatsappMessagePolicy
{
    /**
     * Allow super admins to bypass message checks.
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
    public function view(User $user, WhatsappMessage $whatsappMessage): bool
    {
        return $user->belongsToTenant($whatsappMessage->tenant);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, WhatsappConversation $whatsappConversation): bool
    {
        return $user->currentTenant !== null
            && $user->canManageTenant($whatsappConversation->tenant);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, WhatsappMessage $whatsappMessage): bool
    {
        return $user->canManageTenant($whatsappMessage->tenant);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, WhatsappMessage $whatsappMessage): bool
    {
        return $user->canManageTenant($whatsappMessage->tenant);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, WhatsappMessage $whatsappMessage): bool
    {
        return $user->canManageTenant($whatsappMessage->tenant);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, WhatsappMessage $whatsappMessage): bool
    {
        return $user->canManageTenant($whatsappMessage->tenant);
    }
}
