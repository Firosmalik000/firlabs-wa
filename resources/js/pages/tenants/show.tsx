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

            <div className="space-y-6">
                <Heading
                    title={tenant.name}
                    description="Current workspace details and starter placeholder."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Workspace</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="grid gap-1">
                            <span className="text-muted-foreground">ULID</span>
                            <span className="font-medium">{tenant.ulid}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-muted-foreground">Slug</span>
                            <span className="font-medium">{tenant.slug}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-medium capitalize">
                                {tenant.status}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Button asChild variant="secondary">
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
