/**
 * Dry-run validation: pipeline logic up to (but not including) Nano Banana and Kling.
 * Validates: hero features, tour sequence, clip prompts, opening photo selection.
 *
 * Usage: cd apps/worker && npx tsx tools/dry-run-pipeline.ts [JOB_ID]
 *
 * Flags:
 *   --free       Skip all API calls (Gemini). Only runs: hero features, tour sequence.
 *   --skip-llm   Skip generateClipPrompts (saves chat credits).
 *   --skip-vision Skip pickBestApproachPhotoForOpening (saves vision credits).
 *
 * Examples:
 *   JOB_ID=50f4efac-e55d-4157-8ce8-db4ff8fbcf55 npx tsx tools/dry-run-pipeline.ts
 *   npx tsx tools/dry-run-pipeline.ts --free 50f4efac-e55d-4157-8ce8-db4ff8fbcf55
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const flags = process.argv.slice(2).filter((a) => a.startsWith("-"));
const JOB_ID = process.env.JOB_ID || args[0];
const FREE = flags.includes("--free");
const SKIP_LLM = flags.includes("--skip-llm") || FREE;
const SKIP_VISION = flags.includes("--skip-vision") || FREE;

function extractPhotoUrl(p: unknown): string | null {
    if (typeof p === "string" && p.startsWith("http")) return p;
    if (p && typeof p === "object" && typeof (p as any).url === "string") return (p as any).url;
    return null;
}

async function main() {
    const { queryOne } = await import("../src/db/client");
    const { getDefaultSequence, buildTourSequenceFromRoomNames } = await import(
        "../src/services/floorplan-analyzer"
    );
    const heroModule = await import("../src/services/hero-features");

    if (!JOB_ID) {
        console.error("Usage: JOB_ID=xxx npx tsx tools/dry-run-pipeline.ts");
        console.error("   or: npx tsx tools/dry-run-pipeline.ts <JOB_ID>");
        console.error("\nFlags: --free (no API), --skip-llm, --skip-vision");
        process.exit(1);
    }

    const job = await queryOne<any>(
        "SELECT id, listing_id, user_id, tour_sequence AS job_tour_sequence FROM video_jobs WHERE id = $1",
        [JOB_ID]
    );
    if (!job) {
        console.error("Job not found:", JOB_ID);
        process.exit(1);
    }

    const listing = await queryOne<any>("SELECT * FROM listings WHERE id = $1", [job.listing_id]);
    if (!listing) {
        console.error("Listing not found for job");
        process.exit(1);
    }

    console.log("\n=== DRY RUN: Pipeline Validation (no Nano Banana / Kling) ===\n");
    console.log("Job:", JOB_ID);
    console.log("Address:", listing.address);
    console.log("Flags: free=%s skip-llm=%s skip-vision=%s\n", FREE, SKIP_LLM, SKIP_VISION);

    // 1. Hero features (no API)
    const heroInput = {
        ...(listing.floorplan_analysis || {}),
        description: listing.description,
        amenities: listing.amenities,
    };
    const heroResult = heroModule.deriveHeroFeatures(heroInput);
    console.log("1. HERO FEATURES (free)");
    console.log("   hasPool:", heroResult.hasPool);
    console.log("   heroFeatures:", heroResult.heroFeatures);
    console.log("   primaryHero:", heroResult.primaryHero);

    // 2. Tour sequence (no API for Zillow/default path)
    let tourRooms = job.job_tour_sequence || [];
    if (!tourRooms.length) {
        const propType = (listing.property_type || "house").toLowerCase().replace(/\s+/g, "_");
        const beds = Math.max(1, Number(listing.bedrooms) || 3);
        const baths = Math.max(1, Number(listing.bathrooms) || 2);
        const roomNames = getDefaultSequence(propType, beds, baths, heroResult.hasPool);
        tourRooms = buildTourSequenceFromRoomNames(roomNames);
    }
    console.log("\n2. TOUR SEQUENCE (free)");
    console.log("   rooms:", tourRooms.length);
    tourRooms.forEach((r: any, i: number) => {
        console.log(`   ${i + 1}. ${r.from} → ${r.to}`);
    });

    // 3. Clip prompts (Gemini chat — use --skip-llm to avoid)
    let prompts: any[] = [];
    if (!SKIP_LLM) {
        const { generateClipPrompts } = await import("../src/services/prompt-generator");
        prompts = await generateClipPrompts(tourRooms, {
            property_type: listing.property_type,
            description: listing.description || listing.address,
            style: listing.music_style,
            includeRealtor: true,
            resoFacts: listing.floorplan_analysis?.property_characteristics || {},
            amenities: listing.floorplan_analysis?.rooms?.map((r: any) => r.name) || [],
            heroFeatures: heroResult.heroFeatures,
        });
        console.log("\n3. CLIP PROMPTS (Gemini chat)");
        prompts.forEach((p: any, i: number) => {
            const preview = (p.prompt || "").substring(0, 80) + "...";
            console.log(`   ${i + 1}. ${p.from_room} → ${p.to_room}: ${preview}`);
        });
    } else {
        console.log("\n3. CLIP PROMPTS (skipped --skip-llm)");
        prompts = tourRooms.slice(0, -1).map((r: any, i: number) => ({
            clip_number: i + 1,
            from_room: r.from,
            to_room: r.to,
        }));
    }

    // 4. Opening photo selection (Gemini vision — use --skip-vision to avoid)
    let openingIdx = 0;
    const rawPhotos = listing.additional_photos;
    let additionalPhotos: string[] = [];
    if (Array.isArray(rawPhotos)) {
        additionalPhotos = rawPhotos.map((p: any) => extractPhotoUrl(p)).filter((u): u is string => !!u);
    } else if (typeof rawPhotos === "string") {
        try {
            const parsed = JSON.parse(rawPhotos);
            const arr = Array.isArray(parsed) ? parsed : parsed?.urls || parsed?.photos || [];
            additionalPhotos = arr.map(extractPhotoUrl).filter((u: any): u is string => !!u);
        } catch (_) {}
    }
    const exteriorUrl = extractPhotoUrl(listing.exterior_photo_url) ?? null;
    const openingCandidates = [exteriorUrl, ...additionalPhotos.slice(0, 2)].filter(
        (u): u is string => !!u
    );

    if (!SKIP_VISION && openingCandidates.length >= 1) {
        const { pickBestApproachPhotoForOpening } = await import("../src/services/gemini");
        openingIdx = await pickBestApproachPhotoForOpening(openingCandidates);
        console.log("\n4. OPENING PHOTO (Gemini vision)");
        console.log("   Selected index:", openingIdx);
        console.log(
            "   Source:",
            openingIdx === 0 ? "exterior_photo_url" : `additional_photos[${openingIdx - 1}]`
        );
    } else {
        console.log("\n4. OPENING PHOTO (skipped --skip-vision, using index 0)");
    }

    // 5. Verification checks (3-scene success criteria)
    console.log("\n5. VERIFICATION CHECKS (3-scene criteria)");
    const firstRoom = tourRooms[0];
    const startsExterior = firstRoom?.from?.toLowerCase().includes("exterior") ?? false;
    const firstPrompt = prompts[0]?.prompt || "";
    const hasPathway = /pathway|walkway|approach|walking toward/i.test(firstPrompt);
    const hasSilent = /lips closed|silent|no speaking|not speaking/i.test(firstPrompt);
    console.log("   Tour starts Exterior Front:", startsExterior ? "✓" : "✗");
    console.log("   Clip 1 mentions pathway/walkway/approach:", hasPathway ? "✓" : SKIP_LLM ? "N/A (run without --free)" : "✗");
    console.log("   Clip 1 mentions lips closed/silent:", hasSilent ? "✓" : SKIP_LLM ? "N/A (run without --free)" : "✗");
    if (!startsExterior) {
        console.log("   ⚠️  Tour must start with Exterior Front. Check floorplan/default sequence.");
    }
    if (!SKIP_LLM && (!hasPathway || !hasSilent)) {
        console.log("   ⚠️  Prompt checks failed. Review prompt-generator.ts before smoke.");
    }

    console.log("\n=== DRY RUN COMPLETE ===");
    console.log("No Nano Banana or Kling calls. Ready for full smoke when satisfied.\n");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
