/**
 * Verify scrapeZillowListing accepts both address and URL.
 * Run: cd zillow-to-video && npx tsx tools/verify-apify-scrape.ts
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const APIFY_URL = "https://www.zillow.com/homedetails/1531-Home-Park-Dr-Allen-TX-75002/26651378_zpid/";
const APIFY_ADDRESS = "1531 Home Park Dr, Allen, TX 75002";

async function main() {
  if (!process.env.APIFY_API_TOKEN) {
    console.error("❌ APIFY_API_TOKEN not set. Add to .env");
    process.exit(1);
  }

  const { scrapeZillowListing } = await import("../apps/worker/src/services/apify");

  console.log("\n--- Test 1: Scrape by URL ---");
  try {
    const byUrl = await scrapeZillowListing(APIFY_URL, 5);
    console.log("✅ URL scrape OK");
    console.log("  address:", byUrl.address);
    console.log("  photos:", byUrl.photos?.length ?? 0);
    console.log("  zillow_url:", byUrl.zillow_url ?? "(missing)");
    if (!byUrl.photos?.length) console.warn("  ⚠️ No photos returned");
  } catch (e: any) {
    console.error("❌ URL scrape failed:", e.message);
  }

  console.log("\n--- Test 2: Scrape by address ---");
  try {
    const byAddress = await scrapeZillowListing(APIFY_ADDRESS, 5);
    console.log("✅ Address scrape OK");
    console.log("  address:", byAddress.address);
    console.log("  photos:", byAddress.photos?.length ?? 0);
    console.log("  zillow_url:", byAddress.zillow_url ?? "(missing)");
    if (!byAddress.photos?.length) console.warn("  ⚠️ No photos returned");
    if (!byAddress.zillow_url) console.warn("  ⚠️ zillow_url not populated");
  } catch (e: any) {
    console.error("❌ Address scrape failed:", e.message);
  }

  console.log("\n--- Done ---\n");
}

main();
