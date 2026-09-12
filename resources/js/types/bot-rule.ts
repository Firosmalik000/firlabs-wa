export type BotRuleMatchType = 'contains' | 'exact' | 'starts_with';

export type BotRuleDeviceSummary = {
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

export type BotRuleSummary = {
    id: number;
    ulid: string;
    tenant_id: number;
    whatsapp_device_id: number;
    device: BotRuleDeviceSummary | null;
    name: string;
    match_type: BotRuleMatchType;
    trigger_text: string;
    response_text: string;
    priority: number;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
};
