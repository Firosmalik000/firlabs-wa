import { Form, Head, Link, usePage } from '@inertiajs/react';
import { MoreHorizontal, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { updateUserStatus } from '@/actions/App/Http/Controllers/AdminController';
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
import { index as adminUsersIndex } from '@/routes/admin/users';
import { show as tenantShow } from '@/routes/tenants';
import type { AdminUserSummary } from '@/types/admin';

type Props = {
    users: AdminUserSummary[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export default function AdminUsers({ users }: Props) {
    const currentUserId = usePage().props.auth.user.id;
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const filteredUsers = users.filter((user) => {
        const matchesSearch = [user.name, user.email, user.current_tenant?.name]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(deferredSearch));
        const matchesStatus = status === 'all' || user.status === status;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Head title="Users" />

            <div className="space-y-4">
                <Heading title="Users" />

                <Card className="overflow-hidden shadow-sm">
                    <DataTableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        placeholder="Cari nama, email, tenant..."
                        resultCount={filteredUsers.length}
                        filter={{
                            label: 'Status user',
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
                            <table className="w-full min-w-[860px] text-xs">
                                <thead className="bg-muted/35 text-left text-[10px] tracking-wider text-muted-foreground uppercase">
                                    <tr className="border-b">
                                        <th className="w-12 px-3 py-2 text-center font-semibold">
                                            No.
                                        </th>
                                        <th className="w-14 px-3 py-2 font-semibold">
                                            Action
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            User
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Access
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Tenant
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Joined
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="border-b transition last:border-0 hover:bg-muted/25"
                                        >
                                            <td className="px-3 py-2.5 text-center font-medium text-muted-foreground tabular-nums">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <UserActions
                                                    user={user}
                                                    currentUserId={
                                                        currentUserId
                                                    }
                                                />
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="font-semibold">
                                                    {user.name}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 text-[10px]"
                                                    >
                                                        {user.global_role.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={`h-5 text-[10px] ${
                                                            user.status ===
                                                            'active'
                                                                ? 'border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                                                                : 'border-red-600/20 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
                                                        }`}
                                                    >
                                                        {user.status}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {user.current_tenant ? (
                                                    <Link
                                                        href={tenantShow(
                                                            user.current_tenant,
                                                        )}
                                                        className="font-medium hover:text-emerald-700 hover:underline"
                                                    >
                                                        {
                                                            user.current_tenant
                                                                .name
                                                        }
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                                <div className="text-[10px] text-muted-foreground">
                                                    {user.tenants_count}{' '}
                                                    membership
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                Tidak ada user yang cocok.
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

function UserActions({
    user,
    currentUserId,
}: {
    user: AdminUserSummary;
    currentUserId: number;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="size-7">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">User actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Account action</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.global_role === 'super_admin' && (
                    <DropdownMenuItem disabled>
                        <ShieldCheck /> Super Admin
                    </DropdownMenuItem>
                )}
                {user.status === 'active' ? (
                    <Form {...updateUserStatus.form(user)}>
                        {({ submit }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="status"
                                    value="suspended"
                                />
                                <DropdownMenuItem
                                    variant="destructive"
                                    disabled={user.id === currentUserId}
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        submit();
                                    }}
                                >
                                    <UserX /> Suspend user
                                </DropdownMenuItem>
                            </>
                        )}
                    </Form>
                ) : (
                    <Form {...updateUserStatus.form(user)}>
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
                                    <UserCheck /> Activate user
                                </DropdownMenuItem>
                            </>
                        )}
                    </Form>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

AdminUsers.layout = {
    breadcrumbs: [
        { title: 'Super Admin', href: adminIndex() },
        { title: 'Users', href: adminUsersIndex() },
    ],
};
