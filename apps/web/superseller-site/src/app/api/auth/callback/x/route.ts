/**
 * GET /api/auth/callback/x
 * X (Twitter) OAuth 2.0 PKCE callback handler.
 * Exchanges auth code for access token, fetches user info, stores as PlatformAccount.
 *
 * The stored OAuth 2.0 token is used directly with Bearer auth in the publisher.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency";

    if (error) {
      console.error("[x-callback] OAuth error:", error);
      return NextResponse.redirect(`${baseUrl}/?error=x_${error}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/?error=x_missing_params`);
    }

    // Validate state
    const stateCookie = req.cookies.get("x_oauth_state")?.value;
    if (!stateCookie) {
      return NextResponse.redirect(`${baseUrl}/?error=x_state_expired`);
    }

    let stateData: { state: string; userId: string; email: string; codeVerifier: string };
    try {
      stateData = JSON.parse(stateCookie);
    } catch {
      return NextResponse.redirect(`${baseUrl}/?error=x_invalid_state`);
    }

    if (stateData.state !== state) {
      return NextResponse.redirect(`${baseUrl}/?error=x_state_mismatch`);
    }

    const clientId = process.env.X_CLIENT_ID;
    const clientSecret = process.env.X_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${baseUrl}/?error=x_not_configured`);
    }

    const redirectUri = `${baseUrl}/api/auth/callback/x`;

    // Exchange code for tokens — X requires Basic auth with client credentials
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: stateData.codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[x-callback] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${baseUrl}/?error=x_token_failed`);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 7200;

    // Fetch user info to get username and ID
    const userRes = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userRes.json();
    const xUserId = userData.data?.id;
    const xUsername = userData.data?.username;

    if (!xUserId) {
      console.error("[x-callback] User fetch failed:", userData);
      return NextResponse.redirect(`${baseUrl}/?error=x_user_failed`);
    }

    // Find user's tenant slug for redirect
    let portalSlug = "";
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId: stateData.userId },
      select: { tenantId: true },
    });
    if (tenantUser) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantUser.tenantId },
        select: { slug: true },
      });
      portalSlug = tenant?.slug || "";
    }

    // Store as PlatformAccount
    // metadata stores OAuth 2.0 flag so publisher knows to use Bearer auth
    await prisma.platformAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: stateData.userId,
          platform: "twitter",
          accountId: xUserId,
        },
      },
      update: {
        accessToken,
        refreshToken: refreshToken || undefined,
        tokenExpiry: new Date(Date.now() + expiresIn * 1000),
        accountName: `@${xUsername}`,
        isActive: true,
        metadata: { authType: "oauth2", username: xUsername },
        updatedAt: new Date(),
      },
      create: {
        userId: stateData.userId,
        platform: "twitter",
        accountId: xUserId,
        accountName: `@${xUsername}`,
        accessToken,
        refreshToken,
        tokenExpiry: new Date(Date.now() + expiresIn * 1000),
        scope: "tweet.read,tweet.write,users.read,offline.access",
        metadata: { authType: "oauth2", username: xUsername },
      },
    });

    const redirectPath = portalSlug ? `/portal/${portalSlug}` : "/";
    const response = NextResponse.redirect(
      `${baseUrl}${redirectPath}?x=connected`
    );
    response.cookies.delete("x_oauth_state");

    return response;
  } catch (err) {
    console.error("[x-callback] Error:", err);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency";
    return NextResponse.redirect(`${baseUrl}/?error=x_internal`);
  }
}
