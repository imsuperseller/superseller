import dotenv from "dotenv";
import * as path from "path";
import { logger } from "./utils/logger";

// Load root .env first, then apps/worker/.env (worker overrides)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
const workerEnv = path.resolve(process.cwd(), ".env");
dotenv.config({ path: workerEnv, override: true });

function required(key: string): string {
    const value = process.env[key];
    if (!value) {
        console.warn(`[config] Warning: Missing env var: ${key}. This may cause issues if the feature is used.`);
        return "";
    }
    return value;
}

function optional(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

// Extract Account ID from R2_ENDPOINT if R2_ACCOUNT_ID is missing
const r2Endpoint = process.env.R2_ENDPOINT || "";
const r2AccountId = process.env.R2_ACCOUNT_ID || r2Endpoint.match(/https:\/\/(.*?)\.r2/)?.[1] || "";

export const config = {
    port: parseInt(optional("PORT", "3002")),
    nodeEnv: optional("NODE_ENV", "development"),
    logLevel: optional("LOG_LEVEL", "info"),

    db: {
        url: required("DATABASE_URL") || "postgresql://localhost/tourreel",
    },

    redis: {
        url: optional("REDIS_URL", "redis://127.0.0.1:6379"),
    },



    kie: {
        apiKey: required("KIE_API_KEY"),
        baseUrl: "https://api.kie.ai",
        webhookUrl: process.env.KIE_WEBHOOK_URL || "",
        defaultModel: "gemini-3-pro",
        fallbackModel: "gemini-3-flash",
    },

    google: {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    },



    clerk: {
        secretKey: process.env.CLERK_SECRET_KEY || "", // Optional for now
        webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
    },

    stripe: {
        secretKey: required("STRIPE_SECRET_KEY"),
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        prices: {
            starter: process.env.STRIPE_STARTER_PRICE_ID,
            pro: process.env.STRIPE_PRO_PRICE_ID,
            team: process.env.STRIPE_TEAM_PRICE_ID,
        },
        meterId: process.env.STRIPE_METER_ID,
    },

    r2: {
        accountId: r2AccountId,
        accessKeyId: required("R2_ACCESS_KEY_ID"),
        secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
        bucket: optional("R2_BUCKET_NAME", process.env.R2_BUCKET || "tour-videos"),
        // videos.rensto.com is not configured; use r2.dev for Kie.ai to fetch media
        publicUrl: (() => {
            const raw = optional("R2_PUBLIC_URL", process.env.R2_PUBLIC_DOMAIN || "");
            if (raw && raw.includes("videos.rensto.com")) {
                return "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev";
            }
            return raw;
        })(),
        endpoint: r2Endpoint || `https://${r2AccountId}.r2.cloudflarestorage.com`,
    },

    temp: {
        dir: optional("TEMP_DIR", "/tmp/tourreel-jobs"),
        maxConcurrentJobs: parseInt(optional("MAX_CONCURRENT_JOBS", "1")),
        maxTempAgeMinutes: parseInt(optional("MAX_TEMP_AGE_MINUTES", "120")),
    },

    notifications: {
        resendApiKey: process.env.RESEND_API_KEY,
        fromEmail: optional("NOTIFICATION_FROM_EMAIL", "noreply@tourreel.com"),
    },

    app: {
        url: optional("APP_URL", "http://localhost:3001"),
        apiUrl: optional("API_URL", "http://localhost:3002"),
        corsOrigins: ["http://localhost:3000", "http://localhost:3001", "https://rensto.com", "https://www.rensto.com"],
    },

    video: {
        defaultModel: "kling_3" as const,
        defaultTransition: "fade" as const,
        defaultClipDuration: 5,
        maxClipsPerVideo: 15,
        maxRetriesPerClip: 3,
        maxCostPerVideo: 50.00,
        xfadeDuration: 0.5,
    },
} as const;

export type Config = typeof config;
