import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Option = {
    label: string;
    value: string;
};

type Props = {
    search: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    resultCount: number;
    filter?: {
        label: string;
        value: string;
        onChange: (value: string) => void;
        options: Option[];
    };
    children?: ReactNode;
};

export function DataTableToolbar({
    search,
    onSearchChange,
    placeholder = 'Cari data...',
    resultCount,
    filter,
    children,
}: Props) {
    const hasFilters = search !== '' || (filter?.value ?? 'all') !== 'all';

    const reset = (): void => {
        onSearchChange('');
        filter?.onChange('all');
    };

    return (
        <div className="flex flex-col gap-2 border-b border-zinc-200 bg-zinc-50/80 px-3 py-2.5 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1 sm:max-w-sm">
                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={placeholder}
                    className="h-8 rounded-lg bg-background pl-8 text-xs shadow-none"
                />
            </label>

            {filter && (
                <label className="relative">
                    <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <select
                        aria-label={filter.label}
                        value={filter.value}
                        onChange={(event) =>
                            filter.onChange(event.target.value)
                        }
                        className="h-8 min-w-36 rounded-lg border border-input bg-background pr-7 pl-8 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {children}

            {hasFilters && (
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={reset}
                    className="h-8 px-2 text-xs"
                >
                    <X className="mr-1 size-3.5" />
                    Reset
                </Button>
            )}

            <span className="ml-auto shrink-0 text-[11px] font-medium text-muted-foreground">
                {resultCount} hasil
            </span>
        </div>
    );
}
