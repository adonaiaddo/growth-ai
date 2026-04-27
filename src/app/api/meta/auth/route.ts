import { NextResponse } from "next/server";
import { buildMetaOAuthUrl } from "@/lib/meta/oauth";

export async function GET() {
  const { url } = buildMetaOAuthUrl();
  return NextResponse.redirect(url);
}
