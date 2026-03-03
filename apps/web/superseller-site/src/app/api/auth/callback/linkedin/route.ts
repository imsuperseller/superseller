/**
 * GET /api/auth/callback/linkedin
 * LinkedIn OAuth 2.0 callback handler.
 * Exchanges auth code for access token, fetches profile URN,
 * and stores as PlatformAccount.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLinkedInProfileUrn } from "@/lib/services/social/linkedin-publisher";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const errorDescription = req.nextUrl.searchParams.get("error_description");

    // Handle LinkedIn error response
    if (error) {
      console.error("[linkedin-callback] OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_missing_params`
      );
    }

    // Validate state from cookie (CSRF protection)
    const stateCookie = req.cookies.get("linkedin_oauth_state")?.value;
    if (!stateCookie) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_state_expired`
      );
    }

    let stateData: { state: string; userId: string; email: string };
    try {
      stateData = JSON.parse(stateCookie);
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_invalid_state`
      );
    }

    if (stateData.state !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_state_mismatch`
      );
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_not_configured`
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/api/auth/callback/linkedin`;

    // Exchange auth code for access token
    const tokenRes = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[linkedin-callback] Token exchange failed:", tokenData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_token_failed`
      );
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 5184000; // Default 60 days
    const refreshToken = tokenData.refresh_token;
    const scope = tokenData.scope;

    // Fetch LinkedIn profile to get author URN
    const profile = await getLinkedInProfileUrn(accessToken);
    if (profile.error || !profile.urn) {
      console.error("[linkedin-callback] Profile fetch failed:", profile.error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_profile_failed`
      );
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
    await prisma.platformAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: stateData.userId,
          platform: "linkedin",
          accountId: profile.urn,
        },
      },
      update: {
        accessToken,
        refreshToken: refreshToken || undefined,
        tokenExpiry: new Date(Date.now() + expiresIn * 1000),
        accountName: profile.name || undefined,
        scope: scope || undefined,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: stateData.userId,
        platform: "linkedin",
        accountId: profile.urn,
        accountName: profile.name || "LinkedIn",
        accessToken,
        refreshToken,
        tokenExpiry: new Date(Date.now() + expiresIn * 1000),
        scope,
      },
    });

    // Clear state cookie and redirect to portal with success
    const redirectPath = portalSlug ? `/portal/${portalSlug}` : "/";
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}${redirectPath}?linkedin=connected`
    );
    response.cookies.delete("linkedin_oauth_state");

    return response;
  } catch (err) {
    console.error("[linkedin-callback] Error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency"}/portal?error=linkedin_internal`
    );
  }
}
