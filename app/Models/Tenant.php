<?php

namespace App\Models;

use App\Enums\TenantStatus;
use Database\Factories\TenantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['ulid', 'name', 'slug', 'status', 'created_by', 'device_limit'])]
class Tenant extends Model
{
    /** @use HasFactory<TenantFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'device_limit' => 'integer',
            'status' => TenantStatus::class,
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'ulid';
    }

    /**
     * Get the user who created the tenant.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the users that belong to the tenant.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->using(TenantMembership::class)
            ->withPivot(['role'])
            ->withTimestamps();
    }

    /**
     * Get the WhatsApp devices that belong to the tenant.
     */
    public function devices(): HasMany
    {
        return $this->hasMany(WhatsappDevice::class);
    }

    /**
     * Get the contacts that belong to the tenant.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(WhatsappContact::class);
    }

    /**
     * Get the conversations that belong to the tenant.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(WhatsappConversation::class);
    }

    /**
     * Get the messages that belong to the tenant.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(WhatsappMessage::class);
    }

    /**
     * Get the bot rules that belong to the tenant.
     */
    public function botRules(): HasMany
    {
        return $this->hasMany(BotRule::class);
    }

    /**
     * Get the webhook logs that belong to the tenant.
     */
    public function webhookLogs(): HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }

    /**
     * Determine whether the tenant is active.
     */
    public function isActive(): bool
    {
        return $this->status === TenantStatus::Active;
    }
}
