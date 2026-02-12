import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { geminiChatCompletion } from "../../src/services/gemini";
import { logger } from "../../src/utils/logger";

async function verifyAI() {
    logger.info("🔍 Verifying AI Services (2026 SOTA)...");

    try {
        const result = await geminiChatCompletion([
            { role: "user", content: "Say 'TourReel AI Operational (2026 SOTA - Gemini 3.0)'" }
        ], {
            model: "google/gemini-3-pro",
            temperature: 0.1
        });
        logger.info("✅ Gemini 3 Pro: " + result.content.trim());
    } catch (err: any) {
        logger.error("❌ Gemini 3 Pro: Failed - " + err.message);
    }

    logger.info("ℹ️ Video model (Kling 3.0) verification should be done via real job submission.");
}

verifyAI();
