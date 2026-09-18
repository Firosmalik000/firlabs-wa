<?php

namespace App\Models;

use App\Enums\WhatsappConversationStatus;
use Database\Factories\WhatsappConversationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'ulid',
    'tenant_id',
    'whatsapp_device_id',
    'whatsapp_contact_id',
    'status',
    'last_message_at',
    'last_inbound_message_at',
    'last_outbound_message_at',
    'metadata',
])]
/**
 * @property-read WhatsappDevice|null $device
 * @property-read WhatsappContact|null $contact
 */
class WhatsappConversation extends Model
{
    /** @use HasFactory<WhatsappConversationFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'last_inbound_message_at' => 'datetime',
            'last_outbound_message_at' => 'datetime',
            'metadata' => 'array',
            'status' => WhatsappConversationStatus::class,
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
     * Get the tenant that owns the conversation.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the device that owns the conversation.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(WhatsappDevice::class, 'whatsapp_device_id');
    }

    /**
     * Get the contact that belongs to the conversation.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(WhatsappContact::class, 'whatsapp_contact_id');
    }

    /**
     * Get the messages that belong to the conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(WhatsappMessage::class);
    }

    /**
     * Get the latest message for the conversation.
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(WhatsappMessage::class)->latestOfMany();
    }
}
