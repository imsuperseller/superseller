import express from "express";
import cors from "cors";
import { config } from "./config";
import { logger } from "./utils/logger";
import { apiRouter } from "./api/routes";
import { videoPipelineWorker } from "./queue/workers/video-pipeline.worker";
import { initWorkers } from "./queue/workers/video-pipeline.worker";
import { frontdeskPollerWorker, initFrontDeskPoller } from "./queue/workers/frontdesk-poller.worker";
import { claudeclawWorker, initClaudeClaw } from "./queue/workers/claudeclaw.worker";
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

    // 3. Bull Board UI (basic-auth protected)
    const bullBoard = setupBullBoard();
    app.use("/admin/queues", bullBoard.basicAuth, bullBoard.router);

    // 4. Initialize BullMQ Workers
    await initWorkers();
    await initFrontDeskPoller();
    await initClaudeClaw();
    logger.info("✅ Workers initialized (Concurrency: 1)");

    // 5. Start Server
    const port = process.env.PORT || 3002;
    app.listen(port, () => {
        logger.info(`✨ API Server listening on port ${port}`);
        logger.info(`🔗 Health Check: http://localhost:${port}/api/health`);
        logger.info(`📊 Bull Board: http://localhost:${port}/admin/queues`);
    });

    // Handle termination
    process.on("SIGTERM", async () => {
        logger.info("Shutting down...");
        await videoPipelineWorker.close();
        await frontdeskPollerWorker.close();
        await claudeclawWorker.close();
        process.exit(0);
    });
}

bootstrap().catch((err) => {
    logger.error({ msg: "Fatal error during bootstrap", error: err.message });
    process.exit(1);
});
