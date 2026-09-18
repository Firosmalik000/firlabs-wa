import { Head, Form } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    CircleCheck,
    RotateCcw,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import { Fragment, useDeferredValue, useState } from 'react';
import { forgetFailedJob, retryFailedJob } from '@/actions/App/Http/Controllers/AdminController';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index as adminIndex } from '@/routes/admin';
import { index as adminFailedJobsIndex } from '@/routes/admin/failed-jobs';
import type { AdminFailedJobSummary } from '@/types/admin';

type Props = { jobs: AdminFailedJobSummary[] };

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function AdminFailedJobs({ jobs }: Props) {
    const [search, setSearch] = useState('');
    const [queue, setQueue] = useState('all');
    const [expanded, setExpanded] = useState<number | null>(null);
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const queues = Array.from(new Set(jobs.map((job) => job.queue))).sort();
    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = [
            job.uuid,
            job.connection,
            job.queue,
            job.exception,
        ].some((value) => value.toLowerCase().includes(deferredSearch));

        return matchesSearch && (queue === 'all' || job.queue === queue);
    });

    return (
        <>
            <Head title="Failed Jobs" />
            <div className="space-y-4">
                <Heading title="Failed Jobs" />
                <Card className="overflow-hidden shadow-sm">
                    <DataTableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        placeholder="Cari UUID, queue, exception..."
                        resultCount={filteredJobs.length}
                        filter={{
                            label: 'Queue',
                            value: queue,
                            onChange: setQueue,
                            options: [
                                { label: 'Semua queue', value: 'all' },
                                ...queues.map((value) => ({
                                    label: value,
                                    value,
                                })),
                            ],
                        }}
                    />
                    <CardContent className="p-0">
                        {filteredJobs.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                                <CircleCheck className="size-5 text-emerald-600" />{' '}
                                Tidak ada failed job.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[820px] text-xs">
                                    <thead className="bg-muted/35 text-left text-[10px] tracking-wider text-muted-foreground uppercase">
                                        <tr className="border-b">
                                            <th className="w-12 px-3 py-2 text-center font-semibold">
                                                No.
                                            </th>
                                            <th className="w-14 px-3 py-2 font-semibold">
                                                Action
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Job
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Connection
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Queue
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Failed
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredJobs.map((job, index) => (
                                            <Fragment key={job.id}>
                                                <tr className="border-b transition hover:bg-muted/25">
                                                    <td className="px-3 py-2.5 text-center font-medium text-muted-foreground tabular-nums">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex items-center gap-1">
                                                            <Form
                                                                {...retryFailedJob.form(job.uuid)}
                                                                className="inline"
                                                            >
                                                                <Button
                                                                    type="submit"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="size-7 text-emerald-700 hover:text-emerald-600 dark:text-emerald-300"
                                                                    title="Retry job"
                                                                >
                                                                    <RotateCcw className="size-4" />
                                                                    <span className="sr-only">
                                                                        Retry failed job
                                                                    </span>
                                                                </Button>
                                                            </Form>
                                                            <Form
                                                                {...forgetFailedJob.form(job.uuid)}
                                                                className="inline"
                                                            >
                                                                <Button
                                                                    type="submit"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="size-7 text-red-600 hover:text-red-500"
                                                                    title="Forget job"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                    <span className="sr-only">
                                                                        Forget failed job
                                                                    </span>
                                                                </Button>
                                                            </Form>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-7"
                                                                onClick={() =>
                                                                    setExpanded(
                                                                        expanded ===
                                                                            job.id
                                                                            ? null
                                                                            : job.id,
                                                                    )
                                                                }
                                                            >
                                                                {expanded ===
                                                                job.id ? (
                                                                    <ChevronUp className="size-4" />
                                                                ) : (
                                                                    <ChevronDown className="size-4" />
                                                                )}
                                                                <span className="sr-only">
                                                                    Inspect failed
                                                                    job
                                                                </span>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
                                                            <TriangleAlert className="size-3.5" />{' '}
                                                            Failed job
                                                        </div>
                                                        <div className="mt-0.5 max-w-64 truncate font-mono text-[10px] text-muted-foreground">
                                                            {job.uuid}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <Badge
                                                            variant="outline"
                                                            className="h-5 text-[10px]"
                                                        >
                                                            {job.connection}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-2.5 font-medium">
                                                        {job.queue}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-muted-foreground">
                                                        {formatDate(
                                                            job.failed_at,
                                                        )}
                                                    </td>
                                                </tr>
                                                {expanded === job.id && (
                                                    <tr
                                                        key={`${job.id}-detail`}
                                                        className="border-b bg-red-50/40 dark:bg-red-950/10"
                                                    >
                                                        <td
                                                            colSpan={6}
                                                            className="px-4 py-3"
                                                        >
                                                            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                                Exception
                                                                preview
                                                            </p>
                                                            <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-background p-3 font-mono text-[10px] leading-4 whitespace-pre-wrap">
                                                                {job.exception}
                                                            </pre>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminFailedJobs.layout = {
    breadcrumbs: [
        { title: 'Super Admin', href: adminIndex() },
        { title: 'Failed Jobs', href: adminFailedJobsIndex() },
    ],
};
