/**
 * Hero Features — every property gets a main focus.
 * When no pool (or pool isn't impressive), we elevate other selling points.
 * @see NotebookLM Zillow-to-Video production instructions
 */

export type HeroFeature =
    | "pool"
    | "fireplace"
    | "kitchen_island"
    | "view"
    | "master_suite"
    | "wine_cellar"
    | "vaulted_ceiling"
    | "custom_fireplace"
    | "spa_bath";

/** Priority order for hero features. Pool is #1 when present; otherwise use these. */
const HERO_PRIORITY: HeroFeature[] = [
    "pool",
    "kitchen_island",
    "fireplace",
    "custom_fireplace",
    "view",
    "master_suite",
    "wine_cellar",
    "spa_bath",
    "vaulted_ceiling",
];

/** Map special_features / notable_features strings to HeroFeature */
const FEATURE_MAP: Record<string, HeroFeature> = {
    pool: "pool",
    fireplace: "fireplace",
    "custom fireplace": "custom_fireplace",
    "island kitchen": "kitchen_island",
    "kitchen island": "kitchen_island",
    "island": "kitchen_island",
    view: "view",
    "large windows": "view",
    "floor-to-ceiling": "view",
    "master suite": "master_suite",
    "master bedroom": "master_suite",
    "wine cellar": "wine_cellar",
    "wine fridge": "wine_cellar",
    "vaulted ceiling": "vaulted_ceiling",
    "vaulted ceilings": "vaulted_ceiling",
    "spa": "spa_bath",
    "rain shower": "spa_bath",
    "soaking tub": "spa_bath",
};

/** Room types that correspond to hero features */
export const HERO_ROOM_MAP: Partial<Record<HeroFeature, string>> = {
    pool: "pool",
    fireplace: "living",
    custom_fireplace: "living",
    kitchen_island: "kitchen",
    view: "living", // often living room or master
    master_suite: "master_bedroom",
    wine_cellar: "other",
    spa_bath: "master_bathroom",
    vaulted_ceiling: "living",
};

export interface HeroFeaturesResult {
    /** Top 3 hero features for this property */
    heroFeatures: HeroFeature[];
    /** Primary hero (for finale / Big Reveal) */
    primaryHero: HeroFeature | null;
    hasPool: boolean;
}

const POOL_INDICATORS = ["pool", "swimming pool", "in-ground pool", "in ground pool", "salt water pool"];

function textIndicatesPool(text: string | null | undefined): boolean {
    if (!text) return false;
    const lower = String(text).toLowerCase();
    return POOL_INDICATORS.some((p) => lower.includes(p));
}

/**
 * Derive hero features from floorplan analysis and/or listing description/amenities.
 * For Zillow (no floorplan), description and amenities are used for pool detection.
 */
export function deriveHeroFeatures(input: {
    special_features?: string[];
    rooms?: Array<{ notable_features?: string[] }>;
    description?: string | null;
    amenities?: string[] | { factLabel?: string; factValue?: string }[] | null;
}): HeroFeaturesResult {
    const analysis = input as { special_features?: string[]; rooms?: Array<{ notable_features?: string[] }> };
    const seen = new Set<HeroFeature>();
    const heroFeatures: HeroFeature[] = [];
    const sf = (analysis.special_features || []).map((s) => String(s).toLowerCase().trim());
    const roomNotable = (analysis.rooms || [])
        .flatMap((r) => (r.notable_features || []).map((n) => String(n).toLowerCase().trim()));

    // Pool from listing (Zillow) when no floorplan
    const amenitiesArr = Array.isArray(input.amenities) ? input.amenities : [];
    const amenitiesStr = amenitiesArr
        .map((a) => (typeof a === "string" ? a : `${(a as any).factLabel || ""} ${(a as any).factValue || ""}`))
        .join(" ");
    const hasPoolFromListing = textIndicatesPool(input.description) || textIndicatesPool(amenitiesStr);

    for (const hf of HERO_PRIORITY) {
        if (seen.has(hf)) continue;
        const keys = Object.entries(FEATURE_MAP)
            .filter(([, v]) => v === hf)
            .map(([k]) => k);
        let hasFeature = keys.some(
            (k) => sf.some((s) => s.includes(k)) || roomNotable.some((n) => n.includes(k))
        );
        if (hf === "pool" && hasPoolFromListing) hasFeature = true;
        if (hasFeature) {
            seen.add(hf);
            heroFeatures.push(hf);
        }
    }

    if (heroFeatures.length === 0) {
        heroFeatures.push("kitchen_island", "master_suite");
    }

    const primaryHero = heroFeatures[0] ?? null;
    const hasPool = heroFeatures.includes("pool");

    return {
        heroFeatures: heroFeatures.slice(0, 3),
        primaryHero,
        hasPool,
    };
}

/** Check if a room is a hero room for this property */
export function isHeroRoom(
    toRoom: string,
    heroResult: HeroFeaturesResult
): boolean {
    const roomKey = toRoom.toLowerCase().replace(/\s+/g, "_");
    for (const hf of heroResult.heroFeatures) {
        const mappedRoom = HERO_ROOM_MAP[hf];
        if (mappedRoom && (roomKey.includes(mappedRoom) || roomKey === hf)) return true;
    }
    if (roomKey.includes("pool")) return heroResult.hasPool;
    if (roomKey.includes("kitchen")) return heroResult.heroFeatures.includes("kitchen_island");
    if (roomKey.includes("living")) return heroResult.heroFeatures.some((f) => ["fireplace", "custom_fireplace", "view", "vaulted_ceiling"].includes(f));
    if (roomKey.includes("master_bedroom") || roomKey.includes("master bedroom")) return heroResult.heroFeatures.includes("master_suite");
    if (roomKey.includes("master_bathroom") || roomKey.includes("master bathroom")) return heroResult.heroFeatures.includes("spa_bath");
    return false;
}
