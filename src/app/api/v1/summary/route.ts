import { NextResponse } from "next/server";
import { getSummary } from "@/lib/cameras";

export async function GET() {
  return NextResponse.json(getSummary());
}
