# TourReel API Deep Reference (Level 2)

> Loaded when working on clip generation, prompt engineering, TTS, or Kling API integration.
> For pipeline overview and critical rules, see SKILL.md (Level 1).

## Three Prompt Modes

1. **Property-Only** — no realtor, empty rooms, cinematic camera
2. **Realtor-in-Frame** — Nano Banana composite as start frame, minimal prompt (no person actions)
3. **Kling Elements** — native `@realtor` reference (no Nano composite needed)

## FakeYou TTS Best Practices (NEVER REPEAT)

- **Long text garbles**: Tacotron2 breaks on sentences >8 words. ALWAYS chunk into 5-8 word phrases.
- **CDN URL**: Download from `cdn-2.fakeyou.com` (NOT storage.googleapis.com, NOT cdn.fakeyou.com — both 403).
- **Best Trump model**: `weight_x6r5w2tsxgcrrsgweva6dkrqj` (Trump Angry).
- **JSON escaping**: Use temp JSON files with `@` syntax, not inline. Replace `!` with `.` in text.
- **Stitch chunks**: Use FFmpeg concat filter with 200ms silence pads, crossfade 100ms, loudnorm to -16 LUFS.

## Kling 3.0 API Reference (NEVER REPEAT)

- **Model name**: `kling-3.0/video` (NOT `kling-3.0`, `kling-3.0/standard`, etc.)
- **Required params**: `multi_shots` (boolean), `sound` (boolean), `image_urls` (array), `duration` ("5"|"10"), `mode` ("std"|"pro"), `aspect_ratio` ("16:9"|"9:16"|"1:1")
- **First/last frame transitions**: Pass `image_urls: ["first_frame_url", "last_frame_url"]` for scene-to-scene morphing
- **Endpoint**: POST `https://api.kie.ai/api/v1/jobs/createTask`, poll GET `/api/v1/jobs/recordInfo?taskId=`
- **Response format**: `state` field (not `status`), URLs in `resultJson.resultUrls[]`
- **Negative prompt max**: 500 chars

### Transition Best Practices (researched Feb 2026, 15+ sources)
- **Use actual scene frames**: Last frame of clip A + first frame of clip B. NOT a generic reference image.
- **Prompt = camera path only**: "Smooth steadicam follows the man as he walks forward..." — let model infer the morph. Over-describing causes jitter.
- **Pro mode + 5s duration**: Pro = better motion fidelity. 5s = sweet spot (10s → more hallucination).
- **Color/tone match**: Both frames must share similar lighting. Mismatched lighting = visible seams/artifacts.
- **Hard cuts to/from transition**: The Kling clip IS the transition. Do NOT add xfade dissolve on top.
- **Negative prompt for transitions**: "morphing, flickering, wall penetration, floating person, teleportation, camera shake, glitch, distorted face, extra limbs"
- **Multi-shot incompatible**: End frame does NOT work in multi-prompt mode. Use single-scene only.
- **Guiding objects**: Keep one focal element visible in both frames to anchor the model's motion path.

## ElevenLabs via Kie.ai (NEVER REPEAT)

- **Working models**: `elevenlabs/text-to-speech-turbo-2-5`, `elevenlabs/text-to-speech-multilingual-v2`
- **Broken**: `elevenlabs/text-to-dialogue-v3` (500 errors)
- **Voice IDs**: See Kie.ai dashboard or ElevenLabs voice library

## When Modifying Prompts

Key rules:
- One primary camera movement per clip
- Eye-level POV (5ft)
- Room-specific camera flows are hardcoded in `kie.ts`
- Negative prompts are composited from multiple layers (silent + identity + duplicate + spatial + room-specific)
