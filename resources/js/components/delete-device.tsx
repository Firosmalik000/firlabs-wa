import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { destroy as destroyDevice } from '@/routes/devices';
import type { WhatsappDeviceSummary } from '@/types/device';

type Props = {
    device: WhatsappDeviceSummary;
};

export default function DeleteDevice({ device }: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">Delete device</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Delete {device.display_name}?</DialogTitle>
                <DialogDescription>
                    This will archive the device record and remove it from the
                    active workspace list.
                </DialogDescription>

                <Form
                    {...destroyDevice.form(device)}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    className="space-y-6"
                >
                    {({ processing, resetAndClearErrors }) => (
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => resetAndClearErrors()}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                variant="destructive"
                                disabled={processing}
                                asChild
                            >
                                <button type="submit">Delete device</button>
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
