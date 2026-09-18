import { Form, Head, Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index as devicesIndex, store as devicesStore } from '@/routes/devices';
import type { TenantSummary } from '@/types/auth';

type Props = {
    tenant: TenantSummary;
    deviceCount: number;
    deviceLimit: number;
};

export default function DevicesCreate({ deviceCount, deviceLimit }: Props) {
    return (
        <>
            <Head title="Add device" />

            <div className="space-y-4">
                <Heading title="Add device" />

                <Card className="max-w-3xl">
                    <CardHeader className="flex-row items-center justify-between border-b border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <CardTitle>Device details</CardTitle>
                        <span className="rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:bg-zinc-950">
                            {deviceCount} of {deviceLimit} device slots are in
                            use.
                        </span>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {deviceCount >= deviceLimit && (
                            <div className="mb-4 mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Device limit reached</p>
                                    <p className="text-sm">You have reached the maximum number of devices ({deviceLimit}) allowed for this workspace. Please contact support to increase your limit.</p>
                                </div>
                            </div>
                        )}
                        <Form
                            {...devicesStore.form()}
                            resetOnSuccess={['display_name', 'description']}
                            disableWhileProcessing
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="display_name">
                                            Display name
                                        </Label>
                                        <Input
                                            id="display_name"
                                            name="display_name"
                                            placeholder="Sales"
                                            autoFocus
                                            required
                                        />
                                        <InputError
                                            message={errors.display_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            placeholder="Optional notes about this device"
                                            rows={4}
                                            className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={processing || deviceCount >= deviceLimit}
                                        >
                                            {processing ? 'Creating...' : 'Create device'}
                                        </Button>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="secondary"
                                        >
                                            <Link href={devicesIndex()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DevicesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Devices', href: devicesIndex() },
        { title: 'Add device', href: '#' },
    ],
};
