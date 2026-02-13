import { query, queryOne, transaction } from "../db/client";
import { logger } from "../utils/logger";

/**
 * Service for managing user credits within the worker process.
 * Uses raw SQL to maintain compatibility with the worker's DB client.
 */
export class CreditManager {
    /**
     * Get the current credit balance (integer) for a user.
     */
    static async getBalance(userId: string): Promise<number> {
        return this.checkBalance(userId);
    }

    /** Alias for getBalance. Use for gating checks before expensive operations. */
    static async checkBalance(userId: string): Promise<number> {
        const row = await queryOne(
            "SELECT credits_balance FROM entitlements WHERE user_id = $1",
            [userId]
        );
        if (!row) {
            // Create entitlement if missing
            await query(
                "INSERT INTO entitlements (user_id, credits_balance, updated_at) VALUES ($1, 0, NOW()) ON CONFLICT (user_id) DO NOTHING",
                [userId]
            );
            return 0;
        }
        return Number(row.credits_balance);
    }

    /**
     * Deduct credits and log a usage event.
     * Throws Error if balance is insufficient.
     */
    static async deductCredits(
        userId: string,
        amount: number,
        type: string,
        jobId?: string,
        metadata?: any
    ): Promise<void> {
        if (amount <= 0) return;

        await transaction(async (client) => {
            const res = await client.query(
                "SELECT credits_balance FROM entitlements WHERE user_id = $1 FOR UPDATE",
                [userId]
            );
            const row = res.rows[0];
            const currentBalance = row ? Number(row.credits_balance) : 0;

            if (currentBalance < amount) {
                throw new Error(`Insufficient credits balance. Required: ${amount}, Available: ${currentBalance}`);
            }

            // Deduct credits
            await client.query(
                "UPDATE entitlements SET credits_balance = credits_balance - $1, updated_at = NOW() WHERE user_id = $2",
                [amount, userId]
            );

            // Log usage event (job_id = video_job_id; event_type for legacy 001 schema compat)
            await client.query(
                `INSERT INTO usage_events (id, user_id, job_id, type, amount, metadata, created_at, event_type, credits_used) 
         VALUES (gen_random_uuid(), $1, $2::uuid, 'debit', $3, $4, NOW(), 'credit_debit', $5)`,
                [userId, jobId || null, -amount, JSON.stringify({ ...(metadata || {}), deductType: type }), amount]
            );
        });

        logger.info({ msg: "Deducted credits", userId, amount, type, jobId });
    }

    /**
     * Refund credits (e.g. on job failure).
     * jobId optional for admin refunds; when provided must exist in video_jobs (FK).
     */
    static async refundCredits(
        userId: string,
        amount: number,
        jobId: string | null,
        reason: string
    ): Promise<void> {
        if (amount <= 0) return;

        await transaction(async (client) => {
            // Update balance
            await client.query(
                "UPDATE entitlements SET credits_balance = credits_balance + $1, updated_at = NOW() WHERE user_id = $2",
                [amount, userId]
            );

            // Log usage event (event_type for legacy 001 schema compat; job_id FK requires existing video_jobs.id or null)
            await client.query(
                `INSERT INTO usage_events (id, user_id, job_id, type, amount, metadata, created_at, event_type, credits_used) 
         VALUES (gen_random_uuid(), $1, $2::uuid, 'refund', $3, $4, NOW(), 'credit_refund', $3)`,
                [userId, jobId || null, amount, JSON.stringify({ reason })]
            );
        });

        logger.info({ msg: "Refunded credits", userId, amount, jobId, reason });
    }
}
