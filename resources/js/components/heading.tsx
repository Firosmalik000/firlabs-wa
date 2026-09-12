export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-3 space-y-0.5'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-0.5 text-base font-medium'
                        : 'text-lg font-bold tracking-[-0.02em] sm:text-xl'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="max-w-2xl text-[11px] leading-4 text-muted-foreground">
                    {description}
                </p>
            )}
        </header>
    );
}
