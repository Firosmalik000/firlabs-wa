<?php

namespace Database\Factories;

use App\Enums\BotRuleMatchType;
use App\Models\BotRule;
use App\Models\Tenant;
use App\Models\WhatsappDevice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BotRule>
 */
class BotRuleFactory extends Factory
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
            'whatsapp_device_id' => null,
            'name' => fake()->words(2, true),
            'match_type' => BotRuleMatchType::Contains->value,
            'trigger_text' => fake()->word(),
            'response_text' => fake()->sentence(),
            'priority' => fake()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }

    /**
     * Configure the factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (BotRule $botRule): void {
            $tenant = null;

            if ($botRule->tenant_id !== null) {
                $tenant = Tenant::query()->find($botRule->tenant_id);
            }

            if ($tenant === null) {
                $tenant = Tenant::factory()->create();
                $botRule->tenant_id = $tenant->id;
            }

            if ($botRule->whatsapp_device_id === null) {
                $botRule->whatsapp_device_id = WhatsappDevice::factory()
                    ->for($tenant)
                    ->create()
                    ->id;
            }
        });
    }
}
