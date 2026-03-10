# Backlog: VideoForge Full Audit + End-to-End Test

> **Status**: Not started — needs ~$1-2 spend (Kling API)
> **Decision needed**: Approve spend before starting
> **Owner**: Project 2 (Video Engine)

---

## What This Is

VideoForge is LIVE at superseller.agency/video/create but has never been fully validated end-to-end since the quality fixes. A full pipeline test is needed to confirm:
1. Zillow URL → photo extraction → scene planning → Kling clip generation → FFmpeg assembly → R2 upload → playable URL
2. Credit deduction works
3. No double-realtor bug
4. No pool bug
5. Photo normalization works (1920x1080)
6. Remotion path also works (Ken Burns)

---

## What Needs to Happen

1. Create a test job with a real Zillow listing (pick one with clear rooms + outdoor spaces)
2. Monitor the pipeline (poll job status every 30s)
3. Check final video quality
4. Verify credit was deducted
5. Fix any issues found
6. Document results in findings.md

**Estimated cost**: $1-2 (3-6 Kling Pro clips at $0.10 each + Suno $0.06)

---

## Known Issues Going In

- Kling only accepts jpg/png — NOT webp (verified fix in codebase, not tested live)
- Pool/outdoor scene detection may still over-trigger
- Realtor composite overlay alignment (fixed in code, untested live)
- Remotion path: 14 compositions built, some not tested in production

---

## Files to Work With

```
apps/worker/src/queue/workers/video-pipeline.worker.ts
apps/worker/src/services/kie.ts
apps/worker/src/services/ffmpeg.ts
apps/worker/remotion/
```

---

## Dependency

Requires approval from Shai for ~$2 test spend before starting.
