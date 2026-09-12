import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="app-surface overflow-x-hidden bg-white dark:bg-background"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col p-3 sm:p-4">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
