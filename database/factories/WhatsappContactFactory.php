<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\WhatsappContact;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WhatsappContact>
 */
class WhatsappContactFactory extends Factory
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
            'external_id' => fake()->unique()->numerify('contact-##########'),
            'display_name' => fake()->name(),
            'phone_number' => fake()->optional()->e164PhoneNumber(),
            'last_message_at' => now(),
            'metadata' => [],
        ];
    }
}
