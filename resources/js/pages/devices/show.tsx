import { Head, Link, useForm, usePoll } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock3,
    Copy,
    Edit3,
    Link2,
    LogOut,
    MessageCircle,
    Phone,
    QrCode,
    RefreshCw,
    RotateCcw,
    Server,
    ShieldCheck,
    Smartphone,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
    edit as deviceEdit,
    logout as deviceLogout,
    pair as devicePair,
    qrCode as deviceQrCode,
    reconnect as deviceReconnect,
    startQr as deviceStartQr,
    sync as deviceSync,
} from '@/actions/App/Http/Controllers/WhatsappDeviceController';
import DeleteDevice from '@/components/delete-device';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index as devicesIndex } from '@/routes/devices';
import type { TenantSummary } from '@/types/auth';
import type {
    WhatsappConnectionStatus,
    WhatsappDeviceSummary,
} from '@/types/device';

type Props = {
    device: WhatsappDeviceSummary;
    tenant: TenantSummary;
    canManage: boolean;
    gatewayConfigured: boolean;
};

const connectionLabels: Record<WhatsappConnectionStatus, string> = {
    connected: 'Connected',
    connecting: 'Connecting',
    disconnected: 'Disconnected',
    error: 'Needs attention',
    logged_out: 'Logged out',
    waiting_scan: 'Waiting for connection',
};

const connectionStyles: Record<WhatsappConnectionStatus, string> = {
    connected:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
    connecting:
        'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
    disconnected:
        'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
    error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
    logged_out:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    waiting_scan:
        'border-lime-200 bg-lime-50 text-lime-800 dark:border-lime-900 dark:bg-lime-950/40 dark:text-lime-300',
};

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not available';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function DevicesShow({
    device,
    tenant,
    canManage,
    gatewayConfigured,
}: Props) {
    const phoneForm = useForm({
        phone: device.pairing.phone ?? '',
    });
    const isConnected = device.connection_status === 'connected';
    const hasQrCode =
        device.pairing.mode === 'qr' && device.pairing.qr_available;
    const hasPairCode =
        device.pairing.mode === 'code' && device.pairing.pair_code;
    const configurationWasUpdated =
        gatewayConfigured &&
        device.last_error_message?.includes('GOWA is not configured');
    const awaitingConnection =
        device.connection_status === 'waiting_scan' ||
        device.connection_status === 'connecting';
    const [pairCodeCopied, setPairCodeCopied] = useState(false);
    const copyTimeoutRef = useRef<number | null>(null);

    const poll = usePoll(
        8000,
        { only: ['device'] },
        { autoStart: false, mode: 'rest' },
    );
    const pollRef = useRef(poll);

    useEffect(() => {
        pollRef.current = poll;
    });

    useEffect(() => {
        if (awaitingConnection) {
            pollRef.current.start();
        } else {
            pollRef.current.stop();
        }
    }, [awaitingConnection]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    function submitPhonePairing(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        phoneForm.post(devicePair.url(device), {
            preserveScroll: true,
        });
    }

    function copyPairCode() {
        if (device.pairing.pair_code) {
            void navigator.clipboard.writeText(device.pairing.pair_code).then(() => {
                setPairCodeCopied(true);

                if (copyTimeoutRef.current !== null) {
                    window.clearTimeout(copyTimeoutRef.current);
                }

                copyTimeoutRef.current = window.setTimeout(() => {
                    setPairCodeCopied(false);
                }, 2000);
            });
        }
    }

    return (
        <>
            <Head title={device.display_name} />

            <div className="space-y-6">
                <div className="flex flex-col gap-5 rounded-3xl border bg-gradient-to-br from-card via-card to-emerald-50/60 p-6 shadow-sm md:flex-row md:items-center md:justify-between dark:to-emerald-950/15">
                    <div className="flex items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                            <MessageCircle className="size-7" />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {device.display_name}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={
                                        connectionStyles[
                                            device.connection_status
                                        ]
                                    }
                                >
                                    {connectionLabels[device.connection_status]}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Workspace {tenant.name}
                                {device.description
                                    ? ` - ${device.description}`
                                    : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {awaitingConnection && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                                Auto-refreshing
                            </span>
                        )}
                        <Button asChild variant="outline">
                            <Link
                                href={deviceSync(device)}
                                method="post"
                                as="button"
                                preserveScroll
                            >
                                <RefreshCw className="size-4" />
                                Refresh status
                            </Link>
                        </Button>
                        {canManage && (
                            <Button asChild variant="outline">
                                <Link href={deviceEdit(device)}>
                                    <Edit3 className="size-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {device.last_error_message && (
                    <div
                        className={`flex items-start gap-3 rounded-2xl border p-4 ${
                            configurationWasUpdated
                                ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-100'
                                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/35 dark:text-red-200'
                        }`}
                    >
                        <AlertCircle className="mt-0.5 size-5 shrink-0" />
                        <div className="grid gap-1">
                            <p className="font-semibold">
                                {configurationWasUpdated
                                    ? 'Gateway configuration updated'
                                    : 'Connection failed'}
                            </p>
                            <p className="text-sm leading-6">
                                {configurationWasUpdated
                                    ? 'The local GOWA address is now configured. Start the GOWA service, then generate a fresh QR code or pairing code.'
                                    : device.last_error_message}
                            </p>
                            <p className="text-xs opacity-70">
                                Last attempt: {formatDate(device.last_error_at)}
                            </p>
                        </div>
                    </div>
                )}

                {isConnected ? (
                    <ConnectedPanel device={device} />
                ) : (
                    <div className="grid gap-5 xl:grid-cols-2">
                        <Card className="overflow-hidden border-emerald-200/70 dark:border-emerald-900">
                            <CardHeader className="border-b bg-emerald-50/60 dark:bg-emerald-950/20">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                                        <QrCode className="size-5" />
                                    </span>
                                    <div>
                                        <CardTitle>Scan QR code</CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Fastest when your phone is nearby.
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5 p-5">
                                <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed bg-muted/35 p-5">
                                    {hasQrCode ? (
                                        <div className="grid justify-items-center gap-3">
                                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                                                <img
                                                    src={deviceQrCode.url(
                                                        device,
                                                        {
                                                            query: {
                                                                v:
                                                                    device
                                                                        .pairing
                                                                        .requested_at ??
                                                                    '',
                                                            },
                                                        },
                                                    )}
                                                    alt={`QR code for ${device.display_name}`}
                                                    className="size-52 object-contain"
                                                />
                                            </div>
                                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock3 className="size-3.5" />
                                                QR expires{' '}
                                                {formatDate(
                                                    device.pairing
                                                        .qr_expires_at,
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid max-w-xs justify-items-center gap-3 text-center">
                                            <span className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                                                <QrCode className="size-8 text-muted-foreground" />
                                            </span>
                                            <p className="font-semibold">
                                                QR code not available
                                            </p>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                Generate a new QR code, then
                                                open WhatsApp on your phone and
                                                choose Linked devices.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <ol className="grid gap-2 text-sm text-muted-foreground">
                                    <Instruction number="1">
                                        Open WhatsApp, then Linked devices.
                                    </Instruction>
                                    <Instruction number="2">
                                        Choose &quot;Link a device&quot;.
                                    </Instruction>
                                    <Instruction number="3">
                                        Scan the QR code, then press Refresh
                                        status.
                                    </Instruction>
                                </ol>

                                {canManage && (
                                    <Button asChild className="w-full">
                                        <Link
                                            href={deviceStartQr(device)}
                                            method="post"
                                            as="button"
                                            preserveScroll
                                        >
                                            <QrCode className="size-4" />
                                            {hasQrCode
                                                ? 'Generate new QR'
                                                : 'Generate QR code'}
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardHeader className="border-b bg-sky-50/60 dark:bg-sky-950/20">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-sky-600 text-white">
                                        <Phone className="size-5" />
                                    </span>
                                    <div>
                                        <CardTitle>
                                            Connect with phone number
                                        </CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Get a pairing code without scanning
                                            a QR.
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5 p-5">
                                {hasPairCode ? (
                                    <div className="grid min-h-52 place-content-center justify-items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-6 text-center dark:border-sky-900 dark:bg-sky-950/25">
                                        <span className="text-xs font-semibold tracking-wider text-sky-700 uppercase dark:text-sky-300">
                                            Your pairing code
                                        </span>
                                        <button
                                            type="button"
                                            onClick={copyPairCode}
                                            title="Copy pairing code"
                                            aria-live="polite"
                                            className="group flex items-center gap-3 rounded-2xl border bg-background px-5 py-3 font-mono text-2xl font-black tracking-[0.18em] shadow-sm transition hover:border-sky-400"
                                        >
                                            {device.pairing.pair_code}
                                            {pairCodeCopied ? (
                                                <Check className="size-4 text-emerald-600" />
                                            ) : (
                                                <Copy className="size-4 text-muted-foreground transition group-hover:text-sky-600" />
                                            )}
                                        </button>
                                        <p
                                            className={`text-xs font-medium text-emerald-600 transition-opacity ${pairCodeCopied ? 'opacity-100' : 'opacity-0'}`}
                                            aria-hidden={!pairCodeCopied}
                                        >
                                            Copied to clipboard
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Requested for +
                                            {device.pairing.phone}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/35 p-6 text-center">
                                        <span className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                                            <Smartphone className="size-8 text-muted-foreground" />
                                        </span>
                                        <p className="font-semibold">
                                            Enter your WhatsApp number
                                        </p>
                                        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                                            This number is only used to request
                                            the pairing code. The actual number
                                            is verified again after a
                                            successful login.
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={submitPhonePairing}
                                    className="grid gap-3"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            WhatsApp phone number
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                inputMode="tel"
                                                autoComplete="tel"
                                                placeholder="081234567890 or 6281234567890"
                                                value={phoneForm.data.phone}
                                                onChange={(event) =>
                                                    phoneForm.setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={
                                                    phoneForm.errors.phone
                                                        ? true
                                                        : undefined
                                                }
                                                className="pl-10"
                                                disabled={!canManage}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Local 08 numbers are automatically
                                            converted to the Indonesian 62
                                            format.
                                        </p>
                                        <InputError
                                            message={phoneForm.errors.phone}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        disabled={
                                            phoneForm.processing || !canManage
                                        }
                                    >
                                        <Link2 className="size-4" />
                                        {phoneForm.processing
                                            ? 'Requesting code...'
                                            : hasPairCode
                                              ? 'Request new code'
                                              : 'Get pairing code'}
                                    </Button>
                                </form>

                                <ol className="grid gap-2 text-sm text-muted-foreground">
                                    <Instruction number="1">
                                        Open WhatsApp, then Linked devices.
                                    </Instruction>
                                    <Instruction number="2">
                                        Choose &quot;Link with phone
                                        number&quot;.
                                    </Instruction>
                                    <Instruction number="3">
                                        Enter the code above, then Refresh
                                        status.
                                    </Instruction>
                                </ol>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="size-5" />
                                Connection details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                            <Detail
                                icon={Phone}
                                label="Detected phone number"
                                value={
                                    device.phone_number
                                        ? `+${device.phone_number}`
                                        : 'Available after connection'
                                }
                            />
                            <Detail
                                icon={Link2}
                                label="WhatsApp JID"
                                value={
                                    device.whatsapp_jid ??
                                    'Available after connection'
                                }
                            />
                            <Detail
                                icon={Server}
                                label="GOWA device ID"
                                value={device.gowa_device_id}
                                mono
                            />
                            <Detail
                                icon={ShieldCheck}
                                label="Application status"
                                value={device.status}
                            />
                            <Detail
                                icon={Clock3}
                                label="Last connected"
                                value={formatDate(device.last_connected_at)}
                            />
                            <Detail
                                icon={WifiOff}
                                label="Last disconnected"
                                value={formatDate(device.last_disconnected_at)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Session actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {canManage && (
                                <>
                                    <Button asChild variant="outline">
                                        <Link
                                            href={deviceReconnect(device)}
                                            method="post"
                                            as="button"
                                            preserveScroll
                                        >
                                            <RotateCcw className="size-4" />
                                            Reconnect stored session
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link
                                            href={deviceLogout(device)}
                                            method="post"
                                            as="button"
                                            preserveScroll
                                        >
                                            <LogOut className="size-4" />
                                            Log out WhatsApp
                                        </Link>
                                    </Button>
                                </>
                            )}
                            <Button asChild variant="ghost">
                                <Link href={devicesIndex()}>
                                    <ArrowLeft className="size-4" />
                                    Back to devices
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {canManage && <DeleteDevice device={device} />}
            </div>
        </>
    );
}

DevicesShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Devices', href: devicesIndex() },
        { title: 'Device details', href: '#' },
    ],
};

function ConnectedPanel({ device }: { device: WhatsappDeviceSummary }) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/25">
            <div className="absolute -top-20 -right-12 size-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/20" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-700/20">
                    <CheckCircle2 className="size-8" />
                </span>
                <div className="grid gap-1">
                    <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                        WhatsApp is connected
                    </p>
                    <p className="text-sm leading-6 text-emerald-800/75 dark:text-emerald-200/70">
                        {device.phone_number
                            ? `+${device.phone_number} is ready to receive and send messages through this workspace.`
                            : 'This device is ready to receive and send messages through this workspace.'}
                    </p>
                </div>
                <Wifi className="ml-auto hidden size-8 text-emerald-600 sm:block" />
            </div>
        </div>
    );
}

function Instruction({
    number,
    children,
}: {
    number: string;
    children: ReactNode;
}) {
    return (
        <li className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                {number}
            </span>
            {children}
        </li>
    );
}

function Detail({
    icon: Icon,
    label,
    value,
    mono = false,
}: {
    icon: typeof Phone;
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="grid min-w-0 gap-1">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span
                    className={`font-medium break-all ${mono ? 'font-mono text-xs' : ''}`}
                >
                    {value}
                </span>
            </div>
        </div>
    );
}
