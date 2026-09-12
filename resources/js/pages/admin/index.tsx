import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Eye } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index as adminIndex } from '@/routes/admin';
import { index as adminWebhookLogsIndex } from '@/routes/admin/webhook-logs';
import type {
    AdminSectionLink,
    AdminSummary,
    AdminWebhookLogSummary,
} from '@/types/admin';

type Props = {
    summary: AdminSummary;
    sections: AdminSectionLink[];
    recentWebhookLogs: AdminWebhookLogSummary[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not available';
    }

    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function AdminIndex({
    summary,
    sections,
    recentWebhookLogs,
}: Props) {
    const summaryCards = [
        { label: 'Users', value: summary.users },
        { label: 'Active users', value: summary.active_users },
        { label: 'Tenants', value: summary.tenants },
        { label: 'Active tenants', value: summary.active_tenants },
        { label: 'Devices', value: summary.devices },
        { label: 'Active devices', value: summary.active_devices },
        { label: 'Webhook logs', value: summary.webhook_logs },
        { label: 'Failed jobs', value: summary.failed_jobs },
    ];

    return (
        <>
            <Head title="Super Admin" />

            <div className="space-y-4">
                <Heading title="Super Admin" />

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <Card key={card.label}>
                            <CardHeader className="gap-0.5 p-4">
                                <CardDescription className="text-xs">
                                    {card.label}
                                </CardDescription>
                                <CardTitle className="text-2xl">
                                    {card.value}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {sections.map((section) => (
                        <Card key={section.title}>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base">
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-0 text-xs text-emerald-700 hover:bg-transparent"
                                >
                                    <Link href={section.href}>
                                        Open
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent webhook logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentWebhookLogs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No webhook logs recorded yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead className="text-left text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="w-12 px-3 py-2 text-center font-medium">
                                                No.
                                            </th>
                                            <th className="w-20 px-3 py-2 font-medium">
                                                Action
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Event
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Tenant
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Device
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Status
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Processed
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentWebhookLogs.map((log, index) => (
                                            <tr
                                                key={log.id}
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="px-3 py-3 text-center font-medium text-muted-foreground tabular-nums">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-7"
                                                    >
                                                        <Link
                                                            href={adminWebhookLogsIndex()}
                                                        >
                                                            <Eye className="size-4" />
                                                            <span className="sr-only">
                                                                Inspect webhook
                                                            </span>
                                                        </Link>
                                                    </Button>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="font-medium">
                                                        {log.event_type}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {log.ulid}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {log.tenant?.name ??
                                                        'Unknown tenant'}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {log.device?.display_name ??
                                                        'Unknown device'}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Badge
                                                        variant={
                                                            log.status ===
                                                            'processed'
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {log.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-3 text-muted-foreground">
                                                    {formatDate(
                                                        log.processed_at,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminIndex.layout = {
    breadcrumbs: [
        {
            title: 'Super Admin',
            href: adminIndex(),
        },
    ],
};
