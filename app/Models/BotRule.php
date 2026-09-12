<?php

namespace App\Models;

use App\Enums\BotRuleMatchType;
use Database\Factories\BotRuleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'ulid',
    'tenant_id',
    'whatsapp_device_id',
    'name',
    'match_type',
    'trigger_text',
    'response_text',
    'priority',
    'is_active',
])]
class BotRule extends Model
{
    /** @use HasFactory<BotRuleFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'priority' => 'integer',
            'match_type' => BotRuleMatchType::class,
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
     * Get the tenant that owns the rule.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the device that owns the rule.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(WhatsappDevice::class, 'whatsapp_device_id');
    }

    /**
     * Determine whether the rule is active.
     */
    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    /**
     * Determine whether the rule matches a normalized message body.
     */
    public function matches(string $normalizedBody): bool
    {
        $trigger = $this->normalizedTrigger();

        if ($trigger === '') {
            return false;
        }

        return match ($this->match_type) {
            BotRuleMatchType::Exact => $normalizedBody === $trigger,
            BotRuleMatchType::Contains => str_contains($normalizedBody, $trigger),
            BotRuleMatchType::StartsWith => str_starts_with($normalizedBody, $trigger),
        };
    }

    /**
     * Get the normalized trigger text.
     */
    public function normalizedTrigger(): string
    {
        return strtolower(trim($this->trigger_text));
    }
}
