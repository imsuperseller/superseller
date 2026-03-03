/**
 * GET /api/auth/connect/linkedin
 * Initiates LinkedIn OAuth 2.0 authorization flow.
 * Redirects user to LinkedIn's consent screen.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Must be logged in
  const session = await verifySession();
  if (!session.isValid || !session.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "LinkedIn OAuth not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/api/auth/callback/linkedin`;

  // CSRF protection — random state param
  const state = crypto.randomBytes(16).toString("hex");

  // Scopes for publishing + profile info
  const scopes = [
    "openid",
    "profile",
    "email",
    "w_member_social",
    "r_profile_basicinfo",
  ].join(" ");

  // Store state + userId in a short-lived cookie for validation on callback
  const statePayload = JSON.stringify({
    state,
    userId: session.clientId,
    email: session.email,
  });

  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", scopes);

  const response = NextResponse.redirect(authUrl.toString());

  // Set state cookie (5 min expiry)
  response.cookies.set("linkedin_oauth_state", statePayload, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return response;
}
