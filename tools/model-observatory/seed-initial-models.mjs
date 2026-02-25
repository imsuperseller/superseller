#!/usr/bin/env node
/**
 * Model Observatory — Full Seed Script
 * Populates ai_models with ALL known models from Kie.ai, fal.ai, and direct providers.
 * Every field is structured and queryable for pipeline automation.
 *
 * Usage: DATABASE_URL=... node seed-initial-models.mjs
 * Or on RackNerd: source /opt/tourreel-worker/apps/worker/.env && node seed-initial-models.mjs
 */

import pg from "pg";

const DB_URL = process.env.DATABASE_URL || "postgresql://admin:a1efbcd564b928d3ef1d7cae@172.245.56.50:5432/app_db";

// ═══════════════════════════════════════════════════════════
// COMPLETE MODEL DATABASE — Feb 2026
// Sources: kie.ai/market, fal.ai/explore, provider docs
// ═══════════════════════════════════════════════════════════

const MODELS = [
  // ─────────────────────────────────────────
  // VIDEO GENERATION — Kie.ai
  // ─────────────────────────────────────────
  {
    provider: "kie.ai", model_name: "Kling 3.0 Pro", model_id: "kling-3.0/video",
    model_family: "kling", version: "3.0", developer: "Kuaishou",
    release_date: "2026-02-05", category: "video", subcategory: "image_to_video",
    kie_model_param: "kling-3.0/video",
    fal_endpoint: "fal-ai/kling-video/v3/pro/image-to-video",
    cost_per_second_usd: 0.135, cost_per_5s_usd: 0.675, cost_per_10s_usd: 1.35,
    pricing_notes: "Pro no-audio. With audio: $0.20/s. Kie.ai flat ~$0.10/clip (bulk rate).",
    pricing_source: "https://kie.ai/kling-3-0",
    supports_image_to_video: true, supports_text_to_video: true,
    supports_start_end_frame: true, supports_multi_shot: true,
    supports_native_audio: true, supports_character_ref: true,
    supports_elements: true,
    max_resolution: "1080p", max_duration_sec: 15, min_duration_sec: 3,
    output_formats: ["mp4"], max_input_images: 4,
    quality_overall: 92, quality_realism: 90, quality_motion: 88,
    quality_consistency: 85, quality_architecture: 93, speed_score: 30,
    real_estate_score: 95,
    best_for_rooms: ["exterior", "interior", "pool", "kitchen", "living_room", "bedroom"],
    walkthrough_notes: "Best for property walkthroughs. Multi-shot storyboarding, Elements for realtor, start+end frame for transitions. Proven in 25+ TourReel productions.",
    used_in_pipeline: true, pipeline_role: "primary_video",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Kling 3.0 Standard", model_id: "kling-3.0-std/video",
    model_family: "kling", version: "3.0-std", developer: "Kuaishou",
    release_date: "2026-02-05", category: "video", subcategory: "image_to_video",
    kie_model_param: "kling-3.0/video",
    cost_per_second_usd: 0.10, cost_per_5s_usd: 0.50, cost_per_10s_usd: 1.00,
    pricing_notes: "Std no-audio. With audio: $0.15/s. 720p native, blurs at 1080p.",
    supports_image_to_video: true, supports_text_to_video: true,
    supports_start_end_frame: true, supports_multi_shot: true,
    supports_native_audio: true, supports_character_ref: true, supports_elements: true,
    max_resolution: "720p", max_duration_sec: 15, min_duration_sec: 3,
    quality_overall: 78, quality_realism: 75, quality_architecture: 80, speed_score: 45,
    real_estate_score: 70,
    walkthrough_notes: "Budget option. 720p causes blur when upscaled to 1080p.",
    env_var_to_enable: "KIE_KLING_MODE=std", fallback_for: "kling-3.0/video",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Kling 2.6", model_id: "kling-2.6/video",
    model_family: "kling", version: "2.6", developer: "Kuaishou",
    category: "video", subcategory: "image_to_video",
    kie_model_param: "kling-2.6/video",
    cost_per_5s_usd: 0.28, cost_per_10s_usd: 0.55,
    supports_image_to_video: true, supports_native_audio: true,
    max_resolution: "1080p", max_duration_sec: 10, min_duration_sec: 5,
    quality_overall: 75, real_estate_score: 60,
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Veo 3.1", model_id: "veo-3.1/video",
    model_family: "veo", version: "3.1", developer: "Google",
    release_date: "2026-01-15", category: "video", subcategory: "image_to_video",
    kie_model_param: "veo-3.1",
    fal_endpoint: "fal-ai/veo3.1/first-last-frame-to-video",
    cost_per_call_usd: 1.25, cost_per_5s_usd: 1.25,
    pricing_notes: "Quality mode: $1.25/video. Fast mode: $0.30/video. Max 8s clips.",
    pricing_source: "https://kie.ai/veo-3-1",
    supports_image_to_video: true, supports_text_to_video: true,
    supports_start_end_frame: true, supports_native_audio: true,
    max_resolution: "4K", max_duration_sec: 8, min_duration_sec: 4,
    quality_overall: 95, quality_realism: 97, quality_motion: 90,
    quality_consistency: 88, quality_architecture: 95, speed_score: 25,
    real_estate_score: 85,
    walkthrough_notes: "Best single-shot quality. 8s MAX is limiting for walkthroughs. Best for hero shots.",
    best_for_rooms: ["exterior", "pool"],
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Seedance 2.0", model_id: "seedance-2.0/video",
    model_family: "seedance", version: "2.0", developer: "ByteDance",
    release_date: "2026-02-10", category: "video", subcategory: "image_to_video",
    kie_model_param: "seedance-2.0",
    fal_endpoint: "fal-ai/seedance-2.0",
    pricing_notes: "Pricing TBD on Kie.ai (new model). Free trial credits available.",
    supports_image_to_video: true, supports_text_to_video: true,
    supports_start_end_frame: true, supports_multi_shot: true,
    supports_native_audio: true, supports_character_ref: true,
    max_resolution: "2K", max_duration_sec: 15, min_duration_sec: 4,
    quality_overall: 93, quality_realism: 92, quality_motion: 91,
    quality_consistency: 95, quality_architecture: 90, speed_score: 35,
    real_estate_score: 92,
    walkthrough_notes: "2K resolution > Kling 1080p. Environment Lock keeps background fixed. 12-file multimodal reference. Test for TourReel.",
    best_for_rooms: ["exterior", "interior", "living_room"],
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Seedance 1.5 Pro", model_id: "seedance-1.5-pro/video",
    model_family: "seedance", version: "1.5-pro", developer: "ByteDance",
    category: "video", subcategory: "image_to_video",
    kie_model_param: "seedance-1.5-pro",
    fal_endpoint: "fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
    cost_per_second_usd: 0.035, cost_per_5s_usd: 0.175, cost_per_10s_usd: 0.35,
    pricing_notes: "720p: $0.07/4s, $0.14/8s, $0.21/12s. Audio doubles cost.",
    pricing_source: "https://kie.ai/seedance-1-5-pro",
    supports_image_to_video: true, supports_start_end_frame: true,
    supports_native_audio: true,
    max_resolution: "720p", max_duration_sec: 12, min_duration_sec: 4,
    quality_overall: 80, quality_consistency: 82,
    real_estate_score: 72,
    walkthrough_notes: "Good budget FLF option. Start+end frame native. Audio included.",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Wan 2.6", model_id: "wan-2.6/video",
    model_family: "wan", version: "2.6", developer: "Alibaba",
    category: "video", subcategory: "image_to_video",
    kie_model_param: "wan-2.6",
    fal_endpoint: "fal-ai/wan-i2v",
    cost_per_5s_usd: 0.53, cost_per_10s_usd: 1.05,
    pricing_notes: "720p: $0.35/5s. 1080p: $0.53/5s. Reference-to-video mode for consistency.",
    pricing_source: "https://kie.ai/wan-2-6",
    supports_image_to_video: true, supports_text_to_video: true,
    supports_native_audio: true, supports_lip_sync: true,
    supports_character_ref: true,
    max_resolution: "1080p", max_duration_sec: 15, min_duration_sec: 5,
    quality_overall: 82, quality_realism: 80,
    real_estate_score: 75,
    walkthrough_notes: "Budget 1080p alternative. Reference-to-video for subject consistency.",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Sora 2 Standard", model_id: "sora-2/video",
    model_family: "sora", version: "2.0", developer: "OpenAI",
    category: "video", subcategory: "image_to_video",
    kie_model_param: "sora-2",
    cost_per_second_usd: 0.015, cost_per_5s_usd: 0.075, cost_per_10s_usd: 0.15,
    pricing_notes: "Cheapest video model. 720p. Watermark-free audio.",
    pricing_source: "https://kie.ai/sora-2",
    supports_image_to_video: true, supports_text_to_video: true,
    supports_native_audio: true,
    max_resolution: "720p", max_duration_sec: 15, min_duration_sec: 10,
    quality_overall: 70, quality_architecture: 65, speed_score: 40,
    real_estate_score: 55,
    walkthrough_notes: "Cheapest per-second. Quality inconsistent. Test as ultra-budget tier.",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Hailuo 2.3 Standard", model_id: "hailuo-2.3/video",
    model_family: "hailuo", version: "2.3", developer: "MiniMax",
    category: "video", subcategory: "image_to_video",
    kie_model_param: "hailuo-2.3",
    fal_endpoint: "fal-ai/minimax/hailuo-2.3/pro/image-to-video",
    cost_per_5s_usd: 0.15, cost_per_10s_usd: 0.26,
    pricing_notes: "6s 768P: $0.15, 10s 768P: $0.26. NO 10s@1080p.",
    pricing_source: "https://kie.ai/hailuo-2-3",
    supports_image_to_video: true, supports_text_to_video: true,
    max_resolution: "1080p", max_duration_sec: 10, min_duration_sec: 6,
    quality_overall: 76,
    real_estate_score: 60,
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Runway Gen-4 Turbo", model_id: "runway-gen4-turbo/video",
    model_family: "runway", version: "gen4-turbo", developer: "Runway",
    category: "video", subcategory: "image_to_video",
    kie_model_param: "runway-gen4-turbo",
    fal_endpoint: "fal-ai/runway/gen4/turbo/image-to-video",
    cost_per_5s_usd: 0.06,
    pricing_notes: "5s@720p: $0.06, 10s@720p or 5s@1080p: $0.15. Fast ~1 min generation.",
    pricing_source: "https://kie.ai/runway-api",
    supports_image_to_video: true, supports_text_to_video: true,
    max_resolution: "1080p", max_duration_sec: 8, min_duration_sec: 5,
    quality_overall: 78, speed_score: 70,
    real_estate_score: 65,
    walkthrough_notes: "Fast generation. Good for rapid iteration/testing.",
    status: "active",
  },

  // ─────────────────────────────────────────
  // VIDEO GENERATION — fal.ai exclusives
  // ─────────────────────────────────────────
  {
    provider: "fal.ai", model_name: "Wan 2.1 First+Last Frame", model_id: "fal-ai/wan-flf2v",
    model_family: "wan", version: "2.1-flf", developer: "Alibaba",
    category: "video", subcategory: "first_last_frame",
    fal_endpoint: "fal-ai/wan-flf2v",
    cost_per_call_usd: 0.40, cost_per_5s_usd: 0.40,
    pricing_notes: "Flat $0.40/video at 720p regardless of duration. Cheapest FLF model.",
    pricing_source: "https://fal.ai/models/fal-ai/wan-flf2v",
    supports_image_to_video: true, supports_start_end_frame: true,
    max_resolution: "720p", max_duration_sec: 5,
    quality_overall: 75, quality_consistency: 80,
    real_estate_score: 70,
    walkthrough_notes: "Cheapest dedicated FLF model. Good for room-to-room transitions. 720p only.",
    status: "active",
  },
  {
    provider: "fal.ai", model_name: "Veo 3.1 Fast FLF", model_id: "fal-ai/veo3.1/fast/first-last-frame-to-video",
    model_family: "veo", version: "3.1-fast-flf", developer: "Google",
    category: "video", subcategory: "first_last_frame",
    fal_endpoint: "fal-ai/veo3.1/fast/first-last-frame-to-video",
    cost_per_second_usd: 0.10, cost_per_5s_usd: 0.50,
    pricing_notes: "$0.10/s no audio, $0.15/s with audio. Supports 4K output.",
    supports_image_to_video: true, supports_start_end_frame: true,
    supports_native_audio: true,
    max_resolution: "4K", max_duration_sec: 8,
    quality_overall: 90, quality_realism: 93, quality_consistency: 88,
    real_estate_score: 82,
    walkthrough_notes: "High quality FLF transitions. 4K capable. Max 8s limit.",
    status: "active",
  },
  {
    provider: "fal.ai", model_name: "LongCat Video", model_id: "fal-ai/longcat-video/image-to-video/720p",
    model_family: "longcat", developer: "LongCat",
    category: "video", subcategory: "image_to_video",
    fal_endpoint: "fal-ai/longcat-video/image-to-video/720p",
    cost_per_second_usd: 0.04, cost_per_5s_usd: 0.20,
    pricing_notes: "Very cheap. Good motion/walkthrough feel.",
    supports_image_to_video: true,
    max_resolution: "720p",
    quality_overall: 65, speed_score: 60,
    real_estate_score: 50,
    status: "active",
  },

  // ─────────────────────────────────────────
  // AVATAR / TALKING HEAD
  // ─────────────────────────────────────────
  {
    provider: "kie.ai", model_name: "Kling Avatar v2 Pro", model_id: "kling-avatar-v2-pro",
    model_family: "kling", version: "avatar-v2-pro", developer: "Kuaishou",
    category: "avatar", subcategory: "talking_head",
    kie_model_param: "kling-avatar-v2-pro",
    fal_endpoint: "fal-ai/kling-video/ai-avatar/v2/pro",
    cost_per_second_usd: 0.08, cost_per_5s_usd: 0.40,
    pricing_notes: "Pro 1080p: $0.08/s. Standard 720p: $0.04/s. Up to 15s.",
    pricing_source: "https://kie.ai/kling-ai-avatar",
    supports_image_to_video: true, supports_lip_sync: true,
    supports_character_ref: true,
    max_resolution: "1080p", max_duration_sec: 15,
    quality_overall: 85, quality_realism: 82,
    walkthrough_notes: "Best Kie.ai avatar. Photo + audio → talking head. Used by Winner Studio.",
    used_in_pipeline: true, pipeline_role: "avatar_primary",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "InfiniteTalk", model_id: "infinitetalk",
    model_family: "infinitetalk", developer: "MeiGen-AI",
    category: "avatar", subcategory: "talking_head",
    kie_model_param: "infinitetalk",
    cost_per_second_usd: 0.06, cost_per_5s_usd: 0.30,
    pricing_notes: "720p: $0.06/s. 480p: $0.015/s. Precise lip sync, head motion.",
    pricing_source: "https://kie.ai/infinitalk",
    supports_image_to_video: true, supports_lip_sync: true,
    max_resolution: "720p", max_duration_sec: 15,
    quality_overall: 78,
    walkthrough_notes: "Budget avatar alternative. Cheaper than Kling Avatar.",
    fallback_for: "kling-avatar-v2-pro",
    status: "active",
  },

  // ─────────────────────────────────────────
  // IMAGE UPSCALING
  // ─────────────────────────────────────────
  {
    provider: "kie.ai", model_name: "Recraft Crisp Upscale", model_id: "recraft/crisp-upscale",
    model_family: "recraft", developer: "Recraft",
    category: "upscale", subcategory: "crisp_upscale",
    kie_model_param: "recraft/crisp-upscale",
    fal_endpoint: "fal-ai/recraft/upscale/crisp",
    cost_per_image_usd: 0.004,
    pricing_notes: "Was $0.04, reduced to $0.004 (10x cheaper). Best for architectural photos.",
    pricing_source: "https://kie.ai/recraft-crisp-upscale",
    supports_upscale: true,
    max_upscale_factor: 4,
    quality_overall: 90, quality_architecture: 95,
    real_estate_score: 95,
    walkthrough_notes: "Best upscaler for listing photos. Preserves architectural detail. $0.004/image.",
    used_in_pipeline: true, pipeline_role: "upscale",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Topaz Image Upscale", model_id: "topaz/image-upscale",
    model_family: "topaz", developer: "Topaz Labs",
    category: "upscale", subcategory: "ai_upscale",
    kie_model_param: "topaz/image-upscale",
    cost_per_image_usd: 0.05,
    pricing_notes: "Up to 8x. Max side*factor <= 20000px. Multiple model types.",
    pricing_source: "https://kie.ai/topaz-image-upscale",
    supports_upscale: true,
    max_upscale_factor: 8,
    quality_overall: 95, quality_architecture: 93,
    real_estate_score: 90,
    walkthrough_notes: "Gold standard quality. 12x more expensive than Recraft. Use for hero shots only.",
    status: "active",
  },
  {
    provider: "fal.ai", model_name: "ESRGAN", model_id: "fal-ai/esrgan",
    model_family: "esrgan", developer: "Open Source",
    category: "upscale", subcategory: "ai_upscale",
    fal_endpoint: "fal-ai/esrgan",
    cost_per_image_usd: 0.001,
    pricing_notes: "~$0.001/image. 6 model variants. Supports face enhancement.",
    supports_upscale: true,
    max_upscale_factor: 8,
    quality_overall: 75, quality_architecture: 70,
    real_estate_score: 65,
    walkthrough_notes: "Cheapest upscaler. Acceptable for batch/budget. Less detail than Recraft.",
    status: "active",
  },
  {
    provider: "fal.ai", model_name: "Clarity Upscaler", model_id: "fal-ai/clarity-upscaler",
    model_family: "clarity", developer: "ClarityAI",
    category: "upscale", subcategory: "creative_upscale",
    fal_endpoint: "fal-ai/clarity-upscaler",
    cost_per_image_usd: 0.03,
    pricing_notes: "$0.03/megapixel. Prompt-guided upscaling with AI detail generation.",
    supports_upscale: true, supports_image_edit: true,
    max_upscale_factor: 4,
    quality_overall: 85,
    status: "active",
  },

  // ─────────────────────────────────────────
  // IMAGE COMPOSITING / FACE SWAP
  // ─────────────────────────────────────────
  {
    provider: "kie.ai", model_name: "Nano Banana Pro", model_id: "nano-banana-pro",
    model_family: "nano-banana", developer: "Kie.ai",
    category: "compositing", subcategory: "person_placement",
    kie_model_param: "nano-banana-pro",
    cost_per_image_usd: 0.09,
    pricing_notes: "1K-2K: $0.09. 4K: $0.12. Places person into scene with prompt control.",
    pricing_source: "https://kie.ai/nano-banana-pro",
    supports_compositing: true,
    max_resolution: "4K",
    quality_overall: 80,
    walkthrough_notes: "Used for realtor composite in opening/closing clips. Replaced by Kling Elements for mid-tour.",
    used_in_pipeline: true, pipeline_role: "compositing",
    status: "active",
  },
  {
    provider: "fal.ai", model_name: "Easel AI Face+Body Swap", model_id: "easel-ai/advanced-face-swap",
    model_family: "easel", developer: "Easel AI",
    category: "compositing", subcategory: "face_body_swap",
    fal_endpoint: "easel-ai/advanced-face-swap",
    cost_per_image_usd: 0.03,
    pricing_notes: "Full body swap (not just face). Preserves skin tone and identity.",
    supports_compositing: true, supports_face_swap: true,
    quality_overall: 82,
    walkthrough_notes: "Alternative to Nano Banana. Full body placement at 1/3 the cost.",
    status: "active",
  },
  {
    provider: "fal.ai", model_name: "FLUX.2 Pro Edit", model_id: "fal-ai/flux-2-pro/edit",
    model_family: "flux", developer: "Black Forest Labs",
    category: "compositing", subcategory: "image_edit",
    fal_endpoint: "fal-ai/flux-2-pro/edit",
    cost_per_image_usd: 0.05,
    pricing_notes: "Multi-reference compositing with natural language instructions.",
    supports_compositing: true, supports_image_edit: true, supports_inpainting: true,
    quality_overall: 88,
    status: "active",
  },

  // ─────────────────────────────────────────
  // MUSIC
  // ─────────────────────────────────────────
  {
    provider: "kie.ai", model_name: "Suno V5", model_id: "suno-v5",
    model_family: "suno", version: "5.0", developer: "Suno",
    category: "music", subcategory: "music_generation",
    kie_model_param: "V5",
    cost_per_call_usd: 0.02,
    pricing_notes: "$0.02/track. Instrumental + vocals. Custom style prompts.",
    pricing_source: "https://kie.ai/suno",
    supports_native_audio: true,
    quality_overall: 88,
    walkthrough_notes: "Primary music for TourReel. Luxury real estate piano/ambient style.",
    used_in_pipeline: true, pipeline_role: "music",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Suno V4.5 Plus", model_id: "suno-v4.5-plus",
    model_family: "suno", version: "4.5-plus", developer: "Suno",
    category: "music", subcategory: "music_generation",
    kie_model_param: "V4_5PLUS",
    cost_per_call_usd: 0.02,
    quality_overall: 82,
    fallback_for: "suno-v5",
    status: "active",
  },

  // ─────────────────────────────────────────
  // LLMs (Vision / Text)
  // ─────────────────────────────────────────
  {
    provider: "kie.ai", model_name: "Gemini 3 Flash", model_id: "gemini-3-flash",
    model_family: "gemini", version: "3.0-flash", developer: "Google",
    release_date: "2026-02-01", category: "llm", subcategory: "vision_text",
    kie_model_param: "gemini-3-flash",
    cost_per_1m_input_usd: 0.15, cost_per_1m_output_usd: 0.90,
    pricing_notes: "Vision + text. 1M context. 15% better accuracy than 2.5-flash.",
    pricing_source: "https://kie.ai/gemini-3-flash",
    quality_overall: 88,
    walkthrough_notes: "Used for photo classification, room detection, floorplan analysis.",
    used_in_pipeline: true, pipeline_role: "vision",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "Gemini 2.5 Flash", model_id: "gemini-2.5-flash",
    model_family: "gemini", version: "2.5-flash", developer: "Google",
    category: "llm", subcategory: "vision_text",
    kie_model_param: "gemini-2.5-flash",
    cost_per_1m_input_usd: 0.15, cost_per_1m_output_usd: 0.60,
    quality_overall: 78,
    fallback_for: "gemini-3-flash",
    status: "active",
  },
  {
    provider: "anthropic", model_name: "Claude Opus 4.6", model_id: "claude-opus-4-6",
    model_family: "claude", version: "4.6", developer: "Anthropic",
    category: "llm", subcategory: "reasoning",
    cost_per_1m_input_usd: 15.00, cost_per_1m_output_usd: 75.00,
    quality_overall: 98,
    status: "active",
  },
  {
    provider: "anthropic", model_name: "Claude Sonnet 4.6", model_id: "claude-sonnet-4-6",
    model_family: "claude", version: "4.6", developer: "Anthropic",
    category: "llm", subcategory: "reasoning",
    cost_per_1m_input_usd: 3.00, cost_per_1m_output_usd: 15.00,
    quality_overall: 92,
    status: "active",
  },
  {
    provider: "openai", model_name: "GPT-4o", model_id: "gpt-4o",
    model_family: "gpt", version: "4o", developer: "OpenAI",
    category: "llm", subcategory: "vision_text",
    cost_per_1m_input_usd: 2.50, cost_per_1m_output_usd: 10.00,
    quality_overall: 88,
    status: "active",
  },

  // ─────────────────────────────────────────
  // IMAGE GENERATION
  // ─────────────────────────────────────────
  {
    provider: "kie.ai", model_name: "Seedream 4.0", model_id: "seedream-4.0",
    model_family: "seedream", developer: "ByteDance",
    category: "image", subcategory: "text_to_image",
    kie_model_param: "seedream-4.0",
    cost_per_image_usd: 0.0175,
    pricing_notes: "~3.5 credits ($0.0175) per image. Used for FB Bot listing variations.",
    used_in_pipeline: true, pipeline_role: "image_variation",
    status: "active",
  },
  {
    provider: "kie.ai", model_name: "GPT-Image-1 (4o Image)", model_id: "gpt-image-1",
    model_family: "gpt", developer: "OpenAI",
    category: "image", subcategory: "text_to_image",
    kie_model_param: "gpt-image-1",
    cost_per_image_usd: 0.04,
    status: "active",
  },
];

// ═══════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════

const COLUMNS = [
  "provider", "model_name", "model_id", "model_family", "version", "release_date", "developer",
  "category", "subcategory",
  "kie_endpoint", "kie_model_param", "fal_endpoint", "direct_api_url",
  "cost_per_second_usd", "cost_per_5s_usd", "cost_per_10s_usd", "cost_per_image_usd",
  "cost_per_minute_usd", "cost_per_1m_input_usd", "cost_per_1m_output_usd",
  "cost_per_call_usd", "pricing_notes", "pricing_source", "pricing_verified_at",
  "supports_image_to_video", "supports_text_to_video", "supports_start_end_frame",
  "supports_multi_shot", "supports_native_audio", "supports_character_ref",
  "supports_elements", "supports_lip_sync", "supports_video_to_video", "supports_inpainting",
  "supports_upscale", "supports_compositing", "supports_face_swap", "supports_image_edit",
  "max_resolution", "max_duration_sec", "min_duration_sec", "output_formats",
  "max_upscale_factor", "max_input_images",
  "quality_overall", "quality_realism", "quality_motion", "quality_consistency",
  "quality_architecture", "speed_score",
  "real_estate_score", "best_for_rooms", "walkthrough_notes",
  "used_in_pipeline", "pipeline_role", "env_var_to_enable", "fallback_for",
  "status",
];

async function main() {
  const pool = new pg.Pool({ connectionString: DB_URL });

  try {
    console.log(`Seeding ${MODELS.length} AI models into observatory...`);

    let inserted = 0;
    let updated = 0;

    for (const model of MODELS) {
      const values = COLUMNS.map(col => {
        const val = model[col];
        if (val === undefined || val === null) return null;
        if (Array.isArray(val)) return `{${val.map(v => `"${v}"`).join(",")}}`;
        return val;
      });

      const placeholders = COLUMNS.map((_, i) => `$${i + 1}`).join(", ");
      const updateSet = COLUMNS.filter(c => c !== "provider" && c !== "model_id")
        .map(c => `${c} = EXCLUDED.${c}`)
        .join(", ");

      try {
        const result = await pool.query(
          `INSERT INTO ai_models (${COLUMNS.join(", ")})
           VALUES (${placeholders})
           ON CONFLICT (provider, model_id) DO UPDATE SET ${updateSet}, updated_at = NOW(), last_checked = NOW()`,
          values
        );
        if (result.rowCount > 0) inserted++;
        console.log(`  ${model.provider}/${model.model_name}`);
      } catch (err) {
        console.error(`  FAIL: ${model.provider}/${model.model_name}: ${err.message}`);
      }
    }

    // Verify
    const count = await pool.query("SELECT COUNT(*) FROM ai_models");
    const categories = await pool.query("SELECT category, COUNT(*) as cnt FROM ai_models GROUP BY category ORDER BY cnt DESC");

    console.log(`\nSummary:`);
    console.log(`  Total models: ${count.rows[0].count}`);
    console.log(`  Categories:`);
    for (const row of categories.rows) {
      console.log(`    ${row.category}: ${row.cnt}`);
    }

    // Set recommendations
    console.log(`\nSetting pipeline recommendations...`);
    const recs = [
      { use_case: "video_clip_generation", model_id: "kling-3.0/video", fallback: "seedance-2.0/video", reasoning: "Best real estate quality + Elements for realtor. Proven in 25+ videos." },
      { use_case: "room_transition_flf", model_id: "kling-3.0/video", fallback: "fal-ai/wan-flf2v", reasoning: "Kling start+end frame at $0.10/clip via kie.ai. Wan FLF2V as $0.40 fallback." },
      { use_case: "photo_upscale", model_id: "recraft/crisp-upscale", fallback: "fal-ai/esrgan", reasoning: "Recraft $0.004/img preserves architecture. ESRGAN $0.001 as budget fallback." },
      { use_case: "music_generation", model_id: "suno-v5", fallback: "suno-v4.5-plus", reasoning: "Suno V5 latest quality at $0.02/track." },
      { use_case: "photo_classify", model_id: "gemini-3-flash", fallback: "gemini-2.5-flash", reasoning: "Gemini 3 Flash: 15% better accuracy for photo classification." },
      { use_case: "realtor_compositing", model_id: "nano-banana-pro", fallback: "easel-ai/advanced-face-swap", reasoning: "Nano Banana integrated. Easel AI body swap at 1/3 cost as fallback." },
      { use_case: "avatar_talking_head", model_id: "kling-avatar-v2-pro", fallback: "infinitetalk", reasoning: "Kling Avatar Pro for Winner Studio. InfiniteTalk as budget option." },
    ];

    for (const rec of recs) {
      const primary = await pool.query("SELECT id FROM ai_models WHERE model_id = $1", [rec.model_id]);
      const fallback = rec.fallback ? await pool.query("SELECT id FROM ai_models WHERE model_id = $1", [rec.fallback]) : null;
      if (primary.rows[0]) {
        await pool.query(
          `INSERT INTO ai_model_recommendations (use_case, recommended_model_id, fallback_model_id, reasoning)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (use_case) DO UPDATE SET recommended_model_id = $2, fallback_model_id = $3, reasoning = $4, updated_at = NOW()`,
          [rec.use_case, primary.rows[0].id, fallback?.rows[0]?.id || null, rec.reasoning]
        );
        console.log(`  ${rec.use_case} → ${rec.model_id}`);
      }
    }

    console.log(`\nDone. Run daily-sync.ts for auto-updates.`);
    await pool.end();
  } catch (err) {
    console.error("Seed failed:", err);
    await pool.end();
    process.exit(1);
  }
}

main();
