/**
 * Seed script: content_actors table
 * Populates all known Sora cameos, voice actors, and creative characters.
 *
 * Run: npx tsx src/scripts/seed-content-actors.ts
 */

import dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import pg from "pg";

const { Pool } = pg;

interface ContentActor {
  tenantId: string;
  name: string;
  role: string;
  soraCameoUrl?: string;
  voiceId?: string;
  appearanceNotes?: string;
  availableFor: string[];
  meta?: Record<string, unknown>;
}

const actors: ContentActor[] = [
  // ─── SuperSeller Business ───
  {
    tenantId: "superseller",
    name: "Shai Friedman",
    role: "owner",
    soraCameoUrl: "@shai-lfc",
    appearanceNotes:
      "Israeli-American founder, dark hair, professional casual. Brand ambassador for SuperSeller AI.",
    availableFor: ["reel", "story", "hero", "ad", "testimonial"],
    meta: { business: "superseller", personal: true },
  },
  {
    tenantId: "superseller",
    name: "SuperSeller Lead",
    role: "cameo",
    soraCameoUrl: "@superseller-lead",
    appearanceNotes: "Generic lead/prospect character for SuperSeller content",
    availableFor: ["reel", "ad"],
  },
  {
    tenantId: "superseller",
    name: "SuperSeller Woman",
    role: "cameo",
    soraCameoUrl: "@superseller-woman",
    appearanceNotes: "Professional woman character for SuperSeller content",
    availableFor: ["reel", "ad", "story"],
  },
  {
    tenantId: "superseller",
    name: "SuperSeller Realtor",
    role: "cameo",
    soraCameoUrl: "@superseller-realtor",
    appearanceNotes:
      "Realtor character for VideoForge real estate content",
    availableFor: ["reel", "ad", "property-tour"],
  },

  // ─── Elite Pro Remodeling ───
  {
    tenantId: "elite-pro-remodeling",
    name: "Noam Yanko",
    role: "crew",
    soraCameoUrl: "@flotz",
    appearanceNotes:
      "Elite Pro Remodeling team member. Israeli. Construction/remodeling professional.",
    availableFor: ["reel", "story", "ad", "testimonial"],
    meta: { business: "elite-pro-remodeling", voiceCloned: false },
  },
  {
    tenantId: "elite-pro-remodeling",
    name: "Saar Bitton",
    role: "owner",
    voiceId: "jlOXsp2JeEQ29fkljTTO",
    appearanceNotes:
      "Elite Pro Remodeling owner. Israeli. Executive presence.",
    availableFor: ["reel", "story", "ad", "testimonial"],
    meta: { business: "elite-pro-remodeling", voiceCloned: true },
  },
  {
    tenantId: "elite-pro-remodeling",
    name: "Mor Dayan",
    role: "pm",
    voiceId: "1prnFNmpCkb2bx39pQSi",
    appearanceNotes:
      "Elite Pro Remodeling project manager. Israeli accent, warm, casual-professional.",
    availableFor: ["reel", "story", "ad"],
    meta: { business: "elite-pro-remodeling", voiceCloned: true },
  },

  // ─── Personal / Pets ───
  {
    tenantId: "shai-personal",
    name: "Lucho",
    role: "pet",
    soraCameoUrl: "@shai.lfc-lucho",
    appearanceNotes: "Jack Russell Terrier. Shai's dog. Energetic, cute.",
    availableFor: ["reel", "story"],
    meta: { species: "dog", breed: "jack-russell" },
  },
  {
    tenantId: "shai-personal",
    name: "Leo Bitton",
    role: "pet",
    soraCameoUrl: "@shai-lfc.leo",
    appearanceNotes: "Saar Bitton's dog. Leo Bitton.",
    availableFor: ["reel", "story"],
    meta: { species: "dog", owner: "saar-bitton" },
  },
  {
    tenantId: "shai-personal",
    name: "Shusha",
    role: "cameo",
    soraCameoUrl: "@shusha049",
    appearanceNotes: "Shai's wife",
    availableFor: ["reel", "story"],
    meta: { relationship: "wife" },
  },

  // ─── Creative Characters ───
  {
    tenantId: "superseller",
    name: "Mad Einstein",
    role: "character",
    soraCameoUrl: "@madeinstein",
    appearanceNotes:
      "Mad/creative version of Albert Einstein. Wild hair, eccentric genius vibe.",
    availableFor: ["reel", "ad", "educational"],
    meta: { type: "historical-creative" },
  },
  {
    tenantId: "superseller",
    name: "Elvis",
    role: "character",
    soraCameoUrl: "@elvispresley.cameo.2",
    appearanceNotes: "Elvis Presley style character",
    availableFor: ["reel", "ad"],
    meta: { type: "celebrity-creative" },
  },
  {
    tenantId: "superseller",
    name: "Tupac",
    role: "character",
    soraCameoUrl: "@tupac.league",
    appearanceNotes: "Tupac style character",
    availableFor: ["reel", "ad"],
    meta: { type: "celebrity-creative" },
  },
  {
    tenantId: "superseller",
    name: "Willy Wonka",
    role: "character",
    soraCameoUrl: "@willywonka.league",
    appearanceNotes: "Willy Wonka character, whimsical, colorful",
    availableFor: ["reel", "ad", "educational"],
    meta: { type: "fictional-creative" },
  },
  {
    tenantId: "superseller",
    name: "Stalin",
    role: "character",
    soraCameoUrl: "@stalin.league",
    appearanceNotes: "Historical Stalin character",
    availableFor: ["reel", "educational"],
    meta: { type: "historical-creative" },
  },
  {
    tenantId: "superseller",
    name: "Churchill",
    role: "character",
    soraCameoUrl: "@churchill.league",
    appearanceNotes:
      "Winston Churchill character. Authoritative, British.",
    availableFor: ["reel", "educational", "motivational"],
    meta: { type: "historical-creative" },
  },
  {
    tenantId: "superseller",
    name: "Milei",
    role: "character",
    soraCameoUrl: "@mileiai",
    appearanceNotes:
      "Javier Milei character. Energetic, libertarian economist.",
    availableFor: ["reel", "ad", "motivational"],
    meta: { type: "political-creative" },
  },
  {
    tenantId: "superseller",
    name: "Gary Vee",
    role: "character",
    soraCameoUrl: "@garyvee",
    appearanceNotes:
      "Gary Vaynerchuk style character. Hustle culture, social media guru.",
    availableFor: ["reel", "ad", "motivational"],
    meta: { type: "business-creative" },
  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log(`Seeding ${actors.length} content actors...\n`);

  let inserted = 0;
  let skipped = 0;

  for (const actor of actors) {
    const result = await pool.query(
      `INSERT INTO content_actors (
        tenant_id, name, role, sora_cameo_url, voice_id,
        appearance_notes, available_for, meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
      RETURNING id, name`,
      [
        actor.tenantId,
        actor.name,
        actor.role,
        actor.soraCameoUrl ?? null,
        actor.voiceId ?? null,
        actor.appearanceNotes ?? null,
        JSON.stringify(actor.availableFor),
        JSON.stringify(actor.meta ?? {}),
      ]
    );

    if (result.rowCount && result.rowCount > 0) {
      console.log(`  + Inserted: ${actor.name} (${actor.tenantId})`);
      inserted++;
    } else {
      console.log(`  ~ Skipped (exists): ${actor.name} (${actor.tenantId})`);
      skipped++;
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);

  // Show summary by tenant
  const summary = await pool.query(
    `SELECT tenant_id, COUNT(*) as count FROM content_actors GROUP BY tenant_id ORDER BY tenant_id`
  );
  console.log("\nActors by tenant:");
  for (const row of summary.rows) {
    console.log(`  ${row.tenant_id}: ${row.count}`);
  }

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
