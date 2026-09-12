import { Head, Link } from '@inertiajs/react';
import { Eye, MoreHorizontal, Smartphone } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
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
import { index as adminDevicesIndex } from '@/routes/admin/devices';
import { show as deviceShow } from '@/routes/devices';
import type { AdminDeviceSummary } from '@/types/admin';

type Props = { devices: AdminDeviceSummary[] };

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

export default function AdminDevices({ devices }: Props) {
    const [search, setSearch] = useState('');
    const [connection, setConnection] = useState('all');
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const filteredDevices = devices.filter((device) => {
        const matchesSearch = [
            device.display_name,
            device.phone_number,
            device.gowa_device_id,
            device.tenant?.name,
        ]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(deferredSearch));

        return (
            matchesSearch &&
            (connection === 'all' || device.connection_status === connection)
        );
    });

    return (
        <>
            <Head title="Devices" />
            <div className="space-y-4">
                <Heading title="Devices" />
                <Card className="overflow-hidden shadow-sm">
                    <DataTableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        placeholder="Cari device, nomor, tenant..."
                        resultCount={filteredDevices.length}
                        filter={{
                            label: 'Connection status',
                            value: connection,
                            onChange: setConnection,
                            options: [
                                { label: 'Semua koneksi', value: 'all' },
                                { label: 'Connected', value: 'connected' },
                                {
                                    label: 'Disconnected',
                                    value: 'disconnected',
                                },
                                {
                                    label: 'Waiting scan',
                                    value: 'waiting_scan',
                                },
                                { label: 'Error', value: 'error' },
                            ],
                        }}
                    />
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-xs">
                                <thead className="bg-muted/35 text-left text-[10px] tracking-wider text-muted-foreground uppercase">
                                    <tr className="border-b">
                                        <th className="w-12 px-3 py-2 text-center font-semibold">
                                            No.
                                        </th>
                                        <th className="w-14 px-3 py-2 font-semibold">
                                            Action
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Device
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Tenant
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            State
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            GOWA ID
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Last connected
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDevices.map((device, index) => (
                                        <tr
                                            key={device.id}
                                            className="border-b transition last:border-0 hover:bg-muted/25"
                                        >
                                            <td className="px-3 py-2.5 text-center font-medium text-muted-foreground tabular-nums">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-7"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                            <span className="sr-only">
                                                                Device actions
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="start"
                                                        className="w-44"
                                                    >
                                                        <DropdownMenuLabel>
                                                            Device action
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={deviceShow(
                                                                    device,
                                                                )}
                                                            >
                                                                <Eye /> Open
                                                                device
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                        <Smartphone className="size-4" />
                                                    </span>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {
                                                                device.display_name
                                                            }
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {device.phone_number ??
                                                                'Belum terhubung'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="font-medium">
                                                    {device.tenant?.name ?? '-'}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {device.creator?.name ??
                                                        '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex gap-1.5">
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 text-[10px]"
                                                    >
                                                        {device.status}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={`h-5 text-[10px] ${device.connection_status === 'connected' ? 'border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : ''}`}
                                                    >
                                                        {device.connection_status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="max-w-52 truncate px-3 py-2.5 font-mono text-[10px] text-muted-foreground">
                                                {device.gowa_device_id}
                                            </td>
                                            <td className="px-3 py-2.5 text-muted-foreground">
                                                {formatDate(
                                                    device.last_connected_at,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredDevices.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                Tidak ada device yang cocok.
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

AdminDevices.layout = {
    breadcrumbs: [
        { title: 'Super Admin', href: adminIndex() },
        { title: 'Devices', href: adminDevicesIndex() },
    ],
};
