import type { TenantSummary } from '@/types/auth';

export type AdminSectionLink = {
    title: string;
    href: string;
    description: string;
};

export type AdminSummary = {
    users: number;
    active_users: number;
    tenants: number;
    active_tenants: number;
    devices: number;
    active_devices: number;
    webhook_logs: number;
    failed_jobs: number;
};

export type AdminUserSummary = {
    id: number;
    name: string;
    email: string;
    global_role: 'super_admin' | 'user';
    status: 'active' | 'suspended';
    tenants_count: number;
    current_tenant: TenantSummary | null;
    created_at: string | null;
};

export type AdminTenantSummary = TenantSummary & {
    users_count: number;
    devices_count: number;
    messages_count: number;
    webhook_logs_count: number;
};

export type AdminDeviceSummary = {
    id: number;
    ulid: string;
    display_name: string;
    gowa_device_id: string;
    status: 'pending' | 'active' | 'suspended';
    connection_status:
        | 'waiting_scan'
        | 'connecting'
        | 'connected'
        | 'disconnected'
        | 'logged_out'
        | 'error';
    tenant: TenantSummary | null;
    creator: {
        id: number;
        name: string;
        email: string;
    } | null;
    phone_number: string | null;
    whatsapp_jid: string | null;
    last_connected_at: string | null;
    last_disconnected_at: string | null;
    last_error_at: string | null;
};

export type AdminWebhookLogSummary = {
    id: number;
    ulid: string;
    event_type: string;
    signature_valid: boolean;
    status: string;
    tenant: {
        id: number;
        ulid: string;
        name: string;
    } | null;
    device: {
        id: number;
        ulid: string;
        display_name: string;
        gowa_device_id: string;
    } | null;
    received_at: string | null;
    processed_at: string | null;
    error_message: string | null;
};

export type AdminFailedJobSummary = {
    id: number;
    uuid: string;
    connection: string;
    queue: string;
    failed_at: string | null;
    exception: string;
};
