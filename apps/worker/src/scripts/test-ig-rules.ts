/**
 * Test script for ig-content-rules service.
 * Usage: npx tsx apps/worker/src/scripts/test-ig-rules.ts
 *
 * Pass TENANT_ID env var to test a specific tenant, otherwise uses a default UUID.
 */

import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

import {
  getRule,
  getRulesForContentType,
  getHashtagSet,
  getHashtagSetByName,
  getCaptionTemplate,
  getComplianceChecklist,
  getSchedulingRules,
  getSuburbGeoSwap,
} from "../services/ig-content-rules";
import { pool } from "../db/client";

const TENANT_ID = process.env.TENANT_ID || "elite-pro-remodeling";

async function main() {
  console.log(`\n=== IG Content Rules Service Test ===`);
  console.log(`Tenant: ${TENANT_ID}\n`);

  // 1. getRule
  console.log("── 1. getRule (all, platform_limits, max_hashtags) ──");
  const rule = await getRule(TENANT_ID, "all", "platform_limits", "max_hashtags");
  console.log("Result:", rule ?? "(no rule found)");

  // 2. getRulesForContentType
  console.log("\n── 2. getRulesForContentType (reel) ──");
  const allRules = await getRulesForContentType(TENANT_ID, "reel");
  const ruleCount = Object.keys(allRules).length;
  console.log(`Found ${ruleCount} merged rules`);
  if (ruleCount > 0) {
    for (const [key, value] of Object.entries(allRules).slice(0, 5)) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
    if (ruleCount > 5) console.log(`  ... and ${ruleCount - 5} more`);
  }

  // 3. getHashtagSet (rotation)
  console.log("\n── 3. getHashtagSet (before_after) ──");
  const hashtagSet = await getHashtagSet(TENANT_ID, "before_after");
  if (hashtagSet) {
    console.log(`Set: ${hashtagSet.set_name ?? hashtagSet.setName}`);
    console.log(`Hashtags: ${JSON.stringify(hashtagSet.hashtags)}`);
    console.log(`Usage count: ${hashtagSet.usage_count ?? hashtagSet.usageCount}`);
  } else {
    console.log("(no hashtag set found)");
  }

  // 4. getHashtagSetByName
  console.log("\n── 4. getHashtagSetByName (kitchen_before_after) ──");
  const namedSet = await getHashtagSetByName(TENANT_ID, "kitchen_before_after");
  if (namedSet) {
    console.log(`Hashtags: ${JSON.stringify(namedSet.hashtags)}`);
  } else {
    console.log("(no set found with that name)");
  }

  // 5. getCaptionTemplate
  console.log("\n── 5. getCaptionTemplate (reel, before_after, en) ──");
  const template = await getCaptionTemplate(TENANT_ID, "reel", "before_after", "en");
  if (template) {
    const t = template as any;
    console.log(`Hook: ${t.hook_template ?? t.hook}`);
    console.log(`Body: ${(t.body_template ?? t.body)?.substring(0, 80)}...`);
    console.log(`CTA: ${t.cta_template ?? t.cta}`);
    console.log(`Linked hashtags: ${JSON.stringify(template.hashtags)}`);
  } else {
    console.log("(no template found)");
  }

  // 6. getComplianceChecklist
  console.log("\n── 6. getComplianceChecklist (reel) ──");
  const checklist = await getComplianceChecklist(TENANT_ID, "reel");
  console.log(`Found ${checklist.length} compliance rules`);
  for (const item of checklist.slice(0, 5)) {
    console.log(`  [${item.priority}] ${item.key}: ${JSON.stringify(item.value)}`);
  }

  // 7. getSchedulingRules
  console.log("\n── 7. getSchedulingRules (reel) ──");
  const schedRules = await getSchedulingRules(TENANT_ID, "reel");
  console.log("Scheduling rules:", JSON.stringify(schedRules, null, 2));

  // 8. getSuburbGeoSwap
  console.log("\n── 8. getSuburbGeoSwap (plano) ──");
  const geoTag = await getSuburbGeoSwap(TENANT_ID, "plano");
  console.log("Geo swap result:", geoTag ?? "(no geo swap found)");

  console.log("\n=== Test complete ===\n");
}

main()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
