import express from "express";
import cors from "cors";
import { config } from "./config";
import { logger } from "./utils/logger";
import { apiRouter } from "./api/routes";
import { videoPipelineWorker } from "./queue/workers/video-pipeline.worker";
import { initWorkers } from "./queue/workers/video-pipeline.worker";
import { leadWorker, initLeadWorker } from "./queue/workers/LeadWorker";
import { claudeclawWorker, initClaudeClaw } from "./queue/workers/claudeclaw.worker";
import { marketplaceReplenisherWorker, initMarketplaceReplenisher } from "./queue/workers/marketplace-replenisher.worker";
import { remotionWorker, initRemotionWorker } from "./queue/workers/remotion.worker";
import { crewVideoWorker, initCrewVideoWorker } from "./queue/workers/crew-video.worker";
import { setupBullBoard } from "./bull-board";

async function bootstrap() {
    logger.info("🚀 Starting TourReel Worker Service...");

    // 1. Express Setup
    const app = express();
    app.use(cors({
        origin: [...config.app.corsOrigins],
        credentials: true
    }));
    app.use(express.json({ limit: "50mb" }));

    // 2. Routes
    app.use("/api", apiRouter);

    // 3. Bull Board UI (basic-auth protected, disabled if no password)
    const bullBoard = setupBullBoard();
    if (bullBoard) {
        app.use("/admin/queues", bullBoard.basicAuth, bullBoard.router);
    }

    // 4. Initialize BullMQ Workers
    await initWorkers();
    await initLeadWorker();
    await initClaudeClaw();
    await initMarketplaceReplenisher();
    await initRemotionWorker();
    await initCrewVideoWorker();
    logger.info("✅ Workers initialized");

    // 5. Start Server
    const port = config.port;
    app.listen(port, () => {
        logger.info(`✨ API Server listening on port ${port}`);
        logger.info(`🔗 Health Check: http://localhost:${port}/api/health`);
        logger.info(`📊 Bull Board: http://localhost:${port}/admin/queues`);
    });

    // Handle termination
    process.on("SIGTERM", async () => {
        logger.info("Shutting down...");
        await videoPipelineWorker.close();
        await leadWorker.close();
        await claudeclawWorker.close();
        await marketplaceReplenisherWorker.close();
        await remotionWorker.close();
        await crewVideoWorker.close();
        process.exit(0);
    });
}

bootstrap().catch((err) => {
    logger.error({ msg: "Fatal error during bootstrap", error: err.message });
    process.exit(1);
});
