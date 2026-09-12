<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessIncomingWhatsappMessage;
use App\Models\WebhookLog;
use App\Models\WhatsappDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class GowaWebhookController extends Controller
{
    /**
     * Store a webhook payload and dispatch processing.
     */
    public function store(Request $request): JsonResponse
    {
        if ($this->tooManyRequests($request)) {
            return response()->json([
                'message' => __('Too many webhook requests.'),
            ], 429);
        }

        $payload = $request->json()->all();
        $device = $this->resolveDevice($payload);

        $eventType = $this->eventType($payload);
        $shouldProcess = $device !== null && $this->isMessageEvent($eventType);

        $webhookLog = WebhookLog::query()->create([
            'ulid' => Str::lower((string) Str::ulid()),
            'tenant_id' => $device?->tenant_id,
            'whatsapp_device_id' => $device?->id,
            'event_type' => $eventType,
            'signature_valid' => true,
            'status' => match (true) {
                $device === null => 'unknown_device',
                ! $shouldProcess => 'ignored_event',
                default => 'received',
            },
            'headers' => $this->sanitizeHeaders($request->headers->all()),
            'payload' => $payload,
            'sanitized_payload' => $this->sanitizePayload($payload),
            'error_message' => null,
            'received_at' => now(),
            'processed_at' => $shouldProcess ? null : now(),
        ]);

        if ($shouldProcess) {
            ProcessIncomingWhatsappMessage::dispatch($webhookLog->id)->afterCommit();
        }

        return response()->json([
            'message' => __('Webhook accepted.'),
        ], 202);
    }

    /**
     * Determine whether the webhook request should be rate limited.
     */
    private function tooManyRequests(Request $request): bool
    {
        $maxAttempts = max(1, (int) config('services.gowa.webhook_rate_limit', 60));
        $key = $this->rateLimitKey($request);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return true;
        }

        RateLimiter::hit($key, 60);

        return false;
    }

    /**
     * Build the rate limiter key for a webhook request.
     */
    private function rateLimitKey(Request $request): string
    {
        return 'gowa-webhook:'.$request->ip();
    }

    /**
     * Resolve the device for the webhook payload.
     */
    private function resolveDevice(array $payload): ?WhatsappDevice
    {
        $deviceId = (string) data_get($payload, 'device_id', data_get($payload, 'deviceId', data_get($payload, 'device.id', '')));

        if ($deviceId === '') {
            return null;
        }

        return WhatsappDevice::query()
            ->where(function ($query) use ($deviceId): void {
                $query
                    ->where('gowa_device_id', $deviceId)
                    ->orWhere('whatsapp_jid', $deviceId);
            })
            ->first();
    }

    /**
     * Determine whether the webhook contains an inbound message.
     */
    private function isMessageEvent(?string $eventType): bool
    {
        return in_array($eventType, ['message', 'message.received'], true);
    }

    /**
     * Get the webhook event type.
     */
    private function eventType(array $payload): ?string
    {
        $eventType = data_get($payload, 'event', data_get($payload, 'type'));

        return $eventType === null ? null : (string) $eventType;
    }

    /**
     * Remove sensitive payload values before storing them.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function sanitizePayload(array $payload): array
    {
        foreach ($payload as $key => $value) {
            if (in_array(strtolower((string) $key), ['authorization', 'password', 'secret', 'token', 'webhook_secret'], true)) {
                $payload[$key] = '[redacted]';

                continue;
            }

            if (is_array($value)) {
                $payload[$key] = $this->sanitizePayload($value);
            }
        }

        return $payload;
    }

    /**
     * Remove sensitive values from request headers before persisting them.
     *
     * @param  array<string, array<int, string>>  $headers
     * @return array<string, array<int, string>>
     */
    private function sanitizeHeaders(array $headers): array
    {
        foreach ($headers as $key => $values) {
            if (! is_array($values)) {
                continue;
            }

            if (in_array(strtolower($key), ['authorization', 'x-hub-signature-256', 'x-gowa-signature', 'x-webhook-signature', 'cookie'], true)) {
                $headers[$key] = ['[redacted]'];
            }
        }

        return $headers;
    }
}
