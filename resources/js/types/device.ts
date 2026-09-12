export type WhatsappDeviceStatus = 'active' | 'pending' | 'suspended';

export type WhatsappConnectionStatus =
    | 'connected'
    | 'connecting'
    | 'disconnected'
    | 'error'
    | 'logged_out'
    | 'waiting_scan';

export type WhatsappDeviceSummary = {
    id: number;
    ulid: string;
    tenant_id: number;
    tenant?: {
        id: number;
        ulid: string;
        name: string;
        slug: string;
        status: 'active' | 'suspended';
        device_limit: number;
    } | null;
    created_by: number | null;
    display_name: string;
    description: string | null;
    gowa_device_id: string;
    phone_number: string | null;
    whatsapp_jid: string | null;
    status: WhatsappDeviceStatus;
    connection_status: WhatsappConnectionStatus;
    connected_at: string | null;
    last_connected_at: string | null;
    last_disconnected_at: string | null;
    last_error_message: string | null;
    last_error_at: string | null;
    pairing: {
        mode: 'qr' | 'code' | null;
        phone: string | null;
        pair_code: string | null;
        qr_available: boolean;
        qr_expires_at: string | null;
        requested_at: string | null;
    };
    created_at: string | null;
    updated_at: string | null;
};
