import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    MessageSquareReply,
    Plus,
    Smartphone,
    Trash2,
    Wifi,
    WifiOff,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    create as botRulesCreate,
    destroy as botRulesDestroy,
    edit as botRulesEdit,
    index as botRulesIndex,
} from '@/routes/bot-rules';
import type { TenantSummary } from '@/types/auth';
import type { BotRuleDeviceSummary, BotRuleSummary } from '@/types/bot-rule';

type Props = {
    tenant: TenantSummary;
    devices: BotRuleDeviceSummary[];
    rules: BotRuleSummary[];
    ruleCount: number;
};

type DeviceRuleGroup = {
    device: BotRuleDeviceSummary;
    rules: BotRuleSummary[];
};

function matchTypeLabel(value: string): string {
    return (
        {
            contains: 'Mengandung',
            exact: 'Sama persis',
            starts_with: 'Diawali',
        }[value] ?? value
    );
}

function groupByDevice(
    devices: BotRuleDeviceSummary[],
    rules: BotRuleSummary[],
): DeviceRuleGroup[] {
    const groups = new Map<number, DeviceRuleGroup>();

    devices.forEach((device) => {
        groups.set(device.id, {
            device,
            rules: [],
        });
    });

    rules.forEach((rule) => {
        if (!rule.device) {
            return;
        }

        const existing = groups.get(rule.device.id);

        if (existing) {
            existing.rules.push(rule);

            return;
        }

        groups.set(rule.device.id, {
            device: rule.device,
            rules: [rule],
        });
    });

    return Array.from(groups.values()).sort((first, second) =>
        first.device.display_name.localeCompare(second.device.display_name),
    );
}

export default function BotRulesIndex({ devices, rules, ruleCount }: Props) {
    const deviceGroups = groupByDevice(devices, rules);

    return (
        <>
            <Head title="Bot Rules" />

            <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <Heading title="Bot Rules" />

                    <Button
                        asChild
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Link href={botRulesCreate()}>
                            <Plus className="mr-2 size-4" />
                            Tambah rule
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Total rules" value={ruleCount} icon={Bot} />
                    <Stat
                        label="Device terpakai"
                        value={deviceGroups.length}
                        icon={Smartphone}
                    />
                    <Stat
                        label="Rules aktif"
                        value={rules.filter((rule) => rule.is_active).length}
                        icon={MessageSquareReply}
                    />
                </div>

                {devices.length === 0 ? (
                    <Card className="border-dashed">
                        <CardHeader>
                            <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <Bot className="size-6" />
                            </span>
                            <CardTitle>Belum ada Bot Rule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href={botRulesCreate()}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah rule
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {deviceGroups.map(({ device, rules: deviceRules }) => {
                            const isConnected =
                                device.connection_status === 'connected';
                            const activeCount = deviceRules.filter(
                                (rule) => rule.is_active,
                            ).length;

                            return (
                                <section
                                    key={device.id}
                                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                    <header className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/60">
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                                <Smartphone className="size-5" />
                                            </span>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="font-bold tracking-tight">
                                                        {device.display_name}
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
                                                    {deviceRules.length} rule ·{' '}
                                                    {activeCount} aktif
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="secondary"
                                        >
                                            <Link href={botRulesCreate()}>
                                                <Plus className="mr-2 size-3.5" />
                                                Rule baru
                                            </Link>
                                        </Button>
                                    </header>

                                    <div className="grid gap-3 p-3 lg:grid-cols-2">
                                        {deviceRules.map((rule) => (
                                            <Card
                                                key={rule.ulid}
                                                className="border-black/8 shadow-none dark:border-white/10"
                                            >
                                                <CardHeader className="gap-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <CardTitle className="text-base">
                                                                {rule.name}
                                                            </CardTitle>
                                                            <CardDescription className="mt-1">
                                                                Prioritas{' '}
                                                                {rule.priority}
                                                            </CardDescription>
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                rule.is_active
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            className={
                                                                rule.is_active
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : ''
                                                            }
                                                        >
                                                            {rule.is_active
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="space-y-4">
                                                    <div className="rounded-xl bg-black/3 p-3 text-sm dark:bg-white/5">
                                                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                            Trigger ·{' '}
                                                            {matchTypeLabel(
                                                                rule.match_type,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 font-semibold">
                                                            “{rule.trigger_text}
                                                            ”
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-emerald-700/10 bg-emerald-50 p-3 text-sm dark:bg-emerald-950/25">
                                                        <p className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase dark:text-emerald-300">
                                                            Balasan otomatis
                                                        </p>
                                                        <p className="mt-1 line-clamp-3 leading-5 text-emerald-950 dark:text-emerald-100">
                                                            {rule.response_text}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            variant="secondary"
                                                        >
                                                            <Link
                                                                href={botRulesEdit(
                                                                    rule,
                                                                )}
                                                            >
                                                                Edit
                                                                <ArrowRight className="ml-2 size-3.5" />
                                                            </Link>
                                                        </Button>

                                                        <Form
                                                            {...botRulesDestroy.form(
                                                                rule,
                                                            )}
                                                            options={{
                                                                preserveScroll: true,
                                                            }}
                                                            className="inline-flex"
                                                        >
                                                            {({
                                                                processing,
                                                            }) => (
                                                                <Button
                                                                    type="submit"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                                                >
                                                                    <Trash2 className="mr-2 size-3.5" />
                                                                    Hapus
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {deviceRules.length === 0 && (
                                            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground lg:col-span-2">
                                                Device ini belum memiliki Bot
                                                Rule. Pesan masuk tetap akan
                                                tersimpan di Inbox tanpa balasan
                                                otomatis.
                                            </div>
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

BotRulesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Bot Rules',
            href: botRulesIndex(),
        },
    ],
};

function Stat({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof Bot;
}) {
    return (
        <Card className="shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <Icon className="size-5" />
                </span>
                <div>
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
