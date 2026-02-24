import { getEnv } from "./env";

const KIE_BASE = "https://api.kie.ai/api";

// ── Error Class ────────────────────────────────────────────────────

export class KieApiError extends Error {
  constructor(
    public statusCode: number,
    public responseBody: string,
    public endpoint: string
  ) {
    super(
      `kie.ai API error ${statusCode} on ${endpoint}: ${responseBody.slice(0, 200)}`
    );
    this.name = "KieApiError";
  }

  get isRateLimit(): boolean {
    return this.statusCode === 429;
  }
  get isInsufficientBalance(): boolean {
    return this.statusCode === 402;
  }
  get isRetryable(): boolean {
    return this.statusCode >= 500 || this.statusCode === 429;
  }
}

// ── Types ──────────────────────────────────────────────────────────

export interface CreateTaskRequest {
  model: string;
  input: Record<string, unknown>;
  callBackUrl?: string;
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: { taskId: string };
}

export interface TaskStatusData {
  taskId: string;
  model: string;
  state: "waiting" | "success" | "fail";
  param: string;
  resultJson: string;
  failCode: string | null;
  failMsg: string | null;
  costTime: number | null;
  completeTime: number | null;
  createTime: number;
}

export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: TaskStatusData;
}

// ── Internal Request Helper ────────────────────────────────────────

async function kieRequest<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const env = getEnv();
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${env.KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new KieApiError(response.status, text, url);
  }

  return response.json() as Promise<T>;
}

// ── Task API (Video / Audio Isolation) ─────────────────────────────

export async function createTask(
  request: CreateTaskRequest
): Promise<CreateTaskResponse> {
  const url = `${KIE_BASE}/v1/jobs/createTask`;
  const result = await kieRequest<CreateTaskResponse>("POST", url, request);

  if (result.code !== 200 && result.code !== 0) {
    throw new KieApiError(
      result.code,
      result.msg || "Unknown error",
      url
    );
  }

  return result;
}

export async function getTaskStatus(
  taskId: string
): Promise<TaskStatusResponse> {
  const url = `${KIE_BASE}/v1/jobs/recordInfo?taskId=${taskId}`;
  return kieRequest<TaskStatusResponse>("GET", url);
}

// ── Model-specific task builders ───────────────────────────────────

export function buildAvatarProInput(params: {
  imageUrl: string;
  audioUrl: string;
  prompt: string;
}): Record<string, unknown> {
  // avatar-pro only accepts image_url, audio_url, prompt — no mode parameter
  return {
    image_url: params.imageUrl,
    audio_url: params.audioUrl,
    prompt: params.prompt,
  };
}

export function buildInfinitalkInput(params: {
  imageUrl: string;
  audioUrl: string;
  prompt: string;
  resolution?: "480p" | "720p";
}): Record<string, unknown> {
  return {
    image_url: params.imageUrl,
    audio_url: params.audioUrl,
    prompt: params.prompt,
    resolution: params.resolution || "720p",
  };
}

export function buildKling3Input(params: {
  mode?: "std" | "pro";
  prompt?: string;
  imageUrl?: string;
  duration?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
}): Record<string, unknown> {
  const dur = params.duration || 5;
  return {
    prompt: params.prompt || "",
    mode: params.mode || "std",
    duration: String(dur), // must be "5" or "10" (enum string)
    multi_shots: false, // required — 422 if omitted
    sound: false,
    aspect_ratio: params.aspectRatio || "16:9",
    ...(params.imageUrl ? { image_urls: [params.imageUrl] } : {}),
  };
}

export function buildIsolationInput(params: {
  audioUrl: string;
}): Record<string, unknown> {
  return {
    audio_url: params.audioUrl,
  };
}

// ── Gemini API (via kie.ai proxy) ──────────────────────────────────

export interface GeminiMessage {
  role: "developer" | "user" | "assistant";
  content: Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: { url: string };
  }>;
}

export interface GeminiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callGemini(
  messages: GeminiMessage[],
  responseFormat?: unknown
): Promise<GeminiResponse> {
  const url = `${getEnv().KIE_BASE_URL}/gemini-3-pro/v1/chat/completions`;

  const body: Record<string, unknown> = {
    messages,
    stream: false,
    include_thoughts: false,
    reasoning_effort: "high",
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  return kieRequest<GeminiResponse>("POST", url, body);
}

// ── Result URL extraction helper ───────────────────────────────────

export function extractResultUrls(resultJson: string): string[] {
  if (!resultJson) return [];
  try {
    const parsed = JSON.parse(resultJson);
    if (parsed.resultUrls && Array.isArray(parsed.resultUrls)) {
      return parsed.resultUrls.map((u: unknown) =>
        typeof u === "string" ? u : (u as { url: string }).url
      );
    }
    return [];
  } catch {
    return [];
  }
}
