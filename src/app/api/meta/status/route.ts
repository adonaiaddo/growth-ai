import { NextResponse } from "next/server";
import { getMetaToken } from "@/lib/session";

export async function GET() {
  const token = await getMetaToken();
  return NextResponse.json({ connected: !!token });
}
