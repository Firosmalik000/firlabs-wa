import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';

type Props = {
    message: string;
};

export default function AdminIndex({ message }: Props) {
    return (
        <>
            <Head title="Admin" />

            <div className="space-y-6">
                <Heading
                    title="Super Admin"
                    description="Placeholder entry point for global administration."
                />

                <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                        {message}
                    </CardContent>
                </Card>

                <Button asChild variant="secondary">
                    <Link href={dashboard()}>Back to dashboard</Link>
                </Button>
            </div>
        </>
    );
}
