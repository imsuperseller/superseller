/**
 * GET/POST /api/social/accounts
 * Manage connected social media platform accounts.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPageToken } from "@/lib/services/social/facebook-publisher";

/**
 * GET — List platform accounts for a user
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { error: "userId query param required" },
      { status: 400 }
    );
  }

  const accounts = await prisma.platformAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      platform: true,
      accountName: true,
      accountId: true,
      isActive: true,
      tokenExpiry: true,
      scope: true,
      metadata: true,
      createdAt: true,
      // Exclude tokens from list response
    },
  });

  return NextResponse.json({ accounts });
}

/**
 * POST — Connect a new platform account
 * For Facebook/Instagram: requires a Page Access Token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      platform,
      accessToken,
      accountId,
      accountName,
      refreshToken,
      tokenExpiry,
      scope,
    } = body;

    if (!userId || !platform || !accessToken) {
      return NextResponse.json(
        { error: "userId, platform, and accessToken are required" },
        { status: 400 }
      );
    }

    // Verify the token works for Facebook
    if (platform === "facebook" && accountId) {
      const verify = await verifyPageToken(accountId, accessToken);
      if (!verify.valid) {
        return NextResponse.json(
          { error: `Token verification failed: ${verify.error}` },
          { status: 400 }
        );
      }
    }

    // Upsert — update token if account already connected
    const account = await prisma.platformAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId,
          platform,
          accountId: accountId || "default",
        },
      },
      update: {
        accessToken,
        refreshToken: refreshToken || undefined,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
        accountName: accountName || undefined,
        scope: scope || undefined,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        platform,
        accountId: accountId || "default",
        accountName,
        accessToken,
        refreshToken,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
        scope,
      },
    });

    return NextResponse.json({
      account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        accountId: account.accountId,
        isActive: account.isActive,
      },
    });
  } catch (err) {
    console.error("[social/accounts] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to connect account" },
      { status: 500 }
    );
  }
}
