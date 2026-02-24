import { query, queryRow, transaction } from "./db";
import * as redis from "./redis";

// ── Types ──────────────────────────────────────────────────────────

export interface CreditStatus {
  available: number;
  total: number;
  used: number;
  monthlyRemaining: number;
  monthlyCap: number;
}

export class InsufficientCreditsError extends Error {
  constructor(public userId: string) {
    super(`Insufficient credits for user ${userId}`);
    this.name = "InsufficientCreditsError";
  }
}

// ── Check Credits ──────────────────────────────────────────────────

export async function checkCredits(userId: string): Promise<CreditStatus> {
  const cached = await redis.getJson<CreditStatus>(
    `winner:user:credits:${userId}`
  );
  if (cached) return cached;

  const row = await queryRow<{
    available_credits: number;
    total_credits: number;
    used_credits: number;
    monthly_cap: number;
    monthly_used: number;
  }>(
    `SELECT available_credits, total_credits, used_credits, monthly_cap, monthly_used
     FROM winner_user_credits WHERE user_id = $1`,
    [userId]
  );

  if (!row) throw new Error(`No credit record for user ${userId}`);

  const status: CreditStatus = {
    available: row.available_credits,
    total: row.total_credits,
    used: row.used_credits,
    monthlyRemaining: row.monthly_cap - row.monthly_used,
    monthlyCap: row.monthly_cap,
  };

  await redis.setJson(`winner:user:credits:${userId}`, status, 300);
  return status;
}

// ── Consume Credit (Atomic) ────────────────────────────────────────

export async function consumeCredit(
  userId: string,
  generationId: string
): Promise<CreditStatus> {
  return transaction(async (tx) => {
    // Atomic update with guards
    const rows = await tx.query<{
      available_credits: number;
      total_credits: number;
      used_credits: number;
      monthly_cap: number;
      monthly_used: number;
    }>(
      `UPDATE winner_user_credits
       SET used_credits = used_credits + 1, monthly_used = monthly_used + 1
       WHERE user_id = $1 AND available_credits > 0 AND monthly_used < monthly_cap
       RETURNING available_credits, total_credits, used_credits, monthly_cap, monthly_used`,
      [userId]
    );

    if (rows.length === 0) {
      throw new InsufficientCreditsError(userId);
    }

    const row = rows[0];

    // Log transaction
    await tx.query(
      `INSERT INTO winner_credit_transactions (user_id, type, amount, balance_after, generation_id, description)
       VALUES ($1, 'consume', -1, $2, $3, 'Video generation')`,
      [userId, row.available_credits, generationId]
    );

    const status: CreditStatus = {
      available: row.available_credits,
      total: row.total_credits,
      used: row.used_credits,
      monthlyRemaining: row.monthly_cap - row.monthly_used,
      monthlyCap: row.monthly_cap,
    };

    // Invalidate cache
    await redis.del(`winner:user:credits:${userId}`);

    return status;
  });
}

// ── Refund Credit ──────────────────────────────────────────────────

export async function refundCredit(generationId: string): Promise<void> {
  await transaction(async (tx) => {
    // Find the generation and its user
    const gen = await tx.queryRow<{
      id: string;
      user_id: string;
      credits_charged: number;
      credit_refunded: boolean;
    }>(
      `SELECT id, user_id, credits_charged, credit_refunded
       FROM winner_generations WHERE id = $1`,
      [generationId]
    );

    if (!gen) return;

    // Already refunded or never charged
    if (gen.credit_refunded || gen.credits_charged === 0) return;

    // Restore credits
    await tx.query(
      `UPDATE winner_user_credits
       SET used_credits = GREATEST(0, used_credits - $2),
           monthly_used = GREATEST(0, monthly_used - $2)
       WHERE user_id = $1`,
      [gen.user_id, gen.credits_charged]
    );

    // Mark generation as refunded
    await tx.query(
      `UPDATE winner_generations SET credit_refunded = true WHERE id = $1`,
      [generationId]
    );

    // Get new balance for log
    const balanceRow = await tx.queryRow<{ available_credits: number }>(
      `SELECT available_credits FROM winner_user_credits WHERE user_id = $1`,
      [gen.user_id]
    );

    // Log refund transaction
    await tx.query(
      `INSERT INTO winner_credit_transactions (user_id, type, amount, balance_after, generation_id, description)
       VALUES ($1, 'refund', $2, $3, $4, 'Generation failed — credit refunded')`,
      [
        gen.user_id,
        gen.credits_charged,
        balanceRow?.available_credits ?? 0,
        generationId,
      ]
    );

    // Invalidate cache
    await redis.del(`winner:user:credits:${gen.user_id}`);
  });
}
