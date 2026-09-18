<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WhatsappDevice;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuditLogService
{
    /**
     * Record an immutable audit entry for an important action.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function record(
        string $action,
        ?User $actor = null,
        ?Tenant $tenant = null,
        ?WhatsappDevice $device = null,
        ?Model $subject = null,
        array $metadata = [],
        ?Request $request = null,
    ): AuditLog {
        return AuditLog::query()->create([
            'ulid' => Str::lower((string) Str::ulid()),
            'tenant_id' => $tenant?->id ?? $device?->tenant_id ?? $actor?->current_tenant_id,
            'user_id' => $actor?->id,
            'whatsapp_device_id' => $device?->id,
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
