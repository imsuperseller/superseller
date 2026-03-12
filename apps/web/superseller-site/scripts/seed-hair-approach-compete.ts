/**
 * Seed script: Wire up Hair Approach into the Compete module
 *
 * 1. Creates Tenant record with slug 'hair-approach'
 * 2. Updates competitor_ads from 'prospect-report-hair-approach-dallas' → 'hair-approach'
 * 3. Adds allowlist entries for Shai + Deanna (when email available)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "hair-approach" },
    update: { name: "Hair Approach Dallas", status: "active" },
    create: {
      slug: "hair-approach",
      name: "Hair Approach Dallas",
      status: "active",
    },
  });
  console.log(`Tenant created/updated: ${tenant.id} (${tenant.slug})`);

  // 2. Update competitor_ads tenant_id to clean slug
  const updated = await prisma.$executeRawUnsafe(
    `UPDATE competitor_ads SET tenant_id = 'hair-approach' WHERE tenant_id = 'prospect-report-hair-approach-dallas'`
  );
  console.log(`Updated ${updated} competitor_ads records → tenant_id='hair-approach'`);

  // 3. Also update the prospect_reports slug reference if needed
  await prisma.$executeRawUnsafe(
    `UPDATE prospect_reports SET slug = 'hair-approach-dallas' WHERE slug = 'hair-approach-dallas'`
  );

  // 4. Add allowlist entries
  const emails = [
    "shaifriedman@gmail.com",
    "shai@superseller.agency",
  ];

  for (const email of emails) {
    await prisma.competeAllowlist.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      create: { tenantId: tenant.id, email },
      update: {},
    });
    console.log(`Allowlisted: ${email}`);
  }

  console.log(`\nDone! Access at: https://superseller.agency/compete/hair-approach`);
  console.log(`90 competitor content pieces ready for review.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
