import { Head, Link } from '@inertiajs/react';
import { Eye, Plus, Smartphone } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    create as devicesCreate,
    index as devicesIndex,
    show as devicesShow,
} from '@/routes/devices';
import type { TenantSummary } from '@/types/auth';
import type { WhatsappDeviceSummary } from '@/types/device';

type Props = {
    devices: WhatsappDeviceSummary[];
    tenant: TenantSummary | null;
    canCreate: boolean;
    canManageAll: boolean;
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

export default function DevicesIndex({ devices, canCreate }: Props) {
    const [search, setSearch] = useState('');
    const [connection, setConnection] = useState('all');
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const filteredDevices = devices.filter((device) => {
        const matchesSearch = [
            device.display_name,
            device.phone_number,
            device.description,
            device.gowa_device_id,
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
                <div className="flex items-end justify-between gap-3">
                    <Heading title="Devices" />
                    {canCreate && (
                        <Button
                            asChild
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Link href={devicesCreate()}>
                                <Plus className="mr-1.5 size-4" /> Add device
                            </Link>
                        </Button>
                    )}
                </div>

                <Card className="overflow-hidden shadow-sm">
                    <DataTableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        placeholder="Cari device atau nomor..."
                        resultCount={filteredDevices.length}
                        filter={{
                            label: 'Connection',
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
                            <table className="w-full min-w-[760px] text-xs">
                                <thead className="bg-muted/35 text-left text-[10px] tracking-wider text-muted-foreground uppercase">
                                    <tr className="border-b">
                                        <th className="w-12 px-3 py-2 text-center font-semibold">
                                            No.
                                        </th>
                                        <th className="w-24 px-3 py-2 font-semibold">
                                            Action
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Device
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Phone
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
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    <Link
                                                        href={devicesShow(
                                                            device,
                                                        )}
                                                    >
                                                        <Eye className="mr-1.5 size-3.5" />{' '}
                                                        Open
                                                    </Link>
                                                </Button>
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
                                                        <div className="max-w-52 truncate text-[10px] text-muted-foreground">
                                                            {device.description ??
                                                                device.gowa_device_id}
                                                        </div>
                                                    </div>
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
                                            <td className="px-3 py-2.5">
                                                {device.phone_number ?? '-'}
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
                                                colSpan={6}
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

DevicesIndex.layout = {
    breadcrumbs: [{ title: 'Devices', href: devicesIndex() }],
};
