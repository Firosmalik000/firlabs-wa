<?php

namespace Database\Factories;

use App\Enums\WhatsappMessageDirection;
use App\Enums\WhatsappMessageStatus;
use App\Models\Tenant;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WhatsappMessage>
 */
class WhatsappMessageFactory extends Factory
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
            'whatsapp_conversation_id' => null,
            'external_message_id' => fake()->unique()->bothify('msg-##########'),
            'direction' => WhatsappMessageDirection::Outbound->value,
            'kind' => 'text',
            'status' => WhatsappMessageStatus::Queued->value,
            'body' => fake()->sentence(),
            'payload' => [],
            'metadata' => [],
            'received_at' => null,
            'sent_at' => null,
            'failed_at' => null,
            'error_message' => null,
        ];
    }

    /**
     * Configure the factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (WhatsappMessage $message): void {
            $tenant = null;

            if ($message->tenant_id !== null) {
                $tenant = Tenant::query()->find($message->tenant_id);
            }

            $conversation = null;

            if ($message->whatsapp_conversation_id !== null) {
                $conversation = WhatsappConversation::query()->find($message->whatsapp_conversation_id);
                $tenant ??= $conversation?->tenant;
            }

            if ($tenant === null) {
                $tenant = Tenant::factory()->create();
                $message->tenant_id = $tenant->id;
            }

            if ($conversation === null) {
                $conversation = WhatsappConversation::factory()
                    ->for($tenant)
                    ->create();

                $message->whatsapp_conversation_id = $conversation->id;
            }

            if ($message->whatsapp_device_id === null) {
                $message->whatsapp_device_id = $conversation->whatsapp_device_id;
            }

            if ($message->whatsapp_contact_id === null) {
                $message->whatsapp_contact_id = $conversation->whatsapp_contact_id;
            }

            if ($message->tenant_id === null) {
                $message->tenant_id = $conversation->tenant_id;
            }
        });
    }
}
