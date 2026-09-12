<?php

namespace Database\Factories;

use App\Models\WebhookLog;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WebhookLog>
 */
class WebhookLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ulid' => Str::lower((string) Str::ulid()),
            'tenant_id' => null,
            'whatsapp_device_id' => null,
            'event_type' => 'message.received',
            'signature_valid' => true,
            'status' => 'received',
            'headers' => [],
            'payload' => [],
            'sanitized_payload' => [],
            'error_message' => null,
            'received_at' => now(),
            'processed_at' => null,
        ];
    }
}
