/**
 * Selective Clip Regeneration — Only regenerate bad clips, keep good ones, re-stitch.
 *
 * Mechanism (research-backed):
 * - Use SAME start_frame_url and end_frame_url for each regen clip → Kling interpolates
 *   → preserves continuity with adjacent clips (clip N-1, clip N+1)
 * - Download good clips from R2 (video_url), use regen clips from local
 * - stitchClipsConcat merges [good...] + [regen...] in order → seamless result
 *
 * Usage:
 *   JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts
 *
 * Requires: Completed job with all clips status=complete. DATABASE_URL, R2_*, KIE_API_KEY.
 */
import "dotenv/config";
import { runRegenClips } from "../src/services/regen-clips";

const JOB_ID = process.env.JOB_ID!;
const CLIP_NUMBERS_STR = process.env.CLIP_NUMBERS || "";

async function main() {
    if (!JOB_ID) {
        console.error("Usage: JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts");
        process.exit(1);
    }
    const clipNumbersToRegen = CLIP_NUMBERS_STR
        ? CLIP_NUMBERS_STR.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
        : [];
    if (clipNumbersToRegen.length === 0) {
        console.error("CLIP_NUMBERS required (e.g. CLIP_NUMBERS=2 or CLIP_NUMBERS=2,3)");
        process.exit(1);
    }

    console.log(`Regenerating clips: ${clipNumbersToRegen.join(", ")}. Keeping the rest.`);
    const { masterUrl, duration } = await runRegenClips(JOB_ID, clipNumbersToRegen);
    console.log("\n✅ Selective regeneration complete");
    console.log("   Master URL:", masterUrl);
    console.log("   Duration:", duration.toFixed(1), "s");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
