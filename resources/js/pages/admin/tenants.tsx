import { Form, Head, Link } from '@inertiajs/react';
import {
    Building2,
    Eye,
    MoreHorizontal,
    PauseCircle,
    PlayCircle,
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { updateTenantStatus } from '@/actions/App/Http/Controllers/AdminController';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { index as adminIndex } from '@/routes/admin';
import { index as adminTenantsIndex } from '@/routes/admin/tenants';
import { show as tenantShow } from '@/routes/tenants';
import type { AdminTenantSummary } from '@/types/admin';

type Props = { tenants: AdminTenantSummary[] };

export default function AdminTenants({ tenants }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const filteredTenants = tenants.filter((tenant) => {
        const matchesSearch = [tenant.name, tenant.slug].some((value) =>
            value.toLowerCase().includes(deferredSearch),
        );

        return matchesSearch && (status === 'all' || tenant.status === status);
    });

    return (
        <>
            <Head title="Tenants" />
            <div className="space-y-4">
                <Heading title="Tenants" />

                <Card className="overflow-hidden shadow-sm">
                    <DataTableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        placeholder="Cari workspace atau slug..."
                        resultCount={filteredTenants.length}
                        filter={{
                            label: 'Status tenant',
                            value: status,
                            onChange: setStatus,
                            options: [
                                { label: 'Semua status', value: 'all' },
                                { label: 'Active', value: 'active' },
                                { label: 'Suspended', value: 'suspended' },
                            ],
                        }}
                    />
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-xs">
                                <thead className="bg-muted/35 text-left text-[10px] tracking-wider text-muted-foreground uppercase">
                                    <tr className="border-b">
                                        <th className="w-12 px-3 py-2 text-center font-semibold">
                                            No.
                                        </th>
                                        <th className="w-14 px-3 py-2 font-semibold">
                                            Action
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Workspace
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Members
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Devices
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Messages
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Webhooks
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTenants.map((tenant, index) => (
                                        <tr
                                            key={tenant.id}
                                            className="border-b transition last:border-0 hover:bg-muted/25"
                                        >
                                            <td className="px-3 py-2.5 text-center font-medium text-muted-foreground tabular-nums">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <TenantActions
                                                    tenant={tenant}
                                                />
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                        <Building2 className="size-4" />
                                                    </span>
                                                    <div>
                                                        <Link
                                                            href={tenantShow(
                                                                tenant,
                                                            )}
                                                            className="font-semibold hover:text-emerald-700 hover:underline"
                                                        >
                                                            {tenant.name}
                                                        </Link>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {tenant.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <Badge
                                                    variant="outline"
                                                    className={`h-5 text-[10px] ${tenant.status === 'active' ? 'border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-amber-600/20 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'}`}
                                                >
                                                    {tenant.status}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums">
                                                {tenant.users_count}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums">
                                                {tenant.devices_count} /{' '}
                                                {tenant.device_limit}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums">
                                                {tenant.messages_count.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums">
                                                {tenant.webhook_logs_count.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTenants.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                Tidak ada tenant yang cocok.
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

function TenantActions({ tenant }: { tenant: AdminTenantSummary }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="size-7">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Tenant actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Workspace action</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={tenantShow(tenant)}>
                        <Eye /> View workspace
                    </Link>
                </DropdownMenuItem>
                {tenant.status === 'active' ? (
                    <Form {...updateTenantStatus.form(tenant)}>
                        {({ submit }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="status"
                                    value="suspended"
                                />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        submit();
                                    }}
                                >
                                    <PauseCircle /> Suspend tenant
                                </DropdownMenuItem>
                            </>
                        )}
                    </Form>
                ) : (
                    <Form {...updateTenantStatus.form(tenant)}>
                        {({ submit }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="status"
                                    value="active"
                                />
                                <DropdownMenuItem
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        submit();
                                    }}
                                >
                                    <PlayCircle /> Activate tenant
                                </DropdownMenuItem>
                            </>
                        )}
                    </Form>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

AdminTenants.layout = {
    breadcrumbs: [
        { title: 'Super Admin', href: adminIndex() },
        { title: 'Tenants', href: adminTenantsIndex() },
    ],
};
