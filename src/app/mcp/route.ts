import { NextResponse } from "next/server";
import { getSummary, searchAse, searchIntersections, getAseMonthly, getRlcYearly, getAseSites, getIntersections } from "@/lib/cameras";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "canada-camera-postmortem", version: "1.0.0" };

const TOOLS = [
  {
    name: "camera_site_lookup",
    description:
      "Full record for one Toronto speed-camera site: location, ward, enforcement period, total charges, modelled revenue range ($75-$125/ticket), coordinates, and the monthly charge series.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Site code, e.g. A207 from the search tool" },
      },
      required: ["code"],
    },
  },
  {
    name: "camera_site_search",
    description:
      "Search 520 Toronto speed-camera sites (July 2020 to November 2025) by street name, ranked by tickets issued. Revenue is a modelled range, never exact.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Street name fragment" },
        limit: { type: "integer", description: "Max results, default 50, max 200" },
      },
    },
  },
  {
    name: "intersection_lookup",
    description:
      "Full record for one Toronto red-light intersection: name, ward, enforcement period, total charges, exact implied revenue ($325/ticket), coordinates, and the annual charge series (2007 to mid-2026).",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "integer", description: "Intersection code, e.g. 2578 from the search tool" },
      },
      required: ["code"],
    },
  },
  {
    name: "intersection_search",
    description:
      "Search 321 Toronto red-light intersections (2007 to mid-2026) by name, ranked by tickets issued. Revenue is exact at $325/ticket.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Intersection name fragment" },
        limit: { type: "integer", description: "Max results, default 50, max 200" },
      },
    },
  },
  {
    name: "postmortem_summary",
    description:
      "Citywide aggregates: 2,150,715 speed-camera charges ($161.3M-$268.8M modelled range), 1,304,807 red-light charges ($424.1M exact), top 25 lists, calibration anchors, and methodology notes.",
    inputSchema: { type: "object", properties: {} },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: any) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        if (name === "camera_site_lookup") {
          const code = String(args.code ?? "").toUpperCase();
          const hit = getAseSites().find((s) => s.code.toUpperCase() === code);
          if (!hit) return err(id, -32001, `No speed-camera site ${args.code}`);
          return ok(id, textResult({ ...hit, monthly: getAseMonthly(hit.code) }));
        }
        if (name === "camera_site_search") {
          const q = String(args.q ?? "");
          const limit = Math.min(Math.max(parseInt(String(args.limit ?? "50"), 10) || 50, 1), 200);
          return ok(id, textResult({ q, limit, ...searchAse(q, limit) }));
        }
        if (name === "intersection_lookup") {
          const code = parseInt(String(args.code ?? ""), 10);
          const hit = getIntersections().find((x) => x.code === code);
          if (!hit) return err(id, -32001, `No red-light intersection ${args.code}`);
          return ok(id, textResult({ ...hit, yearly: getRlcYearly(hit.code) }));
        }
        if (name === "intersection_search") {
          const q = String(args.q ?? "");
          const limit = Math.min(Math.max(parseInt(String(args.limit ?? "50"), 10) || 50, 1), 200);
          return ok(id, textResult({ q, limit, ...searchIntersections(q, limit) }));
        }
        if (name === "postmortem_summary") {
          return ok(id, textResult(getSummary()));
        }
        return err(id, -32602, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool error: ${(e as Error).message}`);
      }
    }
    default:
      return err(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = body.map(handle).filter((r) => r !== null);
    return NextResponse.json(out);
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP server accepts JSON-RPC 2.0 via POST only." },
    { status: 405 }
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405 });
}
