import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import { Request, Response, NextFunction } from "express";
import { videoPipelineQueue, clipGenerationQueue } from "./queue/queues";
import { redisConnection } from "./queue/connection";
import { logger } from "./utils/logger";

const BULL_BOARD_PASSWORD = process.env.BULL_BOARD_PASSWORD || "rensto-dev-2026";

/**
 * Simple basic-auth middleware for Bull Board.
 * Credentials: admin / BULL_BOARD_PASSWORD env var.
 */
function basicAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.set("WWW-Authenticate", 'Basic realm="Bull Board"');
        res.status(401).send("Authentication required");
        return;
    }

    const base64 = authHeader.slice(6);
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const [user, pass] = decoded.split(":");

    if (user === "admin" && pass === BULL_BOARD_PASSWORD) {
        next();
        return;
    }

    res.set("WWW-Authenticate", 'Basic realm="Bull Board"');
    res.status(401).send("Invalid credentials");
}

/**
 * Set up Bull Board and return the Express middleware to mount.
 * Registers all known BullMQ queues.
 */
export function setupBullBoard() {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/admin/queues");

    // The frontdesk-poller queue is created dynamically in its worker init,
    // so we create a read-only Queue handle here to register it with Bull Board.
    const frontdeskPollerQueue = new Queue("frontdesk-poller", {
        connection: redisConnection,
    });

    createBullBoard({
        queues: [
            new BullMQAdapter(videoPipelineQueue),
            new BullMQAdapter(clipGenerationQueue),
            new BullMQAdapter(frontdeskPollerQueue),
        ],
        serverAdapter,
    });

    logger.info("Bull Board UI mounted at /admin/queues");

    return { router: serverAdapter.getRouter(), basicAuth };
}
