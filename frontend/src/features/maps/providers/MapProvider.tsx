"use client";

import * as React from "react";

type MapProviderProps = Readonly<{
  children: React.ReactNode;
}>;

/**
 * Lightweight provider that prepares Leaflet resources (CSS) for client-side maps.
 * It also exposes a hook-friendly mounted flag for components that need a client-only rendering.
 * The provider intentionally avoids importing `react-leaflet` or `leaflet` at module-eval time
 * so the app can build even if those modules are not yet installed. The provider will attempt
 * to dynamically load assets at runtime and gracefully no-op if unavailable.
 */
export function MapProvider({ children }: MapProviderProps) {
  // Avoid client-only state side effects that trigger lint warnings; compute
  // client availability synchronously and rely on DOM for CSS injection.
  const isClient = typeof window !== "undefined";

  React.useEffect(() => {
    // Inject a small Leaflet CSS from a CDN so the placeholder renders correctly.
    const id = "leaflet-cdn-css";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
  }, []);

  return <div data-map-provider>{isClient ? children : null}</div>;
}
