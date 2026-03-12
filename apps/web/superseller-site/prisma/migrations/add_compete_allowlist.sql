-- Manual migration: CompeteAllowlist whitelist table
-- Run: psql $DATABASE_URL -f prisma/migrations/add_compete_allowlist.sql

CREATE TABLE IF NOT EXISTS "CompeteAllowlist" (
  "id" TEXT NOT NULL,
  "tenantId" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompeteAllowlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CompeteAllowlist_tenantId_email_key"
  ON "CompeteAllowlist"("tenantId", "email");

CREATE INDEX IF NOT EXISTS "CompeteAllowlist_tenantId_idx"
  ON "CompeteAllowlist"("tenantId");

ALTER TABLE "CompeteAllowlist"
  ADD CONSTRAINT "CompeteAllowlist_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
