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
        'Boleh cek status pesanan saya?',
        '09:42',
        'bg-[#f3a86f]',
    ],
    [
        'BS',
        'Firos Store',
        'Barangnya sudah sampai. Terima kasih!',
        '09:18',
        'bg-[#70bfa5]',
    ],
    [
        'NP',
        'Nadia Putri',
        'Apakah tersedia warna lainnya?',
        'Kemarin',
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
                        3 perangkat aktif
                    </p>
                    <p className="text-[9px] text-[#788981]">
                        Baru disinkronkan
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
                                Hari ini
                            </span>
                            <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white p-3 text-[10px] leading-4 text-[#385248] shadow-sm">
                                Halo, boleh dibantu cek status pesanan saya?
                                <span className="mt-1 block text-right text-[7px] text-[#9aa59f]">
                                    09:41
                                </span>
                            </div>
                            <div className="max-w-[86%] self-end rounded-2xl rounded-br-sm bg-[#c9f7a7] p-3 text-[10px] leading-4 text-[#234735] shadow-sm">
                                Tentu, Kak Alya. Pesanan sedang dikirim dan
                                diperkirakan tiba sore ini.
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
                                        Balasan otomatis diterapkan
                                    </p>
                                    <p className="text-[8px] text-[#89968f]">
                                        Rule: cek status pesanan
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border-t border-[#e0e9e2] bg-white p-3">
                            <span className="h-9 flex-1 rounded-full bg-[#f0f4f1] px-4 py-2 text-[9px] text-[#9aa59f]">
                                Tulis balasan...
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
                        Waktu respons
                    </p>
                    <p className="text-lg font-black text-[#123c2f]">1m 24d</p>
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
                    Pesan berisi “harga”
                </span>
                <span className="relative mx-auto flex size-20 items-center justify-center rounded-full border-[10px] border-white/65 bg-[#153e32] text-[#d9ffad] shadow-xl">
                    <Bot className="size-7" />
                </span>
                <span className="relative ml-auto max-w-[82%] rounded-2xl rounded-br-sm bg-white p-3 text-[9px] leading-4 font-bold text-[#4e3d1f] shadow-sm">
                    Ini daftar harga terbaru kami.
                </span>
            </div>
        );
    }

    return (
        <div className="relative flex h-56 flex-col justify-between overflow-hidden rounded-[26px] bg-[#ebe9ff] p-5">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-[0.16em] text-[#635b91] uppercase">
                    Tim aktif
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
                    content="Kelola perangkat, percakapan, tim, dan otomasi WhatsApp dalam satu workspace."
                />
            </Head>

            <div className="min-h-screen overflow-hidden bg-[#f7f8f2] text-[#173a30] selection:bg-[#b9ff66]">
                <header className="absolute inset-x-0 top-0 z-50">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
                        <Brand />
                        <div className="hidden items-center gap-8 text-sm font-bold text-[#496159] md:flex">
                            <a href="#fitur" className="hover:text-[#123c2f]">
                                Fitur
                            </a>
                            <a
                                href="#cara-kerja"
                                className="hover:text-[#123c2f]"
                            >
                                Cara kerja
                            </a>
                            <a
                                href="#keamanan"
                                className="hover:text-[#123c2f]"
                            >
                                Keamanan
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    prefetch
                                    className="hidden rounded-full px-4 py-2.5 text-sm font-black hover:bg-white sm:block"
                                >
                                    Masuk
                                </Link>
                            )}
                            <Link
                                href={callToAction}
                                prefetch
                                className="group flex items-center gap-2 rounded-full bg-[#123c2f] px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1b5945] motion-reduce:transform-none"
                            >
                                {auth.user ? 'Dashboard' : 'Mulai'}
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
                                    WhatsApp workspace untuk tim modern
                                </span>
                                <h1 className="max-w-xl font-serif text-[clamp(3.5rem,8vw,6.7rem)] leading-[0.88] font-black tracking-[-0.065em] text-[#123c2f]">
                                    Chat lebih{' '}
                                    <span className="relative inline-block italic">
                                        rapi.
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
                                    <br />
                                    Tim lebih cepat.
                                </h1>
                                <p className="mt-8 max-w-lg text-base leading-8 text-[#5d7069] sm:text-lg">
                                    Satukan perangkat, percakapan pelanggan,
                                    anggota tim, dan otomasi dalam satu
                                    dashboard yang nyaman digunakan setiap hari.
                                </p>
                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={callToAction}
                                        prefetch
                                        className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#123c2f] px-7 py-4 text-sm font-black text-white shadow-[0_15px_35px_rgba(18,60,47,0.2)] transition hover:-translate-y-1 hover:bg-[#1a5643] motion-reduce:transform-none"
                                    >
                                        {auth.user
                                            ? 'Buka dashboard'
                                            : 'Buat workspace gratis'}
                                        <span className="flex size-7 items-center justify-center rounded-full bg-[#d9ffad] text-[#123c2f]">
                                            <ArrowRight className="size-3.5" />
                                        </span>
                                    </Link>
                                    <a
                                        href="#fitur"
                                        className="inline-flex items-center justify-center rounded-full border border-[#cbd9cf] bg-white/70 px-7 py-4 text-sm font-black hover:bg-white"
                                    >
                                        Lihat cara kerja
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
                                            Dibuat untuk kolaborasi
                                        </strong>
                                        Owner, admin, dan operator.
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
                                Dibuat untuk:
                            </span>
                            <span>Customer Service</span>
                            <span>Sales</span>
                            <span>Notifications</span>
                            <span>Collections</span>
                        </div>
                    </section>

                    <section
                        id="fitur"
                        className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
                    >
                        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
                            <div>
                                <p className="mb-4 text-xs font-black tracking-[0.18em] text-[#4c7567] uppercase">
                                    Semua yang penting
                                </p>
                                <h2 className="font-serif text-4xl leading-none font-black tracking-[-0.045em] sm:text-6xl">
                                    Tenang di belakang layar, sigap di depan
                                    pelanggan.
                                </h2>
                            </div>
                            <p className="max-w-lg text-base leading-8 text-[#687a73] lg:justify-self-end">
                                Tidak ada lagi tab tercecer atau akses perangkat
                                yang dibagikan sembarangan. Semua aktivitas
                                mengalir melalui Laravel sebagai sumber data
                                utama.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-5 lg:grid-cols-3">
                            {[
                                {
                                    kind: 'devices' as const,
                                    icon: Inbox,
                                    label: 'Satu inbox',
                                    title: 'Semua percakapan, satu kendali.',
                                    text: 'Kelola beberapa nomor WhatsApp tanpa kehilangan konteks.',
                                },
                                {
                                    kind: 'rules' as const,
                                    icon: Workflow,
                                    label: 'Otomasi praktis',
                                    title: 'Balasan cepat yang tetap personal.',
                                    text: 'Atur kata kunci per perangkat dan biarkan queue bekerja.',
                                },
                                {
                                    kind: 'team' as const,
                                    icon: ShieldCheck,
                                    label: 'Workspace aman',
                                    title: 'Akses tim jelas dan terisolasi.',
                                    text: 'Tenant, peran, perangkat, dan data dilindungi dari Laravel.',
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
                        id="cara-kerja"
                        className="relative overflow-hidden bg-[#123c2f] py-24 text-white lg:py-32"
                    >
                        <div className="absolute -top-48 right-[-10rem] size-[38rem] rounded-full border-[90px] border-[#b9ff66]/5" />
                        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <p className="mb-4 text-xs font-black tracking-[0.18em] text-[#b9ff66] uppercase">
                                Alur yang jelas
                            </p>
                            <h2 className="max-w-4xl font-serif text-4xl leading-none font-black tracking-[-0.045em] sm:text-6xl">
                                Dari pesan masuk sampai selesai, tanpa putus
                                konteks.
                            </h2>
                            <div className="mt-16 grid gap-4 md:grid-cols-3">
                                {[
                                    [
                                        Radio,
                                        '01',
                                        'Hubungkan perangkat',
                                        'Identitas perangkat dibuat aman oleh Laravel.',
                                    ],
                                    [
                                        Inbox,
                                        '02',
                                        'Terima dan bagikan',
                                        'Pesan masuk siap ditangani anggota tim.',
                                    ],
                                    [
                                        Gauge,
                                        '03',
                                        'Balas dan pantau',
                                        'Status, antrean, dan kegagalan selalu terlihat.',
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
                                                Langkah {number as string}
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
                        id="keamanan"
                        className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-32"
                    >
                        <div className="relative rounded-[34px] border border-[#d7e2da] bg-white p-6 shadow-[0_30px_80px_rgba(27,70,55,0.12)] sm:p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black">
                                        Workspace security
                                    </p>
                                    <p className="text-[10px] text-[#7b8c84]">
                                        Perlindungan aktif
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
                                        Akses berbasis peran
                                    </strong>
                                    <span className="text-white/55">
                                        Super Admin, Owner, Admin, dan Operator.
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="lg:pl-8">
                            <p className="mb-4 text-xs font-black tracking-[0.18em] text-[#4c7567] uppercase">
                                Aman sejak fondasi
                            </p>
                            <h2 className="font-serif text-4xl leading-none font-black tracking-[-0.045em] sm:text-6xl">
                                GOWA bekerja di belakang. Laravel tetap memegang
                                kendali.
                            </h2>
                            <p className="mt-7 text-base leading-8 text-[#667970]">
                                Pengguna normal tidak pernah mengakses gateway
                                langsung. Tenant, otorisasi, antrean, dan jejak
                                proses diselesaikan di lapisan aplikasi.
                            </p>
                            <div className="mt-8 grid gap-3">
                                {[
                                    'Tenant tidak dipercaya dari browser atau webhook.',
                                    'Kredensial gateway tidak dikirim ke frontend.',
                                    'Pengiriman pesan diproses melalui queue.',
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
                                    Siap merapikan percakapan?
                                </p>
                                <h2 className="max-w-3xl font-serif text-4xl leading-none font-black tracking-[-0.05em] sm:text-6xl">
                                    Bawa WhatsApp bisnis ke satu workspace.
                                </h2>
                            </div>
                            <Link
                                href={callToAction}
                                prefetch
                                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#123c2f] px-7 py-4 text-sm font-black text-white transition hover:-translate-y-1 motion-reduce:transform-none"
                            >
                                {auth.user
                                    ? 'Masuk dashboard'
                                    : 'Mulai sekarang'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>
                </main>

                <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-[#71817a] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
                    <Brand />
                    <p>WhatsApp operations, organized with care.</p>
                    <Link
                        href={login()}
                        prefetch
                        className="font-bold hover:text-[#123c2f]"
                    >
                        Masuk
                    </Link>
                </footer>
            </div>
        </>
    );
}
