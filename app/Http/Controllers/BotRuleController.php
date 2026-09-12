<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBotRuleRequest;
use App\Http\Requests\UpdateBotRuleRequest;
use App\Models\BotRule;
use App\Models\Tenant;
use App\Models\WhatsappDevice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BotRuleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', BotRule::class);

        $tenant = $this->currentTenant($request);
        $tenant = $this->tenantOrFail($tenant);

        $rules = $tenant->botRules()
            ->with(['device'])
            ->latest()
            ->get();

        return Inertia::render('bot-rules/index', [
            'tenant' => $this->tenantData($tenant),
            'devices' => $tenant->devices()
                ->orderBy('display_name')
                ->get()
                ->map(fn (WhatsappDevice $device): array => $this->deviceData($device))
                ->all(),
            'rules' => $rules->map(fn (BotRule $botRule): array => $this->botRuleData($botRule))->all(),
            'ruleCount' => $rules->count(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', BotRule::class);

        $tenant = $this->tenantOrFail($this->currentTenant($request));

        return Inertia::render('bot-rules/create', [
            'tenant' => $this->tenantData($tenant),
            'devices' => $tenant->devices()
                ->orderBy('display_name')
                ->get()
                ->map(fn (WhatsappDevice $device): array => $this->deviceData($device))
                ->all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBotRuleRequest $request): RedirectResponse
    {
        $tenant = $this->tenantOrFail($this->currentTenant($request));

        $botRule = BotRule::query()->create([
            'ulid' => Str::lower((string) Str::ulid()),
            'tenant_id' => $tenant->id,
            'whatsapp_device_id' => $request->validated('whatsapp_device_id'),
            'name' => $request->validated('name'),
            'match_type' => $request->validated('match_type'),
            'trigger_text' => $request->validated('trigger_text'),
            'response_text' => $request->validated('response_text'),
            'priority' => $request->validated('priority'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return to_route('bot-rules.index')
            ->with('success', __('Bot rule created successfully.'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, BotRule $botRule): Response
    {
        Gate::authorize('update', $botRule);

        $botRule->loadMissing(['tenant', 'device']);

        $tenant = $botRule->tenant;

        return Inertia::render('bot-rules/edit', [
            'tenant' => $this->tenantData($tenant),
            'rule' => $this->botRuleData($botRule),
            'devices' => $tenant->devices()
                ->orderBy('display_name')
                ->get()
                ->map(fn (WhatsappDevice $device): array => $this->deviceData($device))
                ->all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBotRuleRequest $request, BotRule $botRule): RedirectResponse
    {
        $botRule->fill($request->validated());
        $botRule->save();

        return to_route('bot-rules.index')
            ->with('success', __('Bot rule updated successfully.'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, BotRule $botRule): RedirectResponse
    {
        Gate::authorize('delete', $botRule);

        $botRule->delete();

        return to_route('bot-rules.index')
            ->with('success', __('Bot rule deleted successfully.'));
    }

    private function currentTenant(Request $request): ?Tenant
    {
        /** @var Tenant|null $tenant */
        $tenant = $request->attributes->get('currentTenant');

        return $tenant;
    }

    private function tenantOrFail(?Tenant $tenant): Tenant
    {
        abort_unless($tenant !== null, 403);

        return $tenant;
    }

    /**
     * @return array<string, mixed>
     */
    private function tenantData(Tenant $tenant): array
    {
        return [
            'id' => $tenant->id,
            'ulid' => $tenant->ulid,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'status' => $tenant->status->value,
            'device_limit' => $tenant->device_limit,
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
    private function botRuleData(BotRule $botRule): array
    {
        return [
            'id' => $botRule->id,
            'ulid' => $botRule->ulid,
            'tenant_id' => $botRule->tenant_id,
            'whatsapp_device_id' => $botRule->whatsapp_device_id,
            'device' => $botRule->relationLoaded('device') && $botRule->device !== null
                ? $this->deviceData($botRule->device)
                : null,
            'name' => $botRule->name,
            'match_type' => $botRule->match_type->value,
            'trigger_text' => $botRule->trigger_text,
            'response_text' => $botRule->response_text,
            'priority' => $botRule->priority,
            'is_active' => $botRule->is_active,
            'created_at' => $botRule->created_at?->toIso8601String(),
            'updated_at' => $botRule->updated_at?->toIso8601String(),
        ];
    }
}
