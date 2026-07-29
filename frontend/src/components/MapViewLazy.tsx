"use client";

import dynamic from "next/dynamic";

export const MapViewLazy = dynamic(() => import("@/components/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <p className="panel-note">Loading map…</p>,
});
