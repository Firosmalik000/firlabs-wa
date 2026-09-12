import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-zinc-200 bg-zinc-100/95 px-4 backdrop-blur-xl transition-[width,height] ease-linear">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <SidebarTrigger className="size-8 rounded-lg border bg-card shadow-sm" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="hidden items-center gap-2 rounded-full border bg-card/80 px-2.5 py-1 text-[11px] text-muted-foreground sm:flex">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129_/_0.12)]" />
                Workspace online
            </div>
        </header>
    );
}
