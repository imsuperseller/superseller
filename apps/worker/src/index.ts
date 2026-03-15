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
import { onboardingWorker, initOnboardingWorker } from "./queue/workers/onboarding.worker";
import { initChangeRequestTable } from "./services/onboarding/change-request-intake";
import { setupBullBoard } from "./bull-board";
import { initWahaSessions } from "./services/waha-session-manager";
import { startHealthMonitor } from "./services/health-monitor";
import { startScheduler } from "./services/scheduler";

async function validateConfig() {
    const errors: string[] = [];

    // Test Redis
    try {
        const Redis = (await import("ioredis")).default;
        const testRedis = new Redis(config.redis.url, { connectTimeout: 5000, maxRetriesPerRequest: 1, retryStrategy: () => null });
        await testRedis.ping();
        await testRedis.quit();
        logger.info({ msg: "Config validation: Redis OK" });
    } catch (err: any) {
        errors.push(`Redis: ${err.message}`);
    }

    // Test PostgreSQL
    try {
        const { query } = await import("./db/client");
        await query("SELECT 1");
        logger.info({ msg: "Config validation: PostgreSQL OK" });
    } catch (err: any) {
        errors.push(`PostgreSQL: ${err.message}`);
    }

    if (errors.length > 0) {
        logger.error({ msg: "Config validation FAILED — fix before deploying", errors });
        throw new Error(`Config validation failed: ${errors.join("; ")}`);
    }

    logger.info({ msg: "Config validation passed" });
}

async function bootstrap() {
    logger.info("🚀 Starting VideoForge Worker Service...");

    // 0. Validate critical connections before proceeding
    await validateConfig();

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
    await initOnboardingWorker();
    await initChangeRequestTable();
    logger.info("✅ Workers initialized");

    // 5. WAHA Multi-Session Bootstrap
    await initWahaSessions().catch((err) =>
        logger.error({ msg: "WAHA session bootstrap failed", error: err.message })
    );

    // 6. Health Monitor + Scheduler
    startHealthMonitor();
    startScheduler();

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
        const { stopHealthMonitor } = await import("./services/health-monitor");
        const { stopScheduler } = await import("./services/scheduler");
        stopHealthMonitor();
        stopScheduler();
        await videoPipelineWorker.close();
        await leadWorker.close();
        await claudeclawWorker.close();
        await marketplaceReplenisherWorker.close();
        await remotionWorker.close();
        await crewVideoWorker.close();
        await onboardingWorker.close();
        process.exit(0);
    });
}

bootstrap().catch((err) => {
    logger.error({ msg: "Fatal error during bootstrap", error: err.message });
    process.exit(1);
});
