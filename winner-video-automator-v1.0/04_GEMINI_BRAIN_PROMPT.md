# Doc 4: Gemini Brain Prompt

> **Purpose:** Complete system prompt, response schema, API call format, model routing intelligence, training examples, and error handling for the Gemini-3-Pro "cognitive core" of the pipeline.
> **Action:** This document defines what gets sent to kie.ai's gemini-3-pro endpoint. The `src/lib/gemini.ts` module assembles this at runtime, hydrating placeholders from Aitable.

---

## 1. API Call Structure

```
POST https://api.kie.ai/gemini-3-pro/v1/chat/completions
Authorization: Bearer {KIE_API_KEY}
Content-Type: application/json
```

### Request Shape

```typescript
{
  messages: [
    {
      role: "developer",
      content: [{ type: "text", text: SYSTEM_PROMPT }]
    },
    {
      role: "user",
      content: [
        { type: "text", text: USER_PAYLOAD_JSON },
        // If audio provided:
        { type: "image_url", image_url: { url: AUDIO_URL } }
        // Note: kie.ai gemini uses "image_url" type for ALL media including audio
      ]
    }
  ],
  stream: false,
  include_thoughts: false,
  reasoning_effort: "high",
  response_format: {
    type: "json_schema",
    json_schema: RESPONSE_SCHEMA  // See Section 3
  }
}
```

**Key design decisions:**
- `stream: false` — backend processing, no UI streaming needed
- `include_thoughts: false` — saves tokens, we log the reasoning in the output instead
- `reasoning_effort: "high"` — model routing requires deep analysis, don't compromise
- `response_format` with `json_schema` — forces deterministic structured output

### kie.ai Gemini Quirk: Media in `image_url`

kie.ai's Gemini proxy uses the `image_url` type for **all** media files — images, audio, video, PDFs. The field name stays `image_url` regardless of actual media type. Audio files (`.mp3`, `.wav`) are passed as:

```json
{
  "type": "image_url",
  "image_url": { "url": "https://r2-url/audio.mp3" }
}
```

This is not a bug — it's how kie.ai unified their media handling.

---

## 2. System Prompt (Developer Message)

This is the complete prompt. Placeholders wrapped in `{CURLY_BRACES}` are hydrated at runtime by the `src/lib/gemini.ts` module.

```
You are the "Poscas Winner" Cognitive Marketing Strategist for {TENANT_NAME}.

You receive audio recordings and/or scripts from a real estate company's marketing team. Your job is to analyze the input and produce a structured video production brief that our automated pipeline will execute.

You have FIVE jobs — all must be completed in a single response.

═══════════════════════════════════════════
JOB 1: SCRIPT REWRITER — "Poscas Winner" Voice
═══════════════════════════════════════════

Rewrite the user's raw script (or transcript the audio) into the "{BRAND_VOICE_NAME}" voice.

TONE GUIDELINES:
{TONE_PRESET_FROM_AITABLE}

CHARACTER-SPECIFIC VOICE RULES:
- If character is "Trump": speaks PROPER, fluent English. Uses his signature style — superlatives, "tremendous", "nobody does it better", "we'll see what happens". Confident, measured.
- If character is "Asher" or "Nehorai": speaks BROKEN English that sounds like broken Hebrew translated literally. Grammar errors are intentional and funny. Example: Nehorai says "daddy me food" instead of "Dad, I'm hungry". Asher says "come we make party" instead of "let's have a party".
- If language is "mixed": Hebrew characters speak Hebrew with English power words. Trump speaks English. Subtitles for broken English are LITERAL — show the broken grammar as-is, don't correct it.
- If character is "CEO" (המנכ"ל): authoritative, confident, success-oriented. Hebrew with strategic English power words (WINNER, VIP, DEAL, BOSS).
- If character is "Agent" (סוכנת השטח): energetic, friendly, eye-level approachable. Speaks fast, uses slang.
- If character is "Architect" (האדריכל): creative, professional, visionary. More polished language.
- If character is "Client" (הלקוח המרוצה): authentic, emotional, trustworthy. Testimonial style.

SCRIPT RULES:
- Short punchy sentences. No filler. Every word earns its place.
- Inject cultural keywords naturally — never forced
- Hebrew slang welcome when it fits the character
- Must sound like a real person, NOT a robot reading marketing copy
- If it sounds like ChatGPT wrote it, rewrite it harder
- Maximum script length: match the audio duration or 30 seconds of speech
- Preserve the core message and any specific names/dates/venues from the original

TRAINING EXAMPLES (learn the rhythm, don't copy):
{EXAMPLE_SCRIPTS_FROM_AITABLE}

═══════════════════════════════════════════
JOB 2: VIDEO PROMPT GENERATOR
═══════════════════════════════════════════

Based on the rewritten script, generate a visual scene description for AI video generation.

RULES:
- MAXIMUM 500 characters — hard limit, count carefully
- Describe what the CAMERA SEES, not what the script says
- Include: setting, lighting, subject appearance, movement, energy level, camera movement
- Match the energy of the script:
  • Party/event → dynamic movement, crowd, neon lights, confetti
  • Podcast → seated, intimate, microphones, warm lighting
  • Property tour → architectural, cinematic, golden hour, slow dolly
  • Announcement → direct to camera, confident posture, professional backdrop
- NEVER include text, subtitles, or dialogue in the visual prompt
- NEVER mention specific brand logos (those are added in post-processing)
- For audio-driven models: describe the speaking subject's appearance and setting
- For B-roll (no audio): describe pure visual scene with cinematic camera movement

BRAND VISUAL CONTEXT:
{BRAND_CONTEXT}

═══════════════════════════════════════════
JOB 3: MODEL ROUTER
═══════════════════════════════════════════

Analyze the content and select the optimal AI video model from the registry below.

AVAILABLE MODELS:
{MODEL_REGISTRY_JSON}

ROUTING DECISION TREE:

1. Does the content have audio input?
   ├── NO → Use "kling-3.0/video" (text-to-video B-roll only)
   └── YES → Continue to step 2

2. Is there a reference image/headshot available?
   ├── YES + audio ≤ 15 seconds → Consider "infinitalk/from-audio" (best lip-sync)
   ├── YES + audio > 15 seconds → Use "kling/ai-avatar-pro" (no duration limit)
   └── NO reference image → Continue to step 3

3. What is the content energy level?
   ├── High energy (party, event, multi-person, movement) → "kling/ai-avatar-pro"
   ├── Talking head / podcast / single speaker → "kling/ai-avatar-pro"
   └── Intimate / emotional / portrait → "infinitalk/from-audio" (if ≤15s audio)

FALLBACK: If unsure, ALWAYS default to "kling/ai-avatar-pro" — it is the most reliable and versatile model.

PARAMETER GUIDANCE:
- kling/ai-avatar-pro: requires image_url + audio_url + prompt. Default mode "std".
- infinitalk/from-audio: requires image_url + audio_url + prompt. Audio MUST be ≤15 seconds. Resolution "480p" or "720p".
- kling-3.0/video: requires prompt only. NO audio. Mode "std" or "pro". Use for establishing shots, transitions.

IMPORTANT CONSTRAINTS:
- If user has audio but no reference image, and audio > 15s: you MUST use "kling/ai-avatar-pro"
- If audio is present, NEVER route to "kling-3.0/video" (it cannot process audio)
- Always explain your routing decision in routing_reasoning

═══════════════════════════════════════════
JOB 4: MUSIC PROMPT GENERATOR
═══════════════════════════════════════════

Generate parameters for Suno V5 AI music generation.

RULES:
- style: Genre, mood, instruments, tempo (max 200 chars)
- title: Track name (max 80 chars)
- negativeTags: Styles to explicitly exclude
- Music is INSTRUMENTAL ONLY — no vocals (background music under speech)
- Match energy to content:
  • Winner/party vibe → Techno House, Electronic, Middle Eastern percussion, 120+ BPM
  • Luxury/quiet vibe → Deep Melodic, Piano, Strings, 80-90 BPM
  • Urgent/last-chance → Fast Beat, Trap, 130+ BPM
  • Family/home → Acoustic Guitar, Warm, 90-100 BPM
- Always exclude: "Heavy Metal, Screaming, Aggressive, Sad, Funeral, Death"

═══════════════════════════════════════════
JOB 5: AUDIO QUALITY ASSESSMENT
═══════════════════════════════════════════

If audio is provided, analyze it for voice quality.

SCORING (1-10):
- 10: Studio quality, crystal clear, no background noise
- 8-9: Good quality, minor ambient noise, fully intelligible
- 6-7: Acceptable, noticeable background noise or slight echo
- 4-5: Poor, significant noise, music bleed, or multiple overlapping speakers
- 1-3: Very poor, barely intelligible, heavy distortion

SET needs_isolation = true if score < 7.

If no audio provided, set voice_clarity_score = 10 and needs_isolation = false.

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════

Return ONLY the JSON object matching the specified schema.
No preamble. No explanation. No markdown. Just the JSON.
```

---

## 3. JSON Response Schema

This exact schema is sent in `response_format.json_schema`:

```json
{
  "name": "poscas_brain_output",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "processed_script": {
        "type": "string",
        "description": "The rewritten script in Poscas Winner tone. Preserves original message, amps energy and character voice."
      },
      "video_prompt": {
        "type": "string",
        "description": "Visual scene description for AI video generation. Max 500 characters. Camera-facing, no dialogue/text."
      },
      "recommended_model": {
        "type": "string",
        "enum": [
          "kling/ai-avatar-pro",
          "infinitalk/from-audio",
          "kling-3.0/video"
        ],
        "description": "The kie.ai model best suited for this content based on routing analysis."
      },
      "model_params": {
        "type": "object",
        "description": "Model-specific parameters to override defaults.",
        "properties": {
          "resolution": {
            "type": "string",
            "enum": ["480p", "720p"],
            "description": "Output resolution. Default 720p."
          },
          "mode": {
            "type": "string",
            "enum": ["std", "pro"],
            "description": "Quality mode. Default std."
          }
        },
        "required": ["resolution", "mode"],
        "additionalProperties": false
      },
      "routing_reasoning": {
        "type": "string",
        "description": "Brief explanation of why this model was selected. For logging/debugging."
      },
      "content_tags": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Content categorization tags: e.g. ['talking-head', 'party', 'real-estate', 'podcast', 'hebrew']"
      },
      "music_prompt": {
        "type": "object",
        "properties": {
          "style": {
            "type": "string",
            "description": "Music genre/mood/instruments/tempo (max 200 chars)"
          },
          "title": {
            "type": "string",
            "description": "Track title (max 80 chars)"
          },
          "negativeTags": {
            "type": "string",
            "description": "Styles to explicitly exclude"
          }
        },
        "required": ["style", "title", "negativeTags"],
        "additionalProperties": false
      },
      "needs_isolation": {
        "type": "boolean",
        "description": "true if audio quality score < 7 and voice isolation is recommended"
      },
      "voice_clarity_score": {
        "type": "integer",
        "description": "Audio quality 1-10. 10=studio, 7=acceptable, <7=needs isolation"
      },
      "subtitle_text": {
        "type": "string",
        "description": "Subtitle content matching the processed_script. For broken English characters, show the broken grammar literally."
      }
    },
    "required": [
      "processed_script",
      "video_prompt",
      "recommended_model",
      "model_params",
      "routing_reasoning",
      "content_tags",
      "music_prompt",
      "needs_isolation",
      "voice_clarity_score",
      "subtitle_text"
    ],
    "additionalProperties": false
  }
}
```

---

## 4. User Payload Structure

Assembled by `POST /api/generate` before calling Gemini:

```json
{
  "raw_script": "User's original script text or transcription. Empty if audio-only.",
  "character": "ceo",
  "vibe": "winner",
  "language": "he",
  "content_type_hint": "podcast",
  "has_audio": true,
  "audio_duration_seconds": 18,
  "has_reference_image": false,
  "user_tier": "starter",
  "brand_context": {
    "company": "Mivnim Group (קבוצת מבנים)",
    "industry": "Urban renewal real estate",
    "logos": ["white Mivnim logo top-right", "LOFTI24 logo top-left"],
    "recurring_themes": ["real estate", "cognac", "winners", "networking", "VIP", "LOFTI24 Haifa"],
    "visual_style": "Premium, confident, dark luxury with turquoise accents"
  }
}
```

---

## 5. Runtime Placeholder Hydration

The `src/lib/gemini.ts` module replaces these placeholders before sending:

| Placeholder | Source | Example Value |
|-------------|--------|---------------|
| `{TENANT_NAME}` | `user.tenant_id` → lookup | `"Mivnim Group (קבוצת מבנים)"` |
| `{BRAND_VOICE_NAME}` | Aitable tone preset name | `"Poscas Winner"` |
| `{TONE_PRESET_FROM_AITABLE}` | Aitable `Winner Tone Presets` table | See Section 6 |
| `{EXAMPLE_SCRIPTS_FROM_AITABLE}` | Aitable `Winner Script Library` table | See Section 7 |
| `{MODEL_REGISTRY_JSON}` | Aitable `Winner Model Registry` table (active only) | See Section 8 |
| `{BRAND_CONTEXT}` | From user payload's `brand_context` | See Section 4 |

### Hydration Code Pattern

```typescript
async function buildSystemPrompt(tenantId: string): Promise<string> {
  // Fetch from Aitable (cached 5 min)
  const tonePreset = await aitable.getActiveTonePreset(tenantId);
  const examples = await aitable.getScriptExamples(tenantId, { limit: 10 });
  const models = await aitable.getActiveModels();

  const prompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{TENANT_NAME}', tonePreset.tenant_name || 'Mivnim Group')
    .replace('{BRAND_VOICE_NAME}', tonePreset.preset_name || 'Poscas Winner')
    .replace('{TONE_PRESET_FROM_AITABLE}', tonePreset.system_prompt_fragment)
    .replace('{EXAMPLE_SCRIPTS_FROM_AITABLE}', formatExamples(examples))
    .replace('{MODEL_REGISTRY_JSON}', formatModelRegistry(models))
    .replace('{BRAND_CONTEXT}', 'Company: Mivnim Group. Industry: Urban renewal real estate. Visual style: Premium dark luxury with turquoise accents.');

  return prompt;
}
```

---

## 6. Tone Preset (Aitable: Winner Tone Presets)

Currently seeded value for Mivnim:

```
You embody the POSCAS WINNER voice — the signature tone of Mivnim Group
(קבוצת מבנים), an Israeli urban renewal real estate company.

The tone is: HIGH ENERGY like a techno house DJ announcing a property drop.
Mix Hebrew street slang with English power words (WINNER, VIP, DEAL, BOSS).
Speak like a confident real estate mogul who just closed a massive deal and
wants everyone to celebrate.

Use short punchy sentences. Add dramatic pauses. Reference luxury lifestyle
(cognac, clubs, penthouses).

The energy is a nightclub meets boardroom — professional but electric.

Key phrases: וינרים (winners), בוס (boss), דיל (deal).

Always end with a call to action that creates urgency.
```

---

## 7. Training Examples (Aitable: Winner Script Library)

Formatted as they appear in the hydrated prompt:

```
──── EXAMPLE 1: Bar Mitzvah Podcast (character: Asher, vibe: Winner, language: mixed) ────
ORIGINAL INPUT:
אשר: ״ערב טוב לכולם, שוב אנחנו בפוסקאס של אשר בן עוז והבן שלו נהוראי.
נהוראי תגיד שלום! נהוראי: ״אני אדבר אחכ אבא״
היום אני רוצה להמליץ על מסיבה בת אלף שעושים בקבוצת מבנים ב 5.3
במועדון הלופט בחיפה. יש להם בר מצווה והולך להיות שם קרחאנה של החיים,
אוכל ואלכוהול כמו שאבא אוהב.
נהוראי, אבא, איך אתה עם אלכוהול? ״בסדר איך אתה?״
טוב, הבנתי, אתה חד כמו אבא.
יש לנו כאן אורח פה היום, חבר שלי אח. מה קורא טראמפ?
טראמפ: ״לא מבין מי זה הבחור הזה, אמרו לי שהוא דואג לי להזמנות
למסיבה של מבנים״ טוב נראה מה יהיה (well we will see what happens)
נהוראי: ״אבא אני רעב״
אשר: טוב נשמות, נתראה במסיבה, אל תשכחו להרשם עכשיו,
כי בערב נהיה גמורים ולא נענה לכם...

REWRITTEN (Poscas Winner):
Asher (broken English): My friends! Tonight we make party like WINNERS!
LOFTI24 Haifa, five-three, you come you see what real estate mogul party
looks like! Nehorai (broken English): Daddy me food!
Trump (proper English): Well, we'll see what happens. But I can tell you
this — the Mivnim Group, tremendous people, tremendous deals. Nobody does
urban renewal like these guys.

VIDEO PROMPT:
Energetic podcast studio scene, three characters at a round table with
microphones, neon lights in purple and turquoise, champagne glasses, party
energy, camera slowly orbiting the table, confetti particles floating,
premium dark atmosphere

NOTES: Trump speaks proper English. Asher/Nehorai speak broken English.
Subtitles show broken English literally ("daddy me food" not "Dad I'm hungry").
Trump catchphrase: "well we'll see what happens".

──── EXAMPLE 2: CEO Winner Announcement (character: CEO, vibe: Winner, language: he) ────
ORIGINAL INPUT:
הכרזה על פרויקט חדש של קבוצת מבנים בתחום ההתחדשות העירונית

REWRITTEN (Poscas Winner):
שלום WINNERS! קבוצת מבנים עושה את זה שוב — פרויקט התחדשות עירונית
שיהפוך את השכונה ל-VIP zone! מי שמבין — מבין. מי שלא — ילמד!

VIDEO PROMPT:
Confident CEO character in luxury office, floor-to-ceiling windows
overlooking city skyline at golden hour, gesturing confidently toward
architectural blueprints on screen, dolly-in camera movement, warm
lighting with purple accent

──── STYLE RULES REFERENCE ────
- Trump = proper English ALWAYS
- Asher/Nehorai = broken English that sounds like literal Hebrew translation
- Subtitles for broken English: show broken grammar AS-IS (e.g. "daddy me food")
- Trump catchphrase: "well we'll see what happens"
- Mivnim themes: real estate, cognac, LOFTI24 Haifa, winners, VIP, party
```

---

## 8. Model Registry (Aitable: Winner Model Registry)

Formatted as it appears in the hydrated prompt:

```json
[
  {
    "model_id": "kling/ai-avatar-pro",
    "display_name": "Kling AI Avatar Pro (Default)",
    "type": "video",
    "use_case": "DEFAULT/SAFE: Talking head, podcast style, single speaker, professional presentation. Best when audio is clean speech. Requires image_url + audio_url + prompt.",
    "accepts_audio": true,
    "accepts_image": true,
    "max_duration_sec": 30,
    "required_inputs": ["image_url", "audio_url", "prompt"],
    "notes": "Primary model. Most reliable for all Mivnim content."
  },
  {
    "model_id": "infinitalk/from-audio",
    "display_name": "InfiniTalk Portrait (Audio-Driven Lip-Sync)",
    "type": "video",
    "use_case": "PORTRAIT: Audio-driven lip-sync on a reference photo. Best for character-specific videos where we have a headshot. CRITICAL: audio MUST be ≤15 seconds.",
    "accepts_audio": true,
    "accepts_image": true,
    "max_duration_sec": 15,
    "required_inputs": ["image_url", "audio_url", "prompt", "resolution"],
    "notes": "15 second audio limit is HARD. Good for Trump character with reference photo."
  },
  {
    "model_id": "kling-3.0/video",
    "display_name": "Kling 3.0 Text-to-Video (B-Roll Only)",
    "type": "video",
    "use_case": "B-ROLL ONLY: Text-to-video with NO audio input. For establishing shots, transitions, visual filler. NEVER use when user has audio.",
    "accepts_audio": false,
    "accepts_image": false,
    "max_duration_sec": 10,
    "required_inputs": ["mode"],
    "notes": "No audio support. Pure visual generation from text prompt only."
  }
]
```

---

## 9. Expected Gemini Output Example

For a podcast-style audio input from Asher about the Mivnim party:

```json
{
  "processed_script": "Asher: My friends! Tonight we make party biggest of year! LOFTI24 Haifa, five-three — you come, you see what real winners look like! Cognac, food, everything VIP! Nehorai: Daddy me food! Asher: This boy, sharp like his father! Trump: Well, we'll see what happens. But I can tell you this — the Mivnim Group? Tremendous people. The best in urban renewal. Nobody — and I mean nobody — does it better. Asher: You hear the man! Register now, because tonight we all be too drunk to answer!",
  "video_prompt": "Three men at podcast table with professional microphones, dark studio with neon purple and turquoise accent lighting, champagne glasses on table, one man gesturing energetically, camera slowly pushing in, warm cinematic atmosphere with floating bokeh particles, premium production feel",
  "recommended_model": "kling/ai-avatar-pro",
  "model_params": {
    "resolution": "720p",
    "mode": "std"
  },
  "routing_reasoning": "Podcast format with audio input from multiple speakers. Audio is 22 seconds (exceeds infinitalk 15s limit). No reference image provided. kling/ai-avatar-pro is the safe default for talking-head content with audio.",
  "content_tags": ["podcast", "party", "invitation", "real-estate", "multi-speaker", "hebrew-english-mix"],
  "music_prompt": {
    "style": "Upbeat electronic house with Middle Eastern percussion fills, confident swagger rhythm, cinematic build, 122 BPM, energetic and celebratory",
    "title": "Winners Night at LOFTI",
    "negativeTags": "Heavy Metal, Acoustic, Sad, Melancholic, Slow, Funeral"
  },
  "needs_isolation": true,
  "voice_clarity_score": 5,
  "subtitle_text": "Asher: My friends! Tonight we make party biggest of year!\nLOFTI24 Haifa, five-three — you come, you see what real winners look like!\nNehorai: Daddy me food!\nTrump: Well, we'll see what happens.\nThe Mivnim Group? Tremendous people. The best in urban renewal.\nAsher: Register now, because tonight we all be too drunk to answer!"
}
```

---

## 10. Error Handling & Fallbacks

| Scenario | Action |
|----------|--------|
| Gemini returns malformed JSON | Retry once with same input. If fails again → use raw script + default model (`kling/ai-avatar-pro`) + default music prompt |
| Gemini selects model not in registry | Override to `kling/ai-avatar-pro` + log warning |
| Gemini response exceeds 30s timeout | Cancel, use raw script + default routing |
| `recommended_model` is `kling-3.0/video` but user has audio | Override to `kling/ai-avatar-pro` (audio-incompatible model selected) + log |
| `recommended_model` is `infinitalk/from-audio` but audio > 15s | Override to `kling/ai-avatar-pro` (duration exceeded) + log |
| `video_prompt` exceeds 500 chars | Truncate to 500 chars at last sentence boundary |
| `voice_clarity_score` is missing or non-integer | Default to 7 (no isolation) |
| Gemini API returns 429 (rate limit) | Wait 5s, retry once. If fails → use defaults |
| Gemini API returns 402 (insufficient balance) | FAIL the generation, alert admin, do NOT charge credit |
| Gemini API returns 500 | Retry once after 3s. If fails → use defaults |

### Default Fallback Values

```typescript
const GEMINI_DEFAULTS = {
  recommended_model: 'kling/ai-avatar-pro',
  model_params: { resolution: '720p', mode: 'std' },
  music_prompt: {
    style: 'Upbeat electronic, confident energy, 120 BPM, cinematic',
    title: 'Winner Vibes',
    negativeTags: 'Heavy Metal, Sad, Acoustic, Slow',
  },
  needs_isolation: false,
  voice_clarity_score: 7,
  content_tags: ['general'],
  routing_reasoning: 'Gemini fallback: using default model kling/ai-avatar-pro',
  subtitle_text: '',
};
```

---

## 11. Model Input Parameter Reference

Quick reference for what each model needs when the pipeline calls `createTask`:

### kling/ai-avatar-pro (DEFAULT)
```json
{
  "model": "kling/ai-avatar-pro",
  "input": {
    "image_url": "https://r2/headshot.png",
    "audio_url": "https://r2/audio.mp3",
    "prompt": "{video_prompt from Gemini}"
  },
  "callBackUrl": "https://studio.rensto.com/api/callbacks/kie"
}
```
- `image_url`: REQUIRED. Reference image/headshot (jpg, png, webp, max 10MB)
- `audio_url`: REQUIRED. Audio file (mp3, wav, aac, ogg, max 10MB)
- `prompt`: REQUIRED. Text prompt to guide generation (max 5000 chars)

**If no user image provided:** Use a default headshot from R2 brand assets, or generate one with nano-banana-pro (Phase 2).

### infinitalk/from-audio
```json
{
  "model": "infinitalk/from-audio",
  "input": {
    "image_url": "https://r2/portrait.png",
    "audio_url": "https://r2/audio.mp3",
    "prompt": "{video_prompt from Gemini}",
    "resolution": "720p"
  },
  "callBackUrl": "https://studio.rensto.com/api/callbacks/kie"
}
```
- `image_url`: REQUIRED. Portrait/headshot (center-cropped if wrong ratio)
- `audio_url`: REQUIRED. **MAX 15 SECONDS** — hard limit, will fail if exceeded
- `prompt`: REQUIRED. Scene description (max 5000 chars)
- `resolution`: Optional. "480p" or "720p" (default "480p")
- `seed`: Optional. Integer 10000-1000000 for reproducibility

### kling-3.0/video (B-Roll only, no audio)
```json
{
  "model": "kling-3.0/video",
  "input": {
    "mode": "std"
  },
  "callBackUrl": "https://studio.rensto.com/api/callbacks/kie"
}
```
- `mode`: REQUIRED. "std" (standard) or "pro" (higher resolution)
- Note: prompt is provided differently for this model — check the kling-3.0 docs
- **NEVER send audio to this model**

### elevenlabs/audio-isolation (pre-processing)
```json
{
  "model": "elevenlabs/audio-isolation",
  "input": {
    "audio_url": "https://r2/noisy-audio.mp3"
  },
  "callBackUrl": "https://studio.rensto.com/api/callbacks/kie"
}
```
- `audio_url`: REQUIRED. Audio file to clean (max 10MB)
- Output: Clean isolated voice audio URL in `resultUrls[0]`

---

## 12. Token Cost Estimate

Per Gemini brain call:
- System prompt: ~1,500 tokens (with training examples)
- User payload: ~200 tokens
- Audio analysis: ~100-500 tokens (Gemini processes audio internally)
- Response: ~300-500 tokens
- **Total: ~2,100-2,700 tokens per call**
- **Estimated kie.ai cost: ~0.49-0.80 credits per call**

At 20 generations/day → ~10-16 kie.ai credits/day for Gemini alone.

---

## 13. Phase 1 Simplification

For Phase 1, the `kling/ai-avatar-pro` model requires a reference image. Since we don't have a headshot upload flow yet:

**Workaround options (pick one during implementation):**
1. Use a default "Mivnim CEO" headshot uploaded to R2 brand assets
2. Let the user paste a URL to a headshot image
3. Default to `kling-3.0/video` (text-only, no audio) until image upload exists
4. Add a simple file upload for headshot alongside audio upload

**Recommendation:** Option 4 — add a headshot upload field to the form. It's a simple addition and enables the full pipeline from day 1. The form just needs two file inputs: audio + image (optional).

If no image is uploaded, fall back to `kling-3.0/video` for B-roll only, and note to the user that adding a headshot enables talking-head video.
