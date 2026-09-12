<?php

namespace App\Services\BotRules;

use App\Enums\WhatsappMessageDirection;
use App\Enums\WhatsappMessageStatus;
use App\Jobs\SendWhatsappMessage;
use App\Models\BotRule;
use App\Models\WhatsappMessage;
use Illuminate\Support\Str;

class BotRuleResponder
{
    /**
     * Queue a bot response for an inbound message when a rule matches.
     */
    public function queueResponse(WhatsappMessage $inboundMessage): ?WhatsappMessage
    {
        if ($inboundMessage->direction !== WhatsappMessageDirection::Inbound) {
            return null;
        }

        if (! $this->shouldEvaluateMessage($inboundMessage)) {
            return null;
        }

        $normalizedBody = $this->normalizeBody($inboundMessage->body);

        if ($normalizedBody === '') {
            return null;
        }

        $rule = $this->matchRule($inboundMessage, $normalizedBody);

        if ($rule === null) {
            return null;
        }

        $response = WhatsappMessage::query()->create([
            'ulid' => Str::lower((string) Str::ulid()),
            'tenant_id' => $inboundMessage->tenant_id,
            'whatsapp_device_id' => $inboundMessage->whatsapp_device_id,
            'whatsapp_contact_id' => $inboundMessage->whatsapp_contact_id,
            'whatsapp_conversation_id' => $inboundMessage->whatsapp_conversation_id,
            'external_message_id' => null,
            'direction' => WhatsappMessageDirection::Outbound,
            'kind' => 'text',
            'status' => WhatsappMessageStatus::Queued,
            'body' => $rule->response_text,
            'media_disk' => null,
            'media_path' => null,
            'media_original_name' => null,
            'media_mime_type' => null,
            'media_size' => null,
            'media_uploaded_at' => null,
            'payload' => [],
            'metadata' => [
                'source' => 'bot_rule',
                'bot_rule_id' => $rule->id,
            ],
            'received_at' => null,
            'sent_at' => null,
            'failed_at' => null,
            'error_message' => null,
        ]);

        SendWhatsappMessage::dispatch($response->id)->afterCommit();

        return $response;
    }

    /**
     * Determine whether the message should be evaluated for bot replies.
     */
    private function shouldEvaluateMessage(WhatsappMessage $message): bool
    {
        if ($message->body === null) {
            return false;
        }

        $payload = $message->payload ?? [];

        return ! $this->isSelfMessage($payload);
    }

    /**
     * Determine the first matching rule for the message.
     */
    private function matchRule(WhatsappMessage $message, string $normalizedBody): ?BotRule
    {
        $rules = BotRule::query()
            ->where('tenant_id', $message->tenant_id)
            ->where('whatsapp_device_id', $message->whatsapp_device_id)
            ->where('is_active', true)
            ->orderBy('priority')
            ->orderBy('id')
            ->get();

        return $rules->first(
            fn (BotRule $rule): bool => $rule->matches($normalizedBody),
        );
    }

    /**
     * Normalize the message body for matching.
     */
    private function normalizeBody(?string $body): string
    {
        if ($body === null) {
            return '';
        }

        return Str::of($body)->squish()->lower()->toString();
    }

    /**
     * Determine whether the payload represents a message sent by the connected account.
     */
    private function isSelfMessage(array $payload): bool
    {
        $flags = [
            data_get($payload, 'message.from_me'),
            data_get($payload, 'message.fromMe'),
            data_get($payload, 'message.is_from_me'),
            data_get($payload, 'message.isFromMe'),
            data_get($payload, 'from_me'),
            data_get($payload, 'fromMe'),
            data_get($payload, 'is_from_me'),
            data_get($payload, 'isFromMe'),
        ];

        return in_array(true, array_map('boolval', $flags), true);
    }
}
