import { Link, usePage } from '@inertiajs/react';
import {
    Ban,
    Bot,
    Building2,
    Inbox,
    LayoutGrid,
    ScrollText,
    ShieldCheck,
    Smartphone,
    Users,
    Webhook,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as adminIndex } from '@/routes/admin';
import { index as adminAuditLogsIndex } from '@/routes/admin/audit-logs';
import { index as adminDevicesIndex } from '@/routes/admin/devices';
import { index as adminFailedJobsIndex } from '@/routes/admin/failed-jobs';
import { index as adminTenantsIndex } from '@/routes/admin/tenants';
import { index as adminUsersIndex } from '@/routes/admin/users';
import { index as adminWebhookLogsIndex } from '@/routes/admin/webhook-logs';
import { index as botRulesIndex } from '@/routes/bot-rules';
import { index as devicesIndex } from '@/routes/devices';
import { index as inboxIndex } from '@/routes/inbox';
import type { NavItem } from '@/types';
import type { SharedData } from '@/types/auth';

export function AppSidebar() {
    const { currentTenant, can } = usePage<SharedData>().props;
    const homeHref = currentTenant
        ? dashboard()
        : can.accessAdmin
          ? adminIndex()
          : dashboard();

    const workspaceNavItems: NavItem[] = [];

    if (currentTenant) {
        workspaceNavItems.push({
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        });
    }

    if (currentTenant) {
        workspaceNavItems.push({
            title: 'Inbox',
            href: inboxIndex(),
            icon: Inbox,
        });

        workspaceNavItems.push({
            title: 'Devices',
            href: devicesIndex(),
            icon: Smartphone,
        });

        workspaceNavItems.push({
            title: 'Bot Rules',
            href: botRulesIndex(),
            icon: Bot,
        });
    }

    const adminNavItems: NavItem[] = [];

    if (can.accessAdmin) {
        adminNavItems.push({
            title: 'Admin',
            href: adminIndex(),
            icon: LayoutGrid,
        });

        adminNavItems.push({
            title: 'Users',
            href: adminUsersIndex(),
            icon: Users,
        });

        adminNavItems.push({
            title: 'Tenants',
            href: adminTenantsIndex(),
            icon: Building2,
        });

        adminNavItems.push({
            title: 'Devices',
            href: adminDevicesIndex(),
            icon: Smartphone,
        });

        adminNavItems.push({
            title: 'Webhook Logs',
            href: adminWebhookLogsIndex(),
            icon: Webhook,
        });

        adminNavItems.push({
            title: 'Audit Logs',
            href: adminAuditLogsIndex(),
            icon: ScrollText,
        });

        adminNavItems.push({
            title: 'Failed Jobs',
            href: adminFailedJobsIndex(),
            icon: Ban,
        });
    }

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-0 [&_[data-sidebar=sidebar]]:bg-[#25272d] [&_[data-sidebar=sidebar]]:text-zinc-100"
        >
            <SidebarHeader className="gap-3 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {currentTenant && (
                    <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-3 group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                                <Building2 className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400 uppercase">
                                    Workspace
                                </p>
                                <p className="truncate text-sm font-semibold text-white">
                                    {currentTenant.name}
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
                            <span className="size-1.5 rounded-full bg-sky-400" />
                            Active and protected
                        </p>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="px-1">
                {workspaceNavItems.length > 0 && (
                    <NavMain label="Workspace" items={workspaceNavItems} />
                )}

                {adminNavItems.length > 0 && (
                    <NavMain label="Super Admin" items={adminNavItems} />
                )}
            </SidebarContent>

            <SidebarFooter className="gap-3 p-3">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-3 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
                        <ShieldCheck className="size-4 text-sky-400" />
                        Laravel protected
                    </div>
                    <p className="mt-1.5 text-[11px] leading-5 text-zinc-400">
                        GOWA credentials stay behind the application gateway.
                    </p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
