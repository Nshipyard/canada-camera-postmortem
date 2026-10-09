"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "@/i18n";
import { fmt, fmtMoney, fmtRange, type AseSite, type Intersection } from "@/lib/format";

interface Props {
  ase: AseSite[];
  rlc: Intersection[];
}

export default function CameraMap({ ase, rlc }: Props) {
  const { t } = useLang();
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [showAse, setShowAse] = useState(true);
  const [showRlc, setShowRlc] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = (await import("leaflet")).default;
      if (cancelled || !divRef.current || mapRef.current) return;
      const map = leaflet.map(divRef.current, { scrollWheelZoom: false }).setView([43.72, -79.38], 11);
      leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 18,
        })
        .addTo(map);
      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);
      draw(leaflet);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw(leaflet: typeof import("leaflet")) {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const maxAse = Math.max(...ase.map((s) => s.total_charges), 1);
    const maxRlc = Math.max(...rlc.map((x) => x.total_charges), 1);
    if (showAse) {
      for (const s of ase) {
        if (s.lat == null || s.lng == null) continue;
        const r = 4 + 14 * Math.sqrt(s.total_charges / maxAse);
        leaflet
          .circleMarker([s.lat, s.lng], {
            radius: r,
            color: "#d80621",
            weight: 1.5,
            fillColor: "#d80621",
            fillOpacity: 0.45,
          })
          .bindPopup(
            `<b>${s.location}</b><br/>${fmt(s.total_charges)} tickets<br/>${fmtRange(s.revenue_low, s.revenue_high)} (${t.explorer.range})`
          )
          .addTo(layer);
      }
    }
    if (showRlc) {
      for (const x of rlc) {
        if (x.lat == null || x.lng == null) continue;
        const r = 4 + 14 * Math.sqrt(x.total_charges / maxRlc);
        leaflet
          .circleMarker([x.lat, x.lng], {
            radius: r,
            color: "#0a0f1e",
            weight: 1.5,
            fillColor: "#0a0f1e",
            fillOpacity: 0.4,
          })
          .bindPopup(`<b>${x.name}</b><br/>${fmt(x.total_charges)} tickets<br/>${fmtMoney(x.revenue_exact)}`)
          .addTo(layer);
      }
    }
  }

  useEffect(() => {
    (async () => {
      const leaflet = (await import("leaflet")).default;
      draw(leaflet);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAse, showRlc, t]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <button
          onClick={() => setShowAse(!showAse)}
          aria-pressed={showAse}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[14px] font-medium ${showAse ? "border-canada bg-canada/10 text-ink" : "border-line text-ink/50"}`}
        >
          <span className="inline-block h-3 w-3 rounded-full bg-canada" />
          {t.explorer.legendAse} (185)
        </button>
        <button
          onClick={() => setShowRlc(!showRlc)}
          aria-pressed={showRlc}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[14px] font-medium ${showRlc ? "border-ink bg-ink/10 text-ink" : "border-line text-ink/50"}`}
        >
          <span className="inline-block h-3 w-3 rounded-full bg-ink" />
          {t.explorer.legendRlc} (301)
        </button>
      </div>
      <div ref={divRef} className="z-0 h-[440px] w-full overflow-hidden rounded-2xl border border-line md:h-[560px]" />
    </div>
  );
}
