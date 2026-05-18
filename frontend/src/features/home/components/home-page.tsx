import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { LandingHeader } from "@/components/layout/landing-header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const foundationItems = [
  { label: "Frontend", value: "Next.js App Router", accent: "bg-emerald-600" },
  { label: "Styling", value: "Tailwind CSS", accent: "bg-amber-500" },
  { label: "Quality", value: "TypeScript + ESLint", accent: "bg-sky-600" },
];

const workspaceItems = ["Open data catalog", "Analytics workspace", "Documentation hub"];

export function HomePage() {
  return (
    <AppShell>
      <LandingHeader />
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_480px] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold text-emerald-700">Production scaffold</p>
          <h1 className="max-w-2xl text-4xl font-bold text-zinc-950">{siteConfig.name}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-700">
            A clean foundation for a full-stack geospatial analytics dashboard built around isolated
            frontend and backend workspaces.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {foundationItems.map((item) => (
              <div className="border-l-4 border-zinc-200 bg-white p-4 shadow-sm" key={item.label}>
                <span className={`mb-4 block h-1.5 w-10 rounded-sm ${item.accent}`} />
                <p className="text-sm font-semibold text-zinc-950">{item.label}</p>
                <p className="mt-1 text-sm text-zinc-600">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview />
      </section>

      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-8 sm:grid-cols-3">
          {workspaceItems.map((item) => (
            <div className="flex items-center gap-3" key={item}>
              <span className="size-2 rounded-sm bg-emerald-600" />
              <span className="text-sm font-medium text-zinc-700">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function DashboardPreview() {
  return (
    <aside
      aria-label="Dashboard preview"
      className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between"
    >
      <div>
        <p className="text-sm font-semibold text-zinc-950">Ready to explore</p>
        <p className="mt-1 text-sm text-zinc-600">
          Access the analytics dashboard with geospatial visualizations and data exploration tools.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Link href="/dashboard">Open Dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">View Documentation</Link>
        </Button>
      </div>

      <div
        className="mt-6 aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 bg-neutral-100"
        aria-hidden="true"
      >
        <div className="grid h-full grid-cols-[1fr_120px]">
          <div className="relative border-r border-zinc-200 bg-[repeating-linear-gradient(0deg,#f4f4f5_0,#f4f4f5_31px,#e4e4e7_32px),repeating-linear-gradient(90deg,transparent_0,transparent_31px,#e4e4e7_32px)]">
            <div className="absolute left-[18%] top-[18%] h-[58%] w-[48%] rounded-[48%] border border-emerald-700/40 bg-emerald-200/60" />
            <div className="absolute left-[44%] top-[28%] h-24 w-20 rounded-[42%] border border-amber-600/40 bg-amber-200/70" />
            <div className="absolute bottom-[22%] left-[24%] h-16 w-28 rounded-[42%] border border-sky-700/40 bg-sky-200/70" />
          </div>
          <div className="bg-white p-4">
            <div className="mb-4 h-3 w-16 rounded-sm bg-zinc-200" />
            <div className="space-y-3">
              <div className="h-2 rounded-sm bg-emerald-600" />
              <div className="h-2 rounded-sm bg-amber-500" />
              <div className="h-2 rounded-sm bg-sky-600" />
              <div className="h-2 rounded-sm bg-zinc-300" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
