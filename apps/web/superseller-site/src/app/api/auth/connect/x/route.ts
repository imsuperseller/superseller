/**
 * GET /api/auth/connect/x
 * Initiates X (Twitter) OAuth 2.0 with PKCE authorization flow.
 * X API v2 supports OAuth 2.0 User Context for tweet creation.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || !session.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const clientId = process.env.X_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "X OAuth not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/api/auth/callback/x`;

  // PKCE: generate code_verifier and code_challenge
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const state = crypto.randomBytes(16).toString("hex");

  // Scopes for posting tweets + reading profile
  const scopes = [
    "tweet.read",
    "tweet.write",
    "users.read",
    "offline.access",
  ].join(" ");

  const statePayload = JSON.stringify({
    state,
    userId: session.clientId,
    email: session.email,
    codeVerifier,
  });

  const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("x_oauth_state", statePayload, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return response;
}
