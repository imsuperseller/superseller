import dotenv from "dotenv";
import * as path from "path";
import { logger } from "./utils/logger";

// Load root .env first, then apps/worker/.env (worker overrides)
// Preserve explicit MAX_CLIPS from shell so 1-clip tests aren't overridden by .env
const explicitMaxClips = process.env.MAX_CLIPS;
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
const workerEnv = path.resolve(process.cwd(), ".env");
dotenv.config({ path: workerEnv, override: true });
if (explicitMaxClips !== undefined) process.env.MAX_CLIPS = explicitMaxClips;

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



    ollama: {
        url: optional("OLLAMA_URL", "http://localhost:11434"),
        model: optional("OLLAMA_EMBED_MODEL", "nomic-embed-text"),
    },

    kie: {
        apiKey: required("KIE_API_KEY"),
        baseUrl: "https://api.kie.ai/api",
        webhookUrl: process.env.KIE_WEBHOOK_URL || "",
    },

    google: {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    },

    telnyx: {
        apiKey: process.env.TELNYX_API_KEY || "",
        baseUrl: "https://api.telnyx.com/v2",
        pollIntervalMinutes: parseInt(optional("FRONTDESK_POLL_INTERVAL_MINUTES", "15")),
        creditsPerCall: parseInt(optional("FRONTDESK_CREDITS_PER_CALL", "5")),
        // Voice webhook config
        elevenLabsApiKeyRef: optional("TELNYX_ELEVENLABS_API_KEY_REF", "superseller"),
        defaultVoiceId: optional("TELNYX_DEFAULT_VOICE_ID", "ElevenLabs.eleven_multilingual_v2.tnSpp4vdxKPjI9w0GnoV"),
        defaultLanguage: optional("TELNYX_DEFAULT_LANGUAGE", "en-US"),
        voiceChatModel: optional("TELNYX_VOICE_CHAT_MODEL", "openai/gpt-4o"),
    },



    // Clerk removed — auth is magic-link via Resend (Feb 2026)
    // Stripe removed — payments via PayPal (Feb 2026)

    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || '',
        mode: process.env.PAYPAL_MODE || 'sandbox',
        plans: {
            starter: process.env.PAYPAL_STARTER_PLAN_ID,
            pro: process.env.PAYPAL_PRO_PLAN_ID,
            team: process.env.PAYPAL_TEAM_PLAN_ID,
        },
    },

    r2: {
        accountId: r2AccountId,
        accessKeyId: required("R2_ACCESS_KEY_ID"),
        secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
        bucket: optional("R2_BUCKET_NAME", process.env.R2_BUCKET || "tour-videos"),
        // Kie.ai must fetch media from public URLs. If unset, use r2.dev (tour-videos bucket) so pipeline works.
        publicUrl: (() => {
            const raw = optional("R2_PUBLIC_URL", process.env.R2_PUBLIC_DOMAIN || "");
            if (raw && raw.startsWith("http")) return raw;
            if (raw && raw.includes("videos.superseller.agency")) return "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev";
            return "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev"; // fallback: Kie needs absolute URLs
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
        fromEmail: optional("NOTIFICATION_FROM_EMAIL", "noreply@superseller.agency"),
    },

    app: {
        url: optional("APP_URL", "http://localhost:3001"),
        apiUrl: optional("API_URL", "http://localhost:3002"),
        corsOrigins: ["http://localhost:3000", "http://localhost:3001", "https://superseller.agency", "https://www.superseller.agency"],
    },

    waha: {
        url: optional("WAHA_URL", "http://localhost:3000"),
        apiKey: process.env.WAHA_API_KEY || "",
        session: optional("WAHA_SESSION", "default"),
    },

    claudeclaw: {
        enabled: optional("CLAUDECLAW_ENABLED", "false") === "true",
        allowedPhones: (process.env.CLAUDECLAW_ALLOWED_PHONES || "").split(",").filter(Boolean),
        projectDir: optional("CLAUDECLAW_PROJECT_DIR", "/opt/claudeclaw"),
        maxResponseLength: parseInt(optional("CLAUDECLAW_MAX_RESPONSE_LENGTH", "4000")),
        sessionTtlDays: parseInt(optional("CLAUDECLAW_SESSION_TTL_DAYS", "7")),
        // Bot's own WhatsApp JID for group mention detection (e.g. "14695885133")
        botJid: optional("CLAUDECLAW_BOT_JID", "14695885133"),
        // Phone numbers of all WAHA sessions — messages FROM these numbers are bot responses,
        // not humans. Prevents cross-session feedback loops (personal ↔ business ping-pong).
        wahaSessionPhones: (process.env.CLAUDECLAW_WAHA_SESSION_PHONES || "14695885133,12144362102").split(",").filter(Boolean),
    },

    wahaSessions: {
        personal: optional("WAHA_SESSION_PERSONAL", "personal"),
        ops: optional("WAHA_SESSION_OPS", "superseller-ops"),
        biz: optional("WAHA_SESSION_BIZ", "superseller-biz"),
        webhookBase: optional("WAHA_WEBHOOK_BASE", "http://172.245.56.50:3002/api/whatsapp"),
    },

    healthMonitor: {
        enabled: optional("HEALTH_CHECK_ENABLED", "false") === "true",
        alertPhone: process.env.HEALTH_MONITOR_ALERT_PHONE || "",
        cooldownMinutes: parseInt(optional("HEALTH_COOLDOWN_MINUTES", "15")),
    },

    rag: {
        systemTenant: optional("RAG_SYSTEM_TENANT", "system"),
        codebaseRoot: optional("RAG_CODEBASE_ROOT", process.cwd()),
    },

    featureFlags: {
        skipUpscale: optional("SKIP_UPSCALE", "") === "1",
        forceNoRealtor: optional("FORCE_NO_REALTOR", "") === "1",
        useAiPhotoMatch: optional("USE_AI_PHOTO_MATCH", "1") !== "0",
        parallelClips: optional("PARALLEL_CLIPS", "true") !== "false",
        useKlingElements: optional("USE_KLING_ELEMENTS", "1") === "1",
        klingSoundEnabled: optional("KLING_SOUND", "") === "1",
    },

    video: {
        defaultModel: "kling_3" as const,
        defaultTransition: "fade" as const,
        defaultClipDuration: 5,
        /** Kling mode: "pro" = 1080p native (quality); "std" = 720p (upscaling causes blur). Set KIE_KLING_MODE=std to revert if Pro causes Kie 500. */
        klingMode: (optional("KIE_KLING_MODE", "pro") || "pro").toLowerCase() === "pro" ? "pro" : "std",
        /** Nano Banana resolution: "4K" = sharper realtor composites for Kling; "2K" = smaller files. NANO_BANANA_RESOLUTION env. */
        nanoBananaResolution: (() => {
            const r = (optional("NANO_BANANA_RESOLUTION", "4K") || "4K").toUpperCase();
            return (r === "1K" || r === "2K" || r === "4K") ? r : "4K";
        })(),
        maxClipsPerVideo: parseInt(optional("MAX_CLIPS", "15")), // Normal: 15 (full tour). Quick smoke: MAX_CLIPS=3
        maxRetriesPerClip: 3,
        maxCostPerVideo: 50.00,
        xfadeDuration: 0.5,
        // OUTPUT_RESOLUTION: "4k" -> 3840x2160, "1080p" or default -> 1920x1080
        outputWidth: (() => {
            const r = (optional("OUTPUT_RESOLUTION", "1080p") || "1080p").toLowerCase();
            return r === "4k" ? 3840 : 1920;
        })(),
        outputHeight: (() => {
            const r = (optional("OUTPUT_RESOLUTION", "1080p") || "1080p").toLowerCase();
            return r === "4k" ? 2160 : 1080;
        })(),
    },
} as const;

export type Config = typeof config;
