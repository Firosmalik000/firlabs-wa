export type WhatsappMessageDirection = 'inbound' | 'outbound';

export type WhatsappMessageStatus =
    'failed' | 'queued' | 'received' | 'sending' | 'sent';

export type WhatsappMessageSummary = {
    id: number;
    ulid: string;
    direction: WhatsappMessageDirection;
    kind: 'document' | 'image' | 'text';
    status: WhatsappMessageStatus;
    body: string | null;
    media_disk: string | null;
    media_path: string | null;
    media_original_name: string | null;
    media_mime_type: string | null;
    media_size: number | null;
    media_uploaded_at: string | null;
    media_url: string | null;
    payload?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    received_at: string | null;
    sent_at: string | null;
    failed_at: string | null;
    error_message: string | null;
    has_media: boolean;
    is_failed: boolean;
    is_outbound: boolean;
};

export type WhatsappConversationSummary = {
    id: number;
    ulid: string;
    tenant_id: number;
    status: 'open' | 'closed';
    last_message_at: string | null;
    last_inbound_message_at: string | null;
    last_outbound_message_at: string | null;
    tenant: {
        id: number;
        ulid: string;
        name: string;
        slug: string;
        status: 'active' | 'suspended';
        device_limit: number;
    };
    device: {
        id: number;
        ulid: string;
        display_name: string;
        gowa_device_id: string;
        status: 'active' | 'pending' | 'suspended';
        connection_status:
            | 'connected'
            | 'connecting'
            | 'disconnected'
            | 'error'
            | 'logged_out'
            | 'waiting_scan';
    };
    contact: {
        id: number;
        ulid: string;
        display_name: string;
        external_id: string;
        phone_number: string | null;
    };
    latest_message: WhatsappMessageSummary | null;
};
