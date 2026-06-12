import type { ReactNode } from "react";
import { Suspense } from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

type DashboardLayoutWrapperProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Layout wrapper for all dashboard pages.
 * Provides consistent header, sidebar, and main content area.
 *
 * The <Suspense> boundary is required by Next.js App Router so that
 * client components in the subtree can safely call useSearchParams()
 * without opting the entire route out of static rendering.
 */
export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  return (
    <DashboardLayout>
      <Suspense>{children}</Suspense>
    </DashboardLayout>
  );
}
