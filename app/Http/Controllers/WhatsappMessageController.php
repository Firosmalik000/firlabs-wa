<?php

namespace App\Http\Controllers;

use App\Enums\WhatsappMessageDirection;
use App\Enums\WhatsappMessageStatus;
use App\Http\Requests\StoreWhatsappMessageRequest;
use App\Jobs\SendWhatsappMessage;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use App\Services\WhatsappMediaStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class WhatsappMessageController extends Controller
{
    /**
     * Store a newly queued outbound message.
     */
    public function store(
        StoreWhatsappMessageRequest $request,
        WhatsappConversation $whatsappConversation,
        WhatsappMediaStorageService $mediaStorage,
    ): RedirectResponse {
        $messageData = $this->buildMessageData($request, $whatsappConversation, $mediaStorage);

        $message = WhatsappMessage::query()->create($messageData);

        SendWhatsappMessage::dispatch($message->id)->afterCommit();

        return back()->with('success', __('Message queued for delivery.'));
    }

    /**
     * Retry a failed outgoing message.
     */
    public function retry(Request $request, WhatsappMessage $whatsappMessage): RedirectResponse
    {
        Gate::authorize('update', $whatsappMessage);

        abort_unless(
            $whatsappMessage->isOutbound() && $whatsappMessage->isFailed(),
            422,
            __('Only failed outgoing messages may be retried.'),
        );

        $whatsappMessage->forceFill([
            'status' => WhatsappMessageStatus::Queued,
            'sent_at' => null,
            'failed_at' => null,
            'error_message' => null,
        ])->save();

        SendWhatsappMessage::dispatch($whatsappMessage->id)->afterCommit();

        return back()->with('success', __('Message queued again.'));
    }

    /**
     * Build the outbound message payload.
     *
     * @return array<string, mixed>
     */
    private function buildMessageData(
        StoreWhatsappMessageRequest $request,
        WhatsappConversation $whatsappConversation,
        WhatsappMediaStorageService $mediaStorage,
    ): array {
        $media = $request->file('media');
        $kind = $media !== null ? (string) $request->validated('media_type') : 'text';
        $storedMedia = $media === null
            ? null
            : $mediaStorage->storeUpload(
                $whatsappConversation->tenant,
                $whatsappConversation->device,
                $media,
            );
        $mediaAttributes = $media === null
            ? [
                'media_disk' => null,
                'media_path' => null,
                'media_original_name' => null,
                'media_mime_type' => null,
                'media_size' => null,
                'media_uploaded_at' => null,
            ]
            : [
                'media_disk' => 'public',
                'media_path' => $storedMedia['path'],
                'media_original_name' => $storedMedia['original_name'],
                'media_mime_type' => $storedMedia['mime_type'],
                'media_size' => $storedMedia['size'],
                'media_uploaded_at' => now(),
            ];

        return [
            'ulid' => Str::lower((string) Str::ulid()),
            'tenant_id' => $whatsappConversation->tenant_id,
            'whatsapp_device_id' => $whatsappConversation->whatsapp_device_id,
            'whatsapp_contact_id' => $whatsappConversation->whatsapp_contact_id,
            'whatsapp_conversation_id' => $whatsappConversation->id,
            'external_message_id' => null,
            'direction' => WhatsappMessageDirection::Outbound,
            'kind' => $kind,
            'status' => WhatsappMessageStatus::Queued,
            'body' => $request->validated('body'),
            ...$mediaAttributes,
            'payload' => [],
            'metadata' => [],
            'received_at' => null,
            'sent_at' => null,
            'failed_at' => null,
            'error_message' => null,
        ];
    }
}
