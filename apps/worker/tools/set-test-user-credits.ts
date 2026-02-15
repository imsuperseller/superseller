/**
 * Add credits for a user (for testing). Run from apps/worker.
 * Usage: npx tsx tools/set-test-user-credits.ts [userId] [amount]
 * Default: c60b6d2f-856d-49fd-8737-7e1fee3fa848, 500
 */
import "dotenv/config";
import { query } from "../src/db/client";

const DEFAULT_USER = "c60b6d2f-856d-49fd-8737-7e1fee3fa848";
const DEFAULT_AMOUNT = 500;

async function main() {
    const userId = process.argv[2] || DEFAULT_USER;
    const amount = parseInt(process.argv[3] || String(DEFAULT_AMOUNT), 10);
    await query(
        `INSERT INTO entitlements (user_id, credits_balance, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (user_id) DO UPDATE SET credits_balance = $2, updated_at = NOW()`,
        [userId, amount]
    );
    console.log("✅ Credits set:", userId, "->", amount);
    process.exit(0);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
