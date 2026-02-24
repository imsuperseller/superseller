#!/usr/bin/env node
/**
 * Regenerate Yaron's TourReel V3 with ALL fixes:
 * - 1920x1080 forced output (fixed normalizeClip calls)
 * - Fresh Suno music (fixed priority bug)
 * - Longer durations (not rushed)
 * - Smoother transitions
 * - Room-specific negative prompts (no pillows in kitchen, etc.)
 * - Dynamic finale (pool detection)
 * - Upgraded to gemini-3-flash for vision analysis
 */
import pg from "pg";
import { Queue } from "bullmq";

const DB_URL = process.env.DATABASE_URL || "postgresql://admin:a1efbcd564b928d3ef1d7cae@localhost:5432/app_db";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "2ea94441a41477c9b8081659";

const YARON_USER_ID = "e81973b0-12f3-4d2d-8005-cc97913789bb";
const LISTING_ID = "003ebb0a-80a3-45e9-a6ed-074aff2c90f8";

// Extended durations for better room appreciation
const TOUR_SEQUENCE = [
  { from: "Exterior Front", to: "Front Door", transition_type: "walk" },
  { from: "Front Door", to: "Foyer", transition_type: "enter" },
  { from: "Foyer", to: "Dining Area", transition_type: "walk" },
  { from: "Dining Area", to: "Kitchen", transition_type: "walk" },
  { from: "Kitchen", to: "Breakfast Nook", transition_type: "walk" },
  { from: "Breakfast Nook", to: "Living Room", transition_type: "walk" },
  { from: "Living Room", to: "Primary Bedroom", transition_type: "walk" },
  { from: "Primary Bedroom", to: "Walk-in Closet", transition_type: "walk" },
  { from: "Walk-in Closet", to: "Primary Bathroom", transition_type: "walk" },
  { from: "Primary Bathroom", to: "Bedroom 2", transition_type: "walk" },
  { from: "Bedroom 2", to: "Bedroom 3", transition_type: "walk" },
  { from: "Bedroom 3", to: "Bedroom 4", transition_type: "walk" },
  { from: "Bedroom 4", to: "Bathroom 2", transition_type: "walk" },
  { from: "Bathroom 2", to: "Backyard", transition_type: "walk" },
];

const BASE_NEG = "cartoon, anime, CGI, duplicate person, two people, clone, extra person, different face, wrong furniture, misplaced objects, items on floor, floating objects, blurry, low quality, morphing, wall penetration";

/** Room-specific negative prompts (prevents pillows in kitchen, etc.) */
function getRoomNegative(roomName) {
  const lower = roomName.toLowerCase();

  if (lower.includes("kitchen")) {
    return `${BASE_NEG}, dirty dishes, food, pillows, bedroom items, living room furniture, couch, sofa`;
  }
  if (lower.includes("bathroom")) {
    return `${BASE_NEG}, toilet seat up, dirty towels, soap scum, kitchen items, chairs, pillows, bedroom furniture, appliances`;
  }
  if (lower.includes("bedroom")) {
    return `${BASE_NEG}, unmade bed, messy clothes, bathroom items, kitchen items, appliances`;
  }
  if (lower.includes("living")) {
    return `${BASE_NEG}, kitchen items, bathroom items, bedroom furniture, appliances`;
  }
  if (lower.includes("backyard") || lower.includes("pool")) {
    return `${BASE_NEG}, rain, cloudy sky, dead plants, brown lawn, trash, indoor furniture`;
  }

  // Default: base negative only
  return BASE_NEG;
}

/** Detect if property has pool from listing data */
function detectPool(listing) {
  const description = String(listing.description || "").toLowerCase();
  const amenities = JSON.stringify(listing.amenities || []).toLowerCase();

  // Definitive pool indicators
  const poolPhrases = ["swimming pool", "in-ground pool", "in ground pool", "private pool", "salt water pool"];
  const hasPoolPhrase = poolPhrases.some(p => description.includes(p) || amenities.includes(p));

  // Check amenities for "Pool: In Ground" etc.
  const hasPoolAmenity = /pool\s*:\s*(in ground|above ground|yes|private)/i.test(amenities);

  return hasPoolPhrase || hasPoolAmenity;
}

async function main() {
  const pool = new pg.Pool({ connectionString: DB_URL });

  try {
    // 1. Query listing to detect pool
    const listingResult = await pool.query(
      `SELECT description, amenities FROM listings WHERE id = $1`,
      [LISTING_ID]
    );
    const listing = listingResult.rows[0];
    const hasPool = detectPool(listing);

    console.log(`✅ Pool detected: ${hasPool ? "YES" : "NO"}`);

    // 2. Generate clips with room-specific negatives and dynamic finale
    const CLIPS_V3 = [
      {
        clip_number: 1, from_room: "Exterior Front", to_room: "Front Door", duration: 12,
        prompt: "@realtor walks naturally along the stone pathway toward the front door. Camera follows at eye-height, smooth dolly forward. Golden afternoon light on brick facade. @realtor turns back with warm welcoming gesture. Lush landscaping. Ground level, no aerial shots. Photorealistic. Lips closed, silent.",
        negative: getRoomNegative("Exterior Front"),
      },
      {
        clip_number: 2, from_room: "Front Door", to_room: "Foyer", duration: 8,
        prompt: "@realtor opens door, steps into bright foyer, gestures for viewer to follow. Camera pushes through doorway revealing entry space. A decorative console table with mirror gently descends from above, settling softly against the wall. Fresh flowers appear on the table as it lands. Camera holds to appreciate the staged entry. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Foyer"),
      },
      {
        clip_number: 3, from_room: "Foyer", to_room: "Dining Area", duration: 7,
        prompt: "@realtor walks from foyer into formal dining area, gesturing gracefully. Camera glides forward revealing dining table. Elegant centerpiece arrangement and decorative wall art float gently downward, settling perfectly as the camera moves. Camera holds briefly to show the completed staging. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Dining Area"),
      },
      {
        clip_number: 4, from_room: "Dining Area", to_room: "Kitchen", duration: 10,
        prompt: "@realtor enters spacious kitchen with pantry, gesturing toward countertops. Camera tracks along counter line revealing modern cabinetry and stainless steel appliances. Decorative fruit bowls, vase with greenery, and kitchen accessories descend gracefully onto counters. Camera pauses to appreciate the functional layout. Warm overhead lighting. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Kitchen"),
      },
      {
        clip_number: 5, from_room: "Kitchen", to_room: "Breakfast Nook", duration: 7,
        prompt: "@realtor walks into sun-filled breakfast nook, gesturing toward window-lit eating area. Camera dollies forward. Stylish table setting and fresh flowers in ceramic vase float down, settling softly. Natural morning light floods through windows. Camera holds to show the cozy breakfast space. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Breakfast Nook"),
      },
      {
        clip_number: 6, from_room: "Breakfast Nook", to_room: "Living Room", duration: 8,
        prompt: "@realtor transitions into open living room, extending arms to showcase space. Camera enters wide, dollies forward revealing full room depth. Throw pillows, cozy blanket, decorative books, and elegant floor lamp descend gently, settling into seating area with soft golden glow. Camera holds to appreciate the living space. Natural light through large windows. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Living Room"),
      },
      {
        clip_number: 7, from_room: "Living Room", to_room: "Primary Bedroom", duration: 10,
        prompt: "@realtor walks into generous primary suite, gesturing proudly toward spacious layout. Camera enters slowly, sweeps across full suite. Plush throw pillows, cashmere blanket, bedside accessories, and statement art piece float gracefully from above, landing softly onto bed and nightstands. Camera holds to show the impressive scale. Layered natural and warm ambient lighting. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Primary Bedroom"),
      },
      {
        clip_number: 8, from_room: "Primary Bedroom", to_room: "Walk-in Closet", duration: 6,
        prompt: "@realtor steps into walk-in closet, gesturing toward organized storage. Camera pushes in from doorway revealing shelving and hanging areas. Neatly folded sweaters, organized shoe displays, and decorative storage boxes gently float down, filling shelves elegantly. Camera holds to appreciate the organized space. Clean bright lighting. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Walk-in Closet"),
      },
      {
        clip_number: 9, from_room: "Walk-in Closet", to_room: "Primary Bathroom", duration: 10,
        prompt: "@realtor enters primary bathroom, gesturing toward large shower as standout feature. Camera sweeps in, captures shower area with modern fixtures, then settles on vanity. Fluffy rolled white towels, orchid in ceramic pot, artisan soap dispensers, and spa bath accessories descend gracefully onto vanity and shelves. Camera holds to show the spa-like bathroom. Bright clean lighting balanced with warm accents. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Primary Bathroom"),
      },
      {
        clip_number: 10, from_room: "Primary Bathroom", to_room: "Bedroom 2", duration: 7,
        prompt: "@realtor walks into well-proportioned secondary bedroom, gesturing toward window. Camera enters gently, pans to reveal full room. Decorative accent pillows, modern desk lamp, small potted succulent, and framed artwork float softly from above, landing delicately around the room. Camera holds to appreciate the bedroom. Soft natural light through curtains. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Bedroom 2"),
      },
      {
        clip_number: 11, from_room: "Bedroom 2", to_room: "Bedroom 3", duration: 7,
        prompt: "@realtor steps into third bedroom, gesturing with quiet confidence. Camera enters revealing room bathed in warm natural light. Cozy reading chair, decorative geometric cushions, and styled bookshelf arrangement gently descend, settling neatly. Camera holds to show the transformed space. Professional staging. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Bedroom 3"),
      },
      {
        clip_number: 12, from_room: "Bedroom 3", to_room: "Bedroom 4", duration: 7,
        prompt: "@realtor enters fourth bedroom near foyer, gesturing to present versatile space. Camera pushes in revealing room. Sleek desk with modern accessories, ergonomic chair, and organizational shelving float gently downward, staging room as perfect home office. Camera holds to appreciate the workspace. Natural light from window. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Bedroom 4"),
      },
      {
        clip_number: 13, from_room: "Bedroom 4", to_room: "Bathroom 2", duration: 6,
        prompt: "@realtor steps into secondary bathroom, gesturing toward clean modern fixtures. Camera pushes in gently showcasing vanity and shower area. Fresh folded spa towels, decorative tray with candles, and small lush plant descend gracefully, adding elevated touches. Camera holds to show the clean bathroom. Bright vanity lighting reflecting off mirror. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Bathroom 2"),
      },
      {
        clip_number: 14, from_room: "Bathroom 2", to_room: "Backyard", duration: 12,
        // DYNAMIC FINALE: Pool or no pool
        prompt: hasPool
          ? "@realtor steps through back door into spacious backyard with sparkling pool, turning to face camera with warm proud gesture toward outdoor entertainment space. Camera moves out onto patio, reveals manicured lawn, mature Texas landscaping, and beautiful pool area, then settles on widest panoramic view. Elegant patio furniture, string lights, and decorative planters descend gently, transforming yard into entertainment paradise. Pool clearly visible. Golden afternoon light. Grand finale. Steady eye-height. Photorealistic. Lips closed."
          : "@realtor steps through back door into spacious backyard, turning to face camera with warm proud gesture toward outdoor entertainment space. Camera moves out onto patio, reveals manicured lawn, mature Texas landscaping, and generous yard space perfect for family gatherings, then settles on widest panoramic view. Elegant patio furniture, string lights, and decorative planters descend gently, transforming yard into entertainment paradise. Golden afternoon light. Grand finale. Steady eye-height. Photorealistic. Lips closed.",
        negative: getRoomNegative("Backyard"),
      },
    ];

    // 3. Create new video_job (V3)
    const jobResult = await pool.query(
      `INSERT INTO video_jobs (id, listing_id, user_id, status, model_preference, tour_sequence, total_clips, completed_clips, progress_percent, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'pending', 'kling_3', $3, $4, 0, 0, NOW(), NOW())
       RETURNING id`,
      [LISTING_ID, YARON_USER_ID, JSON.stringify(TOUR_SEQUENCE), CLIPS_V3.length]
    );
    const jobId = jobResult.rows[0].id;
    console.log(`✅ Created video_job V3: ${jobId}`);

    // 4. Pre-seed clips with V3 prompts
    for (const c of CLIPS_V3) {
      await pool.query(
        `INSERT INTO clips (id, video_job_id, clip_number, from_room, to_room, prompt, negative_prompt, duration_seconds, status, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'pending', NOW())`,
        [jobId, c.clip_number, c.from_room, c.to_room, c.prompt, c.negative, c.duration]
      );
    }
    console.log(`✅ Seeded ${CLIPS_V3.length} clips with room-specific negative prompts`);

    // 5. Queue in BullMQ
    const queue = new Queue("video-pipeline", {
      connection: { host: "127.0.0.1", port: 6379, password: REDIS_PASSWORD },
    });
    await queue.add("generate", {
      jobId,
      listingId: LISTING_ID,
      userId: YARON_USER_ID,
    });
    console.log(`✅ Queued job ${jobId}`);
    console.log(`\n🎬 Monitor: pm2 logs tourreel-worker`);
    console.log(`📊 Status: SELECT status, progress_percent FROM video_jobs WHERE id = '${jobId}'`);

    await queue.close();
    await pool.end();
  } catch (err) {
    console.error("❌ Setup failed:", err);
    await pool.end();
    process.exit(1);
  }
}

main();
