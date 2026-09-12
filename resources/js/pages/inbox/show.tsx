import { Head, Link, useForm, usePoll } from '@inertiajs/react';
import {
    ArrowLeft,
    Bot,
    Check,
    CheckCheck,
    CircleAlert,
    Clock3,
    FileText,
    Inbox,
    Paperclip,
    RotateCcw,
    Search,
    SendHorizontal,
    Smartphone,
    UserRound,
    X,
} from 'lucide-react';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
    retry as retryMessage,
    store as storeMessage,
} from '@/actions/App/Http/Controllers/WhatsappMessageController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index as inboxIndex, show as inboxShow } from '@/routes/inbox';
import type { TenantSummary } from '@/types/auth';
import type {
    WhatsappConversationSummary,
    WhatsappMessageSummary,
} from '@/types/message';

type Props = {
    tenant: TenantSummary;
    conversation: WhatsappConversationSummary;
    conversations: WhatsappConversationSummary[];
    messages: WhatsappMessageSummary[];
    canReply: boolean;
};

type ReplyForm = {
    body: string;
    media_type: 'document' | 'image';
    media: File | null;
};

function formatTime(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatDay(value: string | null): string {
    if (!value) {
        return 'Belum ada aktivitas';
    }

    const date = new Date(value);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return formatTime(value);
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
    }).format(date);
}

function formatFullDate(value: string | null): string {
    if (!value) {
        return 'Belum tersedia';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
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

function previewText(conversation: WhatsappConversationSummary): string {
    const message = conversation.latest_message;

    if (!message) {
        return 'Belum ada pesan';
    }

    if (message.body) {
        return message.body;
    }

    return message.kind === 'image' ? 'Foto' : 'Dokumen';
}

function fileSize(size: number | null): string {
    if (!size) {
        return '';
    }

    if (size >= 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function MessageStatus({ message }: { message: WhatsappMessageSummary }) {
    if (!message.is_outbound) {
        return null;
    }

    if (message.status === 'failed') {
        return <CircleAlert className="size-3.5 text-red-500" />;
    }

    if (message.status === 'queued' || message.status === 'sending') {
        return <Clock3 className="size-3.5 text-emerald-700/70" />;
    }

    if (message.status === 'sent') {
        return <CheckCheck className="size-3.5 text-sky-500" />;
    }

    return <Check className="size-3.5 text-emerald-700/70" />;
}

export default function InboxShow({
    tenant,
    conversation,
    conversations,
    messages,
    canReply,
}: Props) {
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const form = useForm<ReplyForm>({
        body: '',
        media_type: 'image',
        media: null,
    });

    usePoll(
        4000,
        {
            only: ['conversation', 'conversations', 'messages'],
        },
        { mode: 'rest' },
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    const filteredConversations = conversations.filter((item) => {
        if (deferredSearch === '') {
            return true;
        }

        return [
            item.contact.display_name,
            item.contact.phone_number,
            item.contact.external_id,
            item.device.display_name,
        ].some((value) => value?.toLowerCase().includes(deferredSearch));
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.post(
            storeMessage.url({
                whatsappConversation: conversation.ulid,
            }),
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();

                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            },
        );
    };

    const clearAttachment = (): void => {
        form.setData('media', null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <Head title={`Inbox - ${conversation.contact.display_name}`} />

            <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-zinc-950">
                <div className="grid h-[calc(100vh-8.5rem)] min-h-[640px] grid-cols-1 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_18rem]">
                    <aside className="hidden min-h-0 border-r border-black/8 bg-[#f8faf9] lg:flex lg:flex-col dark:border-white/10 dark:bg-zinc-950">
                        <div className="border-b border-black/8 px-4 py-4 dark:border-white/10">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-lg font-bold tracking-tight">
                                        Team Inbox
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {tenant.name} · {conversations.length}{' '}
                                        percakapan
                                    </p>
                                </div>
                                <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                                    <Inbox className="size-5" />
                                </span>
                            </div>

                            <label className="relative block">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari nama atau nomor..."
                                    className="h-10 rounded-xl border-0 bg-black/5 pl-9 shadow-none dark:bg-white/8"
                                />
                            </label>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-2">
                            {filteredConversations.map((item) => {
                                const isActive =
                                    item.ulid === conversation.ulid;

                                return (
                                    <Link
                                        key={item.ulid}
                                        href={inboxShow(item)}
                                        prefetch
                                        className={`flex gap-3 rounded-2xl px-3 py-3 transition ${
                                            isActive
                                                ? 'bg-emerald-100/80 shadow-sm ring-1 ring-emerald-700/10 dark:bg-emerald-950/60'
                                                : 'hover:bg-black/4 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-bold text-white">
                                            {initials(
                                                item.contact.display_name,
                                            )}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-start justify-between gap-2">
                                                <span className="truncate text-sm font-semibold">
                                                    {item.contact.display_name}
                                                </span>
                                                <span className="shrink-0 text-[11px] text-muted-foreground">
                                                    {formatDay(
                                                        item.last_message_at,
                                                    )}
                                                </span>
                                            </span>
                                            <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                {item.latest_message
                                                    ?.is_outbound && (
                                                    <CheckCheck className="size-3.5 text-sky-500" />
                                                )}
                                                <span className="truncate">
                                                    {previewText(item)}
                                                </span>
                                            </span>
                                            <span className="mt-1 block truncate text-[10px] font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
                                                {item.device.display_name}
                                            </span>
                                        </span>
                                    </Link>
                                );
                            })}

                            {filteredConversations.length === 0 && (
                                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    Percakapan tidak ditemukan.
                                </div>
                            )}
                        </div>
                    </aside>

                    <main className="flex min-h-0 min-w-0 flex-col bg-[#efeae2] dark:bg-[#111916]">
                        <header className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-black/8 bg-white/95 px-4 backdrop-blur dark:border-white/10 dark:bg-zinc-950/95">
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="lg:hidden"
                            >
                                <Link href={inboxIndex()}>
                                    <ArrowLeft className="size-5" />
                                </Link>
                            </Button>
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-bold text-white">
                                {initials(conversation.contact.display_name)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold">
                                    {conversation.contact.display_name}
                                </p>
                                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                    <span
                                        className={`size-1.5 rounded-full ${
                                            conversation.device
                                                .connection_status ===
                                            'connected'
                                                ? 'bg-emerald-500'
                                                : 'bg-amber-500'
                                        }`}
                                    />
                                    {conversation.contact.phone_number ??
                                        conversation.contact.external_id}
                                    <span>·</span>
                                    {conversation.device.display_name}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="hidden rounded-full sm:inline-flex"
                            >
                                {conversation.status}
                            </Badge>
                        </header>

                        <div className="relative min-h-0 flex-1 overflow-y-auto">
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.035]"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                                    backgroundSize: '22px 22px',
                                }}
                            />
                            <div className="relative mx-auto flex min-h-full max-w-4xl flex-col justify-end gap-2 px-3 py-6 sm:px-8">
                                {messages.length === 0 ? (
                                    <div className="m-auto max-w-sm rounded-2xl bg-white/90 p-6 text-center shadow-sm dark:bg-zinc-900/90">
                                        <Inbox className="mx-auto mb-3 size-7 text-emerald-600" />
                                        <p className="font-semibold">
                                            Belum ada pesan
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Semua pesan masuk akan tampil di
                                            sini, meskipun Bot Rule tidak aktif.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isOutbound =
                                            message.direction === 'outbound';
                                        const isBot =
                                            message.metadata?.source ===
                                            'bot_rule';

                                        return (
                                            <div
                                                key={message.ulid}
                                                className={`group flex ${
                                                    isOutbound
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`relative max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[72%] ${
                                                        isOutbound
                                                            ? 'rounded-br-md bg-[#d9fdd3] text-zinc-900 dark:bg-emerald-900 dark:text-zinc-50'
                                                            : 'rounded-bl-md bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                                                    }`}
                                                >
                                                    {isBot && (
                                                        <span className="mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
                                                            <Bot className="size-3" />
                                                            Bot Rule
                                                        </span>
                                                    )}

                                                    {message.body && (
                                                        <p className="leading-5.5 whitespace-pre-wrap">
                                                            {message.body}
                                                        </p>
                                                    )}

                                                    {message.has_media && (
                                                        <div className="mb-1 overflow-hidden rounded-xl">
                                                            {message.media_url &&
                                                            message.media_mime_type?.startsWith(
                                                                'image/',
                                                            ) ? (
                                                                <a
                                                                    href={
                                                                        message.media_url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <img
                                                                        src={
                                                                            message.media_url
                                                                        }
                                                                        alt={
                                                                            message.media_original_name ??
                                                                            'Media WhatsApp'
                                                                        }
                                                                        className="max-h-80 w-full object-cover"
                                                                    />
                                                                </a>
                                                            ) : (
                                                                <a
                                                                    href={
                                                                        message.media_url ??
                                                                        '#'
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-3 rounded-xl bg-black/5 p-3 dark:bg-white/8"
                                                                >
                                                                    <span className="flex size-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                                                                        <FileText className="size-5" />
                                                                    </span>
                                                                    <span className="min-w-0">
                                                                        <span className="block truncate font-medium">
                                                                            {message.media_original_name ??
                                                                                'Dokumen'}
                                                                        </span>
                                                                        <span className="text-xs opacity-60">
                                                                            {fileSize(
                                                                                message.media_size,
                                                                            )}
                                                                        </span>
                                                                    </span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}

                                                    <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                                                        {formatTime(
                                                            message.sent_at ??
                                                                message.received_at,
                                                        )}
                                                        <MessageStatus
                                                            message={message}
                                                        />
                                                    </span>

                                                    {message.is_failed && (
                                                        <div className="mt-2 border-t border-red-500/20 pt-2">
                                                            <p className="text-xs text-red-600 dark:text-red-300">
                                                                {message.error_message ??
                                                                    'Pesan gagal dikirim.'}
                                                            </p>
                                                            <Link
                                                                href={retryMessage(
                                                                    {
                                                                        whatsappMessage:
                                                                            message.ulid,
                                                                    },
                                                                )}
                                                                method="post"
                                                                as="button"
                                                                preserveScroll
                                                                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-red-600"
                                                            >
                                                                <RotateCcw className="size-3" />
                                                                Coba lagi
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <footer className="shrink-0 border-t border-black/8 bg-[#f7f8f7] p-3 dark:border-white/10 dark:bg-zinc-950">
                            {canReply ? (
                                <form
                                    onSubmit={submit}
                                    className="mx-auto max-w-4xl"
                                >
                                    {form.data.media && (
                                        <div className="mb-2 flex items-center gap-3 rounded-xl border bg-white px-3 py-2 text-sm dark:bg-zinc-900">
                                            <Paperclip className="size-4 text-emerald-600" />
                                            <span className="min-w-0 flex-1 truncate">
                                                {form.data.media.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {fileSize(form.data.media.size)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={clearAttachment}
                                                className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    )}

                                    {(form.errors.body ||
                                        form.errors.media ||
                                        form.errors.media_type) && (
                                        <Alert
                                            variant="destructive"
                                            className="mb-2"
                                        >
                                            <AlertTitle>
                                                Pesan belum dapat dikirim
                                            </AlertTitle>
                                            <AlertDescription>
                                                {form.errors.body ??
                                                    form.errors.media ??
                                                    form.errors.media_type}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex items-end gap-2">
                                        <input
                                            ref={fileInputRef}
                                            id="message-media"
                                            type="file"
                                            className="sr-only"
                                            accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={(event) => {
                                                const file =
                                                    event.target.files?.[0] ??
                                                    null;

                                                form.setData('media', file);

                                                if (file) {
                                                    form.setData(
                                                        'media_type',
                                                        file.type.startsWith(
                                                            'image/',
                                                        )
                                                            ? 'image'
                                                            : 'document',
                                                    );
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="size-11 shrink-0 rounded-full"
                                            asChild
                                        >
                                            <label htmlFor="message-media">
                                                <Paperclip className="size-5" />
                                                <span className="sr-only">
                                                    Lampirkan file
                                                </span>
                                            </label>
                                        </Button>
                                        <textarea
                                            value={form.data.body}
                                            onChange={(event) =>
                                                form.setData(
                                                    'body',
                                                    event.target.value,
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === 'Enter' &&
                                                    !event.shiftKey
                                                ) {
                                                    event.preventDefault();
                                                    event.currentTarget.form?.requestSubmit();
                                                }
                                            }}
                                            rows={1}
                                            placeholder="Ketik pesan..."
                                            className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm shadow-sm transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-white/10 dark:bg-zinc-900"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={
                                                form.processing ||
                                                (!form.data.body.trim() &&
                                                    !form.data.media)
                                            }
                                            className="size-11 shrink-0 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                                        >
                                            <SendHorizontal className="size-5" />
                                            <span className="sr-only">
                                                Kirim pesan
                                            </span>
                                        </Button>
                                    </div>
                                    {form.progress && (
                                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/5">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{
                                                    width: `${form.progress.percentage ?? 0}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <div className="mx-auto max-w-4xl rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                    Balasan tidak tersedia pada kondisi
                                    workspace saat ini.
                                </div>
                            )}
                        </footer>
                    </main>

                    <aside className="hidden min-h-0 border-l border-black/8 bg-white xl:block dark:border-white/10 dark:bg-zinc-950">
                        <div className="h-full overflow-y-auto p-5">
                            <div className="flex flex-col items-center border-b border-black/8 pb-6 text-center dark:border-white/10">
                                <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-xl font-bold text-white shadow-lg shadow-emerald-900/15">
                                    {initials(
                                        conversation.contact.display_name,
                                    )}
                                </span>
                                <p className="mt-3 font-bold">
                                    {conversation.contact.display_name}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {conversation.contact.phone_number ??
                                        conversation.contact.external_id}
                                </p>
                            </div>

                            <div className="space-y-5 py-6">
                                <Detail
                                    icon={Smartphone}
                                    label="WhatsApp device"
                                    value={conversation.device.display_name}
                                />
                                <Detail
                                    icon={UserRound}
                                    label="Contact ID"
                                    value={conversation.contact.external_id}
                                />
                                <Detail
                                    icon={Clock3}
                                    label="Aktivitas terakhir"
                                    value={formatFullDate(
                                        conversation.last_message_at,
                                    )}
                                />
                            </div>

                            <div className="rounded-2xl border border-emerald-700/10 bg-emerald-50 p-4 dark:bg-emerald-950/30">
                                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                    <Bot className="size-4" />
                                    Automation
                                </div>
                                <p className="mt-2 text-xs leading-5 text-emerald-800/75 dark:text-emerald-200/70">
                                    Bot Rule hanya mengirim jawaban otomatis
                                    jika trigger cocok. Semua pesan pelanggan
                                    tetap masuk ke inbox saat bot aktif maupun
                                    nonaktif.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

InboxShow.layout = {
    breadcrumbs: [
        {
            title: 'Inbox',
            href: inboxIndex(),
        },
        {
            title: 'Conversation',
            href: inboxIndex(),
        },
    ],
};

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Smartphone;
    label: string;
    value: string | null;
}) {
    return (
        <div className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-black/4 text-muted-foreground dark:bg-white/6">
                <Icon className="size-4" />
            </span>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-medium break-words">
                    {value ?? 'Belum tersedia'}
                </p>
            </div>
        </div>
    );
}
