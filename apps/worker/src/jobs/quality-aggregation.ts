/**
 * Quality Aggregation Job
 *
 * Runs nightly to compute average performanceScore per model from content_entries
 * and update ai_model_recommendations.quality_score, closing the Observatory feedback loop.
 *
 * Only updates models with >= 20 samples to ensure statistical significance.
 * Models below the threshold retain their static seed scores.
 */

import { query } from "../db/client";
import { logger } from "../utils/logger";

const MIN_SAMPLES = 20;

interface AggregationRow {
    model_id: string;
    avg_score: string;
    sample_count: string;
}

export async function runQualityAggregation(): Promise<void> {
    try {
        logger.info({ msg: "Quality aggregation: starting nightly run" });

        // Query content_entries for avg performanceScore per model over rolling 90-day window.
        // Uses generation_meta JSONB to extract model_id written by the performance-tracker.
        const rows = await query<AggregationRow>(`
            SELECT
                generation_meta->>'model_id' as model_id,
                AVG(performance_score) as avg_score,
                COUNT(*) as sample_count
            FROM content_entries
            WHERE performance_score IS NOT NULL
              AND generation_meta IS NOT NULL
              AND generation_meta->>'model_id' IS NOT NULL
              AND created_at > NOW() - INTERVAL '90 days'
            GROUP BY generation_meta->>'model_id'
        `);

        logger.info({ msg: "Quality aggregation: query complete", total_models_evaluated: rows.length });

        let updatedCount = 0;
        let skippedCount = 0;

        for (const row of rows) {
            const sampleCount = parseInt(row.sample_count, 10);

            if (sampleCount < MIN_SAMPLES) {
                logger.info({
                    msg: "Quality aggregation: skipping model (insufficient samples)",
                    model_id: row.model_id,
                    sample_count: sampleCount,
                    required: MIN_SAMPLES,
                });
                skippedCount++;
                continue;
            }

            // Update quality_score on ai_model_recommendations where recommended model matches.
            // The JOIN via ai_models.model_id bridges the string model_id to the FK.
            const updated = await query(
                `UPDATE ai_model_recommendations
                 SET quality_score = $1, updated_at = NOW()
                 WHERE recommended_model_id IN (
                     SELECT id FROM ai_models WHERE model_id = $2
                 )`,
                [parseFloat(row.avg_score), row.model_id]
            );

            logger.info({
                msg: "Quality aggregation: updated Observatory score",
                model_id: row.model_id,
                avg_score: parseFloat(row.avg_score).toFixed(4),
                sample_count: sampleCount,
                rows_updated: updated.length,
            });

            updatedCount++;
        }

        logger.info({
            msg: "Quality aggregation: run complete",
            total_models_evaluated: rows.length,
            models_updated: updatedCount,
            models_skipped_insufficient_samples: skippedCount,
        });
    } catch (err: any) {
        // Log but never throw — scheduler already catches, but defense in depth
        logger.error({
            msg: "Quality aggregation: run failed",
            error: err.message,
            stack: err.stack,
        });
    }
}
