import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "The Camera Post-Mortem API",
    version: "1.0.0",
    description:
      "Toronto's traffic-camera post-mortem: 520 speed-camera sites (July 2020 to November 2025; revenue is a modelled $75-$125/ticket range) and 321 red-light intersections (2007 to mid-2026; revenue is exact at $325/ticket), ranked by tickets and implied fine revenue. Sources: City of Toronto Open Data Portal (ASE Charges, ASE Locations, Red Light Camera Annual Charges, Red Light Cameras). MIT licensed.",
  },
  servers: [{ url: "https://cameras.canada.nshipyard.com/api/v1" }],
  paths: {
    "/summary": {
      get: {
        summary: "Citywide aggregates, top 25 sites and intersections, anchors, methodology notes",
        responses: { "200": { description: "Full aggregate summary" } },
      },
    },
    "/ase/sites": {
      get: {
        summary: "Search speed-camera sites by street name, ranked by tickets",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "Parkside" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 50, maximum: 200 } },
        ],
        responses: { "200": { description: "Total plus matching site records with modelled revenue range" } },
      },
    },
    "/ase/site": {
      get: {
        summary: "One speed-camera site: full record plus the monthly charge series",
        parameters: [{ name: "code", in: "query", required: true, schema: { type: "string" }, example: "A207" }],
        responses: { "200": { description: "Site record" }, "404": { description: "No site with that code" } },
      },
    },
    "/redlight/intersections": {
      get: {
        summary: "Search red-light intersections by name, ranked by tickets",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "Kennedy" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 50, maximum: 200 } },
        ],
        responses: { "200": { description: "Total plus matching intersection records with exact implied revenue" } },
      },
    },
    "/redlight/intersection": {
      get: {
        summary: "One red-light intersection: full record plus the annual charge series",
        parameters: [{ name: "code", in: "query", required: true, schema: { type: "integer" }, example: 2578 }],
        responses: { "200": { description: "Intersection record" }, "404": { description: "No intersection with that code" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
