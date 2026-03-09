/**
 * Seed Instagram Content Rules, Hashtag Sets & Caption Templates
 *
 * Run: npx tsx tools/seed-ig-content-rules.ts
 * Idempotent: Uses ON CONFLICT DO UPDATE (upsert) for all inserts.
 *
 * Data sourced from deep research (March 2026):
 * - Instagram platform rules (Dec 2025 hashtag cap, Graph API limits)
 * - DFW remodeling hashtag strategy
 * - Caption best practices per content type
 *
 * Reference: docs/INSTAGRAM_RULES_2025_2026.md
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Tenant: elite-pro-remodeling ──
const TENANT = "elite-pro-remodeling";

// ═══════════════════════════════════════════════════════════════════
// 1. IG CONTENT RULES
// ═══════════════════════════════════════════════════════════════════

interface Rule {
  contentType: string;
  ruleCategory: string;
  ruleKey: string;
  value: unknown;
  description: string;
  source: string;
  priority?: number;
}

const rules: Rule[] = [
  // ── Platform Limits (apply to ALL content types) ──
  {
    contentType: "all",
    ruleCategory: "platform_limits",
    ruleKey: "max_hashtags",
    value: 5,
    description: "Instagram hard limit: 5 hashtags per post/Reel (enforced Dec 2025). Always use exactly 5.",
    source: "Instagram @creators Dec 18 2025",
    priority: 100,
  },
  {
    contentType: "all",
    ruleCategory: "platform_limits",
    ruleKey: "max_caption_chars",
    value: 2200,
    description: "Maximum caption length including hashtags and spaces.",
    source: "Instagram Help Center",
    priority: 100,
  },
  {
    contentType: "all",
    ruleCategory: "platform_limits",
    ruleKey: "api_publish_limit_24h",
    value: 100,
    description: "Max 100 posts per account per rolling 24h window (carousels count as 1).",
    source: "Meta Graph API docs",
    priority: 100,
  },
  {
    contentType: "all",
    ruleCategory: "platform_limits",
    ruleKey: "hashtag_placement",
    value: "caption",
    description: "Hashtags go in caption (NOT first comment). Caption placement = 36% more reach for <5K accounts.",
    source: "Instagram data analysis, Social Media Today",
    priority: 90,
  },

  // ── Reel-specific rules ──
  {
    contentType: "reel",
    ruleCategory: "platform_limits",
    ruleKey: "max_duration_seconds",
    value: 1200,
    description: "Reels can be up to 20 minutes (2026 update).",
    source: "Instagram 2026 update",
  },
  {
    contentType: "reel",
    ruleCategory: "best_practices",
    ruleKey: "optimal_duration_seconds",
    value: { discovery: [7, 30], depth: [60, 90] },
    description: "7-30s for maximum discovery/reach; 60-90s for educational depth content.",
    source: "Hootsuite + Sprout Social analysis 2026",
    priority: 80,
  },
  {
    contentType: "reel",
    ruleCategory: "best_practices",
    ruleKey: "first_3_seconds_hook",
    value: true,
    description: "Instagram HEAVILY weights first 3 seconds. Never start with logo/slow pan. Start with visual hook.",
    source: "Adam Mosseri confirmed, Jan 2025",
    priority: 95,
  },
  {
    contentType: "reel",
    ruleCategory: "best_practices",
    ruleKey: "caption_visible_chars",
    value: 55,
    description: "Only ~55 characters visible before truncation on Reels. Hook must fit in 55 chars.",
    source: "Instagram UI measurement",
    priority: 85,
  },
  {
    contentType: "reel",
    ruleCategory: "dimensions",
    ruleKey: "aspect_ratio",
    value: "9:16",
    description: "Vertical 1080x1920 recommended for full-screen experience.",
    source: "Instagram Help Center",
  },
  {
    contentType: "reel",
    ruleCategory: "dimensions",
    ruleKey: "cover_image",
    value: { width: 1080, height: 1920, gridCrop: "1080x1080 center" },
    description: "Cover at 9:16; center 1:1 square shows on profile grid. Design covers with center-safe text.",
    source: "Instagram Help Center",
  },
  {
    contentType: "reel",
    ruleCategory: "dimensions",
    ruleKey: "text_safe_zone",
    value: { topPx: 108, bottomPx: 320, leftPx: 60, rightPx: 120, minFontPx: 42, maxCharsPerLine: 30 },
    description: "Keep text within safe zone to avoid Instagram UI overlays (buttons, captions, username).",
    source: "Instagram UI measurement",
  },
  {
    contentType: "reel",
    ruleCategory: "compliance",
    ruleKey: "music_business_account",
    value: { allowed: "meta_sound_collection_only", copyrighted: false, consequence: "audio_muted_or_removal" },
    description: "Business accounts CANNOT use copyrighted music. Must use Meta Sound Collection (14K+ royalty-free tracks) or original audio.",
    source: "Instagram Help Center",
    priority: 100,
  },
  {
    contentType: "reel",
    ruleCategory: "compliance",
    ruleKey: "no_tiktok_watermark",
    value: true,
    description: "Reels with TikTok/CapCut watermarks are penalized in distribution.",
    source: "Adam Mosseri statement + Hootsuite analysis",
    priority: 95,
  },
  {
    contentType: "reel",
    ruleCategory: "scheduling",
    ruleKey: "frequency",
    value: { perWeek: [2, 4], bestDays: ["tuesday", "wednesday", "thursday"] },
    description: "2-4 Reels per week. Best days: Tue/Wed/Thu.",
    source: "Sprout Social 2026",
  },
  {
    contentType: "reel",
    ruleCategory: "scheduling",
    ruleKey: "best_times",
    value: { general: ["18:00-21:00"], homeServices: ["19:00-21:00", "09:00-11:00_saturday"] },
    description: "Reels perform best 6-9PM. Home services audience: evening + Saturday morning.",
    source: "Sprout Social + Shopify 2026",
  },
  {
    contentType: "reel",
    ruleCategory: "best_practices",
    ruleKey: "api_specs",
    value: { format: ["MOV", "MP4"], audioCodec: "AAC", maxAudioRate: 48000, videoCodec: "H.264", fps: [23, 60], maxDurationApi: 90 },
    description: "Graph API Reel publishing specs. Note: API max is 90s even though app supports 20min.",
    source: "Meta Graph API docs",
  },

  // ── Story-specific rules ──
  {
    contentType: "story",
    ruleCategory: "platform_limits",
    ruleKey: "max_per_24h",
    value: 100,
    description: "Maximum 100 Stories per 24-hour window.",
    source: "Instagram limits",
  },
  {
    contentType: "story",
    ruleCategory: "platform_limits",
    ruleKey: "video_max_duration_seconds",
    value: 60,
    description: "Each Story video slide: max 60 seconds.",
    source: "Instagram Help Center",
  },
  {
    contentType: "story",
    ruleCategory: "platform_limits",
    ruleKey: "photo_display_seconds",
    value: 7,
    description: "Photo Stories auto-display for 7 seconds.",
    source: "Instagram",
  },
  {
    contentType: "story",
    ruleCategory: "platform_limits",
    ruleKey: "visibility_hours",
    value: 24,
    description: "Stories expire after 24 hours (auto-archived to account).",
    source: "Instagram",
  },
  {
    contentType: "story",
    ruleCategory: "platform_limits",
    ruleKey: "hashtag_limit",
    value: null,
    description: "Stories use sticker-based hashtags, NOT subject to the 5-cap. But hashtag sticker has minimal discovery impact in 2026.",
    source: "Instagram 2026 behavior",
  },
  {
    contentType: "story",
    ruleCategory: "best_practices",
    ruleKey: "interactive_stickers",
    value: ["poll", "question", "quiz", "emoji_slider", "countdown", "add_yours", "music", "location", "mention", "link", "product_tag", "ai_sticker", "gif"],
    description: "Available interactive stickers. Use polls/questions for engagement. Link sticker available to ALL accounts (no follower minimum).",
    source: "Instagram Help Center 2026",
  },
  {
    contentType: "story",
    ruleCategory: "best_practices",
    ruleKey: "api_sticker_support",
    value: false,
    description: "Graph API can publish Stories (image + video) but CANNOT add stickers, links, or interactive elements via API.",
    source: "Meta Graph API docs",
    priority: 90,
  },
  {
    contentType: "story",
    ruleCategory: "scheduling",
    ruleKey: "frequency",
    value: { perDay: [3, 7] },
    description: "3-7 Stories per day for optimal engagement. Daily posting is expected.",
    source: "Hootsuite 2026",
  },
  {
    contentType: "story",
    ruleCategory: "best_practices",
    ruleKey: "highlights",
    value: { coverSize: "1080x1920", displaySize: "161x161_circle", categories: ["portfolio", "reviews", "process", "before_after", "faq"] },
    description: "Create branded Highlight covers. Recommended categories for home remodeling business.",
    source: "Internal strategy",
  },

  // ── Carousel-specific rules ──
  {
    contentType: "carousel",
    ruleCategory: "platform_limits",
    ruleKey: "max_slides",
    value: 20,
    description: "Up to 20 slides per carousel. Can mix photos + videos.",
    source: "Instagram Help Center",
  },
  {
    contentType: "carousel",
    ruleCategory: "platform_limits",
    ruleKey: "max_image_size_mb",
    value: 30,
    description: "Max 30 MB per image slide.",
    source: "Instagram Help Center",
  },
  {
    contentType: "carousel",
    ruleCategory: "platform_limits",
    ruleKey: "max_video_size_mb",
    value: 4096,
    description: "Max 4 GB per video slide.",
    source: "Instagram Help Center",
  },
  {
    contentType: "carousel",
    ruleCategory: "platform_limits",
    ruleKey: "aspect_ratio_constraint",
    value: "all_slides_must_match_first",
    description: "All slides auto-crop to match the FIRST slide's aspect ratio. Mismatched = cut-off content.",
    source: "Instagram Help Center",
    priority: 95,
  },
  {
    contentType: "carousel",
    ruleCategory: "best_practices",
    ruleKey: "optimal_aspect_ratio",
    value: { ratio: "4:5", pixels: "1080x1350" },
    description: "4:5 portrait takes up maximum feed space. Recommended for all carousel content.",
    source: "Hootsuite + Buffer analysis",
    priority: 80,
  },
  {
    contentType: "carousel",
    ruleCategory: "best_practices",
    ruleKey: "optimal_slides",
    value: { engagement: [7, 10], educational: [10, 20] },
    description: "7-10 slides optimal for engagement. Use all 20 for educational/tutorial content.",
    source: "Sprout Social data 2025",
  },
  {
    contentType: "carousel",
    ruleCategory: "best_practices",
    ruleKey: "engagement_rate",
    value: 10.15,
    description: "Carousels average 10.15% engagement — highest of ANY Instagram content type.",
    source: "Social Media Today 2025 data",
    priority: 70,
  },
  {
    contentType: "carousel",
    ruleCategory: "scheduling",
    ruleKey: "frequency",
    value: { perWeek: [1, 2] },
    description: "1-2 carousels per week. High effort but highest engagement payoff.",
    source: "Hootsuite 2026",
  },

  // ── Feed post rules ──
  {
    contentType: "post",
    ruleCategory: "best_practices",
    ruleKey: "caption_visible_chars",
    value: 125,
    description: "Only ~125 characters visible before 'more' button on feed posts. Hook MUST fit in 125 chars.",
    source: "Instagram UI measurement",
    priority: 85,
  },
  {
    contentType: "post",
    ruleCategory: "best_practices",
    ruleKey: "optimal_caption_length",
    value: { short: [0, 300], medium: [300, 500], long: [500, 2200] },
    description: "300-500 chars increases time-on-post. Longer captions = more engagement for feed posts.",
    source: "Buffer + Hootsuite data",
  },
  {
    contentType: "post",
    ruleCategory: "dimensions",
    ruleKey: "photo_specs",
    value: { format: "JPEG", maxSizeMb: 8, aspectRatio: { min: "4:5", max: "1.91:1" }, recommended: "1080x1350" },
    description: "API photo specs. 4:5 portrait recommended for maximum feed real estate.",
    source: "Meta Graph API docs",
  },
  {
    contentType: "post",
    ruleCategory: "scheduling",
    ruleKey: "frequency",
    value: { perWeek: [3, 5], perDay: [1, 2] },
    description: "3-5 feed posts per week, max 1-2 per day.",
    source: "Sprout Social + Hootsuite 2026",
  },

  // ── Algorithm signals (apply to ALL) ──
  {
    contentType: "all",
    ruleCategory: "best_practices",
    ruleKey: "algorithm_ranking_signals",
    value: {
      "1_watch_time": "Strongest signal. First 3 seconds critical threshold.",
      "2_dm_shares": "Strongest for reaching NEW audiences beyond followers.",
      "3_likes_per_reach": "For reaching existing followers.",
      "4_saves": "Strong — content worth revisiting.",
      "5_comments": "Moderate signal.",
      "6_profile_visits": "Strong interest signal.",
      "7_follow_after_viewing": "Strongest interest signal.",
    },
    description: "Instagram algorithm ranking signals in order of importance (confirmed by Adam Mosseri Jan 2025).",
    source: "Adam Mosseri Jan 2025",
    priority: 90,
  },

  // ── Compliance rules for home services ──
  {
    contentType: "all",
    ruleCategory: "compliance",
    ruleKey: "before_after_rules",
    value: { restriction: "none_for_home_reno", note: "Before/after restrictions only apply to weight loss and cosmetic surgery, NOT home renovation." },
    description: "No Instagram restriction on before/after home renovation photos. Best practice: same angle, same lighting.",
    source: "Instagram Community Guidelines",
  },
  {
    contentType: "all",
    ruleCategory: "compliance",
    ruleKey: "testimonial_rules",
    value: { ftc: "disclose_if_incentivized", best_practice: "screenshot_real_reviews_with_permission" },
    description: "FTC requires disclosure if testimonial is incentivized. Screenshot real Google/Yelp reviews with permission.",
    source: "FTC Endorsement Guidelines",
  },
  {
    contentType: "all",
    ruleCategory: "compliance",
    ruleKey: "cross_posting_penalties",
    value: { tiktok_watermark: "penalized", duplicate_content: "replaced_with_original", aggregator_penalty: "60-80% reach drop" },
    description: "Remove all watermarks, resize natively, add platform-specific elements when cross-posting.",
    source: "Hootsuite + Instagram 2025 data",
    priority: 90,
  },
  {
    contentType: "all",
    ruleCategory: "compliance",
    ruleKey: "texas_contractor_advertising",
    value: { note: "Texas may require license number in some advertising. Verify local requirements." },
    description: "Texas contractor advertising compliance. Check local licensing display requirements.",
    source: "Texas state law",
  },

  // ── Content mix strategy ──
  {
    contentType: "all",
    ruleCategory: "best_practices",
    ruleKey: "weekly_content_mix",
    value: {
      reels: { perWeek: 3, note: "1 before/after transformation + 1 process/BTS + 1 tips/educational" },
      stories: { perDay: 5, note: "Mix of polls, progress updates, behind-scenes, client interactions" },
      carousels: { perWeek: 1, note: "Before/after slide deck OR educational tips series" },
      posts: { perWeek: 0, note: "All feed content should be Reels or Carousels for max reach. Static posts are lowest reach." },
    },
    description: "30/30/30 content plan: 1 Reel + 1 Story + 1 Carousel per day adjusted for optimal frequency.",
    source: "Internal Elite Pro strategy",
    priority: 85,
  },
];

// ═══════════════════════════════════════════════════════════════════
// 2. HASHTAG SETS
// ═══════════════════════════════════════════════════════════════════

interface HashtagSet {
  setName: string;
  contentCategory: string;
  hashtags: string[];
  reasoning: string;
  rotationGroup: number;
}

const hashtagSets: HashtagSet[] = [
  {
    setName: "kitchen_before_after",
    contentCategory: "before_after",
    hashtags: ["#KitchenRemodel", "#DFWRemodeling", "#BeforeAndAfter", "#DreamKitchen", "#EliteProRemodeling"],
    reasoning: "Mid-tier service tag + geo + content-type signal + aspirational audience + branded. Optimized for transformation content.",
    rotationGroup: 1,
  },
  {
    setName: "bathroom_before_after",
    contentCategory: "before_after",
    hashtags: ["#BathroomRemodel", "#DallasRemodeling", "#BathroomMakeover", "#LuxuryBathroom", "#EliteProRemodeling"],
    reasoning: "Core service + geo variant + transformation signal + premium positioning + branded.",
    rotationGroup: 1,
  },
  {
    setName: "outdoor_living",
    contentCategory: "before_after",
    hashtags: ["#OutdoorLiving", "#DFWContractor", "#BackyardOasis", "#PatioDesign", "#EliteProRemodeling"],
    reasoning: "Mid-tier lifestyle + geo + aspiration + specific service + branded. Strong for Texas outdoor content.",
    rotationGroup: 2,
  },
  {
    setName: "full_home_renovation",
    contentCategory: "before_after",
    hashtags: ["#HomeRenovation", "#DFWRemodeling", "#Remodeling", "#CustomHomes", "#EliteProRemodeling"],
    reasoning: "Broad mid-tier + geo + industry core + premium audience + branded.",
    rotationGroup: 2,
  },
  {
    setName: "design_inspiration",
    contentCategory: "inspiration",
    hashtags: ["#KitchenDesign", "#InteriorDesign", "#HomeDesign", "#DallasHomes", "#EliteProRemodeling"],
    reasoning: "Design-browsing audience + large tier for visual reach + mid-tier + geo lifestyle + branded.",
    rotationGroup: 3,
  },
  {
    setName: "project_progress_bts",
    contentCategory: "progress",
    hashtags: ["#Renovation", "#DFWContractor", "#GeneralContractor", "#DesignBuild", "#EliteProRemodeling"],
    reasoning: "Broad reach + local trade + industry credibility + process-focused + branded.",
    rotationGroup: 3,
  },
  {
    setName: "tips_educational",
    contentCategory: "tips",
    hashtags: ["#HomeImprovement", "#DFWRemodeling", "#RemodelingTips", "#HomeRenovationProject", "#EliteProRemodeling"],
    reasoning: "Broad educational discovery + geo + intent (seeking advice) + planning-phase homeowners + branded.",
    rotationGroup: 4,
  },
  {
    setName: "testimonial_reviews",
    contentCategory: "testimonial",
    hashtags: ["#HomeRemodel", "#DallasRemodeling", "#HappyHomeowner", "#FiveStarReview", "#EliteProRemodeling"],
    reasoning: "Service + geo + social proof signal + trust content + branded.",
    rotationGroup: 4,
  },
  {
    setName: "team_culture",
    contentCategory: "team",
    hashtags: ["#ContractorLife", "#DFWContractor", "#BuildingDreams", "#TeamWork", "#EliteProRemodeling"],
    reasoning: "Community/culture + geo + aspirational brand + culture signal + branded.",
    rotationGroup: 1,
  },
  {
    setName: "material_specific",
    contentCategory: "material_specific",
    hashtags: ["#TileDesign", "#Countertops", "#KitchenCabinets", "#DFWRemodeling", "#EliteProRemodeling"],
    reasoning: "Material-specific tags attract active decision-makers in buying phase + geo + branded.",
    rotationGroup: 2,
  },
];

// Suburb-specific geo swaps — stored as rule, not separate sets
const suburbGeoSwaps: Rule = {
  contentType: "all",
  ruleCategory: "hashtags",
  ruleKey: "suburb_geo_swaps",
  value: {
    plano: "#PlanoTX",
    frisco: "#FriscoTX",
    mckinney: "#McKinneyTX",
    allen: "#AllenTX",
    richardson: "#RichardsonTX",
    flower_mound: "#FlowerMoundTX",
    southlake: "#SouthlakeTX",
    colleyville: "#ColleyvilleTX",
    fort_worth: "#FortWorthTX",
    arlington: "#ArlingtonTX",
  },
  description: "When posting a project from a specific suburb, swap the geo hashtag (slot 2) with the suburb-specific tag for hyper-local discovery.",
  source: "DFW remodeling hashtag strategy",
  priority: 70,
};

// ═══════════════════════════════════════════════════════════════════
// 3. CAPTION TEMPLATES
// ═══════════════════════════════════════════════════════════════════

interface CaptionTemplate {
  contentType: string;
  scenario: string;
  hookTemplate: string;
  bodyTemplate: string;
  ctaTemplate: string;
  language: string;
  captionLength: string;
  exampleCaption: string;
}

const captionTemplates: CaptionTemplate[] = [
  // ── Reel captions (55 char hook) ──
  {
    contentType: "reel",
    scenario: "before_after",
    hookTemplate: "Wait for the transformation... 🏠✨",
    bodyTemplate: "From {{before_state}} to {{after_state}} in {{timeframe}}. {{project_detail}}. Every detail matters when it's someone's home.",
    ctaTemplate: "📞 Ready to transform your {{room_type}}? Link in bio or call (800) 476-7608",
    language: "en",
    captionLength: "medium",
    exampleCaption: "Wait for the transformation... 🏠✨\n\nFrom outdated 90s kitchen to a modern chef's dream in 6 weeks. Custom cabinetry, quartz countertops, and statement lighting. Every detail matters when it's someone's home.\n\n📞 Ready to transform your kitchen? Link in bio or call (800) 476-7608\n\n#KitchenRemodel #DFWRemodeling #BeforeAndAfter #DreamKitchen #EliteProRemodeling",
  },
  {
    contentType: "reel",
    scenario: "progress",
    hookTemplate: "Day {{day_number}} on this {{project_type}} 🔨",
    bodyTemplate: "{{progress_detail}}. The team is making incredible progress. {{technical_note}}.",
    ctaTemplate: "Follow along for the full transformation 👉 Save this for inspiration!",
    language: "en",
    captionLength: "short",
    exampleCaption: "Day 14 on this master bathroom 🔨\n\nTile work is going in. The team is making incredible progress. Custom herringbone pattern with heated floors.\n\nFollow along for the full transformation 👉 Save this for inspiration!\n\n#Renovation #DFWContractor #GeneralContractor #DesignBuild #EliteProRemodeling",
  },
  {
    contentType: "reel",
    scenario: "tips",
    hookTemplate: "{{number}} things to know before {{action}} 👇",
    bodyTemplate: "{{tip_1}}\n{{tip_2}}\n{{tip_3}}\n\n{{why_it_matters}}",
    ctaTemplate: "💡 Save this for when you're ready to start. DM us your questions!",
    language: "en",
    captionLength: "medium",
    exampleCaption: "3 things to know before remodeling your kitchen 👇\n\n1️⃣ Budget 20% extra for the unexpected\n2️⃣ Temporary kitchen setup saves your sanity\n3️⃣ Cabinet lead times are 6-8 weeks — order early\n\nThese small steps save homeowners thousands.\n\n💡 Save this for when you're ready to start. DM us your questions!\n\n#HomeImprovement #DFWRemodeling #RemodelingTips #HomeRenovationProject #EliteProRemodeling",
  },

  // ── Carousel captions (125 char hook) ──
  {
    contentType: "carousel",
    scenario: "before_after",
    hookTemplate: "Swipe to see the transformation → {{room_type}} before vs. after 🏠 (You won't believe slide {{best_slide}})",
    bodyTemplate: "{{project_overview}}.\n\n📋 Scope: {{scope}}\n⏱️ Timeline: {{timeline}}\n✅ Materials: {{materials}}",
    ctaTemplate: "Want this for your home? 📞 (800) 476-7608 or DM us",
    language: "en",
    captionLength: "medium",
    exampleCaption: "Swipe to see the transformation → Kitchen before vs. after 🏠 (You won't believe slide 5)\n\nComplete gut renovation for a family in Plano. Open concept with island, custom shaker cabinets, waterfall quartz countertop.\n\n📋 Scope: Full kitchen gut + island addition\n⏱️ Timeline: 8 weeks\n✅ Materials: Custom shaker cabinets, quartz countertops, statement pendants\n\nWant this for your home? 📞 (800) 476-7608 or DM us\n\n#KitchenRemodel #DFWRemodeling #BeforeAndAfter #DreamKitchen #EliteProRemodeling",
  },
  {
    contentType: "carousel",
    scenario: "tips",
    hookTemplate: "{{number}} mistakes homeowners make when {{topic}} (and how to avoid them) → Swipe to save 💡",
    bodyTemplate: "We see these every week on the job. Slide through to learn from other homeowners' costly mistakes.\n\n{{summary}}",
    ctaTemplate: "Save this post 📌 Share with someone planning a remodel!",
    language: "en",
    captionLength: "medium",
    exampleCaption: "5 mistakes homeowners make when choosing countertops (and how to avoid them) → Swipe to save 💡\n\nWe see these every week on the job. Slide through to learn from other homeowners' costly mistakes.\n\nFrom picking material without seeing a full slab to forgetting about edge profiles — each slide covers one mistake and the fix.\n\nSave this post 📌 Share with someone planning a remodel!\n\n#HomeImprovement #DFWRemodeling #RemodelingTips #HomeRenovationProject #EliteProRemodeling",
  },

  // ── Story captions (ephemeral, shorter) ──
  {
    contentType: "story",
    scenario: "progress",
    hookTemplate: "On site today 🔨 {{location}}",
    bodyTemplate: "{{quick_update}}",
    ctaTemplate: "Poll: Which finish do you prefer? 🤔",
    language: "en",
    captionLength: "short",
    exampleCaption: "On site today 🔨 Plano kitchen\n\nCabinet install day! Almost there.\n\n[POLL STICKER: White shaker or Navy blue?]",
  },
  {
    contentType: "story",
    scenario: "testimonial",
    hookTemplate: "What our clients say 💬",
    bodyTemplate: "{{client_quote}}",
    ctaTemplate: "Tap the link to start your project ↗️",
    language: "en",
    captionLength: "short",
    exampleCaption: "What our clients say 💬\n\n\"Elite Pro transformed our outdated bathroom into a spa. Professional, on time, on budget.\"\n— Sarah, Frisco TX\n\n[LINK STICKER: Free consultation]",
  },

  // ── Post (static image) captions ──
  {
    contentType: "post",
    scenario: "testimonial",
    hookTemplate: "\"{{client_quote_first_line}}\" — Real words from a real client 🙏",
    bodyTemplate: "{{full_testimonial}}\n\nWe don't just remodel homes — we make families love where they live. {{client_name}} trusted us with their {{project_type}} and the results speak for themselves.",
    ctaTemplate: "📞 Your dream {{room_type}} is one call away: (800) 476-7608",
    language: "en",
    captionLength: "long",
    exampleCaption: "\"They turned our kitchen nightmare into a dream\" — Real words from a real client 🙏\n\n\"We had a terrible experience with another contractor. Elite Pro came in, fixed everything, and delivered beyond what we imagined. Professional from day one to final walkthrough.\"\n\nWe don't just remodel homes — we make families love where they live. The Martinez family trusted us with their kitchen and the results speak for themselves.\n\n📞 Your dream kitchen is one call away: (800) 476-7608\n\n#HomeRemodel #DallasRemodeling #HappyHomeowner #FiveStarReview #EliteProRemodeling",
  },
];

// ═══════════════════════════════════════════════════════════════════
// SEED EXECUTION
// ═══════════════════════════════════════════════════════════════════

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS ig_content_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        content_type TEXT NOT NULL,
        rule_category TEXT NOT NULL,
        rule_key TEXT NOT NULL,
        value JSONB NOT NULL,
        description TEXT,
        source TEXT,
        priority INTEGER DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        meta JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_ig_rules_tenant_type_cat_key UNIQUE (tenant_id, content_type, rule_category, rule_key)
      );
      CREATE INDEX IF NOT EXISTS idx_ig_rules_lookup ON ig_content_rules (tenant_id, content_type, rule_category);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hashtag_sets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        set_name TEXT NOT NULL,
        content_category TEXT NOT NULL,
        hashtags JSONB NOT NULL,
        reasoning TEXT,
        rotation_group INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        last_used_at TIMESTAMPTZ,
        avg_reach DOUBLE PRECISION,
        avg_engagement DOUBLE PRECISION,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        meta JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_hashtag_sets_tenant_name UNIQUE (tenant_id, set_name)
      );
      CREATE INDEX IF NOT EXISTS idx_hashtag_sets_category ON hashtag_sets (tenant_id, content_category);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS caption_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        content_type TEXT NOT NULL,
        scenario TEXT NOT NULL,
        hook_template TEXT NOT NULL,
        body_template TEXT,
        cta_template TEXT,
        language TEXT NOT NULL DEFAULT 'en',
        caption_length TEXT NOT NULL DEFAULT 'medium',
        example_caption TEXT,
        hashtag_set_id UUID REFERENCES hashtag_sets(id),
        usage_count INTEGER DEFAULT 0,
        avg_engagement DOUBLE PRECISION,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        meta JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_caption_tmpl_tenant_type_scenario_lang UNIQUE (tenant_id, content_type, scenario, language)
      );
      CREATE INDEX IF NOT EXISTS idx_caption_tmpl_lookup ON caption_templates (tenant_id, content_type);
    `);

    // Upsert rules (including suburb geo swaps)
    const allRules = [...rules, suburbGeoSwaps];
    for (const r of allRules) {
      await client.query(
        `INSERT INTO ig_content_rules (tenant_id, content_type, rule_category, rule_key, value, description, source, priority)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (tenant_id, content_type, rule_category, rule_key)
         DO UPDATE SET value = $5, description = $6, source = $7, priority = $8, updated_at = NOW()`,
        [TENANT, r.contentType, r.ruleCategory, r.ruleKey, JSON.stringify(r.value), r.description, r.source, r.priority ?? 0]
      );
    }
    console.log(`✅ ${allRules.length} ig_content_rules upserted`);

    // Upsert hashtag sets
    for (const hs of hashtagSets) {
      await client.query(
        `INSERT INTO hashtag_sets (tenant_id, set_name, content_category, hashtags, reasoning, rotation_group)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (tenant_id, set_name)
         DO UPDATE SET hashtags = $4, reasoning = $5, rotation_group = $6, content_category = $3, updated_at = NOW()`,
        [TENANT, hs.setName, hs.contentCategory, JSON.stringify(hs.hashtags), hs.reasoning, hs.rotationGroup]
      );
    }
    console.log(`✅ ${hashtagSets.length} hashtag_sets upserted`);

    // Get hashtag set IDs for linking to caption templates
    const setIds = new Map<string, string>();
    const setResult = await client.query(`SELECT id, set_name FROM hashtag_sets WHERE tenant_id = $1`, [TENANT]);
    for (const row of setResult.rows) {
      setIds.set(row.set_name, row.id);
    }

    // Map scenario → best matching hashtag set
    const scenarioToSet: Record<string, string> = {
      before_after: "kitchen_before_after",
      progress: "project_progress_bts",
      tips: "tips_educational",
      testimonial: "testimonial_reviews",
      team: "team_culture",
      inspiration: "design_inspiration",
      offer: "full_home_renovation",
    };

    // Upsert caption templates
    for (const ct of captionTemplates) {
      const matchedSetName = scenarioToSet[ct.scenario];
      const hashtagSetId = matchedSetName ? setIds.get(matchedSetName) ?? null : null;

      await client.query(
        `INSERT INTO caption_templates (tenant_id, content_type, scenario, hook_template, body_template, cta_template, language, caption_length, example_caption, hashtag_set_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (tenant_id, content_type, scenario, language)
         DO UPDATE SET hook_template = $4, body_template = $5, cta_template = $6, caption_length = $8, example_caption = $9, hashtag_set_id = $10, updated_at = NOW()`,
        [TENANT, ct.contentType, ct.scenario, ct.hookTemplate, ct.bodyTemplate, ct.ctaTemplate, ct.language, ct.captionLength, ct.exampleCaption, hashtagSetId]
      );
    }
    console.log(`✅ ${captionTemplates.length} caption_templates upserted`);

    await client.query("COMMIT");

    // Summary
    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM ig_content_rules WHERE tenant_id = $1) as rules,
        (SELECT COUNT(*) FROM hashtag_sets WHERE tenant_id = $1) as hashtags,
        (SELECT COUNT(*) FROM caption_templates WHERE tenant_id = $1) as captions
    `, [TENANT]);
    const c = counts.rows[0];
    console.log(`\n📊 ${TENANT} totals: ${c.rules} rules, ${c.hashtags} hashtag sets, ${c.captions} caption templates`);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });
