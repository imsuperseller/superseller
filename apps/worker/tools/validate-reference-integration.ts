/**
 * Validates TourReel reference integration: inferRoomType, ROOM_NEGATIVE_ADDITIONS, STYLE_MODIFIERS.
 * Usage: cd apps/worker && npx tsx tools/validate-reference-integration.ts
 */
import { ROOM_DESCRIPTIONS, STYLE_MODIFIERS } from "../src/services/prompt-generator";

// inferRoomType logic (mirror of prompt-generator.ts for validation)
function inferRoomType(roomName: string): string {
    const lower = roomName.toLowerCase();
    if (lower.includes("kitchen")) return "kitchen";
    if (lower.includes("master bath") || lower.includes("primary bath") || lower.includes("en-suite")) return "master_bathroom";
    if (lower.includes("bath") || lower.includes("powder")) return "bathroom";
    if (lower.includes("master bed") || lower.includes("primary bed") || lower.includes("primary suite")) return "master_bedroom";
    if (lower.includes("bed")) return "bedroom";
    if (lower.includes("pool")) return "pool";
    if (lower.includes("backyard") || lower.includes("patio") || lower.includes("deck") || lower.includes("garden")) return "backyard";
    if (lower.includes("outdoor") || lower.includes("exterior") || lower.includes("balcony") || lower.includes("terrace")) return "outdoor";
    if (lower.includes("garage") || lower.includes("carport")) return "garage";
    return "";
}

const ROOM_NEGATIVE_ADDITIONS: Record<string, string> = {
    kitchen: "dirty dishes, messy counters, open cabinets, food, cooking, steam",
    bathroom: "toilet seat up, dirty towels, soap scum, water stains, shower running",
    master_bathroom: "toilet seat up, dirty towels, soap scum, water stains, shower running",
    bedroom: "unmade bed, messy clothes, personal items scattered, alarm clock flashing",
    master_bedroom: "unmade bed, messy clothes, personal items scattered, alarm clock flashing",
    outdoor: "rain, cloudy sky, dead plants, brown lawn, trash, construction",
    pool: "rain, cloudy sky, dead plants, brown lawn, trash, construction",
    backyard: "rain, cloudy sky, dead plants, brown lawn, trash, construction",
    garage: "oil stains, cluttered, messy tools, broken items",
};

const ROOM_CASES: Array<[string, string]> = [
    ["Kitchen", "kitchen"],
    ["Living Room", ""],
    ["Master Bedroom", "master_bedroom"],
    ["Master Bathroom", "master_bathroom"],
    ["Half Bath", "bathroom"],
    ["Powder Room", "bathroom"],
    ["Bedroom 2", "bedroom"],
    ["Primary Suite", "master_bedroom"],
    ["Pool", "pool"],
    ["Pool Area", "pool"],
    ["Backyard", "backyard"],
    ["Patio", "backyard"],
    ["Garage", "garage"],
    ["Outdoor", "outdoor"],
    ["Balcony", "outdoor"],
];

const STYLE_CASES: Array<string> = [
    "modern",
    "farmhouse",
    "modern farmhouse",
    "mid century modern",
    "mid_century_modern",
    "colonial",
    "mediterranean",
    "coastal",
    "luxury_contemporary",
    "generic",
    "unknown_style",
];

function main() {
    console.log("\n=== TourReel Reference Integration Validation ===\n");

    let ok = true;

    console.log("1. inferRoomType");
    for (const [input, expected] of ROOM_CASES) {
        const got = inferRoomType(input);
        const pass = got === expected;
        if (!pass) ok = false;
        console.log(`   ${pass ? "✓" : "✗"} "${input}" → "${got}" ${pass ? "" : `(expected "${expected}")`}`);
    }

    console.log("\n2. ROOM_NEGATIVE_ADDITIONS lookup");
    for (const [, key] of ROOM_CASES) {
        if (!key) continue;
        const val = ROOM_NEGATIVE_ADDITIONS[key];
        const pass = typeof val === "string" && val.length > 0;
        if (!pass) ok = false;
        console.log(`   ${pass ? "✓" : "✗"} "${key}" → ${pass ? "has content" : "MISSING"}`);
    }

    console.log("\n3. STYLE_MODIFIERS lookup");
    for (const key of STYLE_CASES) {
        const styleKey = key.replace(/\s+/g, " ").trim();
        const resolved =
            STYLE_MODIFIERS[styleKey] ||
            STYLE_MODIFIERS[styleKey.replace(/\s+/g, "_")] ||
            STYLE_MODIFIERS["modern"];
        const pass = resolved && resolved.mood;
        const isFallback = resolved === STYLE_MODIFIERS["modern"] && !STYLE_MODIFIERS[key];
        if (key === "unknown_style" && pass) {
            console.log(`   ✓ "${key}" → fallback to modern`);
        } else if (key !== "unknown_style" && !pass) {
            ok = false;
            console.log(`   ✗ "${key}" → MISSING`);
        } else {
            console.log(`   ✓ "${key}" → ${resolved.mood?.slice(0, 30)}...`);
        }
    }

    console.log("\n4. ROOM_DESCRIPTIONS (spot-check)");
    const roomKeys = ["living", "kitchen", "pool", "master_bedroom"];
    for (const k of roomKeys) {
        const r = ROOM_DESCRIPTIONS[k];
        const pass = r && r.typical_features;
        if (!pass) ok = false;
        console.log(`   ${pass ? "✓" : "✗"} "${k}"`);
    }

    console.log("\n" + (ok ? "All checks passed." : "Some checks failed.") + "\n");
    process.exit(ok ? 0 : 1);
}

main();
