"use client";

import React from "react";
import dynamic from "next/dynamic";

import { MapProvider } from "@/features/maps/providers/MapProvider";

const LeafletMap = dynamic(() => import("./LeafletMap").then((mod) => mod.LeafletMap), {
  ssr: false,
});

export function IndiaMapPlaceholder() {
  return (
    <MapProvider>
      <div className="h-96 w-full rounded-lg border border-zinc-200 bg-neutral-100">
        <LeafletMap />
      </div>
    </MapProvider>
  );
}
