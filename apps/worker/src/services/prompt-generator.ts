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
    "pool": {
        typical_features: "crystal clear swimming pool or spa area, tiled water line, surrounding deck or lounge space. HERO FEATURE — main selling point, Big Reveal finale.",
        camera_focus: "Wide sweeping pan of the entire pool area. Hero moment: gentle glide or orbit. Emphasize lifestyle, relaxation, vacation energy.",
        lighting_note: "Sunlight reflecting off the water surface, blue water tones contrasting with warm deck materials",
        material_hints: "sparkling water, stone or wood decking, modern lounge chairs, outdoor umbrellas",
    },
    "backyard": {
        typical_features: "spacious private backyard with lawn, mature trees, and potential for entertaining",
        camera_focus: "Dolly forward from the patio into the lawn area, looking back to show the home's rear elevation",
        lighting_note: "Open outdoor lighting, soft shadows from trees, golden hour highlights",
        material_hints: "manicured lawn, varied plantings, wood fencing or privacy hedging",
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

export const REALTOR_NEGATIVE = "blurry, out of focus, distorted, warped, low quality, low resolution, overexposed, underexposed, dark, moody, grain, noise, artifact, glitch, flickering, strobing, watermark, text overlay, logo, brand name, subtitle, caption, letterbox, black bars, fish-eye lens, extreme wide angle, dutch angle, shaky camera, handheld shake, motion blur, duplicate frames, temporal inconsistency, morphing walls, melting objects, floating furniture, impossible geometry, non-euclidean space, morphing face, melting face, inconsistent facial features, multiple people, crowd, extra faces, pet, animal, dog, cat, bird, cartoon, anime, illustration, painting, sketch, CGI obvious, video game, render artifact, plastic looking, uncanny valley, horror, scary, dark shadows, dramatic lighting, colored lighting, neon, psychedelic, fashion show, runway walk, robotic walk, stiff movement, excessive smiling, posing, staring at camera, blocking doorway, out of character";

// Legacy (no realtor): ban all people.
export const UNIVERSAL_NEGATIVE = "blurry, out of focus, distorted, warped, low quality, low resolution, overexposed, underexposed, dark, moody, grain, noise, artifact, glitch, flickering, strobing, watermark, text overlay, logo, brand name, subtitle, caption, letterbox, black bars, fish-eye lens, extreme wide angle, dutch angle, shaky camera, handheld shake, motion blur, duplicate frames, temporal inconsistency, morphing walls, melting objects, floating furniture, impossible geometry, non-euclidean space, people, person, human figure, hand, finger, face, pet, animal, dog, cat, bird, cartoon, anime, illustration, painting, sketch, CGI obvious, video game, render artifact, plastic looking, uncanny valley, horror, scary, dark shadows, dramatic lighting, colored lighting, neon, psychedelic";

const REALTOR_SYSTEM_PROMPT = `You are a world-class real estate cinematographer directing an AI video generation model. Your job is to write detailed video prompts for a REALTOR-CENTRIC property tour.

THE REALTOR IS A PROFESSIONAL GUIDE:
- The realtor is the person in the provided reference photo (Visual Identity Anchor).
- DO NOT describe clothing like "sharp blazer" or "business casual". Describe the realtor ONLY as "the person from the reference photo".
- CONDUCT: The realtor acts as a humble, professional guide. They are purposefully leading the viewer into the home.
- MOVEMENT: Natural, understated walking. NO "power walking", NO "runway walk", NO "fashion show" behavior.
- BEHAVIOR: They walk into rooms, towards focal points (islands, fireplaces, views), and point naturally at features from a distance. They stay out of the way of the camera's path when necessary.
- EXPRESSIONS: Subdued and professional. A genuine, brief nod to the viewer upon entry, then focusing on the home. No constant smirking or posing.
- DIRECTION: They walk TOWARDS the doors and focal points, guiding the camera's eye.

CINEMATIC RULES:
1. CAMERA MOVEMENT: specify ONE primary movement (forward dolly, tracking, push-in, pan, door-push).
2. CAMERA HEIGHT: Stable eye level (5ft).
3. CONTINUITY: The realtor's position at the end of Clip N must match the start of Clip N+1.
4. SPATIAL LOGIC: Every property has HERO MOMENTS (top 3 selling points). When pool exists: pool is the FINALE. When no pool: elevate kitchen island, fireplace, view, master suite, or other notable features as hero focus. Identify and emphasize the main hero in your prompts.

Return a JSON array of clip prompts. 80-150 words each.`;

const LEGACY_SYSTEM_PROMPT = `You are a world-class real estate cinematographer directing an AI video generation model. Your job is to write detailed video prompts for a property tour WITHOUT any people.

CINEMATIC RULES:
1. CAMERA MOVEMENT: specify ONE primary movement (forward dolly, tracking, push-in, pan, door-push).
2. CAMERA HEIGHT: Stable eye level (5ft).
3. NO PEOPLE: Empty property—no realtor, no humans. Focus on architecture, light, and space.
4. SPATIAL LOGIC: Every property has HERO MOMENTS (top 3 selling points). When pool exists: pool is the FINALE. When no pool: elevate kitchen island, fireplace, view, master suite, or other notable features as hero focus.

Return a JSON array of clip prompts. 80-150 words each. Each object: clip_number, from_room, to_room, prompt, duration_seconds (5), negative_prompt (optional).`;

export async function generateClipPrompts(
    tourSequence: TourRoom[],
    propertyDetails: {
        property_type: string;
        style?: string;
        architectural_style?: string;
        description?: string;
        exterior_description?: string;
        includeRealtor?: boolean;
        resoFacts?: any;
        amenities?: string[];
        heroFeatures?: string[];
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

    const factsNote = propertyDetails.resoFacts ? `\nDeep Metadata: ${JSON.stringify(propertyDetails.resoFacts).substring(0, 1000)}` : "";
    const amenitiesNote = propertyDetails.amenities?.length ? `\nKey Amenities: ${propertyDetails.amenities.join(", ")}` : "";
    const heroNote = propertyDetails.heroFeatures?.length
        ? `\nHero Features (emphasize these as focal points): ${propertyDetails.heroFeatures.join(", ")}. Elevate hero rooms with orbit gestures, "wow" moments.`
        : "";

    const userMessage = `Property: ${propertyDetails.property_type}
Style: ${styleKey}
Description: ${propertyDetails.description}${factsNote}${amenitiesNote}${heroNote}
Realtor: ${includeRealtor ? "YES (Identity Anchor: use reference photo)" : "NO"}

Tour sequence:
${tourDescription}

Generate one cinematic prompt per transition. Focus on natural guiding behavior. Emphasize hero features where they appear.`;

    logger.info({ msg: "Generating cinematic clip prompts", clips: tourSequence.length, includeRealtor });

    const { content } = await chatCompletion(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        {
            temperature: 0.4,
            max_tokens: 8192,
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
        logger.warn({ msg: "Prompt parse error", error: err?.message, contentPreview: content?.substring(0, 200) });
        throw new Error(`Cinematic prompt generation failed: ${err?.message || "invalid JSON"}`);
    }
}
