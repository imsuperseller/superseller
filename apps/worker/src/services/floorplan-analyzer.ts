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
    "Backyard"
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
1. ALWAYS start with "Exterior Front" → "Front Door" (the approach shot)
2. After entering, follow a LOGICAL WALKING PATH — never teleport between disconnected rooms
3. Prefer this general flow: entrance → main living areas → kitchen/dining → bedrooms → bathrooms → outdoor spaces
4. Group rooms by proximity — visit adjacent rooms before moving to distant ones
5. For multi-story: complete the main floor first, then use "Stairs" as a transition, then complete upper floors
6. End with outdoor spaces (backyard, patio, pool) if they exist
7. Never include utility rooms (HVAC closet, electrical panel) unless they are a notable feature
8. Include hallways ONLY if they are architecturally significant or necessary for the walking path
9. Bathrooms should follow their associated bedrooms (Master Bedroom → Master Bathroom)
10. The kitchen and dining room should be adjacent in sequence since they usually connect

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

export function buildTourSequence(analysis: FloorplanAnalysis): TourRoom[] {
    const sequence: TourRoom[] = [];
    const rooms = analysis.suggested_tour_sequence;

    for (let i = 0; i < rooms.length - 1; i++) {
        const from = rooms[i];
        const to = rooms[i + 1];

        let transition_type: TourRoom["transition_type"] = "walk";
        if (to.toLowerCase().includes("door") || to.toLowerCase().includes("entrance")) {
            transition_type = "enter";
        } else if (to.toLowerCase().includes("stair") || to.toLowerCase().includes("upstairs")) {
            transition_type = "stairs";
        } else if (to.toLowerCase().includes("exterior") || to.toLowerCase().includes("backyard")) {
            transition_type = "exit";
        }

        sequence.push({
            order: i + 1,
            from,
            to,
            transition_type,
        });
    }

    return sequence;
}
