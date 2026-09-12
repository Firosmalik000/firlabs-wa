import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    destroy as botRulesDestroy,
    index as botRulesIndex,
    update as botRulesUpdate,
} from '@/routes/bot-rules';
import type { TenantSummary } from '@/types/auth';
import type {
    BotRuleDeviceSummary,
    BotRuleSummary,
    BotRuleMatchType,
} from '@/types/bot-rule';

type Props = {
    tenant: TenantSummary;
    rule: BotRuleSummary;
    devices: BotRuleDeviceSummary[];
};

const matchTypes: Array<{ label: string; value: BotRuleMatchType }> = [
    { label: 'Contains', value: 'contains' },
    { label: 'Exact', value: 'exact' },
    { label: 'Starts with', value: 'starts_with' },
];

export default function BotRulesEdit({ rule, devices }: Props) {
    return (
        <>
            <Head title={`Edit ${rule.name}`} />

            <div className="space-y-4">
                <Heading title={`Edit ${rule.name}`} />

                <Card className="max-w-3xl">
                    <CardHeader className="border-b border-zinc-200 bg-zinc-50/70 p-4">
                        <CardTitle>Rule details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <Form
                            {...botRulesUpdate.form(rule)}
                            resetOnSuccess={[
                                'whatsapp_device_id',
                                'name',
                                'match_type',
                                'trigger_text',
                                'response_text',
                                'priority',
                                'is_active',
                            ]}
                            disableWhileProcessing
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="whatsapp_device_id">
                                            Device
                                        </Label>
                                        <select
                                            id="whatsapp_device_id"
                                            name="whatsapp_device_id"
                                            defaultValue={
                                                rule.whatsapp_device_id
                                            }
                                            required
                                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        >
                                            {devices.map((device) => (
                                                <option
                                                    key={device.id}
                                                    value={device.id}
                                                >
                                                    {device.display_name} (
                                                    {device.gowa_device_id})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.whatsapp_device_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={rule.name}
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="match_type">
                                            Match type
                                        </Label>
                                        <select
                                            id="match_type"
                                            name="match_type"
                                            defaultValue={rule.match_type}
                                            required
                                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        >
                                            {matchTypes.map((type) => (
                                                <option
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.match_type}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="trigger_text">
                                            Trigger text
                                        </Label>
                                        <Input
                                            id="trigger_text"
                                            name="trigger_text"
                                            defaultValue={rule.trigger_text}
                                            required
                                        />
                                        <InputError
                                            message={errors.trigger_text}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="response_text">
                                            Response text
                                        </Label>
                                        <textarea
                                            id="response_text"
                                            name="response_text"
                                            rows={4}
                                            defaultValue={rule.response_text}
                                            className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                                        />
                                        <InputError
                                            message={errors.response_text}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="priority">
                                            Priority
                                        </Label>
                                        <Input
                                            id="priority"
                                            name="priority"
                                            type="number"
                                            min={0}
                                            defaultValue={rule.priority}
                                            required
                                        />
                                        <InputError message={errors.priority} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="hidden"
                                            name="is_active"
                                            value="0"
                                        />
                                        <Checkbox
                                            id="is_active"
                                            name="is_active"
                                            value="1"
                                            defaultChecked={rule.is_active}
                                        />
                                        <Label htmlFor="is_active">
                                            Active rule
                                        </Label>
                                        <InputError
                                            message={errors.is_active}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
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
                                            <Link href={botRulesIndex()}>
                                                Back to rules
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="max-w-3xl border-red-200 dark:border-red-900/60">
                    <CardHeader className="p-4">
                        <CardTitle>Delete rule</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-1">
                        <Form
                            {...botRulesDestroy.form(rule)}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    Delete bot rule
                                </Button>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
