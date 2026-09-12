import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                    <CardHeader className="flex-row items-center justify-between border-b border-zinc-200 bg-zinc-50/70 p-4">
                        <CardTitle>Device details</CardTitle>
                        <span className="rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:bg-zinc-950">
                            {deviceCount} of {deviceLimit} device slots are in
                            use.
                        </span>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
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
                                            disabled={processing}
                                        >
                                            Create device
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
