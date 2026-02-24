import { callGemini, KieApiError } from "./kie";
import type { GeminiMessage } from "./kie";
import type { GeminiBrainResponse } from "@/types";
import {
  SYSTEM_PROMPT_TEMPLATE,
  RESPONSE_SCHEMA,
  GEMINI_DEFAULTS,
  TONE_PRESET,
  EXAMPLE_SCRIPTS,
  MODEL_REGISTRY,
} from "./gemini-constants";

// ── Input / Output Types ───────────────────────────────────────────

export interface GeminiBrainInput {
  rawScript?: string;
  audioUrl?: string;
  imageUrl?: string;
  character: string;
  vibe: string;
  language: string;
  contentTypeHint?: string;
  audioDurationSeconds?: number;
  tenantName?: string;
}

export type GeminiBrainOutput = GeminiBrainResponse;

// ── Build System Prompt (hardcoded for MVP) ────────────────────────

function buildSystemPrompt(tenantName: string): string {
  return SYSTEM_PROMPT_TEMPLATE.replace("{TENANT_NAME}", tenantName)
    .replace("{BRAND_VOICE_NAME}", "Poscas Winner")
    .replace("{TONE_PRESET}", TONE_PRESET)
    .replace("{EXAMPLE_SCRIPTS}", EXAMPLE_SCRIPTS)
    .replace("{MODEL_REGISTRY}", JSON.stringify(MODEL_REGISTRY, null, 2))
    .replace(
      "{BRAND_CONTEXT}",
      "Company: Mivnim Group (קבוצת מבנים). Industry: Urban renewal real estate. Visual style: Premium dark luxury with turquoise accents."
    );
}

// ── Main Gemini Brain Call ──────────────────────────────────────────

export async function callGeminiBrain(
  input: GeminiBrainInput
): Promise<GeminiBrainOutput> {
  const tenantName = input.tenantName || "Mivnim Group (קבוצת מבנים)";
  const systemPrompt = buildSystemPrompt(tenantName);

  const userPayload = {
    raw_script: input.rawScript || "(audio only — please transcribe)",
    character: input.character,
    vibe: input.vibe,
    language: input.language,
    content_type_hint: input.contentTypeHint || "general",
    has_audio: !!input.audioUrl,
    audio_duration_seconds: input.audioDurationSeconds || 0,
    has_reference_image: !!input.imageUrl,
    brand_context: {
      company: tenantName,
      industry: "Urban renewal real estate",
      recurring_themes: [
        "real estate",
        "cognac",
        "winners",
        "networking",
        "VIP",
        "LOFTI24 Haifa",
      ],
    },
  };

  const userContent: GeminiMessage["content"] = [
    { type: "text", text: JSON.stringify(userPayload) },
  ];

  // kie.ai Gemini quirk: audio passed as "image_url" type
  if (input.audioUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: input.audioUrl },
    });
  }

  const messages: GeminiMessage[] = [
    { role: "developer", content: [{ type: "text", text: systemPrompt }] },
    { role: "user", content: userContent },
  ];

  try {
    const response = await callGemini(messages, {
      type: "json_schema",
      json_schema: RESPONSE_SCHEMA,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty Gemini response");

    const parsed: GeminiBrainOutput =
      typeof content === "string" ? JSON.parse(content) : content;

    return sanitizeOutput(parsed, input);
  } catch (err) {
    // On 402 (insufficient balance), propagate — don't charge the user
    if (err instanceof KieApiError && err.isInsufficientBalance) {
      throw err;
    }

    // On 429 (rate limit), retry once after 5s
    if (err instanceof KieApiError && err.isRateLimit) {
      await sleep(5000);
      try {
        const retryResponse = await callGemini(messages, {
          type: "json_schema",
          json_schema: RESPONSE_SCHEMA,
        });
        const content = retryResponse.choices?.[0]?.message?.content;
        if (content) {
          const parsed: GeminiBrainOutput =
            typeof content === "string" ? JSON.parse(content) : content;
          return sanitizeOutput(parsed, input);
        }
      } catch {
        // Fall through to defaults
      }
    }

    // On 500, retry once after 3s
    if (err instanceof KieApiError && err.statusCode >= 500) {
      await sleep(3000);
      try {
        const retryResponse = await callGemini(messages, {
          type: "json_schema",
          json_schema: RESPONSE_SCHEMA,
        });
        const content = retryResponse.choices?.[0]?.message?.content;
        if (content) {
          const parsed: GeminiBrainOutput =
            typeof content === "string" ? JSON.parse(content) : content;
          return sanitizeOutput(parsed, input);
        }
      } catch {
        // Fall through to defaults
      }
    }

    console.error("Gemini brain failed, using defaults:", err);
    return {
      ...GEMINI_DEFAULTS,
      processed_script: input.rawScript || "",
      subtitle_text: input.rawScript || "",
      video_prompt:
        "Professional speaker in modern office, direct to camera, confident posture, warm lighting, cinematic feel",
    };
  }
}

// ── Sanitize & Validate Output ─────────────────────────────────────

const VALID_MODELS = [
  "kling/ai-avatar-pro",
  "infinitalk/from-audio",
  "kling-3.0/video",
];

function sanitizeOutput(
  output: GeminiBrainOutput,
  input: GeminiBrainInput
): GeminiBrainOutput {
  // Validate model is in registry
  if (!VALID_MODELS.includes(output.recommended_model)) {
    output.recommended_model = "kling/ai-avatar-pro";
    output.routing_reasoning +=
      " [OVERRIDE: unknown model, defaulting to kling/ai-avatar-pro]";
  }

  // Prevent audio-incompatible model with audio input
  if (input.audioUrl && output.recommended_model === "kling-3.0/video") {
    output.recommended_model = "kling/ai-avatar-pro";
    output.routing_reasoning +=
      " [OVERRIDE: audio present but text-only model selected]";
  }

  // Prevent infinitalk with audio > 15s
  if (
    output.recommended_model === "infinitalk/from-audio" &&
    input.audioDurationSeconds &&
    input.audioDurationSeconds > 15
  ) {
    output.recommended_model = "kling/ai-avatar-pro";
    output.routing_reasoning +=
      " [OVERRIDE: audio exceeds 15s limit for infinitalk]";
  }

  // Truncate video prompt to 500 chars
  if (output.video_prompt && output.video_prompt.length > 500) {
    const lastSentence = output.video_prompt.lastIndexOf(".", 497);
    output.video_prompt =
      lastSentence > 400
        ? output.video_prompt.slice(0, lastSentence + 1)
        : output.video_prompt.slice(0, 497) + "...";
  }

  // Default voice clarity
  if (!Number.isInteger(output.voice_clarity_score)) {
    output.voice_clarity_score = 7;
    output.needs_isolation = false;
  }

  // Ensure model_params defaults
  if (!output.model_params) {
    output.model_params = { resolution: "720p", mode: "std" };
  }

  return output;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
