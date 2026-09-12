export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    global_role: 'super_admin' | 'user';
    status: 'active' | 'suspended';
    current_tenant_id: number | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TenantSummary = {
    id: number;
    ulid: string;
    name: string;
    slug: string;
    status: 'active' | 'suspended';
    device_limit: number;
    created_at?: string;
    updated_at?: string;
};

export type SharedData = {
    currentTenant: TenantSummary | null;
    can: {
        accessAdmin: boolean;
    };
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
