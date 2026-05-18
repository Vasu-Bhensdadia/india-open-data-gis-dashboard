import type { ReactNode } from "react";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

const navigationItems = ["Dashboard", "Datasets", "Analysis", "Docs"];

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-neutral-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link className="flex items-center gap-3 text-sm font-semibold text-zinc-950" href="/">
            <span className="flex size-9 items-center justify-center rounded-md bg-emerald-700 text-xs font-bold text-white">
              IN
            </span>
            <span>{siteConfig.shortName}</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navigationItems.map((item) => (
              <span className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600" key={item}>
                {item}
              </span>
            ))}
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
