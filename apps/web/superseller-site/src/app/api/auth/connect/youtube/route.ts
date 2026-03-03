/**
 * GET /api/auth/connect/youtube
 * Initiates Google/YouTube OAuth 2.0 authorization flow.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || !session.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "YouTube OAuth not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/api/auth/callback/youtube`;
  const state = crypto.randomBytes(16).toString("hex");

  const scopes = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube.readonly",
  ].join(" ");

  const statePayload = JSON.stringify({
    state,
    userId: session.clientId,
    email: session.email,
  });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("youtube_oauth_state", statePayload, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return response;
}
