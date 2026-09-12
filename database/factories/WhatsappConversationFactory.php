<?php

namespace Database\Factories;

use App\Enums\WhatsappConversationStatus;
use App\Models\Tenant;
use App\Models\WhatsappContact;
use App\Models\WhatsappConversation;
use App\Models\WhatsappDevice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WhatsappConversation>
 */
class WhatsappConversationFactory extends Factory
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
            'whatsapp_contact_id' => null,
            'status' => WhatsappConversationStatus::Open->value,
            'last_message_at' => now(),
            'last_inbound_message_at' => now(),
            'last_outbound_message_at' => null,
            'metadata' => [],
        ];
    }

    /**
     * Configure the factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (WhatsappConversation $conversation): void {
            $tenant = null;

            if ($conversation->tenant_id !== null) {
                $tenant = Tenant::query()->find($conversation->tenant_id);
            }

            if ($tenant === null) {
                $tenant = Tenant::factory()->create();
                $conversation->tenant_id = $tenant->id;
            }

            if ($conversation->whatsapp_device_id === null) {
                $conversation->whatsapp_device_id = WhatsappDevice::factory()
                    ->for($tenant)
                    ->create()
                    ->id;
            }

            if ($conversation->whatsapp_contact_id === null) {
                $conversation->whatsapp_contact_id = WhatsappContact::factory()
                    ->for($tenant)
                    ->create()
                    ->id;
            }
        });
    }
}
