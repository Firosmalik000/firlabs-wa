import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import type { TenantSummary } from '@/types/auth';

type Props = {
    tenant: TenantSummary;
};

export default function TenantShow({ tenant }: Props) {
    return (
        <>
            <Head title={tenant.name} />

            <div className="space-y-4">
                <Heading title={tenant.name} />

                <Card className="max-w-3xl">
                    <CardHeader className="border-b border-zinc-200 bg-zinc-50/70 p-4">
                        <CardTitle>Workspace</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-4 pt-0 text-sm sm:grid-cols-3">
                        <div className="grid gap-1 rounded-lg border p-3">
                            <span className="text-muted-foreground">ULID</span>
                            <span className="truncate font-mono text-xs font-medium">
                                {tenant.ulid}
                            </span>
                        </div>
                        <div className="grid gap-1 rounded-lg border p-3">
                            <span className="text-muted-foreground">Slug</span>
                            <span className="font-medium">{tenant.slug}</span>
                        </div>
                        <div className="grid gap-1 rounded-lg border p-3">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <span className="font-semibold text-emerald-700 capitalize dark:text-emerald-300">
                                {tenant.status}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Button asChild size="sm" variant="secondary">
                    <Link href={dashboard()}>Back to dashboard</Link>
                </Button>
            </div>
        </>
    );
}

TenantShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
