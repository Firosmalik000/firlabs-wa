<?php

namespace App\Models;

use Database\Factories\WebhookLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'ulid',
    'tenant_id',
    'whatsapp_device_id',
    'event_type',
    'signature_valid',
    'status',
    'headers',
    'payload',
    'sanitized_payload',
    'error_message',
    'received_at',
    'processed_at',
])]
class WebhookLog extends Model
{
    /** @use HasFactory<WebhookLogFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'signature_valid' => 'boolean',
            'headers' => 'array',
            'payload' => 'array',
            'sanitized_payload' => 'array',
            'received_at' => 'datetime',
            'processed_at' => 'datetime',
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
     * Get the tenant that owns the webhook log.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the device that owns the webhook log.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(WhatsappDevice::class, 'whatsapp_device_id');
    }
}
