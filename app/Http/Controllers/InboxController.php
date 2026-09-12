<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\WhatsappConversation;
use App\Models\WhatsappDevice;
use App\Models\WhatsappMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InboxController extends Controller
{
    /**
     * Show the inbox conversation list for the current tenant.
     */
    public function index(Request $request): Response
    {
        $tenant = $this->currentTenant($request);

        abort_unless($tenant !== null, 403);

        $conversations = $tenant->conversations()
            ->with(['contact', 'device', 'latestMessage'])
            ->latest('last_message_at')
            ->get();

        return Inertia::render('inbox/index', [
            'tenant' => [
                'id' => $tenant->id,
                'ulid' => $tenant->ulid,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'status' => $tenant->status->value,
                'device_limit' => $tenant->device_limit,
            ],
            'devices' => $tenant->devices()
                ->orderBy('display_name')
                ->get()
                ->map(fn ($device): array => $this->deviceData($device))
                ->all(),
            'conversations' => $conversations->map(fn (WhatsappConversation $conversation): array => $this->conversationData($conversation))->all(),
            'conversationCount' => $conversations->count(),
        ]);
    }

    /**
     * Show a single conversation thread.
     */
    public function show(Request $request, WhatsappConversation $whatsappConversation): Response
    {
        Gate::authorize('view', $whatsappConversation);

        $whatsappConversation->loadMissing(['tenant', 'device', 'contact', 'latestMessage']);

        $messages = $whatsappConversation->messages()
            ->with(['conversation', 'contact', 'device'])
            ->orderBy('id')
            ->get();
        $conversations = $whatsappConversation->tenant
            ->conversations()
            ->with(['tenant', 'contact', 'device', 'latestMessage'])
            ->latest('last_message_at')
            ->get();

        return Inertia::render('inbox/show', [
            'tenant' => [
                'id' => $whatsappConversation->tenant->id,
                'ulid' => $whatsappConversation->tenant->ulid,
                'name' => $whatsappConversation->tenant->name,
                'slug' => $whatsappConversation->tenant->slug,
                'status' => $whatsappConversation->tenant->status->value,
                'device_limit' => $whatsappConversation->tenant->device_limit,
            ],
            'conversation' => $this->conversationData($whatsappConversation),
            'conversations' => $conversations
                ->map(fn (WhatsappConversation $conversation): array => $this->conversationData($conversation))
                ->all(),
            'messages' => $messages->map(fn (WhatsappMessage $message): array => $this->messageData($message))->all(),
            'canReply' => Gate::allows('create', [WhatsappMessage::class, $whatsappConversation]),
        ]);
    }

    private function currentTenant(Request $request): ?Tenant
    {
        /** @var Tenant|null $tenant */
        $tenant = $request->attributes->get('currentTenant');

        return $tenant;
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationData(WhatsappConversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'ulid' => $conversation->ulid,
            'tenant_id' => $conversation->tenant_id,
            'status' => $conversation->status->value,
            'last_message_at' => $conversation->last_message_at?->toIso8601String(),
            'last_inbound_message_at' => $conversation->last_inbound_message_at?->toIso8601String(),
            'last_outbound_message_at' => $conversation->last_outbound_message_at?->toIso8601String(),
            'tenant' => [
                'id' => $conversation->tenant->id,
                'ulid' => $conversation->tenant->ulid,
                'name' => $conversation->tenant->name,
                'slug' => $conversation->tenant->slug,
                'status' => $conversation->tenant->status->value,
                'device_limit' => $conversation->tenant->device_limit,
            ],
            'device' => $this->deviceData($conversation->device),
            'contact' => [
                'id' => $conversation->contact->id,
                'ulid' => $conversation->contact->ulid,
                'display_name' => $conversation->contact->display_name,
                'external_id' => $conversation->contact->external_id,
                'phone_number' => $conversation->contact->phone_number,
            ],
            'latest_message' => $conversation->latestMessage ? $this->messageData($conversation->latestMessage) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function deviceData(WhatsappDevice $device): array
    {
        return [
            'id' => $device->id,
            'ulid' => $device->ulid,
            'display_name' => $device->display_name,
            'gowa_device_id' => $device->gowa_device_id,
            'status' => $device->status->value,
            'connection_status' => $device->connection_status->value,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function messageData(WhatsappMessage $message): array
    {
        return [
            'id' => $message->id,
            'ulid' => $message->ulid,
            'direction' => $message->direction->value,
            'kind' => $message->kind,
            'status' => $message->status->value,
            'body' => $message->body,
            'media_disk' => $message->media_disk,
            'media_path' => $message->media_path,
            'media_original_name' => $message->media_original_name,
            'media_mime_type' => $message->media_mime_type,
            'media_size' => $message->media_size,
            'media_uploaded_at' => $message->media_uploaded_at?->toIso8601String(),
            'media_url' => $this->mediaUrl($message),
            'payload' => $message->payload,
            'metadata' => $message->metadata,
            'received_at' => $message->received_at?->toIso8601String(),
            'sent_at' => $message->sent_at?->toIso8601String(),
            'failed_at' => $message->failed_at?->toIso8601String(),
            'error_message' => $message->error_message,
            'has_media' => $message->hasMedia(),
            'is_failed' => $message->isFailed(),
            'is_outbound' => $message->isOutbound(),
        ];
    }

    private function mediaUrl(WhatsappMessage $message): ?string
    {
        if ($message->media_path === null) {
            return null;
        }

        if (Str::startsWith($message->media_path, ['http://', 'https://'])) {
            return $message->media_path;
        }

        $disk = $message->media_disk ?? 'public';

        return Storage::disk($disk)->url($message->media_path);
    }
}
