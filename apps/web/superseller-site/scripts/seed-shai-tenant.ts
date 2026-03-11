/**
 * Seed Shai Friedman as internal "customer" (no billing).
 * Run: cd apps/web/superseller-site && npx tsx scripts/seed-shai-tenant.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TENANT_SLUG = "shai-personal-brand";
const SHAI_EMAIL = "shai@superseller.agency";

async function main() {
  console.log("Seeding Shai as internal tenant...\n");

  let user = await prisma.user.findFirst({ where: { email: SHAI_EMAIL } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: SHAI_EMAIL,
        name: "Shai Friedman",
        status: "active",
        emailVerified: true,
        businessName: "Shai Personal Brand",
        businessType: "personal_brand",
        source: "internal",
      },
    });
    console.log("Created User:", user.email);
  } else console.log("Found User:", user.email);

  let tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Shai Personal Brand",
        slug: TENANT_SLUG,
        status: "active",
        plan: { tier: "internal", credits: 999, billing: "none" },
        settings: {
          features: { tourReel: true, fbBot: true, winnerStudio: true, frontDesk: true, socialHub: true, agentForge: true, leadPages: true },
          plan: { credits: 999 },
          branding: {},
        },
      },
    });
    console.log("Created Tenant:", tenant.slug);
  } else {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        plan: { tier: "internal", credits: 999, billing: "none" },
        settings: {
          features: { tourReel: true, fbBot: true, winnerStudio: true, frontDesk: true, socialHub: true, agentForge: true, leadPages: true },
          plan: { credits: 999 },
        },
      },
    });
    console.log("Updated Tenant:", tenant.slug);
  }

  let brand = await prisma.brand.findFirst({ where: { tenantId: tenant.id } });
  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        tenantId: tenant.id,
        name: "Shai Friedman Personal Brand",
        slug: TENANT_SLUG,
        primaryColor: "#1e3a8a",
        accentColor: "#2563eb",
        tone: "Persian-Jewish voice, Iran freedom, Israeli-American identity",
        tagline: "@shaifriedman — 10K+ IG, 17.8K+ FB",
        instructions: "Content: Iran viral persona, Persian-Jewish heritage, Israel advocacy.",
        nicheSettings: { niche: "personal_brand", platforms: ["instagram", "facebook"] },
        instagramId: "shai.friedman",
        facebookPageId: "https://www.facebook.com/realshaifriedman",
      },
    });
    console.log("Created Brand:", brand.name);
  }

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    create: { tenantId: tenant.id, userId: user.id, role: "owner" },
    update: { role: "owner" },
  });
  console.log("Linked TenantUser: owner");

  console.log("\nDone. Portal: https://superseller.agency/portal/" + TENANT_SLUG);
  console.log("Compete: https://superseller.agency/compete/" + TENANT_SLUG);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error("Seed failed:", e); prisma.$disconnect(); process.exit(1); });
