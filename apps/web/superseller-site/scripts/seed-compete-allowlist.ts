/**
 * Seed Compete allowlist for a tenant.
 * Run: npx tsx scripts/seed-compete-allowlist.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TENANT_SLUG = "shai-personal-brand";
const ALLOWED_EMAILS = ["shaifriedman@gmail.com", "shai@superseller.agency"];

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) {
    console.error(`Tenant ${TENANT_SLUG} not found.`);
    process.exit(1);
  }
  for (const email of ALLOWED_EMAILS) {
    const normalized = email.toLowerCase().trim();
    await prisma.competeAllowlist.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: normalized } },
      create: { tenantId: tenant.id, email: normalized },
      update: {},
    });
    console.log(`  Allowlisted: ${normalized}`);
  }
  console.log(`\nDone. ${ALLOWED_EMAILS.length} emails for ${TENANT_SLUG}.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
