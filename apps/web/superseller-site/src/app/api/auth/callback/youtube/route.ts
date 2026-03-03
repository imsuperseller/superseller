/**
 * GET /api/auth/callback/youtube
 * Google/YouTube OAuth 2.0 callback handler.
 * Exchanges auth code for tokens, fetches channel info, stores as PlatformAccount.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getYouTubeChannelInfo } from "@/lib/services/social/youtube-publisher";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency";

    if (error) {
      console.error("[youtube-callback] OAuth error:", error);
      return NextResponse.redirect(`${baseUrl}/?error=youtube_${error}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/?error=youtube_missing_params`);
    }

    // Validate state
    const stateCookie = req.cookies.get("youtube_oauth_state")?.value;
    if (!stateCookie) {
      return NextResponse.redirect(`${baseUrl}/?error=youtube_state_expired`);
    }

    let stateData: { state: string; userId: string; email: string };
    try {
      stateData = JSON.parse(stateCookie);
    } catch {
      return NextResponse.redirect(`${baseUrl}/?error=youtube_invalid_state`);
    }

    if (stateData.state !== state) {
      return NextResponse.redirect(`${baseUrl}/?error=youtube_state_mismatch`);
    }

    const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${baseUrl}/?error=youtube_not_configured`);
    }

    const redirectUri = `${baseUrl}/api/auth/callback/youtube`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[youtube-callback] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${baseUrl}/?error=youtube_token_failed`);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3600;

    // Fetch channel info
    const channel = await getYouTubeChannelInfo(accessToken);
    if (channel.error || !channel.channelId) {
      console.error("[youtube-callback] Channel fetch failed:", channel.error);
      return NextResponse.redirect(`${baseUrl}/?error=youtube_channel_failed`);
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
          platform: "youtube",
          accountId: channel.channelId,
        },
      },
      update: {
        accessToken,
        refreshToken: refreshToken || undefined,
        tokenExpiry: new Date(Date.now() + expiresIn * 1000),
        accountName: channel.channelTitle || undefined,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: stateData.userId,
        platform: "youtube",
        accountId: channel.channelId,
        accountName: channel.channelTitle || "YouTube",
        accessToken,
        refreshToken,
        tokenExpiry: new Date(Date.now() + expiresIn * 1000),
        scope: "youtube.upload,youtube.force-ssl,youtube.readonly",
      },
    });

    const redirectPath = portalSlug ? `/portal/${portalSlug}` : "/";
    const response = NextResponse.redirect(
      `${baseUrl}${redirectPath}?youtube=connected`
    );
    response.cookies.delete("youtube_oauth_state");

    return response;
  } catch (err) {
    console.error("[youtube-callback] Error:", err);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://superseller.agency";
    return NextResponse.redirect(`${baseUrl}/?error=youtube_internal`);
  }
}
