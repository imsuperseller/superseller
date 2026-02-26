/**
 * SocialHub — AI Content Generation Service
 * Uses Claude (via Anthropic API) for copy + optional Kie.AI for images.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export interface ContentGenerationRequest {
  topic: string;
  platform: "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok" | "youtube";
  tone?: "professional" | "casual" | "witty" | "inspiring" | "educational";
  contentPillars?: string[]; // e.g. ["AI Trends", "SaaS Growth"]
  businessContext?: string; // e.g. "SuperSeller AI — AI automation agency"
  language?: "en" | "he";
  includeHashtags?: boolean;
  maxLength?: number; // character limit (platform-specific)
}

export interface GeneratedContent {
  text: string;
  hashtags: string[];
  imagePrompt?: string; // Prompt for Kie.AI image generation
  platform: string;
  characterCount: number;
  model: string;
}

// Platform-specific character limits and formatting rules
const PLATFORM_LIMITS: Record<string, { maxChars: number; hashtagStyle: string }> = {
  facebook: { maxChars: 63206, hashtagStyle: "minimal" }, // 3-5 hashtags at end
  instagram: { maxChars: 2200, hashtagStyle: "heavy" }, // up to 30 hashtags
  linkedin: { maxChars: 3000, hashtagStyle: "minimal" }, // 3-5 professional hashtags
  twitter: { maxChars: 280, hashtagStyle: "inline" }, // 1-3 inline hashtags
  tiktok: { maxChars: 2200, hashtagStyle: "heavy" },
  youtube: { maxChars: 5000, hashtagStyle: "minimal" },
};

export async function generateContent(
  req: ContentGenerationRequest
): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const limits = PLATFORM_LIMITS[req.platform] || PLATFORM_LIMITS.facebook;
  const maxChars = req.maxLength || limits.maxChars;

  const systemPrompt = `You are a world-class social media content creator for ${req.businessContext || "a B2B technology company"}.
You write in ${req.language === "he" ? "Hebrew" : "English"}.
Your tone is ${req.tone || "professional"}.
${req.contentPillars?.length ? `Content pillars: ${req.contentPillars.join(", ")}` : ""}

Rules:
- Write for ${req.platform} (max ${maxChars} characters for the main text)
- ${limits.hashtagStyle === "heavy" ? "Include 10-20 relevant hashtags" : limits.hashtagStyle === "inline" ? "Weave 1-3 hashtags naturally into the text" : "Add 3-5 hashtags at the end"}
- Be authentic, not generic. No corporate fluff.
- Include a clear call-to-action
- If applicable, suggest an image concept that would pair well with this post

Respond ONLY in valid JSON with this structure:
{
  "text": "The full post text (without hashtags)",
  "hashtags": ["hashtag1", "hashtag2"],
  "imagePrompt": "A one-sentence image generation prompt, or null if text-only post",
  "cta": "The call-to-action embedded in the text"
}`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Create a ${req.platform} post about: ${req.topic}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || "";

  // Parse JSON from response
  const jsonStr = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed: { text: string; hashtags: string[]; imagePrompt?: string };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Fallback: treat entire response as text
    parsed = { text: content, hashtags: [], imagePrompt: undefined };
  }

  // Assemble final text with hashtags
  const hashtagStr = parsed.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  const fullText =
    limits.hashtagStyle === "inline"
      ? parsed.text // hashtags already inline for Twitter
      : `${parsed.text}\n\n${hashtagStr}`;

  return {
    text: fullText,
    hashtags: parsed.hashtags,
    imagePrompt: parsed.imagePrompt || undefined,
    platform: req.platform,
    characterCount: fullText.length,
    model: "claude-sonnet-4-20250514",
  };
}
