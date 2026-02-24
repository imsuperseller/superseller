#!/usr/bin/env node
/**
 * Setup Yaron Yashar's TourReel video job with custom prompts.
 * Run on RackNerd: node tools/setup-yaron-job.mjs [--test]
 * --test: Only seed clip 1 for Stage 5 test
 */
import pg from "pg";
import { Queue } from "bullmq";

const DB_URL = process.env.DATABASE_URL || "postgresql://admin:a1efbcd564b928d3ef1d7cae@localhost:5432/app_db";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "2ea94441a41477c9b8081659";
const testOnly = process.argv.includes("--test");

const YARON_USER_ID = "e81973b0-12f3-4d2d-8005-cc97913789bb";
const LISTING_ID = "003ebb0a-80a3-45e9-a6ed-074aff2c90f8";

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

const NEG_ELEMENTS = "cartoon, anime, CGI, duplicate person, two people, clone, extra person, crowd, multiple people, different face, wrong person, invented furniture, changed decor, low quality, blurry, morphing, talking, mouth moving, wall penetration, object clipping";

const CLIP_PROMPTS = [
  {
    clip_number: 1, from_room: "Exterior Front", to_room: "Front Door", duration: 10,
    prompt: "A real estate agent @realtor walks naturally along the stone pathway toward the front door of this single-story Allen, Texas home. Golden afternoon sunlight washes across the brick facade. Ground level, steady eye-height camera. Slow dolly forward following the agent who turns back toward the camera with a warm, silent welcoming gesture toward the front entrance. Lush landscaping frames the approach. Photorealistic. Preserve exact architecture, landscaping, and front facade. Camera stays on the walkway. Lips closed, silent.",
    negative: NEG_ELEMENTS,
  },
  {
    clip_number: 2, from_room: "Front Door", to_room: "Foyer", duration: 5,
    prompt: "@realtor opens the front door and steps into the bright foyer, gesturing for the viewer to follow inside. Camera pushes through the doorway revealing the entry space with clean flooring. A decorative console table arrangement, fresh flowers, and a statement mirror gently descend from above, floating softly into place as the room comes alive with elegant staging. Steady eye-height camera. Single person only. Photorealistic. Preserve exact architecture. Lips closed, silent.",
    negative: NEG_ELEMENTS,
  },
  {
    clip_number: 3, from_room: "Foyer", to_room: "Dining Area", duration: 5,
    prompt: "@realtor walks from the foyer into the formal dining area, gesturing gracefully toward the space. Camera glides forward revealing the dining table and overhead light fixture. Elegant centerpiece arrangement, candle holders, and decorative wall art float gently downward from above, settling perfectly into position as if the room is being magically staged. Steady eye-height. Preserve exact architecture and style. Lips closed, silent.",
    negative: NEG_ELEMENTS,
  },
  {
    clip_number: 4, from_room: "Dining Area", to_room: "Kitchen", duration: 10,
    prompt: "@realtor leads into the spacious kitchen with pantry, gesturing excitedly toward the countertops and workspace. Camera tracks along the countertop line revealing modern cabinetry, stainless steel appliances, and the functional layout. Decorative fruit bowls, a vase of fresh greenery, pendant light glows, and elegant kitchen accessories gently descend from above and settle onto the counters. Warm overhead lighting creates depth. Steady eye-height camera. Photorealistic. Preserve exact room, fixtures, and style. Lips closed, silent.",
    negative: `${NEG_ELEMENTS}, dirty dishes, messy counters, open cabinets, food, cooking, steam`,
  },
  {
    clip_number: 5, from_room: "Kitchen", to_room: "Breakfast Nook", duration: 5,
    prompt: "@realtor walks from the kitchen into the sun-filled breakfast nook, gesturing toward the window-lit eating area. Camera dollies forward into the cozy space. A stylish table setting, fresh flowers in a ceramic vase, and colorful cushions float gracefully downward, settling softly into place. Natural morning light floods through the windows. Steady eye-height. Single person only. Preserve exact architecture. Lips closed, silent.",
    negative: NEG_ELEMENTS,
  },
  {
    clip_number: 6, from_room: "Breakfast Nook", to_room: "Living Room", duration: 5,
    prompt: "@realtor transitions into the open living room, extending arms to showcase the generous space. Camera enters wide, gently dollies forward revealing the full room depth and main windows. Throw pillows, a cozy knit blanket, decorative books, and an elegant floor lamp descend gently from above, settling into the seating area with a soft golden glow. Natural light floods through large windows. Steady eye-height. Preserve exact room and decor. Lips closed, silent.",
    negative: NEG_ELEMENTS,
  },
  {
    clip_number: 7, from_room: "Living Room", to_room: "Primary Bedroom", duration: 10,
    prompt: "@realtor walks into the generous primary suite, gesturing proudly toward the spacious layout and natural light. Camera enters slowly, sweeps across the full suite showing its impressive scale. Plush decorative throw pillows, a cashmere blanket, artisan bedside accessories, and a statement art piece float gracefully from above, landing softly onto the bed and nightstands. Layered lighting — natural window light blending with warm ambient tones. Steady eye-height. Photorealistic. Preserve exact room, furniture, and style. Lips closed, silent.",
    negative: `${NEG_ELEMENTS}, unmade bed, messy clothes, personal items scattered`,
  },
  {
    clip_number: 8, from_room: "Primary Bedroom", to_room: "Walk-in Closet", duration: 5,
    prompt: "@realtor steps into the walk-in closet, gesturing toward the organized storage space. Camera pushes in from the doorway, revealing the shelving and hanging areas. Neatly folded cashmere sweaters, organized shoe displays, and decorative storage boxes gently float down from above, filling the shelves in an elegant arrangement. Clean bright lighting. Steady eye-height camera. Single person only. Preserve exact architecture. Lips closed, silent.",
    negative: NEG_ELEMENTS,
  },
  {
    clip_number: 9, from_room: "Walk-in Closet", to_room: "Primary Bathroom", duration: 10,
    prompt: "@realtor enters the primary bathroom, gesturing toward the large shower as the standout feature. Camera sweeps in, captures the shower area with its modern fixtures, then settles on the vanity. Fluffy rolled white towels, an orchid in a ceramic pot, artisan soap dispensers, and spa-quality bath accessories descend gracefully from above, settling onto the vanity and shelves. Bright clean lighting balanced with warm accents. Steady eye-height camera. Photorealistic. Preserve exact room, fixtures, and tile work. Lips closed, silent.",
    negative: `${NEG_ELEMENTS}, toilet seat up, dirty towels, soap scum, water stains, shower running`,
  },
  {
    clip_number: 10, from_room: "Primary Bathroom", to_room: "Bedroom 2", duration: 5,
    prompt: "@realtor walks into a well-proportioned secondary bedroom, gesturing toward the window letting in natural light. Camera enters gently, pans to reveal the full room. Decorative accent pillows, a modern desk lamp, a small potted succulent, and framed artwork float softly from above, landing delicately around the room. Soft natural light through curtains creates a peaceful atmosphere. Steady eye-height. Preserve exact architecture. Lips closed, silent.",
    negative: `${NEG_ELEMENTS}, unmade bed, messy clothes, personal items scattered`,
  },
  {
    clip_number: 11, from_room: "Bedroom 2", to_room: "Bedroom 3", duration: 5,
    prompt: "@realtor steps into the third bedroom, gesturing toward its features with quiet confidence. Camera enters and reveals the room bathed in warm natural light. A cozy reading chair, decorative geometric cushions, and a styled bookshelf arrangement gently descend from above, settling neatly into the space. The room transforms with professional staging. Steady eye-height camera. Single person only. Preserve exact room and decor. Lips closed, silent.",
    negative: `${NEG_ELEMENTS}, unmade bed, messy clothes, personal items scattered`,
  },
  {
    clip_number: 12, from_room: "Bedroom 3", to_room: "Bedroom 4", duration: 5,
    prompt: "@realtor enters the fourth bedroom near the foyer, gesturing to present this versatile space. Camera pushes in from the doorway revealing the room. A sleek desk with modern accessories, an ergonomic chair, and organizational shelving float gently downward from above, staging the room as a perfect home office. Natural light from the window illuminates the workspace. Steady eye-height. Preserve exact architecture. Lips closed, silent.",
    negative: `${NEG_ELEMENTS}, unmade bed, messy clothes, personal items scattered`,
  },
  {
    clip_number: 13, from_room: "Bedroom 4", to_room: "Bathroom 2", duration: 5,
    prompt: "@realtor steps into the secondary bathroom, gesturing toward the clean modern fixtures. Camera pushes in gently from the doorway, showcasing the vanity and shower area. Fresh folded spa towels, a decorative tray with candles, and a small lush plant descend gracefully from above, adding elevated touches. Bright vanity lighting reflecting off the mirror creates a clean, fresh feel. Steady eye-height. Preserve exact room and fixtures. Lips closed, silent.",
    negative: `${NEG_ELEMENTS}, toilet seat up, dirty towels, soap scum, water stains, shower running`,
  },
  {
    clip_number: 14, from_room: "Bathroom 2", to_room: "Backyard", duration: 10,
    prompt: "@realtor steps through the back door into the spacious backyard, turning to face the camera with a warm, proud gesture toward the outdoor entertainment space. Camera moves out onto the patio, reveals the manicured lawn and mature Texas landscaping, then settles on the widest panoramic view. Elegant patio furniture, string lights, and decorative planters descend gently from above, transforming the yard into an entertainment paradise under golden afternoon light. The grand finale. Steady eye-height. Photorealistic. Lips closed, silent.",
    negative: `${NEG_ELEMENTS}, rain, cloudy sky, dead plants, brown lawn, trash`,
  },
];

async function main() {
  const pool = new pg.Pool({ connectionString: DB_URL });

  try {
    // 1. Create video_job
    const jobResult = await pool.query(
      `INSERT INTO video_jobs (id, listing_id, user_id, status, model_preference, tour_sequence, total_clips, completed_clips, progress_percent, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'pending', 'kling_3', $3, $4, 0, 0, NOW(), NOW())
       RETURNING id`,
      [LISTING_ID, YARON_USER_ID, JSON.stringify(TOUR_SEQUENCE), CLIP_PROMPTS.length]
    );
    const jobId = jobResult.rows[0].id;
    console.log(`Created video_job: ${jobId}`);

    // 2. Pre-seed clips
    const clipsToSeed = testOnly ? CLIP_PROMPTS.slice(0, 1) : CLIP_PROMPTS;
    for (const c of clipsToSeed) {
      await pool.query(
        `INSERT INTO clips (id, video_job_id, clip_number, from_room, to_room, prompt, negative_prompt, duration_seconds, status, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'pending', NOW())`,
        [jobId, c.clip_number, c.from_room, c.to_room, c.prompt, c.negative, c.duration]
      );
    }
    console.log(`Seeded ${clipsToSeed.length} clip(s) with custom prompts`);

    // 3. Add to BullMQ queue
    const queue = new Queue("video-pipeline", {
      connection: { host: "127.0.0.1", port: 6379, password: REDIS_PASSWORD },
    });
    await queue.add("generate", {
      jobId,
      listingId: LISTING_ID,
      userId: YARON_USER_ID,
    });
    console.log(`Queued job ${jobId} in BullMQ`);

    await queue.close();
    await pool.end();
    console.log("Done. Monitor with: pm2 logs tourreel-worker");
  } catch (err) {
    console.error("Setup failed:", err);
    await pool.end();
    process.exit(1);
  }
}

main();
