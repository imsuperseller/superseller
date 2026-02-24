// ── Pipeline Stages ──────────────────────────────────────────────
export type GenerationStage =
  | "PENDING"
  | "SCRIPT_PROCESSING"
  | "AUDIO_ISOLATING"
  | "VIDEO_GENERATING"
  | "MUSIC_GENERATING"
  | "AWAITING_MUSIC_SELECT"
  | "POST_PROCESSING"
  | "DELIVERING"
  | "COMPLETE"
  | "FAILED";

export const LEGAL_TRANSITIONS: Record<GenerationStage, GenerationStage[]> = {
  PENDING: ["SCRIPT_PROCESSING"],
  SCRIPT_PROCESSING: ["AUDIO_ISOLATING", "VIDEO_GENERATING", "MUSIC_GENERATING", "FAILED"],
  AUDIO_ISOLATING: ["VIDEO_GENERATING", "FAILED"],
  VIDEO_GENERATING: ["DELIVERING", "POST_PROCESSING", "FAILED"],
  MUSIC_GENERATING: ["AWAITING_MUSIC_SELECT", "FAILED"],
  AWAITING_MUSIC_SELECT: ["POST_PROCESSING", "FAILED"],
  POST_PROCESSING: ["DELIVERING", "FAILED"],
  DELIVERING: ["COMPLETE", "FAILED"],
  COMPLETE: [],
  FAILED: [],
};

// ── Characters ──────────────────────────────────────────────────
export interface Character {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  voice: string;
  description: string;
}

// ── Vibes ────────────────────────────────────────────────────────
export interface Vibe {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  bpmRange: string;
}

// ── Kie.ai ──────────────────────────────────────────────────────
export type KieModel =
  | "kling/ai-avatar-pro"
  | "infinitalk/from-audio"
  | "kling-3.0/video"
  | "elevenlabs/audio-isolation";

export interface KieTaskResponse {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    video_url?: string;
    audio_url?: string;
    image_url?: string;
    duration?: number;
  };
  error?: string;
}

// ── Gemini Brain Response ───────────────────────────────────────
export interface GeminiBrainResponse {
  processed_script: string;
  video_prompt: string;
  recommended_model: KieModel;
  model_params: {
    resolution: "480p" | "720p";
    mode: "std" | "pro";
  };
  routing_reasoning: string;
  content_tags: string[];
  music_prompt: {
    style: string;
    title: string;
    negativeTags: string;
  };
  needs_isolation: boolean;
  voice_clarity_score: number;
  subtitle_text: string;
}

// ── Generation Row ──────────────────────────────────────────────
export interface GenerationRow {
  id: string;
  user_id: string;
  tenant_id: string;
  stage: GenerationStage;
  raw_script: string | null;
  input_audio_url: string | null;
  reference_image_url: string | null;
  character: string;
  vibe: string;
  language: string;
  processed_script: string | null;
  video_prompt: string | null;
  recommended_model: string | null;
  model_params: Record<string, unknown> | null;
  routing_reasoning: string | null;
  voice_clarity_score: number | null;
  needs_isolation: boolean;
  content_tags: string[] | null;
  music_prompt: Record<string, unknown> | null;
  subtitle_text: string | null;
  gemini_task_id: string | null;
  isolation_task_id: string | null;
  video_task_id: string | null;
  cleaned_audio_url: string | null;
  video_result_url: string | null;
  raw_video_r2_url: string | null;
  final_video_url: string | null;
  whatsapp_delivered: boolean;
  whatsapp_message_id: string | null;
  credits_charged: number;
  credit_refunded: boolean;
  error_message: string | null;
  failed_at_stage: string | null;
  retry_count: number;
  duration_ms: number | null;
  created_at: string;
  updated_at: string;
}

// ── User ────────────────────────────────────────────────────────
export interface WinnerUser {
  id: string;
  email: string | null;
  phone: string | null;
  whatsapp_jid: string | null;
  name: string | null;
  tenant_id: string;
  tier: "none" | "starter" | "pro" | "elite";
  is_active: boolean;
  created_at: string;
}

// ── Credits ─────────────────────────────────────────────────────
export interface UserCredits {
  user_id: string;
  total_credits: number;
  used_credits: number;
  available_credits: number;
  monthly_cap: number;
  monthly_used: number;
}
