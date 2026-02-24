/**
 * Room-Specific Negative Prompts
 * Prevents AI from placing inappropriate furniture/objects in wrong rooms.
 * @see TOURREEL_GAP_ANALYSIS.md §8 (Furniture Placement Logic)
 */

const BASE_NEGATIVE = "cartoon, anime, CGI, duplicate person, two people, clone, extra person, different face, wrong furniture, misplaced objects, items on floor, floating objects, blurry, low quality, morphing, wall penetration";

/** Room type negative prompt mappings */
const ROOM_EXCLUSIONS: Record<string, string> = {
    // Kitchen: No bedroom/living/bathroom items
    kitchen: "pillows, bedding, bedroom items, living room furniture, couch, sofa, bathroom fixtures, towels, toilet, shower, bathtub, dirty dishes, food scraps",

    // Bathrooms: No kitchen/bedroom/living items, plus hygiene standards
    bathroom: "kitchen items, appliances, stove, refrigerator, dishes, pillows, bedding, bedroom furniture, chairs (except vanity stool), couch, sofa, toilet seat up, dirty towels, soap scum, hair products scattered",
    primary_bathroom: "kitchen items, appliances, stove, refrigerator, dishes, pillows, bedding, bedroom furniture, chairs (except vanity stool), couch, sofa, toilet seat up, dirty towels, soap scum",

    // Bedrooms: No kitchen/bathroom items, keep it tidy
    bedroom: "kitchen items, appliances, stove, refrigerator, dishes, bathroom fixtures, towels, toilet, shower, unmade bed, messy clothes, clutter",
    primary_bedroom: "kitchen items, appliances, stove, refrigerator, dishes, bathroom fixtures, towels, toilet, shower, unmade bed, messy clothes",

    // Living spaces: No kitchen/bathroom/bedroom items
    living_room: "kitchen items, appliances, stove, refrigerator, dishes, bathroom fixtures, towels, toilet, shower, bedroom furniture, bed, nightstand",
    dining_room: "bathroom fixtures, bedroom furniture, kitchen appliances (except serving pieces)",
    foyer: "bedroom furniture, bathroom fixtures, kitchen appliances",

    // Outdoor: No indoor furniture
    backyard: "indoor furniture, kitchen appliances, bathroom fixtures, bedroom furniture, rain, cloudy sky, dead plants, brown lawn, trash",
    pool: "indoor furniture, kitchen appliances, bathroom fixtures, bedroom furniture, rain, cloudy sky, dead plants, trash",

    // Office/Den: No kitchen/bathroom items
    office: "kitchen appliances, bathroom fixtures, unmade bed, bedroom furniture (except if office is in bedroom)",
    den: "kitchen appliances, bathroom fixtures",

    // Utility spaces
    laundry_room: "bedroom furniture, living room furniture, bathroom fixtures (except utility sink)",
    garage: "bedroom furniture, bathroom fixtures, kitchen appliances, living room furniture",

    // Closets: Organized only
    walk_in_closet: "bathroom fixtures, kitchen items, unmade bed, messy clothes on floor",
    closet: "bathroom fixtures, kitchen items, unmade bed, messy clothes on floor",
};

/**
 * Get room-specific negative prompt for a room name/type.
 * Falls back to base negative if room type not recognized.
 */
export function getRoomSpecificNegativePrompt(roomName: string): string {
    const normalized = roomName.toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z_]/g, "");

    // Try exact match first
    if (ROOM_EXCLUSIONS[normalized]) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS[normalized]}`;
    }

    // Try partial matches for common patterns
    if (normalized.includes("kitchen")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.kitchen}`;
    }
    if (normalized.includes("bathroom") || normalized.includes("bath")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.bathroom}`;
    }
    if (normalized.includes("bedroom") || normalized.includes("bed_")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.bedroom}`;
    }
    if (normalized.includes("living")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.living_room}`;
    }
    if (normalized.includes("dining")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.dining_room}`;
    }
    if (normalized.includes("pool") || normalized.includes("backyard") || normalized.includes("outdoor") || normalized.includes("patio")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.backyard}`;
    }
    if (normalized.includes("office") || normalized.includes("den") || normalized.includes("study")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.office}`;
    }
    if (normalized.includes("closet")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.walk_in_closet}`;
    }
    if (normalized.includes("garage")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.garage}`;
    }
    if (normalized.includes("laundry")) {
        return `${BASE_NEGATIVE}, ${ROOM_EXCLUSIONS.laundry_room}`;
    }

    // Fallback: base negative only
    return BASE_NEGATIVE;
}

/**
 * Get negative prompt with additional custom exclusions.
 * Useful for property-specific constraints (e.g., "no pool" for poolless properties).
 */
export function getRoomNegativeWithCustom(roomName: string, customExclusions: string): string {
    const roomNeg = getRoomSpecificNegativePrompt(roomName);
    return customExclusions ? `${roomNeg}, ${customExclusions}` : roomNeg;
}
