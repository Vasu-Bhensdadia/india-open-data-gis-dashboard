import type { ReactNode } from "react";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Base app shell wrapper for consistent page structure.
 * Provides the minimal app container for all pages.
 * For dashboard-specific layout, use components/layout/dashboard-layout.tsx
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-neutral-50 text-zinc-950">
      {children}
    </div>
  );
}
