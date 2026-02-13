import { prisma } from './prisma';
import { logger } from './logger';

/**
 * Service for managing user credits and tracking usage events.
 * Standardizes credit check, deduction, and refund logic across the app.
 */
export class CreditService {
    /**
     * Get the current credit balance for a user.
     * If the user has no entitlement record, it creates one with 0 balance.
     */
    static async getBalance(userId: string): Promise<number> {
        const entitlement = await prisma.entitlement.upsert({
            where: { userId },
            update: {},
            create: { userId, creditsBalance: 0 },
        });
        return entitlement.creditsBalance;
    }

    /** Alias for getBalance. Use for gating checks before expensive operations. */
    static async checkBalance(userId: string): Promise<number> {
        return this.getBalance(userId);
    }

    /**
     * Deduct credits from a user's balance and log a usage event.
     * Throws an error if balance is insufficient.
     */
    static async deductCredits(
        userId: string,
        amount: number,
        type: string,
        jobId?: string,
        metadata?: any
    ): Promise<void> {
        if (amount <= 0) return;

        await prisma.$transaction(async (tx) => {
            const entitlement = await tx.entitlement.findUnique({
                where: { userId },
            });

            if (!entitlement || entitlement.creditsBalance < amount) {
                throw new Error(`Insufficient credits balance. Required: ${amount}, Available: ${entitlement?.creditsBalance || 0}`);
            }

            // Deduct credits
            await tx.entitlement.update({
                where: { userId },
                data: {
                    creditsBalance: {
                        decrement: amount,
                    },
                },
            });

            // Log usage event
            await tx.usageEvent.create({
                data: {
                    userId,
                    type: 'debit',
                    amount: -amount,
                    jobId,
                    metadata: {
                        ...metadata,
                        deductType: type,
                        previousBalance: entitlement.creditsBalance,
                        newBalance: entitlement.creditsBalance - amount,
                    },
                },
            });
        });

        logger.info(`Deducted ${amount} credits from user ${userId} for ${type}`);
    }

    /**
     * Refund credits to a user and log a usage event.
     */
    static async refundCredits(
        userId: string,
        amount: number,
        jobId: string,
        reason: string
    ): Promise<void> {
        if (amount <= 0) return;

        await prisma.$transaction(async (tx) => {
            // Add credits back
            await tx.entitlement.update({
                where: { userId },
                data: {
                    creditsBalance: {
                        increment: amount,
                    },
                },
            });

            // Log usage event
            await tx.usageEvent.create({
                data: {
                    userId,
                    type: 'refund',
                    amount: amount,
                    jobId,
                    metadata: {
                        reason,
                    },
                },
            });
        });

        logger.info(`Refunded ${amount} credits to user ${userId} for job ${jobId}. Reason: ${reason}`);
    }

    /**
     * Add credits (topup/grant/reset) and log a usage event.
     */
    static async addCredits(
        userId: string,
        amount: number,
        type: 'topup' | 'grant' | 'reset',
        metadata?: any
    ): Promise<void> {
        if (amount <= 0) return;

        await prisma.$transaction(async (tx) => {
            await tx.entitlement.upsert({
                where: { userId },
                update: {
                    creditsBalance: {
                        increment: amount,
                    },
                },
                create: {
                    userId,
                    creditsBalance: amount,
                },
            });

            await tx.usageEvent.create({
                data: {
                    userId,
                    type,
                    amount,
                    metadata,
                },
            });
        });

        logger.info(`Added ${amount} ${type} credits to user ${userId}`);
    }
}
