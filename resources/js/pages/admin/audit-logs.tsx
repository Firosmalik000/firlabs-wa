import { Head, Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp, ScrollText } from 'lucide-react';
import { Fragment, useDeferredValue, useState } from 'react';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index as adminIndex } from '@/routes/admin';
import { index as adminAuditLogsIndex } from '@/routes/admin/audit-logs';
import type { AdminAuditLogSummary } from '@/types/admin';

type Props = {
    logs: AdminAuditLogSummary[];
};

const actionLabels: Record<string, string> = {
    'device.created': 'Device created',
    'device.updated': 'Device updated',
    'device.deleted': 'Device deleted',
    'user.status_updated': 'User status updated',
    'tenant.status_updated': 'Tenant status updated',
    'failed_job.retried': 'Failed job retried',
    'failed_job.forgotten': 'Failed job forgotten',
};

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

function actionLabel(action: string): string {
    return actionLabels[action] ?? action.replaceAll('.', ' ');
}

export default function AdminAuditLogs({ logs }: Props) {
    const [search, setSearch] = useState('');
    const [action, setAction] = useState('all');
    const [expanded, setExpanded] = useState<number | null>(null);
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const actions = Array.from(new Set(logs.map((log) => log.action))).sort();
    const filteredLogs = logs.filter((log) => {
        const matchesSearch = [
            log.user?.name ?? '',
            log.user?.email ?? '',
            log.tenant?.name ?? '',
            log.device?.display_name ?? '',
            log.ip_address ?? '',
            actionLabel(log.action),
        ].some((value) => value.toLowerCase().includes(deferredSearch));

        return matchesSearch && (action === 'all' || log.action === action);
    });

    return (
        <>
            <Head title="Audit Logs" />

            <div className="space-y-4">
                <Heading title="Audit Logs" />

                <Card className="overflow-hidden shadow-sm">
                    <DataTableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        placeholder="Cari aksi, user, tenant, device, IP..."
                        resultCount={filteredLogs.length}
                        filter={{
                            label: 'Aksi',
                            value: action,
                            onChange: setAction,
                            options: [
                                { label: 'Semua aksi', value: 'all' },
                                ...actions.map((value) => ({
                                    label: actionLabel(value),
                                    value,
                                })),
                            ],
                        }}
                    />
                    <CardContent className="p-0">
                        {filteredLogs.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                                <ScrollText className="size-5 text-emerald-600" />{' '}
                                Belum ada audit log.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[820px] text-xs">
                                    <thead className="bg-muted/35 text-left text-[10px] tracking-wider text-muted-foreground uppercase">
                                        <tr className="border-b">
                                            <th className="w-12 px-3 py-2 text-center font-semibold">
                                                No.
                                            </th>
                                            <th className="w-10 px-3 py-2 font-semibold"></th>
                                            <th className="px-3 py-2 font-semibold">
                                                Aksi
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Pelaku
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Workspace
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                IP
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Waktu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log, index) => (
                                            <Fragment key={log.id}>
                                                <tr className="border-b transition hover:bg-muted/25">
                                                    <td className="px-3 py-2.5 text-center font-medium text-muted-foreground tabular-nums">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-7"
                                                            onClick={() =>
                                                                setExpanded(
                                                                    expanded ===
                                                                        log.id
                                                                        ? null
                                                                        : log.id,
                                                                )
                                                            }
                                                        >
                                                            {expanded ===
                                                            log.id ? (
                                                                <ChevronUp className="size-4" />
                                                            ) : (
                                                                <ChevronDown className="size-4" />
                                                            )}
                                                            <span className="sr-only">
                                                                Inspect audit
                                                                log
                                                            </span>
                                                        </Button>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <Badge
                                                            variant="outline"
                                                            className="h-5 text-[10px]"
                                                        >
                                                            {actionLabel(
                                                                log.action,
                                                            )}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        {log.user ? (
                                                            <div>
                                                                <div className="font-medium">
                                                                    {log.user.name}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground">
                                                                    {
                                                                        log.user
                                                                            .email
                                                                    }
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        {log.tenant?.name ??
                                                            '-'}
                                                    </td>
                                                    <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground">
                                                        {log.ip_address ?? '-'}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-muted-foreground">
                                                        {formatDate(
                                                            log.created_at,
                                                        )}
                                                    </td>
                                                </tr>
                                                {expanded === log.id && (
                                                    <tr
                                                        key={`${log.id}-detail`}
                                                        className="border-b bg-muted/20"
                                                    >
                                                        <td
                                                            colSpan={7}
                                                            className="px-4 py-3"
                                                        >
                                                            <div className="grid gap-3 sm:grid-cols-2">
                                                                {log.device && (
                                                                    <div>
                                                                        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                                            Device
                                                                        </p>
                                                                        <p className="mt-1">
                                                                            {
                                                                                log
                                                                                    .device
                                                                                    .display_name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {log.user_agent && (
                                                                    <div>
                                                                        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                                            User
                                                                            agent
                                                                        </p>
                                                                        <p className="mt-1 break-all text-[10px] text-muted-foreground">
                                                                            {
                                                                                log.user_agent
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div className="sm:col-span-2">
                                                                    <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                                        Metadata
                                                                    </p>
                                                                    <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-background p-3 font-mono text-[10px] leading-4 whitespace-pre-wrap">
                                                                        {JSON.stringify(
                                                                            log.metadata,
                                                                            null,
                                                                            2,
                                                                        )}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button asChild size="sm" variant="secondary">
                    <Link href={adminIndex()}>Back to admin dashboard</Link>
                </Button>
            </div>
        </>
    );
}

AdminAuditLogs.layout = {
    breadcrumbs: [
        {
            title: 'Super Admin',
            href: adminIndex(),
        },
        {
            title: 'Audit Logs',
            href: adminAuditLogsIndex(),
        },
    ],
};
