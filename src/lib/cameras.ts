import fs from "node:fs";
import path from "node:path";
import type { AseSite, Intersection } from "./format";

export type { AseSite, Intersection };

const DATA = path.join(process.cwd(), "public", "data");

export interface Summary {
  vintage: Record<string, string | boolean>;
  ase: {
    site_codes: number;
    sites_geocoded: number;
    months: string;
    total_charges: number;
    revenue_low: number;
    revenue_high: number;
    top_sites: { code: string; location: string; total_charges: number; revenue_low: number; revenue_high: number }[];
  };
  redlight: {
    intersections: number;
    intersections_geocoded: number;
    years: string;
    total_charges: number;
    revenue_exact: number;
    top_intersections: { code: number; name: string; total_charges: number; revenue_exact: number }[];
  };
}

function read<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), "utf-8")) as T;
}

export function getSummary(): Summary {
  return read<Summary>("summary.json");
}

export function getAseSites(): AseSite[] {
  return read<AseSite[]>("ase_sites.json");
}

export function getIntersections(): Intersection[] {
  return read<Intersection[]>("redlight.json");
}

export function getAseMonthly(code: string): Record<string, number> {
  const all = read<Record<string, Record<string, number>>>("ase_monthly.json");
  return all[code] ?? {};
}

export function getRlcYearly(code: number): Record<string, number> {
  const all = read<Record<string, Record<string, number>>>("redlight_yearly.json");
  return all[String(code)] ?? {};
}

export function searchAse(q: string, limit: number): { total: number; results: AseSite[] } {
  const needle = q.trim().toLowerCase();
  const all = getAseSites();
  const hits = needle
    ? all.filter((s) => `${s.location} ${s.code}`.toLowerCase().includes(needle))
    : all;
  const ranked = [...hits].sort((a, b) => b.total_charges - a.total_charges);
  return { total: ranked.length, results: ranked.slice(0, limit) };
}

export function searchIntersections(q: string, limit: number): { total: number; results: Intersection[] } {
  const needle = q.trim().toLowerCase();
  const all = getIntersections();
  const hits = needle
    ? all.filter((x) => `${x.name} ${x.code}`.toLowerCase().includes(needle))
    : all;
  const ranked = [...hits].sort((a, b) => b.total_charges - a.total_charges);
  return { total: ranked.length, results: ranked.slice(0, limit) };
}
