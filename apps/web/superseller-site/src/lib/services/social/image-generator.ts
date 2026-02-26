/**
 * SocialHub — AI Image Generation
 * Primary: DALL-E 3 (OpenAI). Fallback: Kie.AI Flux 2 Pro.
 */

const KIE_API_BASE = "https://api.kie.ai/api/v1";
const OPENAI_API_BASE = "https://api.openai.com/v1";

interface KieTaskResponse {
  code: number;
  data: {
    taskId: string;
    state: string;
    resultJson?: string;
    failMsg?: string;
  };
}

// Aspect ratio → DALL-E 3 size mapping
const DALLE_SIZE_MAP: Record<string, string> = {
  "1:1": "1024x1024",
  "16:9": "1792x1024",
  "9:16": "1024x1792",
  "4:5": "1024x1024", // DALL-E 3 doesn't support 4:5, use square
};

/**
 * Generate a social media image. Tries DALL-E 3 first, falls back to Kie.AI.
 */
export async function generateSocialImage(
  prompt: string,
  options?: {
    aspectRatio?: "1:1" | "16:9" | "9:16" | "4:5";
    resolution?: "1K" | "2K";
  }
): Promise<{ imageUrl: string; cost: number } | { error: string }> {
  // Try OpenAI image generation first (gpt-image-1 → dall-e-3 fallback)
  const openaiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ALT;
  if (openaiKey) {
    const result = await generateWithDalle(prompt, options?.aspectRatio || "1:1", openaiKey);
    if ("imageUrl" in result) return result;
    // If primary key failed, try alt key
    const altKey = process.env.OPENAI_API_KEY_ALT;
    if (altKey && altKey !== openaiKey) {
      const altResult = await generateWithDalle(prompt, options?.aspectRatio || "1:1", altKey);
      if ("imageUrl" in altResult) return altResult;
      console.warn("[image-gen] OpenAI failed with both keys, trying Kie.AI:", altResult.error);
    } else {
      console.warn("[image-gen] OpenAI failed, trying Kie.AI:", result.error);
    }
  }

  // Fallback to Kie.AI
  const kieKey = process.env.KIE_AI_API_KEY;
  if (kieKey) {
    return generateWithKie(prompt, options?.aspectRatio || "1:1", options?.resolution || "1K", kieKey);
  }

  return { error: "No image generation API key configured (OPENAI_API_KEY or KIE_AI_API_KEY)" };
}

/**
 * Generate image via gpt-image-1 (latest OpenAI model, 2025).
 * Returns base64 → uploads to R2 for permanent URL.
 * Falls back to dall-e-3 URL mode if R2 upload fails.
 */
async function generateWithDalle(
  prompt: string,
  aspectRatio: string,
  apiKey: string
): Promise<{ imageUrl: string; cost: number } | { error: string }> {
  try {
    const size = DALLE_SIZE_MAP[aspectRatio] || "1024x1024";

    // Try gpt-image-1 first (latest model)
    const res = await fetch(`${OPENAI_API_BASE}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `Professional social media post image. ${prompt}. Clean, modern, high-quality, no text overlays, no watermarks.`,
        n: 1,
        size,
        quality: "medium",
      }),
    });

    if (!res.ok) {
      // Fall back to dall-e-3 if gpt-image-1 not available
      return generateWithDalle3(prompt, size, apiKey);
    }

    const data = await res.json();
    const item = data.data?.[0];

    if (item?.url) {
      return { imageUrl: item.url, cost: 0.04 };
    }

    if (item?.b64_json) {
      // Upload base64 to R2 for permanent URL
      const imageUrl = await uploadBase64ToR2(item.b64_json, `social/${Date.now()}.png`);
      if (imageUrl) {
        return { imageUrl, cost: 0.04 };
      }
      // If R2 upload fails, fall back to dall-e-3 which returns URLs directly
      return generateWithDalle3(prompt, size, apiKey);
    }

    return { error: "No image data in gpt-image-1 response" };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Fallback: DALL-E 3 (returns URLs directly, no R2 needed).
 */
async function generateWithDalle3(
  prompt: string,
  size: string,
  apiKey: string
): Promise<{ imageUrl: string; cost: number } | { error: string }> {
  const res = await fetch(`${OPENAI_API_BASE}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Professional social media post image. ${prompt}. Clean, modern, high-quality, no text overlays, no watermarks.`,
      n: 1,
      size,
      quality: "standard",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { error: `DALL-E error ${res.status}: ${err}` };
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) return { error: "No image URL in DALL-E response" };

  const cost = size === "1024x1024" ? 0.04 : 0.08;
  return { imageUrl, cost };
}

/**
 * Upload base64 image to Cloudflare R2 and return a presigned URL (7 days).
 */
async function uploadBase64ToR2(
  base64Data: string,
  key: string
): Promise<string | null> {
  try {
    const { S3Client, PutObjectCommand, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn("[image-gen] R2 credentials not configured, cannot upload");
      return null;
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const buffer = Buffer.from(base64Data, "base64");
    await s3.send(
      new PutObjectCommand({
        Bucket: "socialhub-content",
        Key: key,
        Body: buffer,
        ContentType: "image/png",
      })
    );

    // Generate presigned URL (7 days = 604800 seconds)
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: "socialhub-content", Key: key }),
      { expiresIn: 604800 }
    );

    return url;
  } catch (err) {
    console.warn("[image-gen] R2 upload failed:", err);
    return null;
  }
}

/**
 * Generate image via Kie.AI Flux 2 Pro. Requires polling.
 */
async function generateWithKie(
  prompt: string,
  aspectRatio: string,
  resolution: string,
  apiKey: string
): Promise<{ imageUrl: string; cost: number } | { error: string }> {
  try {
    const createRes = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "flux-2/pro-text-to-image",
        input: {
          prompt: `Professional social media post image. ${prompt}. Clean, modern, high-quality, no text overlays.`,
          aspect_ratio: aspectRatio,
          resolution,
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      return { error: `Kie.AI error ${createRes.status}: ${err}` };
    }

    const createData: KieTaskResponse = await createRes.json();
    if (createData.code === 402) return { error: "Kie.AI credits insufficient" };
    const taskId = createData.data?.taskId;
    if (!taskId) return { error: "No taskId returned from Kie.AI" };

    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      const statusRes = await fetch(
        `${KIE_API_BASE}/jobs/recordInfo?taskId=${taskId}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      if (!statusRes.ok) continue;
      const statusData: KieTaskResponse = await statusRes.json();
      const state = statusData.data?.state;

      if (state === "success") {
        const resultJson = statusData.data.resultJson;
        if (!resultJson) return { error: "No result in success response" };
        const result = JSON.parse(resultJson);
        const imageUrl = result.resultUrls?.[0] || result.url;
        if (!imageUrl) return { error: "No image URL in result" };
        return { imageUrl, cost: 0.15 };
      }

      if (state === "failed") {
        return { error: `Image generation failed: ${statusData.data.failMsg || "unknown"}` };
      }
    }

    return { error: "Image generation timed out after 120s" };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
