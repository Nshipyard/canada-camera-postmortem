import { NextResponse } from "next/server";
import { getAseSites, getAseMonthly } from "@/lib/cameras";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "").trim().toUpperCase();
  const site = getAseSites().find((s) => s.code.toUpperCase() === code);
  if (!site) return NextResponse.json({ error: `No speed-camera site ${code}` }, { status: 404 });
  return NextResponse.json({ ...site, monthly: getAseMonthly(site.code) });
}
