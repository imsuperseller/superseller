/**
 * Initialize Elite Pro Remodeling tenant, brand, team, and compete allowlist.
 * Run: cd apps/web/superseller-site && npx tsx scripts/init-elite-pro.ts
 */
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const prisma = new PrismaClient();

// Direct pg pool for worker-only tables (content_actors etc.)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const R2 = "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev";

async function main() {
  console.log("=== Initializing Elite Pro Remodeling ===\n");

  // 1. Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "elite-pro-remodeling" },
    update: {
      name: "Elite Pro Remodeling",
      status: "active",
      settings: {
        phone: "(800) 476-7608",
        language: "he",        // Internal: Hebrew
        contentLanguage: "en", // Public content: English
        contract: { monthlyRate: 2000, plan: "30/30/30", cancellation: "7-day" },
        whatsappGroups: {
          clientGroup: "INSTEGRAM ELITE PRO / SHAI", // Saar's group, Mar 13
        },
      },
    },
    create: {
      name: "Elite Pro Remodeling",
      slug: "elite-pro-remodeling",
      status: "active",
      settings: {
        phone: "(800) 476-7608",
        language: "he",
        contentLanguage: "en",
        contract: { monthlyRate: 2000, plan: "30/30/30", cancellation: "7-day" },
        whatsappGroups: {
          clientGroup: "INSTEGRAM ELITE PRO / SHAI",
        },
      },
    },
  });
  console.log(`  Tenant created: ${tenant.id} (${tenant.slug})`);

  // 2. Create Brand
  const brand = await prisma.brand.upsert({
    where: { slug: "elite-pro-remodeling" },
    update: {
      tenantId: tenant.id,
      name: "Elite Pro Remodeling",
      primaryColor: "#1a1a2e",
      accentColor: "#e94560",
      ctaColor: "#f97316",
      tagline: "Dallas Premium Home Remodeling",
      fontFamily: "Inter",
      logoUrl: `${R2}/elite-pro-demo/logo.png`,
    },
    create: {
      tenantId: tenant.id,
      name: "Elite Pro Remodeling",
      slug: "elite-pro-remodeling",
      primaryColor: "#1a1a2e",
      accentColor: "#e94560",
      ctaColor: "#f97316",
      tagline: "Dallas Premium Home Remodeling",
      fontFamily: "Inter",
      logoUrl: `${R2}/elite-pro-demo/logo.png`,
      userId: "superseller-admin",
    },
  });
  console.log(`  Brand created: ${brand.id}`);

  // 3. Compete allowlist — Saar's team emails (add more as they provide)
  const allowlistEmails = [
    "shaifriedman@gmail.com",
    "shai@superseller.agency",
  ];
  for (const email of allowlistEmails) {
    await prisma.competeAllowlist.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      create: { tenantId: tenant.id, email },
      update: {},
    });
  }
  console.log(`  Compete allowlist: ${allowlistEmails.length} emails`);

  // 4. Fix content_actors — update Mor's phone, add Shmuel, remove duplicate Noam
  const client = await pool.connect();
  try {
    // Update Mor Dayan meta with phone
    await client.query(
      `UPDATE content_actors SET meta = jsonb_set(COALESCE(meta, '{}'::jsonb), '{phone}', $1::jsonb) WHERE tenant_id = 'elite-pro-remodeling' AND name = 'Mor Dayan'`,
      [JSON.stringify("+1 (954) 348-8337")]
    );
    console.log("  Updated Mor Dayan phone in meta");

    // Delete duplicate "Noam" (keep "Noam Yanko" which has full name + business meta)
    const dupeResult = await client.query(
      `DELETE FROM content_actors WHERE tenant_id = 'elite-pro-remodeling' AND name = 'Noam' AND id != (SELECT id FROM content_actors WHERE tenant_id = 'elite-pro-remodeling' AND name = 'Noam Yanko' LIMIT 1) RETURNING id`
    );
    if (dupeResult.rowCount && dupeResult.rowCount > 0) {
      console.log(`  Removed duplicate Noam entry (${dupeResult.rows[0].id})`);
    }

    // Add Shmuel (new team member from Mar 13 WhatsApp group)
    const shmuelCheck = await client.query(
      `SELECT id FROM content_actors WHERE tenant_id = 'elite-pro-remodeling' AND name ILIKE '%shmuel%'`
    );
    if (shmuelCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO content_actors (id, tenant_id, name, role, meta, created_at, updated_at) VALUES (gen_random_uuid(), 'elite-pro-remodeling', 'Shmuel', 'crew', '{"addedVia": "whatsapp-group", "addedDate": "2026-03-13"}'::jsonb, NOW(), NOW())`
      );
      console.log("  Added Shmuel to content_actors");
    } else {
      console.log("  Shmuel already exists");
    }

    // Update all content_actors meta to include whatsapp group info
    await client.query(
      `UPDATE content_actors SET meta = jsonb_set(COALESCE(meta, '{}'::jsonb), '{whatsappGroup}', $1::jsonb) WHERE tenant_id = 'elite-pro-remodeling'`,
      [JSON.stringify("INSTEGRAM ELITE PRO / SHAI")]
    );
    console.log("  Tagged all actors with WhatsApp group");

  } finally {
    client.release();
  }

  // 5. Verify final state
  const actorsResult = await pool.query(
    `SELECT name, role, meta FROM content_actors WHERE tenant_id = 'elite-pro-remodeling' ORDER BY created_at`
  );
  console.log(`\n  Content actors (${actorsResult.rows.length}):`);
  for (const row of actorsResult.rows) {
    console.log(`    - ${row.name} (${row.role}) ${JSON.stringify(row.meta)}`);
  }

  const adsCount = await pool.query(
    `SELECT COUNT(*) as c FROM competitor_ads WHERE tenant_id = 'elite-pro-remodeling'`
  );
  const rulesCount = await pool.query(
    `SELECT COUNT(*) as c FROM ig_content_rules WHERE tenant_id = 'elite-pro-remodeling'`
  );
  const hashtagCount = await pool.query(
    `SELECT COUNT(*) as c FROM hashtag_sets WHERE tenant_id = 'elite-pro-remodeling'`
  );
  const captionCount = await pool.query(
    `SELECT COUNT(*) as c FROM caption_templates WHERE tenant_id = 'elite-pro-remodeling'`
  );

  console.log(`\n  Data summary:`);
  console.log(`    Competitor ads: ${adsCount.rows[0].c}`);
  console.log(`    IG content rules: ${rulesCount.rows[0].c}`);
  console.log(`    Hashtag sets: ${hashtagCount.rows[0].c}`);
  console.log(`    Caption templates: ${captionCount.rows[0].c}`);

  console.log("\n=== Elite Pro Remodeling initialized ===");
}

main()
  .catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
