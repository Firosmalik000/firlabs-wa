<?php

namespace Database\Factories;

use App\Enums\WhatsappConnectionStatus;
use App\Enums\WhatsappDeviceStatus;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WhatsappDevice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WhatsappDevice>
 */
class WhatsappDeviceFactory extends Factory
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
            'tenant_id' => Tenant::factory(),
            'created_by' => User::factory(),
            'display_name' => fake()->company(),
            'description' => fake()->optional()->sentence(),
            'gowa_device_id' => WhatsappDevice::generateGowaDeviceId(),
            'phone_number' => fake()->optional()->e164PhoneNumber(),
            'whatsapp_jid' => fake()->optional()->numerify('#############@s.whatsapp.net'),
            'status' => WhatsappDeviceStatus::Pending->value,
            'connection_status' => WhatsappConnectionStatus::WaitingScan->value,
            'connected_at' => null,
            'last_connected_at' => null,
            'last_disconnected_at' => null,
            'last_error_message' => null,
            'last_error_at' => null,
            'metadata' => null,
        ];
    }
}
