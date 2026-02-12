import { geminiChatCompletion as chatCompletion } from "./gemini";
import { TourRoom, ClipPrompt } from "../types";
import { logger } from "../utils/logger";

// ═══════════════════════════════════════════
// CINEMATIC LOOKUP TABLES (THE BIBLE)
// ═══════════════════════════════════════════

export const ROOM_DESCRIPTIONS: Record<string, any> = {
    "living": {
        typical_features: "spacious open layout with comfortable seating area, entertainment center, and large windows",
        camera_focus: "Pull back to reveal the full room depth, emphasizing ceiling height and window placement",
        lighting_note: "Natural light flooding through large windows, supplemented by warm ambient fixtures",
        material_hints: "hardwood floors, neutral-toned walls, plush area rug, crown molding",
    },
    "kitchen": {
        typical_features: "modern cabinetry, stone countertops, stainless steel appliances, and functional island or peninsula",
        camera_focus: "Track along the countertop line, showcasing the workspace flow and appliance arrangement",
        lighting_note: "Bright overhead lighting with under-cabinet accent lights creating depth",
        material_hints: "granite or quartz countertops, tile backsplash, brushed nickel hardware, pendant lights",
    },
    "dining": {
        typical_features: "centered dining table with seating, chandelier or statement light fixture overhead",
        camera_focus: "Sweeping reveal from the entry point, framing the table and light fixture together",
        lighting_note: "Statement chandelier as focal light source, natural sidelight from adjacent windows",
        material_hints: "polished table surface, upholstered chairs, wainscoting or accent wall",
    },
    "bedroom": {
        typical_features: "well-proportioned room with bed as centerpiece, nightstands, and window with natural light",
        camera_focus: "Enter and gently sweep to reveal the full room, settling on the window view",
        lighting_note: "Soft natural light through curtains, bedside lamps creating warm pools of light",
        material_hints: "carpet or hardwood floors, fresh bedding, neutral wall colors, window treatments",
    },
    "master_bedroom": {
        typical_features: "generous primary suite with king bed, sitting area, walk-in closet access, and en-suite bathroom entry visible",
        camera_focus: "Slow reveal from entry, panning across the full suite to show its scale and amenities",
        lighting_note: "Layered lighting — natural window light, recessed ceiling lights, and bedside ambient",
        material_hints: "premium carpet or wide-plank hardwood, tray ceiling, accent wall, reading nook",
    },
    "bathroom": {
        typical_features: "clean and bright bathroom with vanity, mirror, shower or tub-shower combination",
        camera_focus: "Brief push-in from doorway, showcasing the vanity and fixtures without lingering",
        lighting_note: "Bright vanity lighting reflecting off mirror, clean white light with warm accents",
        material_hints: "ceramic tile, glass shower enclosure, polished chrome fixtures, stone vanity top",
    },
    "master_bathroom": {
        typical_features: "luxury en-suite with dual vanities, soaking tub, separate glass-enclosed shower, and high-end finishes",
        camera_focus: "Sweeping entry shot that captures both the tub and shower, then settles on the vanity",
        lighting_note: "Bright clean lighting balanced with warm accents, natural light if window present",
        material_hints: "marble or porcelain tile, frameless glass, rainfall showerhead, freestanding tub, dual sinks",
    },
    "foyer": {
        typical_features: "welcoming entry space with coat closet, console table, and first impression of the home's style",
        camera_focus: "Forward dolly from the door into the space, looking toward the main living area beyond",
        lighting_note: "Entry fixture casting warm downlight, natural light from door sidelights",
        material_hints: "tile or hardwood entry floor, decorative mirror, fresh flowers on console",
    },
    "hallway": {
        typical_features: "connecting corridor with clean lines leading to the next space",
        camera_focus: "Smooth forward dolly through the hallway, framing the destination at the end",
        lighting_note: "Recessed hallway lights creating even illumination, natural light from rooms on either side",
        material_hints: "hardwood or tile floor, neutral walls, framed artwork, architectural details",
    },
    "outdoor": {
        typical_features: "outdoor living space with patio, landscaping, and potential pool or garden views",
        camera_focus: "Exit through door into the space, camera settles on the widest view available",
        lighting_note: "Full natural outdoor light, golden hour warmth across the landscape",
        material_hints: "paver stone patio, outdoor furniture, mature landscaping, green lawn",
    },
    "stairs": {
        typical_features: "staircase connecting floors with railing and architectural character",
        camera_focus: "Ascending steadicam at handrail height, following the stair geometry upward",
        lighting_note: "Stairwell fixture overhead, natural light from landing window if present",
        material_hints: "hardwood or carpeted treads, wood or iron railing, wainscoting on stair wall",
    },
    "office": {
        typical_features: "dedicated workspace with desk, built-in shelving or bookcases, and good natural light",
        camera_focus: "Enter and reveal the workspace, emphasizing the window and built-ins",
        lighting_note: "Task lighting at desk supplemented by natural window light",
        material_hints: "rich wood desk, built-in cabinetry, leather chair, organized shelving",
    },
};

export const STYLE_MODIFIERS: Record<string, any> = {
    "modern": {
        interior_palette: "clean white walls, light gray accents, pops of black hardware",
        material_emphasis: "polished concrete, large-format tile, floor-to-ceiling glass, matte black fixtures",
        mood: "sleek and minimalist with carefully curated design elements",
    },
    "traditional": {
        interior_palette: "warm cream walls, rich wood tones, classic navy or hunter green accents",
        material_emphasis: "hardwood floors, crown molding, chair rail, panel doors, brass or brushed gold hardware",
        mood: "timeless elegance with sophisticated warmth",
    },
    "luxury": {
        interior_palette: "rich charcoal, warm taupe, gold accents, cream marble",
        material_emphasis: "marble slabs, brushed gold fixtures, custom millwork, automated systems, designer lighting",
        mood: "opulent sophistication with cutting-edge design",
    },
};

// Realtor mode: allow single realtor. Avoid morphing, multiple people, inconsistent faces.
export const REALTOR_NEGATIVE = "blurry, out of focus, distorted, warped, low quality, low resolution, overexposed, underexposed, dark, moody, grain, noise, artifact, glitch, flickering, strobing, watermark, text overlay, logo, brand name, subtitle, caption, letterbox, black bars, fish-eye lens, extreme wide angle, dutch angle, shaky camera, handheld shake, motion blur, duplicate frames, temporal inconsistency, morphing walls, melting objects, floating furniture, impossible geometry, non-euclidean space, morphing face, melting face, inconsistent facial features, multiple people, crowd, extra faces, pet, animal, dog, cat, bird, cartoon, anime, illustration, painting, sketch, CGI obvious, video game, render artifact, plastic looking, uncanny valley, horror, scary, dark shadows, dramatic lighting, colored lighting, neon, psychedelic";

// Legacy (no realtor): ban all people.
export const UNIVERSAL_NEGATIVE = "blurry, out of focus, distorted, warped, low quality, low resolution, overexposed, underexposed, dark, moody, grain, noise, artifact, glitch, flickering, strobing, watermark, text overlay, logo, brand name, subtitle, caption, letterbox, black bars, fish-eye lens, extreme wide angle, dutch angle, shaky camera, handheld shake, motion blur, duplicate frames, temporal inconsistency, morphing walls, melting objects, floating furniture, impossible geometry, non-euclidean space, people, person, human figure, hand, finger, face, pet, animal, dog, cat, bird, cartoon, anime, illustration, painting, sketch, CGI obvious, video game, render artifact, plastic looking, uncanny valley, horror, scary, dark shadows, dramatic lighting, colored lighting, neon, psychedelic";

const REALTOR_SYSTEM_PROMPT = `You are a world-class real estate cinematographer directing an AI video generation model. Your job is to write detailed video prompts for a REALTOR-CENTRIC property tour.

THE REALTOR IS THE ANCHOR:
- A single professional realtor (business casual, warm and confident) walks through each room as the guide.
- The realtor uses "Silent Hype" body language: power walk at 70% speed, 5-8 feet ahead of camera, touches luxury features (marble island, velvet sofa), glances back with a smile when entering new rooms.
- Facial expressions: "The Wow" (eyebrows up on entry), "The Knowing Smirk" (confident when pointing at features), "The Welcome Home" (warm look at lens for finale).
- The home is the star; the realtor provides scale and life. No other people or pets.

CINEMATIC RULES:
1. CAMERA MOVEMENT: Every clip must specify ONE primary camera movement (forward dolly, tracking, push-in, pan, pull-back reveal, doorway dolly, staircase follow).
2. CAMERA HEIGHT: Always "eye level" (5ft). Camera follows the realtor.
3. LIGHTING: Consistent warm golden hour.
4. SPEED: Slow and steady (realtor walks at 70% normal speed).
5. CONTINUITY: The end of clip N must visually match the start of clip N+1. Same room state, same realtor position.

OUTPUT FORMAT:
Return a JSON array of clip prompts. Each prompt (80-150 words) must describe the REALTOR in the frame—position, gesture, expression—along with room details.`;

const LEGACY_SYSTEM_PROMPT = `You are a world-class real estate cinematographer directing an AI video generation model. Your job is to write detailed video prompts that produce cinematic, smooth, professional property tour clips.

CINEMATIC RULES:
1. CAMERA MOVEMENT: Every clip must specify ONE primary camera movement (forward dolly, tracking, push-in, pan, pull-back reveal, doorway dolly, staircase follow).
2. CAMERA HEIGHT: Always "eye level" (5ft) unless special feature.
3. LIGHTING CONSISTENCY: All clips MUST use consistent time of day (default: warm golden hour).
4. SPEED: Slow and steady.
5. CONTINUITY: The end of clip N must visually match the start of clip N+1.
6. NO people, pets, text, logos, or unrealistic elements.

OUTPUT FORMAT:
Return a JSON array of clip prompts. Each prompt (80-150 words) should be dense with visual detail.`;

export async function generateClipPrompts(
    tourSequence: TourRoom[],
    propertyDetails: {
        property_type: string;
        style?: string;
        architectural_style?: string;
        exterior_description?: string;
        includeRealtor?: boolean;
    }
): Promise<ClipPrompt[]> {
    const includeRealtor = propertyDetails.includeRealtor ?? true;
    const styleKey = propertyDetails.style?.toLowerCase() || propertyDetails.architectural_style?.toLowerCase() || "modern";
    const selectedStyle = STYLE_MODIFIERS[styleKey] || STYLE_MODIFIERS["modern"];
    const systemPrompt = includeRealtor ? REALTOR_SYSTEM_PROMPT : LEGACY_SYSTEM_PROMPT;
    const baseNegative = includeRealtor ? REALTOR_NEGATIVE : UNIVERSAL_NEGATIVE;

    const tourDescription = tourSequence.map((t, i) => {
        const fromDesc = ROOM_DESCRIPTIONS[t.from.toLowerCase()] || ROOM_DESCRIPTIONS["living"];
        const toDesc = ROOM_DESCRIPTIONS[t.to.toLowerCase()] || ROOM_DESCRIPTIONS["living"];
        return `${i + 1}. ${t.from} (${fromDesc.typical_features}) → ${t.to} (${toDesc.typical_features}) [Type: ${t.transition_type}]`;
    }).join("\n");

    const realtorNote = includeRealtor ? "\n\nEach prompt MUST describe where the realtor is in the frame, their pose or gesture (e.g. 'realtor entering from left, hand on door frame, looking back with smile'), and the room. The realtor anchors the tour." : "";

    const userMessage = `Property: ${propertyDetails.property_type}
Style: ${styleKey}
Details: ${selectedStyle.interior_palette}, ${selectedStyle.material_emphasis}, ${selectedStyle.mood}
Exterior: ${propertyDetails.exterior_description || "Property exterior shot"}
Realtor in video: ${includeRealtor ? "YES — describe realtor position and expression in every prompt" : "NO"}
${realtorNote}

Tour sequence (generate one prompt per transition):
${tourDescription}

Return a JSON array where each element has:
{
  "clip_number": number,
  "from_room": string,
  "to_room": string,
  "prompt": "Full cinematic paragraph (include realtor if enabled)...",
  "camera_movement": string,
  "duration_seconds": 5,
  "negative_prompt": "assembled negative prompt here"
}

Ensure visual continuity: Clip N ends where N+1 begins.
Return ONLY valid JSON array.`;

    logger.info({ msg: "Generating cinematic clip prompts", clips: tourSequence.length, includeRealtor });

    const { content } = await chatCompletion(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        {
            temperature: 0.4,
            max_tokens: 8192,
            response_format: { type: "json_object" },
        }
    );

    try {
        let jsonStr = content.trim();
        if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
        }

        let parsed = JSON.parse(jsonStr);
        const clips: any[] = Array.isArray(parsed) ? parsed : (parsed.clips || parsed.prompts || []);

        return clips.map((clip, index) => ({
            clip_number: clip.clip_number || index + 1,
            from_room: clip.from_room || tourSequence[index]?.from,
            to_room: clip.to_room || tourSequence[index]?.to,
            prompt: clip.prompt,
            start_frame_url: null,
            end_frame_url: null,
            duration_seconds: clip.duration_seconds || 5,
            negative_prompt: clip.negative_prompt
                ? `${clip.negative_prompt}, ${baseNegative}`
                : baseNegative
        }));
    } catch (err: any) {
        logger.error({ msg: "Cinematic prompt generation failed", error: err.message, content: content.substring(0, 500) });
        throw new Error("Cinematic prompt generation failed");
    }
}
