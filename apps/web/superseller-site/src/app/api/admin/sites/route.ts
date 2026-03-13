/**
 * Admin API — Tenant Site Config Management
 *
 * GET  /api/admin/sites          — List all site configs (with full data)
 * GET  /api/admin/sites?slug=x   — Get single site config
 * POST /api/admin/sites          — Create site config for a tenant
 * PATCH /api/admin/sites         — Update site config, services, areas, badges, etc.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) {
    return { session: { isValid: true, role: "admin" } };
  }
  const session = await verifySession();
  if (!session.isValid || session.role !== "admin") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

// Full site config include for consistent responses
const fullSiteInclude = {
  brand: true,
  siteConfig: {
    include: {
      trustBadges: { orderBy: { order: "asc" as const } },
      stats: { orderBy: { order: "asc" as const } },
      reviewPlatforms: { orderBy: { order: "asc" as const } },
    },
  },
  services: { orderBy: { order: "asc" as const } },
  serviceAreas: { orderBy: { order: "asc" as const } },
};

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const slug = req.nextUrl.searchParams.get("slug");

  if (slug) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: fullSiteInclude,
    });
    if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ site: tenant });
  }

  // List all tenants that have a site config
  const tenants = await prisma.tenant.findMany({
    where: { siteConfig: { isNot: null } },
    include: fullSiteInclude,
  });

  return NextResponse.json({ sites: tenants, total: tenants.length });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { tenantId, slug, ...config } = body;

  // Resolve tenant
  const tenant = tenantId
    ? await prisma.tenant.findUnique({ where: { id: tenantId } })
    : slug
      ? await prisma.tenant.findUnique({ where: { slug } })
      : null;

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // Check if site config already exists
  const existing = await prisma.tenantSiteConfig.findUnique({
    where: { tenantId: tenant.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Site config already exists for this tenant" }, { status: 409 });
  }

  const siteConfig = await prisma.tenantSiteConfig.create({
    data: {
      tenantId: tenant.id,
      phone: config.phone,
      email: config.email,
      addressStreet: config.addressStreet,
      addressCity: config.addressCity,
      addressState: config.addressState,
      addressZip: config.addressZip,
      website: config.website,
      foundedYear: config.foundedYear,
      license: config.license,
      schemaType: config.schemaType ?? "GeneralContractor",
      accentHoverColor: config.accentHoverColor,
      heroHeadline: config.heroHeadline,
      heroSubheadline: config.heroSubheadline,
      aboutText: config.aboutText,
      uniqueValue: config.uniqueValue,
      metaTitle: config.metaTitle,
      metaDescription: config.metaDescription,
      facebookUrl: config.facebookUrl,
      instagramUrl: config.instagramUrl,
      yelpUrl: config.yelpUrl,
      tiktokUrl: config.tiktokUrl,
      youtubeUrl: config.youtubeUrl,
      googleReviewUrl: config.googleReviewUrl,
    },
    include: {
      trustBadges: true,
      stats: true,
      reviewPlatforms: true,
    },
  });

  return NextResponse.json({ siteConfig }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { tenantId, slug, services, serviceAreas, trustBadges, stats, reviewPlatforms, ...siteFields } = body;

  const tenant = tenantId
    ? await prisma.tenant.findUnique({ where: { id: tenantId } })
    : slug
      ? await prisma.tenant.findUnique({ where: { slug } })
      : null;

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const sc = await prisma.tenantSiteConfig.findUnique({ where: { tenantId: tenant.id } });
  if (!sc) {
    return NextResponse.json({ error: "No site config for this tenant" }, { status: 404 });
  }

  // Update site config fields
  if (Object.keys(siteFields).length > 0) {
    await prisma.tenantSiteConfig.update({
      where: { tenantId: tenant.id },
      data: siteFields,
    });
  }

  // Upsert services (replace all)
  if (services) {
    await prisma.tenantService.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenantService.createMany({
      data: services.map((svc: Record<string, unknown>, i: number) => ({
        tenantId: tenant.id,
        slug: svc.slug as string,
        name: svc.name as string,
        shortDescription: svc.shortDescription as string,
        longDescription: svc.longDescription as string | undefined,
        icon: (svc.icon as string) ?? "🔨",
        features: svc.features ?? null,
        priceRange: svc.priceRange as string | undefined,
        imageUrl: svc.imageUrl as string | undefined,
        order: i,
      })),
    });
  }

  // Upsert service areas (replace all)
  if (serviceAreas) {
    await prisma.tenantServiceArea.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenantServiceArea.createMany({
      data: serviceAreas.map((area: string | { name: string; state?: string }, i: number) => ({
        tenantId: tenant.id,
        name: typeof area === "string" ? area : area.name,
        state: typeof area === "string" ? undefined : area.state,
        order: i,
      })),
    });
  }

  // Upsert trust badges (replace all)
  if (trustBadges) {
    await prisma.tenantTrustBadge.deleteMany({ where: { siteConfigId: sc.id } });
    await prisma.tenantTrustBadge.createMany({
      data: trustBadges.map((tb: Record<string, unknown>, i: number) => ({
        siteConfigId: sc.id,
        label: tb.label as string,
        detail: tb.detail as string | undefined,
        icon: (tb.icon as string) ?? "✅",
        order: i,
      })),
    });
  }

  // Upsert stats (replace all)
  if (stats) {
    await prisma.tenantStat.deleteMany({ where: { siteConfigId: sc.id } });
    await prisma.tenantStat.createMany({
      data: stats.map((s: Record<string, unknown>, i: number) => ({
        siteConfigId: sc.id,
        value: s.value as string,
        label: s.label as string,
        order: i,
      })),
    });
  }

  // Upsert review platforms (replace all)
  if (reviewPlatforms) {
    await prisma.tenantReviewPlatform.deleteMany({ where: { siteConfigId: sc.id } });
    await prisma.tenantReviewPlatform.createMany({
      data: reviewPlatforms.map((rp: Record<string, unknown>, i: number) => ({
        siteConfigId: sc.id,
        name: rp.name as string,
        rating: rp.rating as number,
        count: rp.count as number,
        url: rp.url as string | undefined,
        order: i,
      })),
    });
  }

  // Return updated full config
  const updated = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    include: fullSiteInclude,
  });

  return NextResponse.json({ site: updated });
}
