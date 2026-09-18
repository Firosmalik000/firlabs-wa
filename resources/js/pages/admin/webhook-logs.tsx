import { Head } from '@inertiajs/react';
import { ChevronDown, ChevronUp, ShieldCheck, ShieldX } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index as adminIndex } from '@/routes/admin';
import { index as adminWebhookLogsIndex } from '@/routes/admin/webhook-logs';
import type { AdminWebhookLogSummary } from '@/types/admin';

type Props = { logs: AdminWebhookLogSummary[] };

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function AdminWebhookLogs({ logs }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [expanded, setExpanded] = useState<number | null>(null);
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const statuses = Array.from(new Set(logs.map((log) => log.status))).sort();
    const filteredLogs = logs.filter((log) => {
        const matchesSearch = [
            log.event_type,
            log.ulid,
            log.tenant?.name,
            log.device?.display_name,
        ]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(deferredSearch));

        return matchesSearch && (status === 'all' || log.status === status);
    });

    return (
        <>
            <Head title="Webhook Logs" />
            <div className="space-y-4">
                <Heading title="Webhook Logs" />
                <Card className="overflow-hidden shadow-sm">
                    <DataTableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        placeholder="Search event, tenant, device..."
                        resultCount={filteredLogs.length}
                        filter={{
                            label: 'Webhook status',
                            value: status,
                            onChange: setStatus,
                            options: [
                                { label: 'All statuses', value: 'all' },
                                ...statuses.map((value) => ({
                                    label: value.replace('_', ' '),
                                    value,
                                })),
                            ],
                        }}
                    />
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px] text-xs">
                                <thead className="bg-muted/35 text-left text-[10px] tracking-wider text-muted-foreground uppercase">
                                    <tr className="border-b">
                                        <th className="w-12 px-3 py-2 text-center font-semibold">
                                            No.
                                        </th>
                                        <th className="w-14 px-3 py-2 font-semibold">
                                            Action
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Event
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Source
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Security
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Received
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log, index) => (
                                        <FragmentRow
                                            key={log.id}
                                            log={log}
                                            rowNumber={index + 1}
                                            expanded={expanded === log.id}
                                            onToggle={() =>
                                                setExpanded(
                                                    expanded === log.id
                                                        ? null
                                                        : log.id,
                                                )
                                            }
                                        />
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                No matching webhooks found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function FragmentRow({
    log,
    rowNumber,
    expanded,
    onToggle,
}: {
    log: AdminWebhookLogSummary;
    rowNumber: number;
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <>
            <tr className="border-b transition hover:bg-muted/25">
                <td className="px-3 py-2.5 text-center font-medium text-muted-foreground tabular-nums">
                    {rowNumber}
                </td>
                <td className="px-3 py-2.5">
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={onToggle}
                    >
                        {expanded ? (
                            <ChevronUp className="size-4" />
                        ) : (
                            <ChevronDown className="size-4" />
                        )}
                        <span className="sr-only">Inspect webhook</span>
                    </Button>
                </td>
                <td className="px-3 py-2.5">
                    <div className="font-semibold">{log.event_type}</div>
                    <div className="max-w-44 truncate font-mono text-[10px] text-muted-foreground">
                        {log.ulid}
                    </div>
                </td>
                <td className="px-3 py-2.5">
                    <div>{log.tenant?.name ?? 'Unknown tenant'}</div>
                    <div className="text-[10px] text-muted-foreground">
                        {log.device?.display_name ?? 'Unknown device'}
                    </div>
                </td>
                <td className="px-3 py-2.5">
                    {log.signature_valid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                            <ShieldCheck className="size-3.5" /> Valid
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                            <ShieldX className="size-3.5" /> Invalid
                        </span>
                    )}
                </td>
                <td className="px-3 py-2.5">
                    <Badge variant="outline" className="h-5 text-[10px]">
                        {log.status.replace('_', ' ')}
                    </Badge>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                    {formatDate(log.received_at)}
                </td>
            </tr>
            {expanded && (
                <tr className="border-b bg-muted/20">
                    <td colSpan={7} className="px-4 py-3">
                        <div className="grid gap-3 text-[11px] sm:grid-cols-3">
                            <Detail
                                label="GOWA device ID"
                                value={log.device?.gowa_device_id ?? '-'}
                            />
                            <Detail
                                label="Processed"
                                value={formatDate(log.processed_at)}
                            />
                            <Detail
                                label="Error"
                                value={log.error_message ?? 'No error'}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 font-medium break-words">{value}</p>
        </div>
    );
}

AdminWebhookLogs.layout = {
    breadcrumbs: [
        { title: 'Super Admin', href: adminIndex() },
        { title: 'Webhook Logs', href: adminWebhookLogsIndex() },
    ],
};
