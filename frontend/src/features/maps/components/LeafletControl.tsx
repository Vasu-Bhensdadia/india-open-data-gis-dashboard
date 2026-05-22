"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface LeafletControlProps {
  position?: "topleft" | "topright" | "bottomleft" | "bottomright";
  className?: string;
  children: React.ReactNode;
}

export function LeafletControl({
  position = "topright",
  className,
  children,
}: LeafletControlProps) {
  const map = useMap();
  const [container] = useState(() => document.createElement("div"));
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!map || controlRef.current) {
      return;
    }

    const control = new L.Control({ position });
    control.onAdd = () => {
      const containerElement = container;
      containerElement.className = ["leaflet-control", className].filter(Boolean).join(" ");
      containerElement.style.pointerEvents = "auto";
      return containerElement;
    };

    control.addTo(map);
    controlRef.current = control;

    return () => {
      control.remove();
      controlRef.current = null;
    };
  }, [map, position, className, container]);

  return createPortal(children, container);
}
