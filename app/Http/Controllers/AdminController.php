<?php

namespace App\Http\Controllers;

use App\Enums\GlobalRole;
use App\Enums\TenantStatus;
use App\Enums\UserStatus;
use App\Enums\WhatsappDeviceStatus;
use App\Http\Requests\Admin\UpdateTenantStatusRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WebhookLog;
use App\Models\WhatsappDevice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/index', [
            'summary' => [
                'users' => User::query()->count(),
                'active_users' => User::query()->where('status', UserStatus::Active->value)->count(),
                'tenants' => Tenant::query()->count(),
                'active_tenants' => Tenant::query()->where('status', TenantStatus::Active->value)->count(),
                'devices' => WhatsappDevice::query()->count(),
                'active_devices' => WhatsappDevice::query()->where('status', WhatsappDeviceStatus::Active->value)->count(),
                'webhook_logs' => WebhookLog::query()->count(),
                'failed_jobs' => DB::table('failed_jobs')->count(),
            ],
            'sections' => $this->sectionLinks(),
            'recentWebhookLogs' => WebhookLog::query()
                ->with(['tenant', 'device'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (WebhookLog $log): array => $this->webhookLogData($log))
                ->all(),
        ]);
    }

    public function users(): Response
    {
        return Inertia::render('admin/users', [
            'users' => User::query()
                ->with('currentTenant')
                ->withCount('tenants')
                ->latest()
                ->get()
                ->map(fn (User $user): array => $this->userData($user))
                ->all(),
        ]);
    }

    public function updateUserStatus(UpdateUserStatusRequest $request, User $user): RedirectResponse
    {
        $status = UserStatus::from((string) $request->validated('status'));

        abort_if(
            $request->user()?->is($user) && $status === UserStatus::Suspended,
            422,
            __('You cannot suspend your own account.'),
        );

        if ($user->isSuperAdmin() && $status === UserStatus::Suspended) {
            $activeSuperAdmins = User::query()
                ->where('global_role', GlobalRole::SuperAdmin->value)
                ->where('status', UserStatus::Active->value)
                ->count();

            abort_if($activeSuperAdmins <= 1, 422, __('At least one active Super Admin is required.'));
        }

        $user->forceFill(['status' => $status])->save();

        return back()->with('success', __('User status updated.'));
    }

    public function tenants(): Response
    {
        return Inertia::render('admin/tenants', [
            'tenants' => Tenant::query()
                ->withCount(['users', 'devices', 'messages', 'webhookLogs'])
                ->latest()
                ->get()
                ->map(fn (Tenant $tenant): array => $this->tenantData($tenant))
                ->all(),
        ]);
    }

    public function updateTenantStatus(UpdateTenantStatusRequest $request, Tenant $tenant): RedirectResponse
    {
        $tenant->forceFill([
            'status' => TenantStatus::from((string) $request->validated('status')),
        ])->save();

        return back()->with('success', __('Tenant status updated.'));
    }

    public function devices(): Response
    {
        return Inertia::render('admin/devices', [
            'devices' => WhatsappDevice::query()
                ->with(['tenant', 'creator'])
                ->latest()
                ->get()
                ->map(fn (WhatsappDevice $device): array => $this->deviceData($device))
                ->all(),
        ]);
    }

    public function webhookLogs(): Response
    {
        return Inertia::render('admin/webhook-logs', [
            'logs' => WebhookLog::query()
                ->with(['tenant', 'device'])
                ->latest()
                ->limit(25)
                ->get()
                ->map(fn (WebhookLog $log): array => $this->webhookLogData($log))
                ->all(),
        ]);
    }

    public function auditLogs(): Response
    {
        return Inertia::render('admin/audit-logs', [
            'message' => __('Audit logging is not implemented yet. This page is reserved for the next phase.'),
        ]);
    }

    public function failedJobs(): Response
    {
        return Inertia::render('admin/failed-jobs', [
            'jobs' => DB::table('failed_jobs')
                ->orderByDesc('id')
                ->limit(25)
                ->get()
                ->map(fn (object $job): array => $this->failedJobData($job))
                ->all(),
        ]);
    }

    /**
     * @return array<int, array{title: string, href: string, description: string}>
     */
    private function sectionLinks(): array
    {
        return [
            [
                'title' => 'Users',
                'href' => route('admin.users.index', absolute: false),
                'description' => 'Review global access, status, and tenant membership.',
            ],
            [
                'title' => 'Tenants',
                'href' => route('admin.tenants.index', absolute: false),
                'description' => 'Check workspace status, members, and device limits.',
            ],
            [
                'title' => 'Devices',
                'href' => route('admin.devices.index', absolute: false),
                'description' => 'Inspect all WhatsApp devices across tenants.',
            ],
            [
                'title' => 'Webhook Logs',
                'href' => route('admin.webhook-logs.index', absolute: false),
                'description' => 'Review incoming webhook activity and processing state.',
            ],
            [
                'title' => 'Audit Logs',
                'href' => route('admin.audit-logs.index', absolute: false),
                'description' => 'Reserved for future audit visibility.',
            ],
            [
                'title' => 'Failed Jobs',
                'href' => route('admin.failed-jobs.index', absolute: false),
                'description' => 'Inspect queued job failures and recent exceptions.',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'global_role' => $user->global_role->value,
            'status' => $user->status->value,
            'tenants_count' => $user->tenants_count ?? 0,
            'current_tenant' => $user->currentTenant === null ? null : [
                'id' => $user->currentTenant->id,
                'ulid' => $user->currentTenant->ulid,
                'name' => $user->currentTenant->name,
                'slug' => $user->currentTenant->slug,
                'status' => $user->currentTenant->status->value,
            ],
            'created_at' => $user->created_at?->toIso8601String(),
        ];
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
            'users_count' => $tenant->users_count ?? 0,
            'devices_count' => $tenant->devices_count ?? 0,
            'messages_count' => $tenant->messages_count ?? 0,
            'webhook_logs_count' => $tenant->webhook_logs_count ?? 0,
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
            'tenant' => $device->tenant === null ? null : [
                'id' => $device->tenant->id,
                'ulid' => $device->tenant->ulid,
                'name' => $device->tenant->name,
                'slug' => $device->tenant->slug,
                'status' => $device->tenant->status->value,
            ],
            'creator' => $device->creator === null ? null : [
                'id' => $device->creator->id,
                'name' => $device->creator->name,
                'email' => $device->creator->email,
            ],
            'phone_number' => $device->phone_number,
            'whatsapp_jid' => $device->whatsapp_jid,
            'last_connected_at' => $device->last_connected_at?->toIso8601String(),
            'last_disconnected_at' => $device->last_disconnected_at?->toIso8601String(),
            'last_error_at' => $device->last_error_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function webhookLogData(WebhookLog $log): array
    {
        return [
            'id' => $log->id,
            'ulid' => $log->ulid,
            'event_type' => $log->event_type,
            'signature_valid' => $log->signature_valid,
            'status' => $log->status,
            'tenant' => $log->tenant === null ? null : [
                'id' => $log->tenant->id,
                'ulid' => $log->tenant->ulid,
                'name' => $log->tenant->name,
            ],
            'device' => $log->device === null ? null : [
                'id' => $log->device->id,
                'ulid' => $log->device->ulid,
                'display_name' => $log->device->display_name,
                'gowa_device_id' => $log->device->gowa_device_id,
            ],
            'received_at' => $log->received_at?->toIso8601String(),
            'processed_at' => $log->processed_at?->toIso8601String(),
            'error_message' => $log->error_message,
        ];
    }

    /**
     * @param  object{id:int,uuid:string,connection:string,queue:string,exception:string,failed_at:string|null}  $job
     * @return array<string, mixed>
     */
    private function failedJobData(object $job): array
    {
        return [
            'id' => $job->id,
            'uuid' => $job->uuid,
            'connection' => $job->connection,
            'queue' => $job->queue,
            'failed_at' => $job->failed_at,
            'exception' => mb_substr($job->exception, 0, 240),
        ];
    }
}
