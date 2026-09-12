<?php

namespace App\Jobs;

use App\Enums\WhatsappConversationStatus;
use App\Enums\WhatsappMessageDirection;
use App\Enums\WhatsappMessageStatus;
use App\Models\WebhookLog;
use App\Models\WhatsappContact;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use App\Services\BotRules\BotRuleResponder;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ProcessIncomingWhatsappMessage implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    /**
     * The number of seconds the job remains unique.
     */
    public int $uniqueFor = 3600;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The retry delay in seconds between attempts.
     *
     * @var array<int, int>
     */
    public array $backoff = [5, 15, 30];

    /**
     * Create a new job instance.
     */
    public function __construct(public int $webhookLogId) {}

    /**
     * The number of seconds before a job should timeout.
     */
    public int $timeout = 30;

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return (string) $this->webhookLogId;
    }

    /**
     * Execute the job.
     */
    public function handle(BotRuleResponder $botRuleResponder): void
    {
        $webhookLog = WebhookLog::query()
            ->with(['device.tenant'])
            ->findOrFail($this->webhookLogId);

        if ($webhookLog->processed_at !== null) {
            return;
        }

        $device = $webhookLog->device;

        if ($device === null || $device->tenant === null) {
            $webhookLog->forceFill([
                'status' => 'unknown_device',
                'processed_at' => now(),
            ])->save();

            return;
        }

        $payload = $webhookLog->payload ?? [];

        if ($this->isSelfMessage($payload)) {
            $webhookLog->forceFill([
                'status' => 'ignored_self_message',
                'processed_at' => now(),
            ])->save();

            return;
        }

        $tenant = $device->tenant;
        $externalContactId = $this->externalContactId($payload);
        $externalMessageId = $this->externalMessageId($payload);
        $incomingBody = $this->messageBody($payload);
        $incomingKind = $this->messageKind($payload);
        $incomingMedia = $this->messageMedia($payload);
        $eventTimestamp = now();

        DB::transaction(function () use (
            $device,
            $eventTimestamp,
            $externalContactId,
            $externalMessageId,
            $incomingBody,
            $incomingKind,
            $incomingMedia,
            $payload,
            $botRuleResponder,
            $tenant,
            $webhookLog
        ): void {
            $contact = WhatsappContact::query()->firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'external_id' => $externalContactId,
                ],
                [
                    'ulid' => Str::lower((string) Str::ulid()),
                    'display_name' => $this->contactName($payload, $externalContactId),
                    'phone_number' => $this->phoneNumber($payload, $externalContactId),
                    'last_message_at' => $eventTimestamp,
                    'metadata' => [
                        'source' => 'gowa',
                    ],
                ],
            );

            $conversation = WhatsappConversation::query()->firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'whatsapp_device_id' => $device->id,
                    'whatsapp_contact_id' => $contact->id,
                ],
                [
                    'ulid' => Str::lower((string) Str::ulid()),
                    'status' => WhatsappConversationStatus::Open,
                    'last_message_at' => $eventTimestamp,
                    'last_inbound_message_at' => $eventTimestamp,
                    'metadata' => [],
                ],
            );

            $message = WhatsappMessage::query()->firstOrCreate(
                [
                    'whatsapp_device_id' => $device->id,
                    'external_message_id' => $externalMessageId,
                ],
                [
                    'ulid' => Str::lower((string) Str::ulid()),
                    'tenant_id' => $tenant->id,
                    'whatsapp_contact_id' => $contact->id,
                    'whatsapp_conversation_id' => $conversation->id,
                    'direction' => WhatsappMessageDirection::Inbound,
                    'kind' => $incomingKind,
                    'status' => WhatsappMessageStatus::Received,
                    'body' => $incomingBody,
                    'media_disk' => $incomingMedia['media_disk'],
                    'media_path' => $incomingMedia['media_path'],
                    'media_original_name' => $incomingMedia['media_original_name'],
                    'media_mime_type' => $incomingMedia['media_mime_type'],
                    'media_size' => $incomingMedia['media_size'],
                    'media_uploaded_at' => $incomingMedia['media_uploaded_at'],
                    'payload' => $payload,
                    'metadata' => [
                        'source' => 'gowa',
                        'media' => $incomingMedia['metadata'],
                    ],
                    'received_at' => $eventTimestamp,
                ],
            );

            if (! $message->wasRecentlyCreated) {
                $webhookLog->forceFill([
                    'status' => 'duplicate',
                    'processed_at' => now(),
                ])->save();

                return;
            }

            $contact->forceFill([
                'last_message_at' => $eventTimestamp,
            ])->save();

            $conversation->forceFill([
                'last_message_at' => $eventTimestamp,
                'last_inbound_message_at' => $eventTimestamp,
                'status' => WhatsappConversationStatus::Open,
            ])->save();

            if ($message->direction === WhatsappMessageDirection::Inbound
                && $message->body !== null
                && ! $message->hasMedia()) {
                $botRuleResponder->queueResponse($message);
            }

            $webhookLog->forceFill([
                'status' => 'processed',
                'processed_at' => now(),
            ])->save();
        });
    }

    /**
     * Get the inbound contact identifier.
     */
    private function externalContactId(array $payload): string
    {
        $externalContactId = data_get(
            $payload,
            'payload.chat_id',
            data_get(
                $payload,
                'payload.from',
                data_get($payload, 'from', data_get($payload, 'message.from', data_get($payload, 'contact.id', data_get($payload, 'contact.jid', 'unknown')))),
            ),
        );

        return (string) $externalContactId;
    }

    /**
     * Get the inbound message identifier.
     */
    private function externalMessageId(array $payload): string
    {
        $externalMessageId = data_get($payload, 'payload.id', data_get($payload, 'message.id', data_get($payload, 'messageId', data_get($payload, 'id'))));

        if ($externalMessageId !== null && $externalMessageId !== '') {
            return (string) $externalMessageId;
        }

        return sha1((string) json_encode($payload));
    }

    /**
     * Get the inbound message body.
     */
    private function messageBody(array $payload): ?string
    {
        $body = data_get($payload, 'payload.body', data_get($payload, 'message.body', data_get($payload, 'body', data_get($payload, 'text'))));

        if ($body === null) {
            $caption = data_get($payload, 'payload.caption', data_get($payload, 'message.caption', data_get($payload, 'caption')));

            if ($caption === null) {
                return null;
            }

            $body = $caption;
        }

        $normalizedBody = trim((string) $body);

        return $normalizedBody === '' ? null : $normalizedBody;
    }

    /**
     * Determine the incoming message kind.
     */
    private function messageKind(array $payload): string
    {
        $kind = data_get($payload, 'payload.type', data_get($payload, 'message.type', data_get($payload, 'type', data_get($payload, 'message.kind', data_get($payload, 'kind', 'text')))));

        $normalizedKind = strtolower((string) $kind);

        return in_array($normalizedKind, ['image', 'document', 'text'], true)
            ? $normalizedKind
            : 'text';
    }

    /**
     * Extract incoming media metadata when present.
     *
     * @return array{media_disk:?string,media_path:?string,media_original_name:?string,media_mime_type:?string,media_size:?int,media_uploaded_at:?string,metadata:array<string, mixed>}
     */
    private function messageMedia(array $payload): array
    {
        $media = data_get($payload, 'payload.media', data_get($payload, 'message.media', data_get($payload, 'media', [])));
        $metadata = is_array($media) ? $media : [];

        $path = data_get($metadata, 'path', data_get($metadata, 'url'));
        $name = data_get($metadata, 'name', data_get($metadata, 'filename'));
        $mimeType = data_get($metadata, 'mime_type', data_get($metadata, 'mimeType'));
        $size = data_get($metadata, 'size');
        $uploadedAt = data_get($metadata, 'uploaded_at', data_get($metadata, 'uploadedAt'));

        return [
            'media_disk' => null,
            'media_path' => is_string($path) && $path !== '' ? $path : null,
            'media_original_name' => is_string($name) && $name !== '' ? $name : null,
            'media_mime_type' => is_string($mimeType) && $mimeType !== '' ? $mimeType : null,
            'media_size' => is_numeric($size) ? (int) $size : null,
            'media_uploaded_at' => is_string($uploadedAt) && $uploadedAt !== '' ? $uploadedAt : null,
            'metadata' => $metadata,
        ];
    }

    /**
     * Get a display name for the contact.
     */
    private function contactName(array $payload, string $fallback): string
    {
        $name = data_get($payload, 'payload.from_name', data_get($payload, 'contact.name', data_get($payload, 'pushName', data_get($payload, 'name'))));

        if ($name === null || trim((string) $name) === '') {
            return $fallback;
        }

        return (string) $name;
    }

    /**
     * Get the best available phone number.
     */
    private function phoneNumber(array $payload, string $fallback): ?string
    {
        $phoneNumber = data_get($payload, 'payload.phone_number', data_get($payload, 'contact.phone_number', data_get($payload, 'contact.phoneNumber', data_get($payload, 'phone_number', data_get($payload, 'phoneNumber', null)))));

        if ($phoneNumber !== null && trim((string) $phoneNumber) !== '') {
            return (string) $phoneNumber;
        }

        if (str_contains($fallback, '@')) {
            $jidPhoneNumber = Str::before($fallback, '@');

            return ctype_digit($jidPhoneNumber) ? $jidPhoneNumber : null;
        }

        return $fallback;
    }

    /**
     * Determine whether the message came from the connected WhatsApp account.
     */
    private function isSelfMessage(array $payload): bool
    {
        $flags = [
            data_get($payload, 'payload.is_from_me'),
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

    /**
     * Mark the webhook log as failed if the job errors.
     */
    public function failed(Throwable $exception): void
    {
        WebhookLog::query()
            ->whereKey($this->webhookLogId)
            ->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'processed_at' => now(),
            ]);
    }
}
