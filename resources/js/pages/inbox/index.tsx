import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    MessageCircle,
    MessagesSquare,
    Plus,
    Smartphone,
    Wifi,
    WifiOff,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { create as devicesCreate } from '@/routes/devices';
import { index as inboxIndex, show as inboxShow } from '@/routes/inbox';
import type { TenantSummary } from '@/types/auth';
import type { WhatsappConversationSummary } from '@/types/message';

type Props = {
    tenant: TenantSummary;
    devices: WhatsappConversationSummary['device'][];
    conversations: WhatsappConversationSummary[];
    conversationCount: number;
};

type DeviceConversationGroup = {
    device: WhatsappConversationSummary['device'];
    conversations: WhatsappConversationSummary[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return 'No messages yet';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function previewText(conversation: WhatsappConversationSummary): string {
    const message = conversation.latest_message;

    if (!message) {
        return 'No messages in this conversation yet.';
    }

    if (message.body) {
        return message.body;
    }

    if (message.has_media && message.media_original_name) {
        return message.media_original_name;
    }

    return message.kind === 'image' ? 'Image' : 'Document';
}

function pluralize(count: number, singular: string, plural?: string): string {
    return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function groupByDevice(
    devices: WhatsappConversationSummary['device'][],
    conversations: WhatsappConversationSummary[],
): DeviceConversationGroup[] {
    const groups = new Map<number, DeviceConversationGroup>();

    devices.forEach((device) => {
        groups.set(device.id, {
            device,
            conversations: [],
        });
    });

    conversations.forEach((conversation) => {
        const existing = groups.get(conversation.device.id);

        if (existing) {
            existing.conversations.push(conversation);

            return;
        }

        groups.set(conversation.device.id, {
            device: conversation.device,
            conversations: [conversation],
        });
    });

    return Array.from(groups.values()).sort((first, second) =>
        first.device.display_name.localeCompare(second.device.display_name),
    );
}

export default function InboxIndex({
    devices,
    conversations,
    conversationCount,
}: Props) {
    const deviceGroups = groupByDevice(devices, conversations);

    return (
        <>
            <Head title="Inbox" />

            <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <Heading title="Team Inbox" />
                    <div className="flex gap-2">
                        <Badge
                            variant="outline"
                            className="rounded-full px-3 py-1"
                        >
                            {pluralize(deviceGroups.length, 'device')}
                        </Badge>
                        <Badge className="rounded-full bg-emerald-600 px-3 py-1 text-white">
                            {pluralize(conversationCount, 'conversation')}
                        </Badge>
                    </div>
                </div>

                {devices.length === 0 ? (
                    <Card className="border-dashed">
                        <CardHeader>
                            <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <MessagesSquare className="size-6" />
                            </span>
                            <CardTitle>No conversations yet</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Connect a WhatsApp device first. New customer
                                messages will appear here.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Button asChild size="sm">
                                <Link href={devicesCreate()}>
                                    <Plus className="mr-1.5 size-4" />
                                    Connect a device
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {deviceGroups.map(
                            ({ device, conversations: items }) => {
                                const isConnected =
                                    device.connection_status === 'connected';

                                return (
                                    <section
                                        key={device.id}
                                        className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                                    >
                                        <header className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/60">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-900/20">
                                                    <Smartphone className="size-5" />
                                                </span>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h2 className="font-bold tracking-tight">
                                                            {
                                                                device.display_name
                                                            }
                                                        </h2>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                isConnected
                                                                    ? 'border-emerald-600/20 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                                                    : ''
                                                            }
                                                        >
                                                            {isConnected ? (
                                                                <Wifi className="mr-1 size-3" />
                                                            ) : (
                                                                <WifiOff className="mr-1 size-3" />
                                                            )}
                                                            {
                                                                device.connection_status
                                                            }
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {pluralize(
                                                            items.length,
                                                            'conversation',
                                                        )}{' '}
                                                        on this device
                                                    </p>
                                                </div>
                                            </div>

                                            <Badge
                                                variant="secondary"
                                                className="w-fit rounded-full"
                                            >
                                                {device.status}
                                            </Badge>
                                        </header>

                                        <div className="divide-y divide-black/6 dark:divide-white/8">
                                            {items.map((conversation) => (
                                                <Link
                                                    key={conversation.ulid}
                                                    href={inboxShow(
                                                        conversation,
                                                    )}
                                                    prefetch
                                                    className="group flex items-center gap-3 px-4 py-4 transition hover:bg-emerald-50/60 sm:px-5 dark:hover:bg-emerald-950/20"
                                                >
                                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-bold text-white">
                                                        {initials(
                                                            conversation.contact
                                                                .display_name,
                                                        )}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="flex items-start justify-between gap-3">
                                                            <span className="truncate font-semibold">
                                                                {
                                                                    conversation
                                                                        .contact
                                                                        .display_name
                                                                }
                                                            </span>
                                                            <span className="shrink-0 text-[11px] text-muted-foreground">
                                                                {formatDate(
                                                                    conversation.last_message_at,
                                                                )}
                                                            </span>
                                                        </span>
                                                        <span className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                            <MessageCircle className="size-3.5 shrink-0" />
                                                            <span className="truncate">
                                                                {previewText(
                                                                    conversation,
                                                                )}
                                                            </span>
                                                        </span>
                                                        <span className="mt-1 block text-[11px] text-muted-foreground">
                                                            {conversation
                                                                .contact
                                                                .phone_number ??
                                                                conversation
                                                                    .contact
                                                                    .external_id}
                                                        </span>
                                                    </span>
                                                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-700" />
                                                </Link>
                                            ))}
                                            {items.length === 0 && (
                                                <div className="flex items-center gap-3 px-5 py-8 text-sm text-muted-foreground">
                                                    <MessagesSquare className="size-5 text-emerald-600" />
                                                    No conversations received
                                                    on this device yet.
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                );
                            },
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

InboxIndex.layout = {
    breadcrumbs: [
        {
            title: 'Inbox',
            href: inboxIndex(),
        },
    ],
};
