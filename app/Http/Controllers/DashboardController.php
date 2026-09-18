<?php

namespace App\Http\Controllers;

use App\Enums\WhatsappConnectionStatus;
use App\Enums\WhatsappConversationStatus;
use App\Enums\WhatsappMessageDirection;
use App\Models\Tenant;
use App\Models\WhatsappConversation;
use App\Models\WhatsappDevice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the tenant operations dashboard.
     */
    public function __invoke(Request $request): Response
    {
        /** @var Tenant|null $tenant */
        $tenant = $request->attributes->get('currentTenant');

        if ($tenant === null) {
            return Inertia::render('dashboard', [
                'tenant' => null,
                'stats' => $this->emptyStats(),
                'recentDevices' => [],
                'recentConversations' => [],
                'gatewayConfigured' => filled(config('services.gowa.base_url')),
                'canCreateDevice' => false,
            ]);
        }

        return Inertia::render('dashboard', [
            'tenant' => [
                'id' => $tenant->id,
                'ulid' => $tenant->ulid,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'status' => $tenant->status->value,
                'device_limit' => $tenant->device_limit,
            ],
            'gatewayConfigured' => filled(config('services.gowa.base_url')),
            'canCreateDevice' => $tenant->devices()->count() < $tenant->device_limit,
            'stats' => [
                'devices' => $tenant->devices()->count(),
                'connected_devices' => $tenant->devices()
                    ->where('connection_status', WhatsappConnectionStatus::Connected->value)
                    ->count(),
                'conversations' => $tenant->conversations()->count(),
                'open_conversations' => $tenant->conversations()
                    ->where('status', WhatsappConversationStatus::Open->value)
                    ->count(),
                'messages_today' => $tenant->messages()
                    ->whereDate('created_at', today())
                    ->count(),
                'outbound_today' => $tenant->messages()
                    ->where('direction', WhatsappMessageDirection::Outbound->value)
                    ->whereDate('created_at', today())
                    ->count(),
                'active_bot_rules' => $tenant->botRules()->where('is_active', true)->count(),
                'total_bot_rules' => $tenant->botRules()->count(),
            ],
            'recentDevices' => $tenant->devices()
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn (WhatsappDevice $device): array => [
                    'id' => $device->id,
                    'ulid' => $device->ulid,
                    'display_name' => $device->display_name,
                    'phone_number' => $device->phone_number,
                    'status' => $device->status->value,
                    'connection_status' => $device->connection_status->value,
                    'last_connected_at' => $device->last_connected_at?->toIso8601String(),
                ])
                ->all(),
            'recentConversations' => $tenant->conversations()
                ->with(['contact', 'device', 'latestMessage'])
                ->latest('last_message_at')
                ->limit(5)
                ->get()
                ->map(fn (WhatsappConversation $conversation): array => [
                    'id' => $conversation->id,
                    'ulid' => $conversation->ulid,
                    'contact_name' => $conversation->contact->display_name,
                    'device_name' => $conversation->device->display_name,
                    'status' => $conversation->status->value,
                    'last_message_at' => $conversation->last_message_at?->toIso8601String(),
                    'latest_message' => $conversation->latestMessage?->body,
                    'latest_direction' => $conversation->latestMessage?->direction->value,
                ])
                ->all(),
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function emptyStats(): array
    {
        return [
            'devices' => 0,
            'connected_devices' => 0,
            'conversations' => 0,
            'open_conversations' => 0,
            'messages_today' => 0,
            'outbound_today' => 0,
            'active_bot_rules' => 0,
            'total_bot_rules' => 0,
        ];
    }
}
