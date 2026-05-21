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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

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

  return <div data-map-provider>{mounted ? children : null}</div>;
}
