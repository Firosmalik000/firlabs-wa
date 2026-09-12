<?php

namespace App\Models;

use App\Enums\WhatsappMessageDirection;
use App\Enums\WhatsappMessageStatus;
use Database\Factories\WhatsappMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'ulid',
    'tenant_id',
    'whatsapp_device_id',
    'whatsapp_contact_id',
    'whatsapp_conversation_id',
    'external_message_id',
    'direction',
    'kind',
    'status',
    'body',
    'media_disk',
    'media_path',
    'media_original_name',
    'media_mime_type',
    'media_size',
    'media_uploaded_at',
    'payload',
    'metadata',
    'received_at',
    'sent_at',
    'failed_at',
    'error_message',
])]
class WhatsappMessage extends Model
{
    /** @use HasFactory<WhatsappMessageFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'metadata' => 'array',
            'media_size' => 'integer',
            'media_uploaded_at' => 'datetime',
            'received_at' => 'datetime',
            'sent_at' => 'datetime',
            'failed_at' => 'datetime',
            'direction' => WhatsappMessageDirection::class,
            'status' => WhatsappMessageStatus::class,
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
     * Get the tenant that owns the message.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the device that owns the message.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(WhatsappDevice::class, 'whatsapp_device_id');
    }

    /**
     * Get the contact that owns the message.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(WhatsappContact::class, 'whatsapp_contact_id');
    }

    /**
     * Get the conversation that owns the message.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WhatsappConversation::class, 'whatsapp_conversation_id');
    }

    /**
     * Determine whether the message has media attached.
     */
    public function hasMedia(): bool
    {
        return $this->media_path !== null
            || in_array($this->kind, ['image', 'document'], true);
    }

    /**
     * Determine whether the message failed.
     */
    public function isFailed(): bool
    {
        return $this->status === WhatsappMessageStatus::Failed;
    }

    /**
     * Determine whether the message is outbound.
     */
    public function isOutbound(): bool
    {
        return $this->direction === WhatsappMessageDirection::Outbound;
    }

    public function markAsSending(): void
    {
        $this->forceFill([
            'status' => WhatsappMessageStatus::Sending,
        ])->save();
    }

    public function markAsSent(?string $externalMessageId = null): void
    {
        $this->forceFill([
            'external_message_id' => $externalMessageId ?? $this->external_message_id,
            'status' => WhatsappMessageStatus::Sent,
            'sent_at' => now(),
            'failed_at' => null,
            'error_message' => null,
        ])->save();
    }

    public function markAsFailed(?string $errorMessage = null): void
    {
        $this->forceFill([
            'status' => WhatsappMessageStatus::Failed,
            'failed_at' => now(),
            'error_message' => $errorMessage,
        ])->save();
    }
}
