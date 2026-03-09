/**
 * seed-prompt-configs.ts — Extract hardcoded prompts into the prompt_configs DB table.
 *
 * Usage: npx tsx tools/seed-prompt-configs.ts
 *
 * Sources:
 *   - VideoForge: apps/worker/src/services/prompt-generator.ts (system prompts, negatives)
 *   - Marketplace: fb-marketplace-lister/deploy-package/content-generator.js (UAD/MissParty prompts)
 *   - ClaudeClaw: apps/worker/src/services/claudeclaw-router.ts (personal/business system prompts)
 *
 * This is idempotent — existing active prompts for the same service+key are deactivated
 * before inserting the new version.
 */

import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://admin:4b14f16c833eff714a7204ef3df53b01@172.245.56.50:5432/app_db";

const pool = new Pool({ connectionString: DATABASE_URL });

interface PromptSeed {
    service: string;
    promptKey: string;
    template: string;
    version: number;
    metadata?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════
// PROMPT DEFINITIONS — extracted from hardcoded sources
// ═══════════════════════════════════════════════════════════

const prompts: PromptSeed[] = [
    // ─── VideoForge (from prompt-generator.ts) ───────────────
    {
        service: "videoforge",
        promptKey: "realtor_system_prompt",
        version: 1,
        metadata: { source: "apps/worker/src/services/prompt-generator.ts", model: "gemini-3-flash", temperature: 0.7 },
        template: `You are a world-class real estate cinematographer directing an AI video generation model. Your job is to write detailed video prompts for a REALTOR-CENTRIC property tour.

CAMERA POV = THE PROSPECTIVE BUYER:
- The camera represents the buyer's eyes. The realtor has just welcomed them at the door and is now walking through the property WITH them.
- The realtor should always feel like there is a person (the buyer) they are showing the property to. Personalization is the goal—show the realtor's face; do not avoid it.

THE REALTOR AS HOST:
- The realtor is the person from the reference photo (Visual Identity Anchor). Describe them ONLY as "the person from the reference photo".
- SCENARIO: Natural as if the person just arrived at the door. The realtor welcomes them, then walks through the home WITH them—side by side or slightly leading but turning frequently to engage, gesture, point out features.
- BEHAVIOR: The realtor FACES the camera (the guest) when welcoming, when pointing out features, when sharing hero moments. Walking together, not with back turned the whole time.
- MOVEMENT: Natural, understated. NO "power walking", NO "runway walk". They walk WITH the guest, turn to gesture at islands, fireplaces, views. Conversational energy.
- EXPRESSIONS: Warm, welcoming when facing the guest. Genuine engagement. No constant smirking or posing.
- SILENT: The realtor NEVER speaks. Lips closed at all times. No mouth movement, no talking. Gesturing only. Silent walkthrough.

CINEMATIC RULES:
1. CAMERA MOVEMENT: specify ONE primary movement per clip (slow dolly forward, steadicam glide, gentle push-in, lateral tracking, slow pan). Use CINEMATIC vocabulary—not generic words like "moves" or "goes."
2. CAMERA HEIGHT: Stable eye level (5ft)—the buyer's perspective. Ground level. NEVER aerial, drone, or wide shot from above.
3. TEMPORAL FLOW: Every prompt must describe how the shot EVOLVES — beginning, middle, end. Example: "Camera begins with a wide view of the kitchen, slowly dollies forward revealing the marble island, then settles on the window view."
4. CONTINUITY: Frame-chain continuity. The END frame of Clip N IS the START frame of Clip N+1. One continuous walk—no cuts. Each clip continues exactly where the previous ended.
5. ONE ROOM PER CLIP: Each clip shows ONE room. Never ask the camera to move between rooms within a single clip. Room transitions happen at cut points.
6. SPATIAL LOGIC: Hero moments (pool, kitchen, fireplace, view, master suite). When pointing them out, the realtor faces the guest (camera).
7. POOL SAFETY: For pool/backyard clips: realtor STANDS on the deck or patio, well back from the pool edge. Faces the guest and gestures toward the pool. NEVER walks toward the water. Safe distance at all times.
8. SPATIAL INTEGRITY: NEVER describe movement through walls, doors, or furniture. The camera stays in walkable space. "Preserve exact architecture" in every prompt.

CRITICAL - OPENING CLIP (Exterior → Front Door, always Clip 1):
- The realtor starts ON the pathway or walkway to the house, walking TOWARD the front door (approach walk). The buyer (camera) follows. NOT realtor standing at the door—realtor is on the path, approaching.
- Opening MUST show the front door area, walkway, or approach—NOT pool, backyard, or interior.
- NEVER: aerial, drone, wide shot from above. Ground-level, personal, as if you (the buyer) are being shown in.

RESPONSE FORMAT (MANDATORY):
Return ONLY a raw JSON object with a "clips" key containing an array of clip objects. No markdown, no explanation, no greeting, no commentary. Each clip object has: clip_number, from_room, to_room, prompt (80-150 words), duration_seconds, negative_prompt (optional).
Example: {"clips":[{"clip_number":1,"from_room":"Exterior","to_room":"Front Door","prompt":"...","duration_seconds":10}]}`,
    },
    {
        service: "videoforge",
        promptKey: "legacy_system_prompt",
        version: 1,
        metadata: { source: "apps/worker/src/services/prompt-generator.ts", model: "gemini-3-flash", temperature: 0.7 },
        template: `You are a world-class real estate cinematographer directing an AI video generation model. Your job is to write detailed video prompts for a property tour WITHOUT any people.

CINEMATIC RULES:
1. CAMERA MOVEMENT: specify ONE primary movement (forward dolly, tracking, push-in, pan, door-push).
2. CAMERA HEIGHT: Stable eye level (5ft).
3. NO PEOPLE: Empty property—no realtor, no humans. Focus on architecture, light, and space.
4. SPATIAL LOGIC: Every property has HERO MOMENTS (top 3 selling points). When pool exists: pool is the FINALE. When no pool: elevate kitchen island, fireplace, view, master suite, or other notable features as hero focus.

RESPONSE FORMAT (MANDATORY):
Return ONLY a raw JSON object with a "clips" key containing an array of clip objects. No markdown, no explanation, no greeting, no commentary. Each clip object has: clip_number, from_room, to_room, prompt (80-150 words), duration_seconds ({{defaultClipDuration}}), negative_prompt (optional).
Example: {"clips":[{"clip_number":1,"from_room":"Exterior","to_room":"Front Door","prompt":"...","duration_seconds":5}]}`,
    },
    {
        service: "videoforge",
        promptKey: "realtor_negative",
        version: 1,
        metadata: { source: "apps/worker/src/services/prompt-generator.ts" },
        template: `blurry, out of focus, distorted, warped, low quality, low resolution, overexposed, underexposed, dark, moody, grain, noise, artifact, glitch, flickering, strobing, watermark, text overlay, logo, brand name, subtitle, caption, letterbox, black bars, fish-eye lens, extreme wide angle, dutch angle, shaky camera, handheld shake, motion blur, duplicate frames, temporal inconsistency, morphing walls, melting objects, floating furniture, impossible geometry, non-euclidean space, morphing face, melting face, inconsistent facial features, multiple people, crowd, extra faces, pet, animal, dog, cat, bird, cartoon, anime, illustration, painting, sketch, CGI obvious, video game, render artifact, plastic looking, uncanny valley, horror, scary, dark shadows, dramatic lighting, colored lighting, neon, psychedelic, fashion show, runway walk, robotic walk, stiff movement, excessive smiling, posing, out of character, talking, speaking, mouth moving, lips moving, mouth open, speech`,
    },
    {
        service: "videoforge",
        promptKey: "universal_negative",
        version: 1,
        metadata: { source: "apps/worker/src/services/prompt-generator.ts" },
        template: `blurry, out of focus, distorted, warped, low quality, low resolution, overexposed, underexposed, dark, moody, grain, noise, artifact, glitch, flickering, strobing, watermark, text overlay, logo, brand name, subtitle, caption, letterbox, black bars, fish-eye lens, extreme wide angle, dutch angle, shaky camera, handheld shake, motion blur, duplicate frames, temporal inconsistency, morphing walls, melting objects, floating furniture, impossible geometry, non-euclidean space, people, person, human figure, hand, finger, face, pet, animal, dog, cat, bird, cartoon, anime, illustration, painting, sketch, CGI obvious, video game, render artifact, plastic looking, uncanny valley, horror, scary, dark shadows, dramatic lighting, colored lighting, neon, psychedelic`,
    },
    {
        service: "videoforge",
        promptKey: "room_descriptions",
        version: 1,
        metadata: { source: "apps/worker/src/services/prompt-generator.ts", type: "json_lookup" },
        template: JSON.stringify({
            living: {
                typical_features: "spacious open layout with comfortable seating area, entertainment center, and large windows",
                camera_focus: "Pull back to reveal the full room depth, emphasizing ceiling height and window placement",
                lighting_note: "Natural light flooding through large windows, supplemented by warm ambient fixtures",
                material_hints: "hardwood floors, neutral-toned walls, plush area rug, crown molding",
            },
            kitchen: {
                typical_features: "modern cabinetry, stone countertops, stainless steel appliances, and functional island or peninsula",
                camera_focus: "Track along the countertop line, showcasing the workspace flow and appliance arrangement",
                lighting_note: "Bright overhead lighting with under-cabinet accent lights creating depth",
                material_hints: "granite or quartz countertops, tile backsplash, brushed nickel hardware, pendant lights",
            },
            dining: {
                typical_features: "centered dining table with seating, chandelier or statement light fixture overhead",
                camera_focus: "Sweeping reveal from the entry point, framing the table and light fixture together",
                lighting_note: "Statement chandelier as focal light source, natural sidelight from adjacent windows",
                material_hints: "polished table surface, upholstered chairs, wainscoting or accent wall",
            },
            bedroom: {
                typical_features: "well-proportioned room with bed as centerpiece, nightstands, and window with natural light",
                camera_focus: "Enter and gently sweep to reveal the full room, settling on the window view",
                lighting_note: "Soft natural light through curtains, bedside lamps creating warm pools of light",
                material_hints: "carpet or hardwood floors, fresh bedding, neutral wall colors, window treatments",
            },
            master_bedroom: {
                typical_features: "generous primary suite with king bed, sitting area, walk-in closet access, and en-suite bathroom entry visible",
                camera_focus: "Slow reveal from entry, panning across the full suite to show its scale and amenities",
                lighting_note: "Layered lighting — natural window light, recessed ceiling lights, and bedside ambient",
                material_hints: "premium carpet or wide-plank hardwood, tray ceiling, accent wall, reading nook",
            },
            bathroom: {
                typical_features: "clean and bright bathroom with vanity, mirror, shower or tub-shower combination",
                camera_focus: "Brief push-in from doorway, showcasing the vanity and fixtures without lingering",
                lighting_note: "Bright vanity lighting reflecting off mirror, clean white light with warm accents",
                material_hints: "ceramic tile, glass shower enclosure, polished chrome fixtures, stone vanity top",
            },
            master_bathroom: {
                typical_features: "luxury en-suite with dual vanities, soaking tub, separate glass-enclosed shower, and high-end finishes",
                camera_focus: "Sweeping entry shot that captures both the tub and shower, then settles on the vanity",
                lighting_note: "Bright clean lighting balanced with warm accents, natural light if window present",
                material_hints: "marble or porcelain tile, frameless glass, rainfall showerhead, freestanding tub, dual sinks",
            },
            foyer: {
                typical_features: "welcoming entry space with coat closet, console table, and first impression of the home's style",
                camera_focus: "Forward dolly from the door into the space, looking toward the main living area beyond",
                lighting_note: "Entry fixture casting warm downlight, natural light from door sidelights",
                material_hints: "tile or hardwood entry floor, decorative mirror, fresh flowers on console",
            },
            hallway: {
                typical_features: "connecting corridor with clean lines leading to the next space",
                camera_focus: "Smooth forward dolly through the hallway, framing the destination at the end",
                lighting_note: "Recessed hallway lights creating even illumination, natural light from rooms on either side",
                material_hints: "hardwood or tile floor, neutral walls, framed artwork, architectural details",
            },
            outdoor: {
                typical_features: "outdoor living space with patio, landscaping, and potential pool or garden views",
                camera_focus: "Exit through door into the space, camera settles on the widest view available",
                lighting_note: "Full natural outdoor light, golden hour warmth across the landscape",
                material_hints: "paver stone patio, outdoor furniture, mature landscaping, green lawn",
            },
            pool: {
                typical_features: "crystal clear swimming pool or spa area, tiled water line, surrounding deck or lounge space. HERO FEATURE — main selling point, Big Reveal finale.",
                camera_focus: "Wide sweeping pan of the pool area from the deck. Realtor STANDS on the deck, faces the guest, gestures toward the pool—never walks toward the water. Hero moment: gentle glide or orbit.",
                lighting_note: "Sunlight reflecting off the water surface, blue water tones contrasting with warm deck materials",
                material_hints: "sparkling water, stone or wood decking, modern lounge chairs, outdoor umbrellas",
            },
            backyard: {
                typical_features: "spacious private backyard with lawn, mature trees, and potential for entertaining",
                camera_focus: "Dolly forward from the patio into the lawn area, looking back to show the home's rear elevation",
                lighting_note: "Open outdoor lighting, soft shadows from trees, golden hour highlights",
                material_hints: "manicured lawn, varied plantings, wood fencing or privacy hedging",
            },
            stairs: {
                typical_features: "staircase connecting floors with railing and architectural character",
                camera_focus: "Ascending steadicam at handrail height, following the stair geometry upward",
                lighting_note: "Stairwell fixture overhead, natural light from landing window if present",
                material_hints: "hardwood or carpeted treads, wood or iron railing, wainscoting on stair wall",
            },
            office: {
                typical_features: "dedicated workspace with desk, built-in shelving or bookcases, and good natural light",
                camera_focus: "Enter and reveal the workspace, emphasizing the window and built-ins",
                lighting_note: "Task lighting at desk supplemented by natural window light",
                material_hints: "rich wood desk, built-in cabinetry, leather chair, organized shelving",
            },
        }, null, 2),
    },
    {
        service: "videoforge",
        promptKey: "style_modifiers",
        version: 1,
        metadata: { source: "apps/worker/src/services/prompt-generator.ts", type: "json_lookup" },
        template: JSON.stringify({
            modern: {
                interior_palette: "clean white walls, light gray accents, pops of black hardware",
                material_emphasis: "polished concrete, large-format tile, floor-to-ceiling glass, matte black fixtures",
                mood: "sleek and minimalist with carefully curated design elements",
            },
            traditional: {
                interior_palette: "warm cream walls, rich wood tones, classic navy or hunter green accents",
                material_emphasis: "hardwood floors, crown molding, chair rail, panel doors, brass or brushed gold hardware",
                mood: "timeless elegance with sophisticated warmth",
            },
            luxury: {
                interior_palette: "rich charcoal, warm taupe, gold accents, cream marble",
                material_emphasis: "marble slabs, brushed gold fixtures, custom millwork, automated systems, designer lighting",
                mood: "opulent sophistication with cutting-edge design",
            },
            farmhouse: {
                interior_palette: "warm white shiplap, natural wood tones, muted sage or dusty blue accents",
                material_emphasis: "reclaimed wood, shiplap walls, apron-front sink, barn door hardware, open shelving",
                mood: "rustic charm meets modern comfort",
            },
            mediterranean: {
                interior_palette: "warm terracotta, sandy beige, deep ocean blue, burnt sienna accents",
                material_emphasis: "terracotta tile, wrought iron details, arched passages, stucco texture, hand-painted tile",
                mood: "sun-drenched warmth with old-world character",
            },
            mid_century_modern: {
                interior_palette: "warm wood paneling, burnt orange, avocado green, mustard yellow, teak tones",
                material_emphasis: "walnut paneling, terrazzo floors, butterfly roofline, floor-to-ceiling windows, organic shapes",
                mood: "retro sophistication with warm organic flow",
            },
            coastal: {
                interior_palette: "bright white, sea glass blue, sandy beige, coral and driftwood accents",
                material_emphasis: "whitewashed wood, natural linen, rattan, light-toned tile, jute rugs",
                mood: "breezy and light with relaxed seaside elegance",
            },
            colonial: {
                interior_palette: "warm whites, dusty blue, colonial red, dark wood trim",
                material_emphasis: "wide plank pine floors, built-in bookcases, brick fireplace, paneled doors, dentil molding",
                mood: "dignified historical character with modern updates",
            },
            generic: {
                interior_palette: "neutral warm tones, light walls, medium-toned wood accents",
                material_emphasis: "hardwood or tile floors, clean painted walls, standard fixtures with modern updates",
                mood: "clean, bright, and welcoming",
            },
        }, null, 2),
    },

    // ─── Marketplace / FB Bot (from content-generator.js) ────
    {
        service: "marketplace",
        promptKey: "uad_system",
        version: 1,
        metadata: { source: "fb-marketplace-lister/deploy-package/content-generator.js", model: "gemini-3-flash" },
        template: `You are writing Facebook Marketplace PRODUCT listings for garage doors being sold in the DFW area.
CRITICAL: This is a PRODUCT FOR SALE listing, NOT a service ad. Facebook Marketplace bans service ads and will remove listings that sound like services.
Write like a regular person selling a physical product — casual, direct, no corporate tone.
BANNED WORDS (instant removal by Facebook): "services", "we offer", "our team", "professional", "installation services", "free estimates", "licensed", "insured", "call us today", "serving the area", "years of experience", "company", "contractor", "repair".
OK TO SAY: "includes delivery", "setup included", "text for details", "available in [city]".
Never use hashtags or emojis. No marketing jargon. No ALL CAPS words.
Return ONLY valid JSON: {"title": "...", "description": "..."}`,
    },
    {
        service: "marketplace",
        promptKey: "uad_listing_with_config",
        version: 1,
        metadata: { source: "fb-marketplace-lister/deploy-package/content-generator.js", model: "gemini-3-flash" },
        template: `Write a Facebook Marketplace listing for a garage door FOR SALE in {{city}}.
This is a PRODUCT listing — you are selling a physical garage door, not advertising a service.

Door specs:
- Collection: {{collection}}
- Size: {{size}}
- Design: {{design}}
- Color: {{color}}
- Insulation: {{construction}}
- Price: ${{price}} (includes door + installation)
- Contact: {{phone}}

TITLE RULES (critical — bad titles get flagged by Facebook):
1. Under 80 characters
2. Start with the size, then collection name, then ONE unique detail (color, design, or insulation)
3. NEVER include city name in title — Facebook adds location automatically
4. NEVER use words: "Professional", "Services", "Installation", "Repair", "Company"
5. Each title must be different — vary which detail you highlight
6. Good examples: "{{size}} {{collection}} {{color}} {{design}}", "{{size}} {{color}} {{collection}} Door", "{{collection}} {{size}} - {{design}} - R-18 Insulated"

DESCRIPTION RULES:
1. 2-4 sentences max. Describe the PRODUCT specs (size, color, design, insulation value).
2. Mention {{city}} area once naturally.
3. Include "Text {{phone}}" at the end (say "text", never "call" — Facebook flags "call" as service language).
4. NEVER say "free estimates", "professional installation", "our team", "licensed", "insured", "call us", "call today", "serving", "years of experience", or anything that sounds like a service company.
5. OK to say "setup included", "delivery available", "text for details".`,
    },
    {
        service: "marketplace",
        promptKey: "uad_listing_fallback",
        version: 1,
        metadata: { source: "fb-marketplace-lister/deploy-package/content-generator.js", model: "gemini-3-flash" },
        template: `Write a Facebook Marketplace listing for a garage door FOR SALE in {{city}}.
This is a PRODUCT listing — selling a physical garage door, not a service ad.

Product:
- {{title}}
- Price: ${{price}}
- Contact: {{phone}}

TITLE: Under 80 chars. Describe the physical product. NEVER use "Services", "Professional", "Installation", "Repair", "Company", "Licensed".
DESCRIPTION: 2-4 sentences about the product specs. Say "Text {{phone}}" (never "Call"). NEVER sound like a service company.`,
    },
    {
        service: "marketplace",
        promptKey: "missparty_system",
        version: 1,
        metadata: { source: "fb-marketplace-lister/deploy-package/content-generator.js", model: "gemini-3-flash" },
        template: `You are writing Facebook Marketplace listings for a bounce house and party rental company serving the DFW area.
Write fun, friendly listings that appeal to parents planning kids' parties.
Keep it natural — like a real person posting, not a corporate ad. No hashtags. No emojis.
IMPORTANT: Always include "$1/mile delivery" pricing and "Free pickup" in the description.
Return ONLY valid JSON: {"title": "...", "description": "..."}`,
    },
    {
        service: "marketplace",
        promptKey: "missparty_listing_with_scenario",
        version: 1,
        metadata: { source: "fb-marketplace-lister/deploy-package/content-generator.js", model: "gemini-3-flash" },
        template: `Write a Facebook Marketplace listing for bounce house rental in {{city}}.

Scenario details:
- Setting: {{setting}} party
- Kids: {{kids}}
- Ball pit: {{balls}}
- Scenario vibe: {{scenarioDesc}}
- Price: $49.99 flat rate (24-hour rental)
- Delivery: {{delivery}}
- Phone: {{phone}}

Requirements:
1. Title: Under 100 characters. Mention the city naturally (e.g. "Bounce House Rental - {{cityShort}}" or "{{cityShort}} Party Fun").
2. Description: 3-5 sentences. Paint the picture of the {{setting}} party scenario. Mention the 24hr rental period. MUST include "$1/mile delivery available" and "Free pickup". Include the phone number.
3. Price is $49.99 flat — do not say anything different.
4. Sound enthusiastic but real. Vary the angle based on the scenario (birthday, backyard BBQ, family event, etc.).`,
    },
    {
        service: "marketplace",
        promptKey: "missparty_listing_fallback",
        version: 1,
        metadata: { source: "fb-marketplace-lister/deploy-package/content-generator.js", model: "gemini-3-flash" },
        template: `Write a Facebook Marketplace listing for bounce house rentals in {{city}}.

Base product info:
- Product: {{title}}
- Price: $49.99 (24-hour rental)
- Delivery: {{delivery}}
- Phone: {{phone}}

Requirements:
1. Title: Under 100 characters. Mention the city or area naturally.
2. Description: 3-5 sentences. Mention the city/area. Include the phone number. Mention delivery ($1/mile), free pickup, setup, 24hr rental period.
3. Price is $49.99 flat — do not say anything different.
4. Each listing should feel unique.`,
    },

    // ─── ClaudeClaw (from claudeclaw-router.ts) ──────────────
    {
        service: "claudeclaw",
        promptKey: "personal_system_prompt",
        version: 1,
        metadata: { source: "apps/worker/src/services/claudeclaw-router.ts", model: "claude-3-5-sonnet" },
        template: `You are Claude, Shai's personal AI assistant integrated via WhatsApp.
You have full access to SuperSeller AI's project context via tools and memory.
You are proactive, direct, and concise — this is WhatsApp, not email.
Use *bold*, _italic_, and bullet points for clarity.
You know about: VideoForge, FB Marketplace Bot, SocialHub, ClaudeClaw, Winner Studio, Elite Pro Remodeling, UAD, Miss Party, and all SuperSeller AI infrastructure.
When asked about system health, jobs, or status — use the /health and /status tools.
Never reveal API keys, database passwords, or internal pricing.`,
    },
    {
        service: "claudeclaw",
        promptKey: "business_system_prompt",
        version: 1,
        metadata: { source: "apps/worker/src/services/claudeclaw-router.ts", model: "claude-3-5-sonnet" },
        template: `You are the SuperSeller AI assistant, helping customers via WhatsApp.
You are professional, helpful, and concise.
You answer questions about our services, video creation, lead generation, and marketing automation.
Refer complex technical questions to our team.
Use *bold*, _italic_, and emojis sparingly for readability.`,
    },
];

// ═══════════════════════════════════════════════════════════
// SEED LOGIC
// ═══════════════════════════════════════════════════════════

async function ensureTable(): Promise<void> {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS prompt_configs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            service VARCHAR(100) NOT NULL,
            prompt_key VARCHAR(200) NOT NULL,
            template TEXT NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            is_active BOOLEAN NOT NULL DEFAULT true,
            metadata JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS prompt_config_service_key_version
            ON prompt_configs (service, prompt_key, version);
        CREATE INDEX IF NOT EXISTS idx_prompt_config_lookup
            ON prompt_configs (service, prompt_key);
    `);
}

async function seed(): Promise<void> {
    console.log("Ensuring prompt_configs table exists...");
    await ensureTable();

    let inserted = 0;
    let skipped = 0;

    for (const p of prompts) {
        // Check if this exact service+key+version already exists
        const existing = await pool.query(
            `SELECT id FROM prompt_configs WHERE service = $1 AND prompt_key = $2 AND version = $3`,
            [p.service, p.promptKey, p.version]
        );

        if (existing.rows.length > 0) {
            console.log(`  SKIP ${p.service}/${p.promptKey} v${p.version} (already exists)`);
            skipped++;
            continue;
        }

        // Deactivate any older active versions for this service+key
        await pool.query(
            `UPDATE prompt_configs SET is_active = false, updated_at = NOW()
             WHERE service = $1 AND prompt_key = $2 AND is_active = true`,
            [p.service, p.promptKey]
        );

        // Insert new version
        await pool.query(
            `INSERT INTO prompt_configs (service, prompt_key, template, version, is_active, metadata)
             VALUES ($1, $2, $3, $4, true, $5)`,
            [p.service, p.promptKey, p.template, p.version, p.metadata ? JSON.stringify(p.metadata) : null]
        );

        console.log(`  INSERT ${p.service}/${p.promptKey} v${p.version}`);
        inserted++;
    }

    console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}, Total defined: ${prompts.length}`);
}

seed()
    .then(() => pool.end())
    .catch((err) => {
        console.error("Seed failed:", err);
        pool.end();
        process.exit(1);
    });
