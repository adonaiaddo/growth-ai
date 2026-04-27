import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, validateOAuthState } from "@/lib/meta/oauth";
import { setMetaToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const state = req.nextUrl.searchParams.get("state");

  if (error) {
    console.error(
      "OAuth denied:",
      error,
      req.nextUrl.searchParams.get("error_description")
    );
    return NextResponse.redirect(`${appUrl}?error=oauth_denied`);
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  // Validate CSRF state (server-side, no cookies involved)
  if (!state || !validateOAuthState(state)) {
    console.error("OAuth CSRF validation failed");
    return NextResponse.redirect(`${appUrl}?error=csrf_invalid`);
  }

  try {
    const token = await exchangeCodeForToken(code);
    setMetaToken(token);
    return NextResponse.redirect(`${appUrl}?connected=true`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}?error=oauth_failed`);
  }
}
