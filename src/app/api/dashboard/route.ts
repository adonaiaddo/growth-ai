import { NextResponse } from "next/server";
import { getMetaToken } from "@/lib/session";
import { MetaAPI } from "@/lib/meta/api";

export async function GET() {
  const token = await getMetaToken();
  if (!token) {
    return NextResponse.json(
      { error: "Not connected to Meta" },
      { status: 401 }
    );
  }

  try {
    const api = new MetaAPI(token);
    const accounts = await api.getAdAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad accounts" },
      { status: 500 }
    );
  }
}
