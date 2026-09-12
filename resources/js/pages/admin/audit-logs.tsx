import { Head, Link } from '@inertiajs/react';
import { ScrollText } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index as adminIndex } from '@/routes/admin';
import { index as adminAuditLogsIndex } from '@/routes/admin/audit-logs';

type Props = {
    message: string;
};

export default function AdminAuditLogs({ message }: Props) {
    return (
        <>
            <Head title="Audit Logs" />

            <div className="space-y-4">
                <Heading title="Audit Logs" />

                <Card className="max-w-2xl border-dashed">
                    <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                            <ScrollText className="size-4" />
                        </span>
                        <span>{message}</span>
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
