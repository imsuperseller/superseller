import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";

function hashIP(ip: string): string {
  return createHash("sha256").update(ip + (process.env.IP_SALT || "superseller")).digest("hex").slice(0, 16);
}

function detectDevice(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    return /ipad|tablet/i.test(ua) ? "tablet" : "mobile";
  }
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, type, referrer, utmSource, utmMedium, utmCampaign, metadata } = body;

    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const ipHash = hashIP(ip);
    const device = detectDevice(ua);

    if (type === "conversion") {
      // Track conversion event
      const eventType = body.eventType || "cta_click";
      await prisma.conversionEvent.create({
        data: {
          slug,
          eventType,
          metadata: metadata || null,
          ipHash,
          userAgent: ua.slice(0, 500),
        },
      });
      return NextResponse.json({ ok: true, event: "conversion" });
    }

    // Default: page view
    await prisma.pageView.create({
      data: {
        slug,
        referrer: referrer?.slice(0, 2000) || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        userAgent: ua.slice(0, 500),
        ipHash,
        device,
      },
    });

    return NextResponse.json({ ok: true, event: "pageview" });
  } catch (err) {
    console.error("[Analytics Track]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
