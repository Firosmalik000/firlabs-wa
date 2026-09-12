<?php

namespace App\Models;

use App\Enums\WhatsappConnectionStatus;
use App\Enums\WhatsappDeviceStatus;
use Database\Factories\WhatsappDeviceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable([
    'ulid',
    'tenant_id',
    'created_by',
    'display_name',
    'description',
    'gowa_device_id',
    'phone_number',
    'whatsapp_jid',
    'status',
    'connection_status',
    'connected_at',
    'last_connected_at',
    'last_disconnected_at',
    'last_error_message',
    'last_error_at',
    'metadata',
])]
class WhatsappDevice extends Model
{
    /** @use HasFactory<WhatsappDeviceFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'connected_at' => 'datetime',
            'last_connected_at' => 'datetime',
            'last_disconnected_at' => 'datetime',
            'last_error_at' => 'datetime',
            'metadata' => 'array',
            'status' => WhatsappDeviceStatus::class,
            'connection_status' => WhatsappConnectionStatus::class,
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
     * Get the tenant that owns the device.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the user who created the device.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the contacts that reference the device.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(WhatsappContact::class);
    }

    /**
     * Get the conversations that belong to the device.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(WhatsappConversation::class);
    }

    /**
     * Get the messages that belong to the device.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(WhatsappMessage::class);
    }

    /**
     * Get the bot rules that belong to the device.
     */
    public function botRules(): HasMany
    {
        return $this->hasMany(BotRule::class, 'whatsapp_device_id');
    }

    /**
     * Get the webhook logs that belong to the device.
     */
    public function webhookLogs(): HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }

    /**
     * Create an immutable GOWA device identifier.
     */
    public static function generateGowaDeviceId(): string
    {
        return 'dev_'.Str::lower((string) Str::ulid());
    }
}
