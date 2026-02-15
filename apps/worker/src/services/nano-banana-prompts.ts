/**
 * Centralized Nano Banana Pro prompts for realtor placement.
 * Aligns with NotebookLM Zillow-to-Video production instructions.
 * Every property has hero moments — pool when present, or kitchen/fireplace/view/master suite.
 * @see https://notebooklm.google.com/notebook/0baf5f36-7ff0-4550-a878-923dbf59de5c
 */

import type { HeroFeaturesResult } from "./hero-features";
import { isHeroRoom } from "./hero-features";

/** Identity anchor: Ensures the SAME person appears in every room. Per Nano Banana consistency guide. */
export const IDENTITY_ANCHOR =
    "THE EXACT SAME PERSON from the first reference image. Maintain exact facial features, bone structure, skin tone, hair, eyes. Do not alter their appearance. ";

/** POV: Camera = the prospective buyer. The realtor is showing the property TO this person. */
const GUEST_POV = "The camera represents the prospective buyer's eyes. The realtor is welcoming and showing the property TO this person. ";

/** Spatial: person must feel naturally in the scene—correct scale, on floor, in walkable space. */
const SPATIAL_ANCHOR = "The person must be naturally integrated: standing on the floor, correct scale for the room, in the walkable space (not overlapping furniture). ";

/** Opening: Realtor ON the pathway/walkway, walking TOWARD the front door (approach walk). NOT standing at the door. NEVER aerial/drone. Lips closed—no speaking. */
export const NANO_BANANA_OPENING_PROMPT =
    IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR +
    "The realtor ON the pathway or walkway leading to the front door, walking TOWARD the door (approach walk). The realtor is midway along the path—NOT yet at the door. Warm, inviting, lips closed, not speaking. Ground level, eye height. NOT aerial, NOT drone, NOT wide shot from above. Silent—no mouth movement.";

/** Room-specific prompts. Realtor walks WITH the guest, faces them when gesturing. SILENT: lips closed, no speaking. */
export const NANO_BANANA_ROOM_PROMPTS: Record<string, string> = {
    living:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor walking with the guest into the living room, in the open space (not overlapping sofas or tables), then turning to face the guest (camera) to gesture toward the fireplace. Lips closed, silent, no speaking.",
    kitchen:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor at the island, standing on the floor on the guest side, facing the guest (camera) as they run a hand along the surface or gesture at the appliances. Lips closed, silent, no speaking.",
    dining:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor walking with the guest through the dining area, between table and walls, turning to point out features. Lips closed, silent, no speaking.",
    bedroom:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor entering with the guest, stepping aside into the open space and turning to face them to reveal the window view. Lips closed, silent, no speaking.",
    master_bedroom:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor in the primary suite, in the walkable space, turning to face the guest (camera) to gesture at the scale and amenities. Lips closed, silent, no speaking.",
    bathroom:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor at the doorway, one foot over the threshold, briefly facing the guest or visible in the mirror. Lips closed, silent, no speaking.",
    master_bathroom:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor at the en-suite entrance, standing on the floor just inside, turning to face the guest to gesture toward the tub. Lips closed, silent, no speaking.",
    foyer:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor walking with the guest from the entry into the main hall, one step inside the doorway. May turn to welcome or point ahead. Lips closed, silent, no speaking.",
    hallway:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor walking down the corridor with the guest, in the center of the hallway, occasionally turning to gesture. Lips closed, silent, no speaking.",
    outdoor:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor on the patio or deck, standing on the surface, facing the guest (camera) and gesturing toward the view. Standing still or walking along the deck—never toward pool water. Lips closed, silent, no speaking.",
    pool:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor STANDING on the deck or patio, feet on the deck surface, well back from the pool edge. FACING the guest (camera), gesturing toward the pool from a safe distance. Never walking toward the water. Hero moment. Lips closed, silent, no speaking.",
    backyard:
        IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor standing on the patio or lawn, feet on the ground, facing the guest (camera) and gesturing toward the yard or pool from a safe distance. Never walking toward the pool. Lips closed, silent, no speaking.",
};

/** Normalize room name to prompt key (e.g. "Master Bedroom" -> "master_bedroom") */
function toPromptKey(room: string): string {
    return room.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

/** Hero-moment prompts. Realtor FACES the guest (camera) when sharing the moment. SILENT. */
const HERO_ROOM_PROMPTS: Record<string, string> = {
    living: IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor standing in the living room, in the open space, FACING the guest (camera), gesturing toward the fireplace. Hero moment. Lips closed, silent, no speaking.",
    kitchen: IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor at the kitchen island, standing on the floor, facing the guest, running a hand along the surface. Hero moment. Lips closed, silent, no speaking.",
    master_bedroom: IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor in the primary suite, in the walkable space, facing the guest to gesture at scale and amenities. Hero moment. Lips closed, silent, no speaking.",
    master_bathroom: IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor at the en-suite entrance, standing on the floor, facing the guest to gesture toward the tub. Hero moment. Lips closed, silent, no speaking.",
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

    return IDENTITY_ANCHOR + GUEST_POV + SPATIAL_ANCHOR + "The realtor in the room, in the walkable space between furniture, facing or turning to the guest (camera). Lips closed, silent, no speaking. Real estate walkthrough.";
}
