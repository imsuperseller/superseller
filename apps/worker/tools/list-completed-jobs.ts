/**
 * List completed video jobs with master_video_url.
 * Run: cd apps/worker && npx tsx tools/list-completed-jobs.ts
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

import { query } from "../src/db/client";

async function main() {
    const rows = await query<any>(
        `SELECT vj.id, vj.status, vj.master_video_url, vj.error_message, vj.current_step, vj.created_at, l.address
         FROM video_jobs vj
         JOIN listings l ON l.id = vj.listing_id
         ORDER BY vj.created_at DESC
         LIMIT 20`
    );
    console.log(JSON.stringify(rows, null, 2));
    const completed = rows.filter((r: any) => r.status === "complete" && r.master_video_url);
    if (completed.length) {
        console.log("\n--- COMPLETED WITH VIDEO ---");
        completed.forEach((r: any) => console.log(`${r.id} | ${r.address} | ${r.master_video_url}`));
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
