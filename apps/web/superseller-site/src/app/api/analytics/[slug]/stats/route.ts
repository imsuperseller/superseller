import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    // Verify the landing page exists and get owner info
    const lp = await prisma.landingPage.findUnique({
      where: { slug },
      select: { id: true, views: true, submissions: true, userId: true, createdAt: true },
    });

    if (!lp) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Get date range from query params (default: last 30 days)
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30", 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Parallel queries for stats
    const [
      totalPageViews,
      totalConversions,
      recentPageViews,
      recentConversions,
      deviceBreakdown,
      dailyViews,
      dailyConversions,
      conversionsByType,
      topReferrers,
    ] = await Promise.all([
      // All-time page views
      prisma.pageView.count({ where: { slug } }),
      // All-time conversions
      prisma.conversionEvent.count({ where: { slug } }),
      // Recent page views
      prisma.pageView.count({ where: { slug, createdAt: { gte: since } } }),
      // Recent conversions
      prisma.conversionEvent.count({ where: { slug, createdAt: { gte: since } } }),
      // Device breakdown
      prisma.pageView.groupBy({
        by: ["device"],
        where: { slug, createdAt: { gte: since } },
        _count: true,
      }),
      // Daily views (raw query for date grouping)
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM page_views
        WHERE slug = ${slug} AND created_at >= ${since}
        GROUP BY DATE(created_at)
        ORDER BY date
      ` as Promise<Array<{ date: string; count: number }>>,
      // Daily conversions
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM conversion_events
        WHERE slug = ${slug} AND created_at >= ${since}
        GROUP BY DATE(created_at)
        ORDER BY date
      ` as Promise<Array<{ date: string; count: number }>>,
      // Conversions by type
      prisma.conversionEvent.groupBy({
        by: ["eventType"],
        where: { slug, createdAt: { gte: since } },
        _count: true,
      }),
      // Top referrers
      prisma.pageView.groupBy({
        by: ["referrer"],
        where: { slug, createdAt: { gte: since }, referrer: { not: null } },
        _count: true,
        orderBy: { _count: { referrer: "desc" } },
        take: 10,
      }),
    ]);

    const conversionRate =
      recentPageViews > 0
        ? ((recentConversions / recentPageViews) * 100).toFixed(1)
        : "0.0";

    return NextResponse.json({
      slug,
      period: { days, since: since.toISOString() },
      summary: {
        totalPageViews,
        totalConversions,
        recentPageViews,
        recentConversions,
        conversionRate: parseFloat(conversionRate),
        legacyViews: lp.views, // from LandingPage counter
        legacySubmissions: lp.submissions,
      },
      devices: deviceBreakdown.map((d) => ({
        device: d.device || "unknown",
        count: d._count,
      })),
      dailyViews,
      dailyConversions,
      conversionsByType: conversionsByType.map((c) => ({
        type: c.eventType,
        count: c._count,
      })),
      topReferrers: topReferrers
        .filter((r) => r.referrer)
        .map((r) => ({
          referrer: r.referrer,
          count: r._count,
        })),
      createdAt: lp.createdAt,
    });
  } catch (err) {
    console.error("[Analytics Stats]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
