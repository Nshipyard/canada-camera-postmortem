// Client-safe: types and formatters. No node imports.

export interface AseSite {
  code: string;
  location: string;
  ward: string | null;
  enforcement_start: string | null;
  enforcement_end: string | null;
  rotations: number;
  total_charges: number;
  months_with_data: number;
  revenue_low: number;
  revenue_high: number;
  lat: number | null;
  lng: number | null;
  site_status: string | null;
}

export interface Intersection {
  code: number;
  name: string;
  ward: string | null;
  enforcement_start: string | null;
  enforcement_end: string | null;
  total_charges: number;
  revenue_exact: number;
  lat: number | null;
  lng: number | null;
}

export function fmt(n: number): string {
  return n.toLocaleString("en-CA");
}

export function fmtMoney(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function fmtRange(low: number, high: number): string {
  return `${fmtMoney(low)}-${fmtMoney(high)}`;
}
