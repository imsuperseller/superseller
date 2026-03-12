import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS review_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_slug TEXT NOT NULL,
      business_name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      client_email TEXT,
      google_review_url TEXT,
      yelp_review_url TEXT,
      scheduled_for TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
      email_sent BOOLEAN NOT NULL DEFAULT false,
      error_log TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_review_requests_status_scheduled ON review_requests(status, scheduled_for)`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_review_requests_tenant ON review_requests(tenant_slug)`
  );
  console.log("review_requests table + indexes created");
}

main().catch(console.error).finally(() => prisma.$disconnect());
