import { prisma } from "@/lib/prisma";
import type { ContractorSiteConfig } from "../types";

// ---------------------------------------------------------------------------
// Site config — DB-backed with Prisma. Single source of truth.
// ---------------------------------------------------------------------------

/**
 * Fetch a contractor site config from the database.
 * Joins Tenant + Brand + TenantSiteConfig + services + areas + badges + stats + reviews.
 */
export async function getSiteConfig(
  slug: string
): Promise<ContractorSiteConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      brand: true,
      siteConfig: {
        include: {
          trustBadges: { orderBy: { order: "asc" } },
          stats: { orderBy: { order: "asc" } },
          reviewPlatforms: { orderBy: { order: "asc" } },
        },
      },
      services: { orderBy: { order: "asc" } },
      serviceAreas: { orderBy: { order: "asc" } },
    },
  });

  if (!tenant?.brand || !tenant?.siteConfig) return null;

  const brand = tenant.brand;
  const sc = tenant.siteConfig;

  return {
    slug: tenant.slug,
    businessName: tenant.name,
    tagline: brand.tagline ?? "",
    phone: sc.phone,
    email: sc.email ?? undefined,
    address: {
      street: sc.addressStreet,
      city: sc.addressCity,
      state: sc.addressState,
      zip: sc.addressZip,
    },
    website: sc.website ?? undefined,
    foundedYear: sc.foundedYear ?? 2020,
    license: sc.license ?? undefined,

    colors: {
      primary: brand.primaryColor,
      accent: brand.accentColor,
      accentHover: sc.accentHoverColor ?? brand.accentColor,
      background: sc.backgroundColor ?? "#FFFFFF",
      backgroundAlt: sc.backgroundAlt ?? "#F7F8FA",
      warmBg: sc.warmBg ?? "#FDF8F3",
      textDark: sc.textDark ?? "#1E293B",
      textMid: sc.textMid ?? "#475569",
      textLight: sc.textLight ?? "#64748B",
      border: sc.borderColor ?? "#E2E8F0",
    },
    logoUrl: brand.logoUrl ?? undefined,
    heroImageUrl: sc.heroImageUrl ?? undefined,

    heroHeadline: sc.heroHeadline ?? "",
    heroSubheadline: sc.heroSubheadline ?? "",
    aboutText: sc.aboutText ?? "",
    uniqueValue: sc.uniqueValue ?? "",

    services: tenant.services.map((svc) => ({
      slug: svc.slug,
      name: svc.name,
      shortDescription: svc.shortDescription,
      longDescription: svc.longDescription ?? undefined,
      icon: svc.icon,
      features: (svc.features as string[] | null) ?? undefined,
      priceRange: svc.priceRange ?? undefined,
      imageUrl: svc.imageUrl ?? undefined,
    })),

    serviceAreas: tenant.serviceAreas.map((sa) => sa.name),

    trustBadges: sc.trustBadges.map((tb) => ({
      label: tb.label,
      detail: tb.detail ?? undefined,
      icon: tb.icon,
    })),

    stats: sc.stats.map((s) => ({
      value: s.value,
      label: s.label,
    })),

    reviewPlatforms: sc.reviewPlatforms.map((rp) => ({
      name: rp.name,
      rating: rp.rating,
      count: rp.count,
      url: rp.url ?? undefined,
    })),

    social: {
      facebook: sc.facebookUrl ?? undefined,
      instagram: sc.instagramUrl ?? undefined,
      yelp: sc.yelpUrl ?? undefined,
      tiktok: sc.tiktokUrl ?? undefined,
      youtube: sc.youtubeUrl ?? undefined,
    },
    googleReviewUrl: sc.googleReviewUrl ?? undefined,

    metaTitle: sc.metaTitle ?? undefined,
    metaDescription: sc.metaDescription ?? undefined,
    schemaType: sc.schemaType as ContractorSiteConfig["schemaType"],
  };
}

/**
 * Get all tenant slugs that have a site config (for static generation / sitemap).
 */
export async function getAllSiteSlugs(): Promise<string[]> {
  const configs = await prisma.tenantSiteConfig.findMany({
    select: { tenant: { select: { slug: true } } },
  });
  return configs.map((c) => c.tenant.slug);
}
