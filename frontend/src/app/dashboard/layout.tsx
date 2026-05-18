import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

type DashboardLayoutWrapperProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Layout wrapper for all dashboard pages.
 * Provides consistent header, sidebar, and main content area.
 */
export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
