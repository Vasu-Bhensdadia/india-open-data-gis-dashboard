import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

/**
 * Landing page header with branding and CTA.
 * Different from dashboard header - no sidebar toggle, includes CTA button.
 */
export function LandingHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link className="flex items-center gap-3 text-sm font-semibold text-zinc-950" href="/">
          <span className="flex size-9 items-center justify-center rounded-md bg-emerald-700 text-xs font-bold text-white">
            IN
          </span>
          <span>{siteConfig.shortName}</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/#features"
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
            >
              Features
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/#about"
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
            >
              About
            </a>
          </nav>

          <Button asChild variant="default" className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard">Launch Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
