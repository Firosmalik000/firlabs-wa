<?php

namespace App\Services;

use App\Enums\WhatsappMessageDirection;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class OutgoingMessageRateLimiter
{
    /**
     * Ensure an outgoing message stays within the configured usage limits.
     */
    public function ensureWithinLimits(WhatsappConversation $conversation): void
    {
        $this->ensurePerDayLimit($conversation);
        $this->ensurePerMinuteLimit($conversation);

        RateLimiter::hit($this->perMinuteKey($conversation), 60);
    }

    /**
     * Enforce the daily outgoing message limit per workspace.
     */
    private function ensurePerDayLimit(WhatsappConversation $conversation): void
    {
        $perDay = max(1, (int) config('services.limits.outgoing_per_day', 1000));
        $todayCount = WhatsappMessage::query()
            ->where('tenant_id', $conversation->tenant_id)
            ->where('direction', WhatsappMessageDirection::Outbound)
            ->whereDate('created_at', today())
            ->count();

        if ($todayCount >= $perDay) {
            throw ValidationException::withMessages([
                'body' => __('Daily outgoing message limit reached for this workspace.'),
            ]);
        }
    }

    /**
     * Enforce the per-minute outgoing message limit per device.
     */
    private function ensurePerMinuteLimit(WhatsappConversation $conversation): void
    {
        $perMinute = max(1, (int) config('services.limits.outgoing_per_minute_per_device', 20));

        if (RateLimiter::tooManyAttempts($this->perMinuteKey($conversation), $perMinute)) {
            throw ValidationException::withMessages([
                'body' => __('Outgoing message rate limit reached for this device. Try again shortly.'),
            ]);
        }
    }

    private function perMinuteKey(WhatsappConversation $conversation): string
    {
        return 'outgoing:device:'.$conversation->whatsapp_device_id;
    }
}
