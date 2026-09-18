<?php

namespace App\Http\Controllers;

use App\Enums\WhatsappConnectionStatus;
use App\Enums\WhatsappDeviceStatus;
use App\Http\Requests\PairWhatsappDeviceRequest;
use App\Http\Requests\StoreWhatsappDeviceRequest;
use App\Http\Requests\UpdateWhatsappDeviceRequest;
use App\Models\Tenant;
use App\Models\WhatsappDevice;
use App\Services\AuditLogService;
use App\Services\Gowa\GowaDeviceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Throwable;

class WhatsappDeviceController extends Controller
{
    public function __construct(
        private readonly GowaDeviceService $gowaDeviceService,
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', WhatsappDevice::class);

        $user = $request->user();
        $tenant = $this->currentTenant($request);
        $isSuperAdmin = $user?->isSuperAdmin() ?? false;

        $devices = $isSuperAdmin
            ? WhatsappDevice::query()
                ->with(['tenant', 'creator'])
                ->latest()
                ->get()
            : $this->tenantOrFail($tenant)
                ->devices()
                ->with(['tenant', 'creator'])
                ->latest()
                ->get();

        return Inertia::render('devices/index', [
            'devices' => $devices->map(fn (WhatsappDevice $device): array => $this->deviceData($device))->all(),
            'tenant' => $tenant === null ? null : $this->tenantData($tenant),
            'canCreate' => $tenant !== null && $tenant->devices()->count() < $tenant->device_limit,
            'canManageAll' => $isSuperAdmin,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', WhatsappDevice::class);

        $tenant = $this->tenantOrFail($this->currentTenant($request));

        return Inertia::render('devices/create', [
            'tenant' => $this->tenantData($tenant),
            'deviceCount' => $tenant->devices()->count(),
            'deviceLimit' => $tenant->device_limit,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWhatsappDeviceRequest $request): RedirectResponse
    {
        $tenant = $this->tenantOrFail($this->currentTenant($request));

        if ($tenant->devices()->count() >= $tenant->device_limit) {
            throw ValidationException::withMessages([
                'display_name' => __('This workspace has reached its device limit.'),
            ]);
        }

        $device = DB::transaction(function () use ($request, $tenant): WhatsappDevice {
            /** @var WhatsappDevice $device */
            $device = WhatsappDevice::query()->create([
                'ulid' => Str::lower((string) Str::ulid()),
                'tenant_id' => $tenant->id,
                'created_by' => $request->user()?->id,
                'display_name' => $request->validated('display_name'),
                'description' => $request->validated('description'),
                'gowa_device_id' => WhatsappDevice::generateGowaDeviceId(),
                'status' => WhatsappDeviceStatus::Pending,
                'connection_status' => WhatsappConnectionStatus::WaitingScan,
            ]);

            return $device;
        });

        $this->auditLogService->record(
            'device.created',
            actor: $request->user(),
            tenant: $tenant,
            device: $device,
            subject: $device,
            metadata: ['display_name' => $device->display_name],
            request: $request,
        );

        $this->gowaDeviceService->initializeDevice($device);

        $this->flashDeviceResult(
            $device->refresh(),
            __('Device created. Scan the QR code or request a pairing code to connect it.'),
        );

        return to_route('devices.show', $device)
            ->with('success', __('Device created successfully.'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, WhatsappDevice $whatsappDevice): Response
    {
        Gate::authorize('view', $whatsappDevice);

        $whatsappDevice->loadMissing(['tenant', 'creator']);

        return Inertia::render('devices/show', [
            'device' => $this->deviceData($whatsappDevice),
            'tenant' => $this->tenantData($whatsappDevice->tenant),
            'canManage' => Gate::allows('update', $whatsappDevice),
            'gatewayConfigured' => filled(config('services.gowa.base_url')),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, WhatsappDevice $whatsappDevice): Response
    {
        Gate::authorize('update', $whatsappDevice);

        $whatsappDevice->loadMissing(['tenant', 'creator']);

        return Inertia::render('devices/edit', [
            'device' => $this->deviceData($whatsappDevice),
            'tenant' => $this->tenantData($whatsappDevice->tenant),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWhatsappDeviceRequest $request, WhatsappDevice $whatsappDevice): RedirectResponse
    {
        $whatsappDevice->fill($request->validated());
        $whatsappDevice->save();

        $this->auditLogService->record(
            'device.updated',
            actor: $request->user(),
            device: $whatsappDevice,
            subject: $whatsappDevice,
            metadata: ['display_name' => $whatsappDevice->display_name],
            request: $request,
        );

        return to_route('devices.show', $whatsappDevice)
            ->with('success', __('Device updated successfully.'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, WhatsappDevice $whatsappDevice): RedirectResponse
    {
        Gate::authorize('delete', $whatsappDevice);

        $device = $this->gowaDeviceService->removeDevice($whatsappDevice);

        if ($device->connection_status === WhatsappConnectionStatus::Error) {
            $this->flashDeviceResult($device, '');

            return back();
        }

        $whatsappDevice->delete();

        $this->auditLogService->record(
            'device.deleted',
            actor: $request->user(),
            device: $whatsappDevice,
            subject: $whatsappDevice,
            metadata: ['display_name' => $whatsappDevice->display_name],
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Device removed.'),
        ]);

        return to_route('devices.index')
            ->with('success', __('Device deleted successfully.'));
    }

    public function reconnect(Request $request, WhatsappDevice $whatsappDevice): RedirectResponse
    {
        Gate::authorize('update', $whatsappDevice);

        $device = $this->gowaDeviceService->reconnectDevice($whatsappDevice);
        $this->flashDeviceResult($device, __('Reconnect request sent to GOWA.'));

        return back();
    }

    public function logout(Request $request, WhatsappDevice $whatsappDevice): RedirectResponse
    {
        Gate::authorize('update', $whatsappDevice);

        $device = $this->gowaDeviceService->logOutDevice($whatsappDevice);
        $this->flashDeviceResult($device, __('Device session logged out.'));

        return back();
    }

    public function startQr(Request $request, WhatsappDevice $whatsappDevice): RedirectResponse
    {
        Gate::authorize('update', $whatsappDevice);

        $device = $this->gowaDeviceService->startQrPairing($whatsappDevice);
        $this->flashDeviceResult($device, __('A fresh QR code is ready to scan.'));

        return back();
    }

    public function pair(PairWhatsappDeviceRequest $request, WhatsappDevice $whatsappDevice): RedirectResponse
    {
        $phone = $request->string('phone')->toString();
        $device = $this->gowaDeviceService->startCodePairing(
            $whatsappDevice,
            $phone,
        );
        $this->flashDeviceResult($device, __('Pairing code generated.'));

        return back();
    }

    public function sync(Request $request, WhatsappDevice $whatsappDevice): RedirectResponse
    {
        Gate::authorize('update', $whatsappDevice);

        $device = $this->gowaDeviceService->syncDeviceStatus($whatsappDevice);
        $this->flashDeviceResult($device, __('Device status refreshed.'));

        return back();
    }

    public function qrCode(Request $request, WhatsappDevice $whatsappDevice): HttpResponse
    {
        Gate::authorize('update', $whatsappDevice);

        abort_unless(
            $this->hasActiveQrCode($whatsappDevice),
            410,
            __('The QR code has expired. Generate a new QR code and try again.'),
        );

        try {
            $image = $this->gowaDeviceService->qrCodeImage($whatsappDevice);
        } catch (Throwable) {
            abort(502, __('The QR code could not be loaded. Generate a new QR code and try again.'));
        }

        return response($image['contents'], 200, [
            'Content-Type' => $image['content_type'],
            'Cache-Control' => 'no-store, private',
            'X-Content-Type-Options' => 'nosniff',
        ]);
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
            'tenant_id' => $device->tenant_id,
            'tenant' => $device->relationLoaded('tenant') && $device->tenant !== null
                ? $this->tenantData($device->tenant)
                : null,
            'created_by' => $device->created_by,
            'display_name' => $device->display_name,
            'description' => $device->description,
            'gowa_device_id' => $device->gowa_device_id,
            'phone_number' => $device->phone_number,
            'whatsapp_jid' => $device->whatsapp_jid,
            'status' => $device->status->value,
            'connection_status' => $device->connection_status->value,
            'connected_at' => $device->connected_at?->toIso8601String(),
            'last_connected_at' => $device->last_connected_at?->toIso8601String(),
            'last_disconnected_at' => $device->last_disconnected_at?->toIso8601String(),
            'last_error_message' => $device->last_error_message,
            'last_error_at' => $device->last_error_at?->toIso8601String(),
            'pairing' => [
                'mode' => data_get($device->metadata, 'pairing.mode'),
                'phone' => data_get($device->metadata, 'pairing.phone'),
                'pair_code' => data_get($device->metadata, 'pairing.pair_code'),
                'qr_available' => $this->hasActiveQrCode($device),
                'qr_expires_at' => data_get($device->metadata, 'pairing.qr_expires_at'),
                'requested_at' => data_get($device->metadata, 'pairing.requested_at'),
            ],
            'created_at' => $device->created_at?->toIso8601String(),
            'updated_at' => $device->updated_at?->toIso8601String(),
        ];
    }

    private function hasActiveQrCode(WhatsappDevice $device): bool
    {
        $qrLink = data_get($device->metadata, 'pairing.qr_link');
        $expiresAt = data_get($device->metadata, 'pairing.qr_expires_at');

        if (! is_string($qrLink) || $qrLink === '' || ! is_string($expiresAt)) {
            return false;
        }

        try {
            return Carbon::parse($expiresAt)->isFuture();
        } catch (Throwable) {
            return false;
        }
    }

    private function flashDeviceResult(WhatsappDevice $device, string $successMessage): void
    {
        $failed = $device->connection_status === WhatsappConnectionStatus::Error;

        Inertia::flash('toast', [
            'type' => $failed ? 'error' : 'success',
            'message' => $failed
                ? __('GOWA request failed. Review the connection error and configuration.')
                : $successMessage,
        ]);
    }
}
