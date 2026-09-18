import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    Check,
    CheckCircle2,
    Clock3,
    Gauge,
    Inbox,
    MessageCircle,
    Radio,
    ScanLine,
    Send,
    ShieldCheck,
    Sparkles,
    Users,
    Workflow,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const people = [
    ['FM', 'bg-[#f3a86f]'],
    ['DA', 'bg-[#70bfa5]'],
    ['RN', 'bg-[#8e9fce]'],
    ['NS', 'bg-[#e7c161]'],
];

const conversations = [
    [
        'AR',
        'Alya Rahman',
        'Can you check my order status?',
        '09:42',
        'bg-[#f3a86f]',
    ],
    [
        'BS',
        'Firos Store',
        'The package arrived. Thank you!',
        '09:18',
        'bg-[#70bfa5]',
    ],
    [
        'NP',
        'Nadia Putri',
        'Are other colors available?',
        'Yesterday',
        'bg-[#8e9fce]',
    ],
];

function Brand() {
    return (
        <span className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#123c2f] text-[#d9ffad]">
                <MessageCircle className="size-5 fill-current" />
            </span>
            <span className="text-lg font-black tracking-[-0.04em] text-[#123c2f]">
                Firlabs WA
            </span>
        </span>
    );
}

function Avatar({
    initials,
    color,
    size = 'size-9',
}: {
    initials: string;
    color: string;
    size?: string;
}) {
    return (
        <span
            className={`flex shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-black text-[#173a30] ${color} ${size}`}
        >
            {initials}
        </span>
    );
}

function InboxVisual() {
    return (
        <div className="landing-float relative mx-auto max-w-[620px]">
            <div className="absolute -top-8 -right-3 z-20 hidden items-center gap-3 rounded-2xl border border-[#dce9df] bg-white px-4 py-3 shadow-[0_18px_60px_rgba(18,60,47,0.16)] sm:flex">
                <span className="relative flex size-3">
                    <span className="absolute size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                    <span className="relative size-3 rounded-full bg-emerald-500" />
                </span>
                <div>
                    <p className="text-xs font-extrabold text-[#123c2f]">
                        3 active devices
                    </p>
                    <p className="text-[9px] text-[#788981]">
                        Just synced
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-white/70 bg-[#f8fbf8] shadow-[0_45px_100px_rgba(18,60,47,0.22)] ring-1 ring-[#173f32]/10">
                <div className="flex items-center justify-between border-b border-[#e3ebe5] bg-white px-5 py-3">
                    <div className="flex gap-2">
                        <span className="size-2.5 rounded-full bg-[#ff7f78]" />
                        <span className="size-2.5 rounded-full bg-[#f2c65f]" />
                        <span className="size-2.5 rounded-full bg-[#65c78d]" />
                    </div>
                    <span className="rounded-full bg-[#eff5f0] px-5 py-1.5 text-[8px] font-black tracking-[0.16em] text-[#6e8178] uppercase">
                        Live workspace
                    </span>
                    <span className="size-6 rounded-full bg-[#dce7df]" />
                </div>

                <div className="grid min-h-[390px] grid-cols-[78px_1fr] sm:grid-cols-[175px_1fr]">
                    <aside className="border-r border-[#e0e9e2] bg-white p-3">
                        <div className="mb-5 flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-[#123c2f] text-white">
                                <Inbox className="size-3.5" />
                            </span>
                            <span className="hidden text-xs font-black sm:block">
                                Inbox
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {conversations.map(
                                ([initials, name, preview, , color], index) => (
                                    <div
                                        key={name}
                                        className={`rounded-xl p-2 ${index === 0 ? 'bg-[#e8f5ed]' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                initials={initials}
                                                color={color}
                                                size="size-8"
                                            />
                                            <div className="hidden min-w-0 sm:block">
                                                <p className="truncate text-[9px] font-black">
                                                    {name}
                                                </p>
                                                <p className="truncate text-[7px] text-[#84928c]">
                                                    {preview}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </aside>

                    <div className="flex min-w-0 flex-col">
                        <div className="flex items-center justify-between border-b border-[#e0e9e2] bg-white px-4 py-3">
                            <div className="flex items-center gap-3">
                                <Avatar initials="AR" color="bg-[#f3a86f]" />
                                <div>
                                    <p className="text-xs font-black">
                                        Alya Rahman
                                    </p>
                                    <p className="flex items-center gap-1 text-[8px] text-[#6e8178]">
                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                        Customer Service
                                    </p>
                                </div>
                            </div>
                            <span className="flex size-8 items-center justify-center rounded-full border border-[#dce7df]">
                                <ScanLine className="size-3.5" />
                            </span>
                        </div>
                        <div className="flex flex-1 flex-col gap-3 bg-[radial-gradient(circle_at_20%_20%,#ffffff_0,#f3f8f3_48%,#edf5ef_100%)] p-4">
                            <span className="self-center rounded-full bg-white px-3 py-1 text-[8px] font-bold text-[#89968f] shadow-sm">
                                Today
                            </span>
                            <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white p-3 text-[10px] leading-4 text-[#385248] shadow-sm">
                                Hi, could you help check my order status?
                                <span className="mt-1 block text-right text-[7px] text-[#9aa59f]">
                                    09:41
                                </span>
                            </div>
                            <div className="max-w-[86%] self-end rounded-2xl rounded-br-sm bg-[#c9f7a7] p-3 text-[10px] leading-4 text-[#234735] shadow-sm">
                                Of course, Alya. Your order is on its way and
                                should arrive this afternoon.
                                <span className="mt-1 flex justify-end text-[7px] text-[#547262]">
                                    09:42 ✓✓
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl border border-[#dfe9e1] bg-white p-2.5">
                                <span className="flex size-8 items-center justify-center rounded-lg bg-[#eef4ef]">
                                    <Bot className="size-4" />
                                </span>
                                <div>
                                    <p className="text-[9px] font-black">
                                        Auto reply applied
                                    </p>
                                    <p className="text-[8px] text-[#89968f]">
                                        Rule: check order status
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border-t border-[#e0e9e2] bg-white p-3">
                            <span className="h-9 flex-1 rounded-full bg-[#f0f4f1] px-4 py-2 text-[9px] text-[#9aa59f]">
                                Write a reply...
                            </span>
                            <span className="flex size-9 items-center justify-center rounded-full bg-[#123c2f] text-[#d9ffad]">
                                <Send className="size-3.5" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="landing-float-delayed absolute -bottom-7 -left-4 z-20 hidden items-center gap-3 rounded-2xl border border-[#e2e9e4] bg-white p-4 shadow-[0_20px_60px_rgba(18,60,47,0.16)] md:flex">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff1ce] text-[#8a5e08]">
                    <Clock3 className="size-5" />
                </span>
                <div>
                    <p className="text-[9px] font-bold text-[#76867e]">
                        Response time
                    </p>
                    <p className="text-lg font-black text-[#123c2f]">1m 24s</p>
                </div>
            </div>
        </div>
    );
}

function FeatureArtwork({ kind }: { kind: 'devices' | 'rules' | 'team' }) {
    if (kind === 'devices') {
        return (
            <div className="relative flex h-56 items-end justify-center gap-3 overflow-hidden rounded-[26px] bg-[#153e32] p-5">
                <div className="absolute -top-10 -right-10 size-40 rounded-full bg-[#b9ff66]/25 blur-2xl" />
                {[
                    ['Sales', 'bg-[#f7c96e]', '-rotate-6'],
                    ['Support', 'bg-[#b9ff66]', '-translate-y-3'],
                    ['Notify', 'bg-[#8cc8ff]', 'rotate-6'],
                ].map(([name, color, transform]) => (
                    <div
                        key={name}
                        className={`relative w-[29%] rounded-[18px] border border-white/20 bg-white/10 p-2.5 backdrop-blur ${transform}`}
                    >
                        <div
                            className={`mb-7 flex aspect-square items-center justify-center rounded-xl ${color}`}
                        >
                            <Radio className="size-5 text-[#153e32]" />
                        </div>
                        <p className="truncate text-[9px] font-black text-white">
                            {name}
                        </p>
                        <p className="text-[7px] text-white/45">Connected</p>
                        <span className="mt-2 block h-1 rounded-full bg-emerald-300/70" />
                    </div>
                ))}
            </div>
        );
    }

    if (kind === 'rules') {
        return (
            <div className="relative flex h-56 flex-col justify-between overflow-hidden rounded-[26px] bg-[#fff2d6] p-5">
                <svg
                    aria-hidden="true"
                    className="absolute inset-0 size-full opacity-25"
                    viewBox="0 0 400 220"
                >
                    <path
                        d="M-20 170 C90 30 175 250 420 45"
                        fill="none"
                        stroke="#9b6b18"
                        strokeDasharray="7 10"
                        strokeWidth="2"
                    />
                </svg>
                <span className="relative self-start rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-[#79551a] shadow-sm">
                    Message contains &ldquo;price&rdquo;
                </span>
                <span className="relative mx-auto flex size-20 items-center justify-center rounded-full border-[10px] border-white/65 bg-[#153e32] text-[#d9ffad] shadow-xl">
                    <Bot className="size-7" />
                </span>
                <span className="relative ml-auto max-w-[82%] rounded-2xl rounded-br-sm bg-white p-3 text-[9px] leading-4 font-bold text-[#4e3d1f] shadow-sm">
                    Here is our latest price list.
                </span>
            </div>
        );
    }

    return (
        <div className="relative flex h-56 flex-col justify-between overflow-hidden rounded-[26px] bg-[#ebe9ff] p-5">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-[0.16em] text-[#635b91] uppercase">
                    Active team
                </span>
                <span className="rounded-full bg-white/70 px-2.5 py-1 text-[8px] font-bold text-[#635b91]">
                    4 online
                </span>
            </div>
            <div className="flex justify-center -space-x-3">
                {people.map(([initials, color], index) => (
                    <div
                        key={initials}
                        className={
                            index % 2 === 0 ? '-translate-y-3' : 'translate-y-3'
                        }
                    >
                        <Avatar
                            initials={initials}
                            color={color}
                            size="size-16"
                        />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
                {['Owner', 'Admin', 'Operator'].map((role) => (
                    <span
                        key={role}
                        className="rounded-full bg-white/70 py-1.5 text-center text-[8px] font-bold text-[#635b91]"
                    >
                        {role}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;
    const callToAction = auth.user ? dashboard() : register();

    return (
        <>
            <Head title="WhatsApp teamwork, simplified">
                <meta
                    name="description"
                    content="Manage WhatsApp devices, conversations, teams, and automation in one workspace."
                />
            </Head>

            <div className="min-h-screen overflow-hidden bg-[#f7f8f2] text-[#173a30] selection:bg-[#b9ff66]">
                <header className="absolute inset-x-0 top-0 z-50">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
                        <Brand />
                        <div className="hidden items-center gap-8 text-sm font-bold text-[#496159] md:flex">
                            <a
                                href="#features"
                                className="hover:text-[#123c2f]"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="hover:text-[#123c2f]"
                            >
                                How it works
                            </a>
                            <a
                                href="#security"
                                className="hover:text-[#123c2f]"
                            >
                                Security
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    prefetch
                                    className="hidden rounded-full px-4 py-2.5 text-sm font-black hover:bg-white sm:block"
                                >
                                    Sign in
                                </Link>
                            )}
                            <Link
                                href={callToAction}
                                prefetch
                                className="group flex items-center gap-2 rounded-full bg-[#123c2f] px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1b5945] motion-reduce:transform-none"
                            >
                                {auth.user ? 'Dashboard' : 'Get started'}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </nav>
                </header>

                <main>
                    <section className="landing-grid relative pt-36 pb-24 sm:pt-44 lg:pt-48 lg:pb-32">
                        <div className="absolute top-24 left-[8%] size-72 rounded-full bg-[#d9ffad]/55 blur-3xl" />
                        <div className="absolute right-[-8rem] bottom-0 size-[28rem] rounded-full bg-[#dceeff]/70 blur-3xl" />
                        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
                            <div className="landing-rise max-w-2xl">
                                <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cfdfd3] bg-white/75 px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-[#46645a] uppercase shadow-sm">
                                    <span className="flex size-6 items-center justify-center rounded-full bg-[#d9ffad]">
                                        <Sparkles className="size-3" />
                                    </span>
                                    WhatsApp workspace for modern teams
                                </span>
                                <h1 className="max-w-xl font-serif text-[clamp(3.5rem,8vw,6.7rem)] leading-[0.88] font-black tracking-[-0.065em] text-[#123c2f]">
                                    Tidier chats.{' '}
                                    <span className="relative inline-block italic">
                                        Faster teams.
                                        <svg
                                            className="absolute -bottom-3 left-0 h-4 w-full text-[#8fd64d]"
                                            viewBox="0 0 260 22"
                                            preserveAspectRatio="none"
                                        >
                                            <path
                                                d="M4 17C68 3 170 4 256 12"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeWidth="8"
                                            />
                                        </svg>
                                    </span>
                                </h1>
                                <p className="mt-8 max-w-lg text-base leading-8 text-[#5d7069] sm:text-lg">
                                    Bring devices, customer conversations, team
                                    members, and automation together in one
                                    dashboard your team will enjoy using every
                                    day.
                                </p>
                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={callToAction}
                                        prefetch
                                        className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#123c2f] px-7 py-4 text-sm font-black text-white shadow-[0_15px_35px_rgba(18,60,47,0.2)] transition hover:-translate-y-1 hover:bg-[#1a5643] motion-reduce:transform-none"
                                    >
                                        {auth.user
                                            ? 'Open dashboard'
                                            : 'Create a free workspace'}
                                        <span className="flex size-7 items-center justify-center rounded-full bg-[#d9ffad] text-[#123c2f]">
                                            <ArrowRight className="size-3.5" />
                                        </span>
                                    </Link>
                                    <a
                                        href="#how-it-works"
                                        className="inline-flex items-center justify-center rounded-full border border-[#cbd9cf] bg-white/70 px-7 py-4 text-sm font-black hover:bg-white"
                                    >
                                        See how it works
                                    </a>
                                </div>
                                <div className="mt-9 flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {people.map(([initials, color]) => (
                                            <Avatar
                                                key={initials}
                                                initials={initials}
                                                color={color}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs leading-5 text-[#6b7c75]">
                                        <strong className="block text-[#24483d]">
                                            Built for collaboration
                                        </strong>
                                        Owners, admins, and operators.
                                    </p>
                                </div>
                            </div>
                            <div className="landing-rise [animation-delay:180ms]">
                                <InboxVisual />
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-[#dce5de] bg-white/70 py-7">
                        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-5 px-5 text-xs font-black tracking-[0.12em] text-[#789087] uppercase lg:justify-between lg:px-10">
                            <span className="text-[#24483d]">
                                Built for:
                            </span>
                            <span>Customer Service</span>
                            <span>Sales</span>
                            <span>Notifications</span>
                            <span>Collections</span>
                        </div>
                    </section>

                    <section
                        id="features"
                        className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
                    >
                        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
                            <div>
                                <p className="mb-4 text-xs font-black tracking-[0.18em] text-[#4c7567] uppercase">
                                    Everything that matters
                                </p>
                                <h2 className="font-serif text-4xl leading-none font-black tracking-[-0.045em] sm:text-6xl">
                                    Calm behind the scenes, responsive in
                                    front of customers.
                                </h2>
                            </div>
                            <p className="max-w-lg text-base leading-8 text-[#687a73] lg:justify-self-end">
                                No more scattered tabs or casually shared
                                device access. Every activity flows through
                                Laravel as the single source of truth.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-5 lg:grid-cols-3">
                            {[
                                {
                                    kind: 'devices' as const,
                                    icon: Inbox,
                                    label: 'One inbox',
                                    title: 'Every conversation, one control.',
                                    text: 'Manage multiple WhatsApp numbers without losing context.',
                                },
                                {
                                    kind: 'rules' as const,
                                    icon: Workflow,
                                    label: 'Practical automation',
                                    title: 'Fast replies that stay personal.',
                                    text: 'Set keywords per device and let the queue do the work.',
                                },
                                {
                                    kind: 'team' as const,
                                    icon: ShieldCheck,
                                    label: 'Secure workspace',
                                    title: 'Clear, isolated team access.',
                                    text: 'Tenants, roles, devices, and data protected by Laravel.',
                                },
                            ].map((feature) => (
                                <article
                                    key={feature.title}
                                    className="group rounded-[32px] border border-[#dce5de] bg-white p-4 shadow-[0_18px_50px_rgba(31,66,54,0.06)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(31,66,54,0.12)] motion-reduce:transform-none"
                                >
                                    <FeatureArtwork kind={feature.kind} />
                                    <div className="p-4 pt-6">
                                        <feature.icon className="mb-5 size-5" />
                                        <p className="mb-2 text-[10px] font-black tracking-[0.18em] text-[#73877f] uppercase">
                                            {feature.label}
                                        </p>
                                        <h3 className="text-xl leading-7 font-black tracking-[-0.025em]">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 text-[#718079]">
                                            {feature.text}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section
                        id="how-it-works"
                        className="relative overflow-hidden bg-[#123c2f] py-24 text-white lg:py-32"
                    >
                        <div className="absolute -top-48 right-[-10rem] size-[38rem] rounded-full border-[90px] border-[#b9ff66]/5" />
                        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <p className="mb-4 text-xs font-black tracking-[0.18em] text-[#b9ff66] uppercase">
                                A clear flow
                            </p>
                            <h2 className="max-w-4xl font-serif text-4xl leading-none font-black tracking-[-0.045em] sm:text-6xl">
                                From incoming message to resolution, without
                                losing context.
                            </h2>
                            <div className="mt-16 grid gap-4 md:grid-cols-3">
                                {[
                                    [
                                        Radio,
                                        '01',
                                        'Connect devices',
                                        'Device identities are created securely by Laravel.',
                                    ],
                                    [
                                        Inbox,
                                        '02',
                                        'Receive and share',
                                        'Incoming messages are ready for your team to handle.',
                                    ],
                                    [
                                        Gauge,
                                        '03',
                                        'Reply and monitor',
                                        'Status, queues, and failures are always visible.',
                                    ],
                                ].map(([Icon, number, title, text]) => {
                                    const StepIcon = Icon as typeof Radio;

                                    return (
                                        <article
                                            key={number as string}
                                            className="rounded-[28px] border border-white/10 bg-white/[0.055] p-7 backdrop-blur transition hover:bg-white/[0.09]"
                                        >
                                            <span className="mb-10 flex size-12 items-center justify-center rounded-2xl bg-[#b9ff66] text-[#123c2f]">
                                                <StepIcon className="size-5" />
                                            </span>
                                            <p className="mb-3 text-[10px] font-black tracking-[0.18em] text-[#b9ff66] uppercase">
                                                Step {number as string}
                                            </p>
                                            <h3 className="text-xl font-black">
                                                {title as string}
                                            </h3>
                                            <p className="mt-3 text-sm leading-6 text-white/55">
                                                {text as string}
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section
                        id="security"
                        className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-32"
                    >
                        <div className="relative rounded-[34px] border border-[#d7e2da] bg-white p-6 shadow-[0_30px_80px_rgba(27,70,55,0.12)] sm:p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black">
                                        Workspace security
                                    </p>
                                    <p className="text-[10px] text-[#7b8c84]">
                                        Active protection
                                    </p>
                                </div>
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#dff8ec] text-[#176646]">
                                    <ShieldCheck className="size-5" />
                                </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    'Tenant isolation',
                                    'Role authorization',
                                    'Webhook signature',
                                    'Queued delivery',
                                ].map((label) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between rounded-2xl bg-[#f4f7f3] p-4"
                                    >
                                        <span className="text-xs font-bold">
                                            {label}
                                        </span>
                                        <CheckCircle2 className="size-4 text-[#21825c]" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#173a30] p-4 text-white">
                                <span className="flex size-11 items-center justify-center rounded-xl bg-[#b9ff66] text-[#173a30]">
                                    <Users className="size-5" />
                                </span>
                                <p className="text-xs leading-5">
                                    <strong className="block">
                                        Role-based access
                                    </strong>
                                    <span className="text-white/55">
                                        Super Admin, Owner, Admin, and
                                        Operator.
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="lg:pl-8">
                            <p className="mb-4 text-xs font-black tracking-[0.18em] text-[#4c7567] uppercase">
                                Secure by design
                            </p>
                            <h2 className="font-serif text-4xl leading-none font-black tracking-[-0.045em] sm:text-6xl">
                                GOWA works behind the scenes. Laravel stays in
                                control.
                            </h2>
                            <p className="mt-7 text-base leading-8 text-[#667970]">
                                Regular users never touch the gateway directly.
                                Tenants, authorization, queues, and audit
                                trails are handled in the application layer.
                            </p>
                            <div className="mt-8 grid gap-3">
                                {[
                                    'Tenants are never trusted from the browser or webhooks.',
                                    'Gateway credentials are never sent to the frontend.',
                                    'Message delivery is processed through queues.',
                                ].map((item) => (
                                    <p
                                        key={item}
                                        className="flex items-center gap-3 text-sm font-bold"
                                    >
                                        <span className="flex size-6 items-center justify-center rounded-full bg-[#d9ffad]">
                                            <Check className="size-3.5" />
                                        </span>
                                        {item}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="px-5 pb-8 sm:px-8 lg:px-10">
                        <div className="relative mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[36px] bg-[#e5ffbe] px-7 py-16 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-20">
                            <div>
                                <p className="mb-4 text-xs font-black tracking-[0.18em] text-[#53703e] uppercase">
                                    Ready to tidy up conversations?
                                </p>
                                <h2 className="max-w-3xl font-serif text-4xl leading-none font-black tracking-[-0.05em] sm:text-6xl">
                                    Bring business WhatsApp into one workspace.
                                </h2>
                            </div>
                            <Link
                                href={callToAction}
                                prefetch
                                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#123c2f] px-7 py-4 text-sm font-black text-white transition hover:-translate-y-1 motion-reduce:transform-none"
                            >
                                {auth.user
                                    ? 'Open dashboard'
                                    : 'Get started now'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>
                </main>

                <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-[#71817a] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
                    <Brand />
                    <p>WhatsApp operations, organized with care.</p>
                    {!auth.user && (
                        <Link
                            href={login()}
                            prefetch
                            className="font-bold hover:text-[#123c2f]"
                        >
                            Sign in
                        </Link>
                    )}
                </footer>
            </div>
        </>
    );
}
