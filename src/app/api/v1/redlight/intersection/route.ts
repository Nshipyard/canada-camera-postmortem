import { NextResponse } from "next/server";
import { getIntersections, getRlcYearly } from "@/lib/cameras";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = parseInt(url.searchParams.get("code") ?? "", 10);
  const hit = getIntersections().find((x) => x.code === code);
  if (!hit) return NextResponse.json({ error: `No red-light intersection ${code}` }, { status: 404 });
  return NextResponse.json({ ...hit, yearly: getRlcYearly(hit.code) });
}
