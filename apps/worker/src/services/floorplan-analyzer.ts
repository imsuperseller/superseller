import { geminiVisionAnalysis as visionAnalysis } from "./gemini";
import { FloorplanAnalysis, TourRoom } from "../types";
import { logger } from "../utils/logger";

const FLOORPLAN_PROMPT = `You are an expert real estate floorplan analyst specializing in property walkthrough planning. Analyze this floorplan image carefully and extract detailed room information for generating a cinematic property tour video.

Property context: {{PROPERTY_TYPE_CONTEXT}}

Analyze the floorplan and return a JSON object with this EXACT structure:

{
  "rooms": [
    {
      "name": "Living Room",
      "type": "living",
      "approximate_position": { "x": 0.4, "y": 0.5 },
      "approximate_size": "large",
      "connects_to": ["Foyer", "Kitchen", "Dining Room"],
      "notable_features": ["fireplace", "large windows", "vaulted ceiling"],
      "floor": 1
    }
  ],
  "suggested_tour_sequence": [
    "Exterior Front",
    "Front Door",
    "Foyer",
    "Living Room",
    "Kitchen",
    "Dining Room",
    "Master Bedroom",
    "Master Bathroom",
    "Bedroom 2",
    "Bathroom 2",
    "Backyard",
    "Pool"
  ],
  "total_rooms": 9,
  "property_type": "house",
  "architectural_style": "modern farmhouse",
  "floors": 2,
  "special_features": ["pool", "garage", "balcony", "fireplace", "island kitchen"],
  "natural_light_direction": "south-facing",
  "estimated_sqft_per_floor": [1800, 1200],
  "confidence_score": 0.85
}

CRITICAL RULES for the tour sequence:
1. ALWAYS start with "Exterior Front" → "Front Door" (the approach shot — realtor walks from front of house toward door)
2. After entering, follow a LOGICAL WALKING PATH — never teleport between disconnected rooms
3. Prefer this general flow: entrance → main living areas → kitchen/dining → bedrooms → bathrooms → outdoor spaces
4. Group rooms by proximity — visit adjacent rooms before moving to distant ones
5. STAIRS: Add "Stairs" ONLY if the floorplan CLEARLY shows multiple floors (e.g. second level, upper bedrooms). For single-story/ranch layouts, NEVER add Stairs. Do NOT invent stairs.
6. POOL: Add "Pool" ONLY if the floorplan CLEARLY shows a pool (labeled pool, distinct pool shape). Do NOT assume pool from generic outdoor space. At most ONE "Pool" room.
7. End with outdoor spaces. At most ONE "Backyard" and ONE "Pool" — never duplicate (no "Pool Deck", "Pool Area" as separate rooms). Order: Backyard → Pool when both exist.
8. Never include utility rooms (HVAC closet, electrical panel) unless they are a notable feature
9. Include hallways ONLY if they are architecturally significant or necessary for the walking path
10. Bathrooms should follow their associated bedrooms (Master Bedroom → Master Bathroom)
11. The kitchen and dining room should be adjacent in sequence since they usually connect
12. DO NOT invent or hallucinate: Only include rooms and features VISIBLY present in the floorplan. No assumed furniture, finishes, or layout.

Room type classifications (use exactly these):
- "living", "kitchen", "dining", "bedroom", "bathroom", "foyer", "hallway", "office", "laundry", "garage", "outdoor", "stairs", "closet", "bonus", "other"

Size classifications:
- "small" (<100sqft), "medium" (100-200sqft), "large" (200-400sqft), "extra_large" (>400sqft)

Return ONLY valid JSON. No markdown code fences. No explanation text.`;

export async function analyzeFloorplan(
    floorplanUrl: string,
    listing?: {
        property_type?: string;
        bedrooms?: number;
        bathrooms?: number;
        sqft?: number;
        city?: string;
        state?: string;
    }
): Promise<FloorplanAnalysis> {
    const propertyContext = buildPropertyContext(listing);
    const prompt = FLOORPLAN_PROMPT.replace("{{PROPERTY_TYPE_CONTEXT}}", propertyContext);

    logger.info({ msg: "Analyzing floorplan", url: floorplanUrl });

    try {
        const { content, cost } = await visionAnalysis(floorplanUrl, prompt);

        try {
            let jsonStr = content.trim();
            if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
            }

            const analysis: FloorplanAnalysis = JSON.parse(jsonStr);

            if (analysis.confidence_score < 0.5) {
                logger.warn({ msg: "Floorplan analysis confidence low", score: analysis.confidence_score });
                // We'll still return it but flag in logs
            }

            logger.info({
                msg: "Floorplan analysis complete",
                rooms: analysis.total_rooms,
                floors: analysis.floors,
                confidence: analysis.confidence_score,
            });

            return analysis;
        } catch (err) {
            logger.error({ msg: "Failed to parse floorplan analysis", content: content.substring(0, 500) });
            throw new Error("Floorplan analysis returned invalid JSON");
        }
    } catch (visionError: any) {
        // Fallback to default sequence when Gemini Vision fails (e.g., Kie.ai outage)
        logger.warn({
            msg: "Gemini Vision failed, using default tour sequence as fallback",
            error: visionError.message,
            listing: { propertyType: listing?.property_type, beds: listing?.bedrooms, baths: listing?.bathrooms }
        });

        const propertyType = listing?.property_type || "house";
        const bedrooms = listing?.bedrooms || 3;
        const bathrooms = listing?.bathrooms || 2;
        const sequence = getDefaultSequence(propertyType, bedrooms, bathrooms, false, false);

        return {
            rooms: sequence.map((name, idx) => ({
                name,
                type: inferRoomType(name),
                approximate_position: { x: 0.5, y: 0.5 },
                approximate_size: "medium",
                connects_to: [],
                notable_features: [],
                floor: 1
            })),
            suggested_tour_sequence: sequence,
            total_rooms: sequence.length,
            property_type: propertyType,
            floors: sequence.some(r => r.toLowerCase().includes("stair")) ? 2 : 1,
            special_features: [],
            confidence_score: 0.3 // Low confidence since fallback
        };
    }
}

function inferRoomType(name: string): string {
    const n = name.toLowerCase();
    if (n.includes("living")) return "living";
    if (n.includes("kitchen")) return "kitchen";
    if (n.includes("bedroom") || n.includes("master")) return "bedroom";
    if (n.includes("bathroom") || n.includes("bath")) return "bathroom";
    if (n.includes("dining")) return "dining";
    if (n.includes("exterior") || n.includes("front")) return "exterior";
    if (n.includes("pool")) return "pool";
    if (n.includes("backyard") || n.includes("patio") || n.includes("deck")) return "outdoor";
    if (n.includes("foyer") || n.includes("entry") || n.includes("hallway")) return "hallway";
    if (n.includes("garage")) return "garage";
    if (n.includes("office") || n.includes("study")) return "office";
    if (n.includes("family")) return "family";
    if (n.includes("laundry")) return "laundry";
    if (n.includes("stair")) return "stairs";
    return "other";
}

function buildPropertyContext(listing?: any): string {
    const parts: string[] = [];
    if (!listing) return "No additional property details available.";

    if (listing.property_type) parts.push(`Property type: ${listing.property_type}`);
    if (listing.bedrooms) parts.push(`${listing.bedrooms} bedrooms`);
    if (listing.bathrooms) parts.push(`${listing.bathrooms} bathrooms`);
    if (listing.sqft) parts.push(`${listing.sqft} sqft`);
    if (listing.city && listing.state) parts.push(`Location: ${listing.city}, ${listing.state}`);

    return parts.length > 0
        ? parts.join(". ") + "."
        : "No additional property details available.";
}

/** Collapse duplicate pool rooms — at most one Pool (no Pool Deck, Pool Area as separate clips). */
function dedupePoolRooms(roomNames: string[]): string[] {
    const poolLike = /^(pool|pool deck|pool area|pool patio)$/i;
    let seenPool = false;
    return roomNames.filter((r) => {
        if (poolLike.test(r.trim())) {
            if (seenPool) return false;
            seenPool = true;
        }
        return true;
    });
}

/**
 * Validate tour sequence against adjacency data. Log warnings for teleportation
 * (consecutive rooms that are not connected). Falls back to suggested sequence
 * even if validation fails — the video will still generate, just with potential spatial issues.
 */
function validateTourAdjacency(
    sequence: string[],
    rooms: Array<{ name: string; connects_to?: string[] }> | undefined
): { valid: boolean; teleports: string[] } {
    if (!rooms || rooms.length === 0) return { valid: true, teleports: [] };
    const teleports: string[] = [];
    const adjacencyMap = new Map<string, Set<string>>();
    for (const room of rooms) {
        const key = room.name.toLowerCase();
        const connections = new Set((room.connects_to || []).map((c) => c.toLowerCase()));
        adjacencyMap.set(key, connections);
    }
    for (let i = 0; i < sequence.length - 1; i++) {
        const from = sequence[i].toLowerCase();
        const to = sequence[i + 1].toLowerCase();
        // Skip exterior/front door — they're not in the floorplan adjacency
        if (from.includes("exterior") || from.includes("front door") || to.includes("exterior") || to.includes("front door")) continue;
        const fromConnections = adjacencyMap.get(from);
        if (fromConnections && !fromConnections.has(to)) {
            // Check if connected via a common intermediate (hallway)
            let hasIntermediate = false;
            for (const [roomName, conns] of adjacencyMap) {
                if (fromConnections.has(roomName) && conns.has(to)) {
                    hasIntermediate = true;
                    break;
                }
            }
            if (!hasIntermediate) {
                teleports.push(`${sequence[i]} → ${sequence[i + 1]}`);
            }
        }
    }
    return { valid: teleports.length === 0, teleports };
}

/**
 * Sanity check: room count in analysis vs listing data. Warns if floor plan claims
 * significantly more rooms than the listing suggests.
 */
function validateRoomCount(
    analysisRoomCount: number,
    bedrooms?: number,
    bathrooms?: number
): boolean {
    if (!bedrooms) return true;
    // Expected rooms: beds + baths + ~4 common rooms (living, kitchen, dining, foyer)
    const expectedMax = (bedrooms || 3) + (bathrooms || 2) + 6;
    if (analysisRoomCount > expectedMax * 1.5) {
        logger.warn({ msg: "Floor plan analysis may have hallucinated rooms", analysisRoomCount, expectedMax });
        return false;
    }
    return true;
}

export function buildTourSequence(
    analysis: FloorplanAnalysis,
    listing?: { bedrooms?: number; bathrooms?: number }
): TourRoom[] {
    let seq = dedupePoolRooms(analysis.suggested_tour_sequence || []);
    if (analysis.floors != null && analysis.floors <= 1) {
        seq = seq.filter((r) => !/stairs?|stairway|upstairs/i.test(r));
    }

    // Adjacency validation: log teleportation warnings
    const adjResult = validateTourAdjacency(seq, analysis.rooms);
    if (!adjResult.valid) {
        logger.warn({ msg: "Tour sequence has teleportation (rooms not connected)", teleports: adjResult.teleports });
    }

    // Room count sanity check
    if (analysis.total_rooms) {
        validateRoomCount(analysis.total_rooms, listing?.bedrooms, listing?.bathrooms);
    }

    return buildTourSequenceFromRoomNames(seq);
}

/** Build TourRoom[] from ordered room names. Used for floorplan analysis and default sequences. */
export function buildTourSequenceFromRoomNames(roomNames: string[]): TourRoom[] {
    const sequence: TourRoom[] = [];
    for (let i = 0; i < roomNames.length - 1; i++) {
        const from = roomNames[i];
        const to = roomNames[i + 1];
        let transition_type: TourRoom["transition_type"] = "walk";
        if (to.toLowerCase().includes("door") || to.toLowerCase().includes("entrance")) {
            transition_type = "enter";
        } else if (to.toLowerCase().includes("stair") || to.toLowerCase().includes("upstairs")) {
            transition_type = "stairs";
        } else if (to.toLowerCase().includes("exterior") || to.toLowerCase().includes("backyard") || to.toLowerCase().includes("pool")) {
            transition_type = "exit";
        }
        sequence.push({ order: i + 1, from, to, transition_type });
    }
    return sequence;
}

/** Default tour sequences when no floorplan. Pool appended when hasPool. */
const DEFAULT_SEQUENCES: Record<string, string[]> = {
    house_3bed_2bath: [
        "Exterior Front", "Front Door", "Foyer", "Living Room",
        "Kitchen", "Dining Room", "Master Bedroom", "Master Bathroom",
        "Bedroom 2", "Bedroom 3", "Bathroom 2", "Backyard"
    ],
    house_4bed_2bath: [
        "Exterior Front", "Front Door", "Foyer", "Living Room",
        "Kitchen", "Dining Room", "Master Bedroom", "Master Bathroom",
        "Bedroom 2", "Bedroom 3", "Bedroom 4", "Bathroom 2", "Backyard"
    ],
    house_4bed_3bath: [
        "Exterior Front", "Front Door", "Foyer", "Living Room",
        "Kitchen", "Dining Room", "Family Room",
        "Stairs", "Master Bedroom", "Master Bathroom",
        "Bedroom 2", "Bedroom 3", "Bedroom 4",
        "Bathroom 2", "Bathroom 3", "Backyard"
    ],
    house_5bed_3bath: [
        "Exterior Front", "Front Door", "Foyer", "Living Room",
        "Kitchen", "Dining Room", "Family Room",
        "Stairs", "Master Bedroom", "Master Bathroom",
        "Bedroom 2", "Bedroom 3", "Bedroom 4", "Bedroom 5",
        "Bathroom 2", "Bathroom 3", "Backyard"
    ],
    condo_2bed_2bath: [
        "Building Exterior", "Lobby", "Elevator/Hallway", "Unit Entry",
        "Living Room", "Kitchen", "Dining Area",
        "Master Bedroom", "Master Bathroom",
        "Bedroom 2", "Bathroom 2", "Balcony"
    ],
    apartment_1bed_1bath: [
        "Building Exterior", "Lobby", "Unit Entry",
        "Living Area", "Kitchen", "Bedroom", "Bathroom"
    ],
    townhouse_3bed_2bath: [
        "Exterior Front", "Front Door", "Living Room",
        "Kitchen", "Dining Room", "Powder Room",
        "Stairs", "Master Bedroom", "Master Bathroom",
        "Bedroom 2", "Bedroom 3", "Bathroom 2",
        "Patio/Deck"
    ],
};

/** Pool suffix: append to sequence when property has pool (finale). */
const POOL_SUFFIX = ["Backyard", "Pool"];

/** Detect single-story from listing. Avoid inventing stairs for ranches/one-floor homes. */
export function isSingleStory(listing: {
    description?: string | null;
    amenities?: string[] | { factLabel?: string; factValue?: string }[] | null;
    reso_facts?: any;
    floorplan_analysis?: { floors?: number } | null;
}): boolean {
    const fp = listing.floorplan_analysis;
    if (fp && typeof fp.floors === "number") return fp.floors <= 1;

    const desc = (listing.description || "").toLowerCase();
    const singleStoryPhrases = ["single-story", "single story", "one story", "1 story", "ranch", "rambler", "single level", "one level", "no stairs"];
    if (singleStoryPhrases.some((p) => desc.includes(p))) return true;

    const amenities = Array.isArray(listing.amenities) ? listing.amenities : [];
    const amStr = amenities
        .map((a) => (typeof a === "string" ? a : `${(a as any).factLabel || ""} ${(a as any).factValue || ""}`))
        .join(" ")
        .toLowerCase();
    if (/stories?\s*:\s*1\b|1\s*story|single\s*story|ranch/i.test(amStr)) return true;

    const rf = listing.reso_facts;
    if (rf?.atAGlanceFacts) {
        const storiesFact = (rf.atAGlanceFacts as any[]).find(
            (f) => /stories?/i.test(String(f.factLabel || ""))
        );
        const val = String(storiesFact?.factValue || "").trim();
        if (val === "1" || /^1\s*story$/i.test(val)) return true;
    }

    return false;
}

export function getDefaultSequence(
    propertyType: string,
    bedrooms: number,
    bathrooms: number,
    hasPool: boolean,
    singleStory?: boolean
): string[] {
    const baseKey = `${propertyType}_${bedrooms}bed_${Math.floor(bathrooms)}bath`;
    let rooms = DEFAULT_SEQUENCES[baseKey];

    if (!rooms) {
        const candidates = Object.entries(DEFAULT_SEQUENCES)
            .filter(([k]) => k.startsWith(propertyType))
            .sort((a, b) => {
                const aBeds = parseInt(a[0].match(/(\d+)bed/)?.[1] || "0");
                const bBeds = parseInt(b[0].match(/(\d+)bed/)?.[1] || "0");
                return Math.abs(aBeds - bedrooms) - Math.abs(bBeds - bedrooms);
            });
        rooms = candidates[0]?.[1] ?? DEFAULT_SEQUENCES.house_3bed_2bath;
    }

    if (singleStory) {
        rooms = rooms.filter((r) => !/stairs?|stairway|upstairs/i.test(r));
    }

    if (hasPool && !rooms.some((r) => r.toLowerCase().includes("pool"))) {
        const withoutBackyard = rooms.filter((r) => !r.toLowerCase().includes("backyard"));
        rooms = [...withoutBackyard, ...POOL_SUFFIX];
    }

    return rooms;
}
