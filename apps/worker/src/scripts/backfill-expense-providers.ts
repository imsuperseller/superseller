/**
 * Backfill script: Fix misattributed api_expenses rows.
 *
 * Problem: character-video-gen.ts hardcoded service="kie.ai" regardless of actual provider.
 * Fix: Update rows where metadata or PipelineRun indicates fal was the actual provider.
 *
 * Run: npx tsx apps/worker/src/scripts/backfill-expense-providers.ts
 * Safe to run multiple times (idempotent).
 */

import { query } from "../db/client";

async function backfill() {
    console.log("=== Backfill: Fix misattributed api_expenses providers ===\n");

    // Step 1: Normalize "kie.ai" → "kie" (the standard label)
    const normalizeResult = await query(
        `UPDATE api_expenses SET service = 'kie' WHERE service = 'kie.ai' RETURNING id`
    );
    console.log(`Step 1: Normalized ${normalizeResult.length} rows from "kie.ai" → "kie"`);

    // Step 2: Find rows that were tracked as kie but actually came from fal
    // These have operation="sora-2-pro" and the PipelineRun.modelUsed contains "sora" (fal route)
    // Or metadata contains provider hints
    const falCandidates = await query<{ id: string; job_id: string; metadata: any }>(
        `SELECT e.id, e.job_id, e.metadata
         FROM api_expenses e
         WHERE e.service = 'kie'
           AND e.operation = 'sora-2-pro'
           AND e.job_id IS NOT NULL`
    );

    let updatedToFal = 0;
    for (const row of falCandidates) {
        // Check if metadata has provider info (future-proofing — our fix adds this)
        const meta = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata;
        if (meta?.provider === "fal") {
            await query(`UPDATE api_expenses SET service = 'fal' WHERE id = $1`, [row.id]);
            updatedToFal++;
            continue;
        }

        // Check PipelineRun for model info
        const pipelineRows = await query<{ modelUsed: string | null }>(
            `SELECT "modelUsed" FROM "PipelineRun" WHERE id = $1`,
            [row.job_id]
        );
        if (pipelineRows.length > 0) {
            const model = pipelineRows[0].modelUsed?.toLowerCase() ?? "";
            // fal models contain "fal-ai" or "fal/" in their model IDs
            if (model.includes("fal-ai") || model.includes("fal/")) {
                await query(`UPDATE api_expenses SET service = 'fal' WHERE id = $1`, [row.id]);
                updatedToFal++;
            }
        }
    }

    console.log(`Step 2: Re-attributed ${updatedToFal} rows from "kie" → "fal" (of ${falCandidates.length} candidates)`);

    // Step 3: Summary
    const summary = await query<{ service: string; cnt: string }>(
        `SELECT service, COUNT(*) as cnt FROM api_expenses GROUP BY service ORDER BY cnt DESC`
    );
    console.log("\n=== Current provider distribution ===");
    for (const row of summary) {
        console.log(`  ${row.service}: ${row.cnt} rows`);
    }

    console.log("\nBackfill complete.");
    process.exit(0);
}

backfill().catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
});
