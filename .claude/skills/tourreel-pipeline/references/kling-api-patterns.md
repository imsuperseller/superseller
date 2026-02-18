# Kling 3.0 API Patterns (via Kie.ai)

## API Details

- **Base URL**: `https://api.kie.ai/api`
- **Auth**: `Bearer ${KIE_KEY}`
- **Model**: `kling-3.0/video` (only model used)

## Create Task

**Endpoint**: `POST /api/v1/generate`

```typescript
{
  prompt: string;                        // Cinematic scene description
  image_url: string;                     // Start frame (MUST be public R2 URL)
  last_frame?: string;                   // End frame for seamless continuity
  negative_prompt?: string;              // Max 500 chars
  kling_elements?: KlingElement[];       // Native character reference
  mode?: "std" | "pro";                  // std=720p, pro=1080p native
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  model: "kling-3.0/video";
  duration?: 5 | 10;                     // MUST be "5" or "10" (string enum)
  multi_shots: false;                    // Always false
}
```

## Hard Constraints

| Constraint | Detail | Failure Mode |
|------------|--------|-------------|
| `duration` | Must be `"5"` or `"10"` string enum | Kie 500 if float |
| `image_url` | Must be public R2 URL | Kie 500 if Zillow URL (blocked) |
| `negative_prompt` | Max 500 chars | Request body error if longer |
| `aspect_ratio` | Omit when `last_frame` is set | Conflict error |

## Poll Task Status

**Endpoint**: `GET /api/v1/jobs/recordInfo?taskId=${taskId}`

**States**:
- `SUCCESS` / `success` / `COMPLETED` → completed
- `PROCESSING` / `waiting` → processing
- `FAIL` / `FAILED` / `fail` → failed

**Polling**: Every 10s, timeout 15 minutes (900,000ms)

**Result extraction** (multiple formats — check in order):
1. `statusData.resultUrls` (JSON string or array)
2. `statusData.response` (JSON string with `videoUrl`)
3. `statusData.data[0].videoUrl`

## Kling Elements (Native Character Reference)

```typescript
{
  name: "realtor",                     // Referenced as @realtor in prompt
  description: "Professional real estate agent...",
  element_input_urls: string[];       // 2-4 reference images (JPG/PNG, max 10MB each)
}
```

When using Elements, prompt references `@realtor` instead of describing the person.

## Suno Music Generation

**Endpoint**: `POST /api/v1/generate`

```typescript
{
  prompt: string;           // "Cinematic real estate background music"
  model?: "V4_5" | "V5";
  instrumental?: boolean;   // Default: true
}
```

Fallback: SoundHelix MP3 if Suno fails.

## Negative Prompt Layers

Composed from multiple constants (total must stay under 500 chars):

| Layer | Purpose | Used When |
|-------|---------|-----------|
| `SILENT_NEGATIVE` | Ban talking, lip movement | Always with realtor |
| `IDENTITY_NEGATIVE` | Ban different face/person | Realtor reference used |
| `DUPLICATE_FIGURE_NEGATIVE` | Ban double figure, clone | Realtor in frame (Nano) |
| `SPATIAL_NEGATIVE` | Ban wall penetration, floating | All clips |
| Room-specific additions | Ban room-specific issues | Per room type |

## Common API Errors

### Error: Kie 500 on Task Creation
- **Cause 1**: Float duration (e.g., `5.00` instead of `"5"`)
- **Cause 2**: Zillow URL as image_url (blocked by Kling)
- **Cause 3**: negative_prompt > 500 chars
- **Fix**: Check all three constraints before submitting

### Error: Task Timeout (15 min)
- **Cause**: Kling overloaded or image too complex
- **Fix**: Retry with `mode: "std"` (720p, faster) or simplify prompt

### Error: Task Failed
- **Cause**: Content moderation, invalid image, or internal Kling error
- **Fix**: Check prompt for NSFW triggers, verify image_url accessible, retry
