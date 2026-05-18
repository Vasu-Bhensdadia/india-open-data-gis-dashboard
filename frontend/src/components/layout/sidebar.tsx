"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  BarChart3,
  Filter,
  Settings,
  HelpCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const mainNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Maps",
    href: "/dashboard/maps",
    icon: Map,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

const secondaryNavItems = [
  {
    label: "Filters",
    href: "/dashboard/filters",
    icon: Filter,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

/**
 * Sidebar navigation component for dashboard.
 * Displays main navigation, secondary items, and footer links.
 */
export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-3">
          <h2 className="text-sm font-semibold text-zinc-950">Navigation</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100",
                    isActive && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        <SidebarMenu>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100",
                    isActive && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            >
              <a href="#" aria-label="Help and documentation">
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
