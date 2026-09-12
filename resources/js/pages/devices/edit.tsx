import { Form, Head, Link } from '@inertiajs/react';
import DeleteDevice from '@/components/delete-device';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    index as devicesIndex,
    show as devicesShow,
    update as devicesUpdate,
} from '@/routes/devices';
import type { TenantSummary } from '@/types/auth';
import type { WhatsappDeviceSummary } from '@/types/device';

type Props = {
    device: WhatsappDeviceSummary;
    tenant: TenantSummary;
};

export default function DevicesEdit({ device }: Props) {
    return (
        <>
            <Head title={`Edit ${device.display_name}`} />

            <div className="space-y-4">
                <Heading title={`Edit ${device.display_name}`} />

                <Card className="max-w-3xl">
                    <CardHeader className="border-b border-zinc-200 bg-zinc-50/70 p-4">
                        <CardTitle>Device details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <Form
                            {...devicesUpdate.form(device)}
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
                                            defaultValue={device.display_name}
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
                                            defaultValue={
                                                device.description ?? ''
                                            }
                                            rows={4}
                                            className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={processing}
                                        >
                                            Save changes
                                        </Button>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="secondary"
                                        >
                                            <Link href={devicesShow(device)}>
                                                Back to details
                                            </Link>
                                        </Button>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link href={devicesIndex()}>
                                                Back to devices
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <DeleteDevice device={device} />
            </div>
        </>
    );
}
