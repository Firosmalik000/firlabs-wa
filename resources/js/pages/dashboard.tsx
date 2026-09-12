import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Bot,
    ChevronRight,
    CircleAlert,
    Inbox,
    MessageCircleMore,
    Plus,
    Radio,
    Smartphone,
    Sparkles,
    Wifi,
    WifiOff,
    Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as adminIndex } from '@/routes/admin';
import { index as botRulesIndex } from '@/routes/bot-rules';
import {
    create as devicesCreate,
    index as devicesIndex,
    show as deviceShow,
} from '@/routes/devices';
import { index as inboxIndex, show as inboxShow } from '@/routes/inbox';
import type { TenantSummary } from '@/types/auth';
import type {
    WhatsappConnectionStatus,
    WhatsappDeviceStatus,
} from '@/types/device';

type DashboardStats = {
    devices: number;
    connected_devices: number;
    conversations: number;
    open_conversations: number;
    messages_today: number;
    outbound_today: number;
    active_bot_rules: number;
    total_bot_rules: number;
};

type RecentDevice = {
    id: number;
    ulid: string;
    display_name: string;
    phone_number: string | null;
    status: WhatsappDeviceStatus;
    connection_status: WhatsappConnectionStatus;
    last_connected_at: string | null;
};

type RecentConversation = {
    id: number;
    ulid: string;
    contact_name: string;
    device_name: string;
    status: 'open' | 'closed';
    last_message_at: string | null;
    latest_message: string | null;
    latest_direction: 'inbound' | 'outbound' | null;
};

type Props = {
    tenant: TenantSummary | null;
    stats: DashboardStats;
    recentDevices: RecentDevice[];
    recentConversations: RecentConversation[];
};

const connectionLabel: Record<WhatsappConnectionStatus, string> = {
    connected: 'Connected',
    connecting: 'Connecting',
    disconnected: 'Disconnected',
    error: 'Needs attention',
    logged_out: 'Logged out',
    waiting_scan: 'Waiting to pair',
};

function formatRelativeDate(value: string | null): string {
    if (!value) {
        return 'No activity yet';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function Dashboard({
    tenant,
    stats,
    recentDevices,
    recentConversations,
}: Props) {
    if (!tenant) {
        return (
            <>
                <Head title="Dashboard" />
                <div className="dashboard-rise flex min-h-[65vh] items-center justify-center">
                    <Card className="max-w-xl border-emerald-200/70 bg-white/90 text-center dark:border-emerald-900 dark:bg-card/90">
                        <CardContent className="grid justify-items-center gap-5 p-10">
                            <span className="flex size-16 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20">
                                <Sparkles className="size-8" />
                            </span>
                            <div className="grid gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Select a workspace
                                </h1>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    This account does not have an active
                                    workspace selected. Super Admin tools remain
                                    available.
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={adminIndex()}>
                                    Open Super Admin
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    const deviceUsage =
        tenant.device_limit > 0
            ? Math.min(
                  100,
                  Math.round((stats.devices / tenant.device_limit) * 100),
              )
            : 0;
    const connectedPercent =
        stats.devices > 0
            ? Math.round((stats.connected_devices / stats.devices) * 100)
            : 0;

    return (
        <>
            <Head title="Dashboard" />

            <div className="dashboard-rise space-y-4">
                <section className="relative overflow-hidden rounded-[1.5rem] bg-[#123c2f] px-5 py-5 text-white shadow-xl shadow-emerald-950/15 sm:px-6 sm:py-6">
                    <div className="dashboard-hero-grid absolute inset-0 opacity-30" />
                    <div className="absolute -top-24 -right-20 size-72 rounded-full bg-lime-300/20 blur-3xl" />
                    <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-emerald-400/15 blur-3xl" />

                    <div className="relative grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
                        <div className="max-w-3xl space-y-3">
                            <Badge className="border-white/15 bg-white/10 text-lime-100 hover:bg-white/10">
                                <Radio className="mr-1 size-3.5" />
                                Operations center
                            </Badge>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-emerald-200">
                                    Workspace {tenant.name}
                                </p>
                                <h1 className="max-w-2xl text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                                    WhatsApp operations center
                                </h1>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    className="bg-lime-300 text-emerald-950 hover:bg-lime-200"
                                >
                                    <Link href={inboxIndex()}>
                                        <Inbox className="size-4" />
                                        Open inbox
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                                >
                                    <Link href={devicesCreate()}>
                                        <Plus className="size-4" />
                                        Connect device
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid min-w-64 grid-cols-2 gap-3">
                            <HeroMetric
                                label="Connected"
                                value={`${stats.connected_devices}/${stats.devices}`}
                                detail={`${connectedPercent}% online`}
                            />
                            <HeroMetric
                                label="Messages today"
                                value={stats.messages_today.toLocaleString(
                                    'id-ID',
                                )}
                                detail={`${stats.outbound_today} outbound`}
                            />
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={Smartphone}
                        label="WhatsApp devices"
                        value={stats.devices}
                        detail={`${stats.connected_devices} connected`}
                        tone="emerald"
                        href={devicesIndex()}
                    />
                    <MetricCard
                        icon={MessageCircleMore}
                        label="Conversations"
                        value={stats.conversations}
                        detail={`${stats.open_conversations} open threads`}
                        tone="sky"
                        href={inboxIndex()}
                    />
                    <MetricCard
                        icon={Zap}
                        label="Messages today"
                        value={stats.messages_today}
                        detail={`${stats.outbound_today} sent by team`}
                        tone="amber"
                        href={inboxIndex()}
                    />
                    <MetricCard
                        icon={Bot}
                        label="Active automations"
                        value={stats.active_bot_rules}
                        detail={`${stats.total_bot_rules} total rules`}
                        tone="rose"
                        href={botRulesIndex()}
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60">
                            <div className="grid gap-1">
                                <CardTitle>Recent conversations</CardTitle>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={inboxIndex()}>
                                    View inbox
                                    <ChevronRight className="size-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentConversations.length === 0 ? (
                                <EmptyPanel
                                    icon={Inbox}
                                    title="Inbox is quiet"
                                    href={devicesIndex()}
                                    action="Check devices"
                                />
                            ) : (
                                <div className="divide-y divide-border/60">
                                    {recentConversations.map((conversation) => (
                                        <Link
                                            key={conversation.id}
                                            href={inboxShow({
                                                whatsappConversation:
                                                    conversation.ulid,
                                            })}
                                            className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-emerald-50/60 dark:hover:bg-emerald-950/15"
                                        >
                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                                                {conversation.contact_name
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-semibold">
                                                        {
                                                            conversation.contact_name
                                                        }
                                                    </p>
                                                    {conversation.status ===
                                                        'open' && (
                                                        <span className="size-2 rounded-full bg-emerald-500" />
                                                    )}
                                                </div>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {conversation.latest_direction ===
                                                    'outbound'
                                                        ? 'You: '
                                                        : ''}
                                                    {conversation.latest_message ??
                                                        'Media message'}
                                                </p>
                                            </div>
                                            <div className="hidden text-right sm:block">
                                                <p className="text-xs text-muted-foreground">
                                                    {conversation.device_name}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatRelativeDate(
                                                        conversation.last_message_at,
                                                    )}
                                                </p>
                                            </div>
                                            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="grid gap-1">
                                    <CardTitle>Device health</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.devices} of {tenant.device_limit}{' '}
                                        slots used
                                    </p>
                                </div>
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <Wifi className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid gap-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Device capacity</span>
                                        <span>{deviceUsage}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-400 transition-all duration-700"
                                            style={{ width: `${deviceUsage}%` }}
                                        />
                                    </div>
                                </div>

                                {recentDevices.length === 0 ? (
                                    <EmptyPanel
                                        icon={Smartphone}
                                        title="No device connected"
                                        href={devicesCreate()}
                                        action="Connect device"
                                        compact
                                    />
                                ) : (
                                    <div className="grid gap-2">
                                        {recentDevices.map((device) => (
                                            <Link
                                                key={device.id}
                                                href={deviceShow({
                                                    whatsappDevice: device.ulid,
                                                })}
                                                className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition-all hover:border-emerald-300 hover:shadow-sm dark:hover:border-emerald-800"
                                            >
                                                <span
                                                    className={`flex size-9 items-center justify-center rounded-xl ${
                                                        device.connection_status ===
                                                        'connected'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {device.connection_status ===
                                                    'connected' ? (
                                                        <Wifi className="size-4" />
                                                    ) : (
                                                        <WifiOff className="size-4" />
                                                    )}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold">
                                                        {device.display_name}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {device.phone_number
                                                            ? `+${device.phone_number}`
                                                            : connectionLabel[
                                                                  device
                                                                      .connection_status
                                                              ]}
                                                    </p>
                                                </div>
                                                <ChevronRight className="size-4 text-muted-foreground" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-amber-200/70 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/15">
                            <CardContent className="flex items-start gap-4 p-5">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200/70 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                    <CircleAlert className="size-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">
                                        Quick setup check
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        GOWA and queue worker must remain
                                        online.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </>
    );
}

function HeroMetric({
    label,
    value,
    detail,
}: {
    label: string;
    value: string | number;
    detail: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/8 p-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-emerald-100/60">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-lime-200/75">{detail}</p>
        </div>
    );
}

const metricTones = {
    emerald:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

function MetricCard({
    icon: Icon,
    label,
    value,
    detail,
    tone,
    href,
}: {
    icon: typeof Smartphone;
    label: string;
    value: number;
    detail: string;
    tone: keyof typeof metricTones;
    href: ReturnType<typeof devicesIndex>;
}) {
    return (
        <Link href={href} className="group">
            <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5 dark:hover:border-emerald-900">
                <CardContent className="flex items-start gap-3 p-4">
                    <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${metricTones[tone]}`}
                    >
                        <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold tracking-tight">
                            {value.toLocaleString('id-ID')}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {detail}
                        </p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600" />
                </CardContent>
            </Card>
        </Link>
    );
}

function EmptyPanel({
    icon: Icon,
    title,
    href,
    action,
    compact = false,
}: {
    icon: typeof Inbox;
    title: string;
    href: ReturnType<typeof devicesIndex>;
    action: string;
    compact?: boolean;
}) {
    return (
        <div
            className={`grid justify-items-center gap-3 text-center ${compact ? 'py-4' : 'px-6 py-12'}`}
        >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Icon className="size-5" />
            </span>
            <p className="font-semibold">{title}</p>
            <Button asChild variant="outline" size="sm">
                <Link href={href}>{action}</Link>
            </Button>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
