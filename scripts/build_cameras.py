#!/usr/bin/env python3
"""Build the Canada Camera Post-Mortem datasets from Toronto Open Data sources.

Sources (snapshots committed in data/raw/):
  ase.xlsx      - "Automated Speed Enforcement (ASE) Charges" (open.toronto.ca)
                  Monthly ticket counts per site code, July 2020 onward.
  ase_loc.geojson - "Automated Speed Enforcement Locations"
                  Current camera site points. Location_Code is literally the
                  string "None" on every feature, so the join to charges is done
                  by normalized location name (see normalize()).
  rlc.xlsx      - "Red Light Camera Annual Charges"
                  Annual ticket counts per intersection code, 2007 onward.
  rlc_loc.csv   - "Red Light Cameras" locations. Joins to charges on
                  charge_code + 3500 = location RLC code.

Outputs (public/data/): ase_sites.json, redlight.json, summary.json,
ase_sites.csv, redlight.csv
"""
from __future__ import annotations

import csv
import json
import re
from datetime import datetime
from pathlib import Path
from collections import defaultdict

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

# Modelled ASE revenue per ticket. The open file does not publish speed
# distributions, so per-site revenue is a range, never a single number.
# Bounds: ASE cameras sit in community safety zones, where HTA s.128 fines
# double: $5/km/h for 1-19 km/h over becomes $10/km/h. A typical ticket
# (7-13 km/h over) carries roughly $70-$130 before surcharges; the published
# Parkside Dr figure ($6.8M / 63,000 tickets = ~$108/ticket, Dec 2024
# reporting) falls inside this range, which validates it.
ASE_LOW, ASE_HIGH = 75, 125
# Red-light fine: flat $325 per ticket ($260 set fine + $60 victim surcharge
# + $5 court costs), uniform across Ontario.
RLC_FINE = 325


def normalize(s: str) -> str:
    if not s:
        return ""
    s = s.lower()
    s = re.sub(r"[.,;:]", " ", s)
    for a, b in [("ave", "avenue"), ("av", "avenue"), ("st", "street"),
                 ("dr", "drive"), ("rd", "road"), ("blvd", "boulevard"),
                 ("ct", "court"), ("pl", "place"), ("cres", "crescent"),
                 ("trl", "trail"), ("pkwy", "parkway"), ("ln", "lane"),
                 ("terr", "terrace")]:
        s = re.sub(r"\b%s\b" % a, b, s)
    return re.sub(r"\s+", " ", s).strip()


def d(x):
    return x.date().isoformat() if isinstance(x, datetime) else None


# ---------------- ASE ----------------
wb = openpyxl.load_workbook(RAW / "ase.xlsx", read_only=True, data_only=True)
ws = wb["Charges by Site and Month"]
rows = list(ws.iter_rows(values_only=True))
hdr = rows[0]
month_cols = [(i, c.date().isoformat()[:7]) for i, c in enumerate(hdr) if isinstance(c, datetime)]

geo = json.loads((RAW / "ase_loc.geojson").read_text())
loc_by_name = {}
for f in geo["features"]:
    p = f["properties"]
    n = normalize(p.get("location"))
    coords = f["geometry"]["coordinates"][0]
    loc_by_name[n] = {"lat": coords[1], "lng": coords[0],
                      "status": p.get("Status"), "raw": p.get("location")}

# One row per site code per rotation; aggregate rows sharing a site code
# (same spot, camera rotated back later). Location text differs only by
# stray double spaces, so keep the longest label.
agg = defaultdict(lambda: {"locations": [], "wards": [], "starts": [], "ends": [],
                            "monthly": defaultdict(int)})
for r in rows[1:]:
    code = r[0]
    if code is None:
        continue
    a = agg[code]
    a["locations"].append(r[1] or "")
    a["wards"].append(r[2])
    a["starts"].append(r[3])
    a["ends"].append(r[4])
    for i, m in month_cols:
        v = r[i]
        if isinstance(v, (int, float)):
            a["monthly"][m] += int(v)

ase_sites = []
for code, a in sorted(agg.items()):
    location = max(a["locations"], key=len)
    ward = next((w for w in a["wards"] if w not in (None, "")), None)
    starts = [x for x in a["starts"] if isinstance(x, datetime)]
    ends = [x for x in a["ends"] if isinstance(x, datetime)]
    monthly = dict(sorted(a["monthly"].items()))
    total = sum(monthly.values())
    g = loc_by_name.get(normalize(location))
    ase_sites.append({
        "code": code, "location": location, "ward": ward,
        "enforcement_start": min(starts).date().isoformat() if starts else None,
        "enforcement_end": max(ends).date().isoformat() if ends else None,
        "rotations": len(a["locations"]),
        "total_charges": total,
        "months_with_data": len(monthly),
        "revenue_low": total * ASE_LOW, "revenue_high": total * ASE_HIGH,
        "lat": g["lat"] if g else None, "lng": g["lng"] if g else None,
        "site_status": g["status"] if g else None,
        "monthly": monthly,
    })

ase_geocoded = sum(1 for s in ase_sites if s["lat"] is not None)
ase_total = sum(s["total_charges"] for s in ase_sites)
first_month = month_cols[0][1]
last_month = month_cols[-1][1]

# ---------------- Red light ----------------
wb2 = openpyxl.load_workbook(RAW / "rlc.xlsx", read_only=True, data_only=True)
ws2 = wb2["RLC Charges By Location (FINAL)"]
r2 = list(ws2.iter_rows(values_only=True))
h2 = r2[0]
yr_cols = [(i, c) for i, c in enumerate(h2) if isinstance(c, int)]

rlc_locs = {}
with open(RAW / "rlc_loc.csv") as f:
    for l in csv.DictReader(f):
        try:
            code = int(l["RLC"])
        except (ValueError, TypeError):
            continue
        g2 = json.loads(l["geometry"])["coordinates"][0]
        rlc_locs[code] = {"lat": g2[1], "lng": g2[0], "name": l["NAME"],
                          "activation": l.get("ACTIVATION_DATE")}

rlc = []
for r in r2[1:]:
    try:
        code = int(r[0])
    except (ValueError, TypeError):
        continue
    yearly = {}
    for i, y in yr_cols:
        v = r[i]
        if isinstance(v, (int, float)):
            yearly[y] = int(v)
    total = sum(yearly.values())
    g = rlc_locs.get(code + 3500)
    rlc.append({
        "code": code, "name": r[2], "ward": r[1],
        "enforcement_start": d(r[3]), "enforcement_end": d(r[4]),
        "total_charges": total,
        "revenue_exact": total * RLC_FINE,
        "lat": g["lat"] if g else None, "lng": g["lng"] if g else None,
        "yearly": yearly,
    })

rlc_geocoded = sum(1 for x in rlc if x["lat"] is not None)
rlc_total = sum(x["total_charges"] for x in rlc)

# ---------------- Outputs ----------------
def write_json(name, obj):
    (OUT / name).write_text(json.dumps(obj, indent=1))

sites_out = [{k: v for k, v in s.items() if k != "monthly"} for s in ase_sites]
write_json("ase_sites.json", sites_out)
write_json("ase_monthly.json", {s["code"]: s["monthly"] for s in ase_sites})
rlc_out = [{k: v for k, v in x.items() if k != "yearly"} for x in rlc]
write_json("redlight.json", rlc_out)
write_json("redlight_yearly.json", {str(x["code"]): x["yearly"] for x in rlc})

with open(OUT / "ase_sites.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["site_code", "location", "ward", "enforcement_start", "enforcement_end",
                "rotations", "total_charges", "revenue_low_cad", "revenue_high_cad",
                "lat", "lng", "site_status"])
    for s in ase_sites:
        w.writerow([s["code"], s["location"], s["ward"], s["enforcement_start"],
                    s["enforcement_end"], s["rotations"], s["total_charges"],
                    s["revenue_low"], s["revenue_high"], s["lat"], s["lng"], s["site_status"]])
with open(OUT / "redlight.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["intersection_code", "intersection", "ward", "enforcement_start",
                "enforcement_end", "total_charges", "implied_revenue_cad", "lat", "lng"])
    for x in rlc:
        w.writerow([x["code"], x["name"], x["ward"], x["enforcement_start"],
                    x["enforcement_end"], x["total_charges"], x["revenue_exact"],
                    x["lat"], x["lng"]])

top_ase = sorted(ase_sites, key=lambda s: -s["total_charges"])[:25]
top_rlc = sorted(rlc, key=lambda x: -x["total_charges"])[:25]
parkside = next(s for s in ase_sites if s["code"] == "A207")
kennedy = next(x for x in rlc if x["code"] == 2578)

summary = {
    "project": "canada-camera-postmortem",
    "vintage": {"built": "2026-10-09", "ase_last_month": last_month,
                "rlc_last_year": yr_cols[-1][1], "rlc_2026_partial": True},
    "ase": {
        "site_codes": len(ase_sites), "site_rows_raw": len(rows) - 1,
        "sites_geocoded": ase_geocoded,
        "months": f"{first_month} to {last_month}", "month_count": len(month_cols),
        "total_charges": ase_total,
        "revenue_low": ase_total * ASE_LOW, "revenue_high": ase_total * ASE_HIGH,
        "revenue_model": f"modelled range: charges x [{ASE_LOW},{ASE_HIGH}] CAD per ticket",
        "anchor_parkside": {"code": "A207", "total_charges": parkside["total_charges"],
                            "published": "63,000 charges, $6.8M fines (Dec 2024 reporting)",
                            "published_avg_per_ticket": round(6800000 / 63000, 2)},
        "top_sites": [{"code": s["code"], "location": s["location"],
                       "total_charges": s["total_charges"],
                       "revenue_low": s["revenue_low"], "revenue_high": s["revenue_high"]}
                      for s in top_ase],
    },
    "redlight": {
        "intersections": len(rlc), "intersections_geocoded": rlc_geocoded,
        "years": f"{yr_cols[0][1]} to {yr_cols[-1][1]}",
        "total_charges": rlc_total,
        "revenue_exact": rlc_total * RLC_FINE,
        "revenue_model": f"exact: charges x {RLC_FINE} CAD per ticket",
        "anchor_kennedy": {"code": 2578, "name": kennedy["name"],
                           "charges_2025": kennedy["yearly"].get(2025),
                           "implied_2025": (kennedy["yearly"].get(2025) or 0) * RLC_FINE},
        "top_intersections": [{"code": x["code"], "name": x["name"],
                               "total_charges": x["total_charges"],
                               "revenue_exact": x["revenue_exact"]} for x in top_rlc],
    },
    "sources": [
        {"name": "Automated Speed Enforcement (ASE) Charges",
         "url": "https://open.toronto.ca/dataset/automated-speed-enforcement-ase-charges/"},
        {"name": "Automated Speed Enforcement Locations",
         "url": "https://open.toronto.ca/dataset/automated-speed-enforcement-locations/"},
        {"name": "Red Light Camera Annual Charges",
         "url": "https://open.toronto.ca/dataset/red-light-camera-annual-charges/"},
        {"name": "Red Light Cameras",
         "url": "https://open.toronto.ca/dataset/red-light-cameras/"},
    ],
}
write_json("summary.json", summary)

print(f"ASE: {len(ase_sites)} sites, {ase_geocoded} geocoded, {ase_total:,} charges, "
      f"${ase_total*ASE_LOW/1e6:.1f}M-${ase_total*ASE_HIGH/1e6:.1f}M modelled")
print(f"RLC: {len(rlc)} intersections, {rlc_geocoded} geocoded, {rlc_total:,} charges, "
      f"${rlc_total*RLC_FINE/1e6:.1f}M exact")
print(f"Parkside A207: {parkside['total_charges']:,} charges, "
      f"${parkside['total_charges']*ASE_LOW/1e6:.2f}M-${parkside['total_charges']*ASE_HIGH/1e6:.2f}M modelled")
print(f"Kennedy 2578 2025: {kennedy['yearly'].get(2025)} -> ${(kennedy['yearly'].get(2025) or 0)*RLC_FINE:,}")
