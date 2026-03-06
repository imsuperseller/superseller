import Redis from "ioredis";
import { config } from "../config";
import { logger } from "../utils/logger";

export const redisConnection = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,  // Required by BullMQ
}) as any;

redisConnection.on("error", (err: any) => {
    logger.error({ msg: "Redis connection error", error: err.message, code: (err as any).code });
});

redisConnection.on("connect", () => {
    const maskedUrl = config.redis.url.replace(/:[^@]+@/, ":****@");
    logger.info({ msg: "Redis connected", url: maskedUrl });
});
