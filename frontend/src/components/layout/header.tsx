"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

type HeaderProps = Readonly<{
  showMenuButton?: boolean;
}>;

/**
 * Header component for dashboard.
 * Displays branding, navigation, and sidebar toggle button.
 */
export function Header({ showMenuButton = true }: HeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
            <span className="flex size-8 items-center justify-center rounded-md bg-emerald-700 text-xs font-bold text-white">
              IN
            </span>
            <span className="hidden sm:inline">{siteConfig.shortName}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
          >
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">v0.1.0</span>
        </div>
      </div>
    </header>
  );
}
