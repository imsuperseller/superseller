import { Worker } from "bullmq";
import { redisConnection } from "../connection";
import { MarketplaceJobData } from "../queues";
import { logger } from "../../utils/logger";
import { MarketplaceService } from "../../services/marketplace";

export const marketplaceReplenisherWorker = new Worker<MarketplaceJobData>(
    "marketplace-replenisher",
    async (job) => {
        const { productId, count } = job.data;
        logger.info({ msg: "Marketplace replenishment job started", jobId: job.id, productId, count });

        try {
            await MarketplaceService.replenish(productId, count);
            logger.info({ msg: "Marketplace replenishment job completed", jobId: job.id });
        } catch (err: any) {
            logger.error({ msg: "Marketplace replenishment job failed", error: err.message, jobId: job.id });
            throw err;
        }
    },
    {
        connection: redisConnection,
        concurrency: 1, // One replenishment at a time to avoid rate limits
    }
);

export async function initMarketplaceReplenisher() {
    logger.info("Initializing Marketplace Replenisher schedule...");

    const { marketplaceReplenisherQueue } = await import("../queues");

    // Check every 60 minutes for both UAD and MissParty
    // In production, we'd use a repeatable job, but for now we'll just kick it off
    // or set a repeatable job if we want it to be automatic.
    await marketplaceReplenisherQueue.upsertJobScheduler(
        "uad-replenish-cron",
        { pattern: "0 * * * *" }, // Every hour
        { data: { productId: "uad", count: 5 } }
    );

    await marketplaceReplenisherQueue.upsertJobScheduler(
        "missparty-replenish-cron",
        { pattern: "15 * * * *" }, // Every hour offset by 15 mins
        { data: { productId: "missparty", count: 3 } }
    );

    logger.info("✅ Marketplace Replenisher scheduled (1hr cycles)");
}
