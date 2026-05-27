import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/layout/sidebar";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Dashboard layout wrapper combining header, sidebar, and content area.
 * Use this for all dashboard pages to maintain consistent layout.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header showMenuButton={true} />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            <div className="h-full w-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
