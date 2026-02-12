/**
 * Centralized Nano Banana Pro prompts for realtor placement.
 * Aligns with NotebookLM Zillow-to-Video production instructions.
 * Every property has hero moments — pool when present, or kitchen/fireplace/view/master suite.
 * @see https://notebooklm.google.com/notebook/0baf5f36-7ff0-4550-a878-923dbf59de5c
 */

import type { HeroFeaturesResult } from "./hero-features";
import { isHeroRoom } from "./hero-features";

/** Opening shot: Realtor walking FROM front of house TOWARD front door (approach walk). */
export const NANO_BANANA_OPENING_PROMPT =
    "Professional guide from reference photo walking along the walkway from the front of the house toward the front door, leading the camera in a steady approach. Natural stride, 5-8 feet ahead of the camera, acting as a magnet pulling the viewer in. No posing. Real estate cinematography.";

/** Room-specific prompts for realtor placement. Pool gets Hero Moment treatment. */
export const NANO_BANANA_ROOM_PROMPTS: Record<string, string> = {
    living:
        "The guide from reference photo walking into the living room, leading the camera towards the fireplace. Natural stride.",
    kitchen:
        "The guide from reference photo standing near the island, glancing at the appliances. No posing.",
    dining:
        "The guide from reference photo leading the way through the dining area. Professional conduct.",
    bedroom:
        "The guide from reference photo entering the bedroom, stepping to the side to reveal the window view.",
    master_bedroom:
        "The guide from reference photo walking into the primary suite, gesturing towards the scale of the room.",
    bathroom:
        "The guide from reference photo briefly visible in the mirror or doorway, keeping focus on the fixtures.",
    master_bathroom:
        "The guide from reference photo at the entrance of the en-suite, stepping aside to show the tub.",
    foyer:
        "The guide from reference photo leading the camera from the entry into the main hall.",
    hallway:
        "The guide from reference photo walking down the corridor at a steady pace.",
    outdoor:
        "The guide from reference photo walking toward the pool or garden, looking ahead. Natural. Leading the camera to the outdoor space.",
    pool:
        "The guide from reference photo on the deck, gesturing toward the sparkling pool with a 'Can you believe this?' expression. Hero moment, lifestyle sell. Silent hype. Main focus on the water features.",
    backyard:
        "The guide from reference photo walking into the backyard, leading the camera. If pool is visible, gesture toward it as the hero feature.",
};

/** Normalize room name to prompt key (e.g. "Master Bedroom" -> "master_bedroom") */
function toPromptKey(room: string): string {
    return room.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

/** Hero-moment prompts for non-pool features. Every room can be a hero. */
const HERO_ROOM_PROMPTS: Record<string, string> = {
    living: "The guide from reference photo in the living room, gesturing toward the fireplace or view with a 'Can you believe this?' expression. Hero moment. Silent hype.",
    kitchen: "The guide from reference photo at the kitchen island, running a hand along the surface. Hero moment — touching the luxury. Gesture toward appliances or view.",
    master_bedroom: "The guide from reference photo in the primary suite, gesturing toward the scale and amenities. Hero moment. Silent hype.",
    master_bathroom: "The guide from reference photo at the en-suite entrance, gesturing toward the tub or rain shower. Hero moment.",
};

export function getNanoBananaRoomPrompt(
    toRoom: string,
    hasPool?: boolean,
    heroResult?: HeroFeaturesResult | null
): string {
    const key = toPromptKey(toRoom);
    const exact = NANO_BANANA_ROOM_PROMPTS[key];
    if (exact && !heroResult) return exact;

    // Hero override: when this room is a hero room, use hero treatment
    if (heroResult && isHeroRoom(toRoom, heroResult)) {
        if (key.includes("kitchen")) return HERO_ROOM_PROMPTS.kitchen;
        if (key.includes("living")) return HERO_ROOM_PROMPTS.living;
        if (key.includes("master_bedroom") || key.includes("masterbedroom")) return HERO_ROOM_PROMPTS.master_bedroom;
        if (key.includes("master_bathroom") || key.includes("masterbathroom")) return HERO_ROOM_PROMPTS.master_bathroom;
    }

    if (exact) return exact;

    // Fuzzy match: "pool area", "Pool", "backyard/pool" etc.
    if (key.includes("pool")) return NANO_BANANA_ROOM_PROMPTS.pool;
    if (key.includes("backyard"))
        return hasPool ? NANO_BANANA_ROOM_PROMPTS.backyard : NANO_BANANA_ROOM_PROMPTS.outdoor;
    if (key.includes("outdoor") || key.includes("patio") || key.includes("deck"))
        return NANO_BANANA_ROOM_PROMPTS.outdoor;

    return "The guide from reference photo in room. Natural pose. Real estate cinematography.";
}
