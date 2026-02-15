# TourReel Realtor Workflow & Handoff Spec

**Purpose**: Define how a realtor's work is saved, surfaced, and handed off from demo to production.

---

## 0. Pipeline Flow (Technical — No Confusion)

**Canonical flow**: Nano Banana Pro → composite images → Kling 3.0 → video clips.

| Step | Component | What it does | What it does NOT do |
|------|-----------|--------------|----------------------|
| 1 | **Nano Banana Pro** | `[avatar, room_photo]` → **composite image** with realtor placed in the scene | Does not animate; output is a single image |
| 2 | **Kling 3.0** | `[start_frame, end_frame]` → **interpolates** video between two frames | Does NOT inject or add the realtor; the realtor is already in both frames (from Nano) |

**Clarification**: Kling receives frames that already contain the realtor (Nano composites). Kling only animates/interpolates between them. There is no "realtor injection" step at Kling.

**Official Kie references** (use these, not kie.ai/market):
- Kling 3.0: https://kie.ai/kling-3-0  
- Nano Banana Pro: https://kie.ai/nano-banana-pro  
- API updates: https://kie.ai/api-updates  

**Code**: `nano-banana.ts`, `kie.ts`, `video-pipeline.worker.ts`.

---

## 0b. Pipeline Config (SSOT)

**Single source of truth**: `apps/worker/src/config.ts` → `config.video`

| Setting | Value | Used by |
|---------|-------|---------|
| `defaultClipDuration` | 5 seconds | prompt-generator, kie (Kling `duration`), video-pipeline fallbacks |
| `maxClipsPerVideo` | 15 (env `MAX_CLIPS`) | video-pipeline cap on tour sequence |
| `xfadeDuration` | 0.5s | ffmpeg stitch |

**Override for smoke**: `MAX_CLIPS=1` or `MAX_CLIPS=3` in worker env. **All code must read from config**—no hardcoded 5 or 15 for duration/max-clips. Clip count = `min(tour_sequence.length, maxClipsPerVideo)`.

**Legacy docs** (blueprint, implementation specs, playbook): May show `duration_seconds: 5`, `maxClipsPerVideo: 15`. When they conflict with config.ts, **config wins**.

---

## 1. Save Everything Under the User

- All jobs tied to `user_id` (video_jobs.user_id in worker DB).
- Dashboard: `/dashboard/[clientId]/video` where `clientId` = `userId`.
- **My Videos**: List from worker `GET /api/jobs?userId={clientId}`.
- Assets in R2: `{userId}/{jobId}/frames/...`, avatar, floorplan, master video.

---

## 2. Video History in Dashboard

- No `jobId` → call `GET /api/jobs?userId=...`, show list (address, status, links).
- User picks a job → `/dashboard/[clientId]/video?jobId={id}` or `/video/[jobId]`.
- One dashboard URL; realtor sees all their videos.

---

## 3. Learning & Reference

- Outcomes: job success/fail, opening-frame choice (front vs pool).
- Reference location: R2 under `{userId}/`.
- Use for debugging and prompt improvements.

---

## 4. Handoff Flow (Demo → Production)

1. **Delete residue** — Remove test jobs, clips, temp files for user.
2. **Reset credentials** — New `dashboardToken` or invite.
3. **Payment** — Stripe; webhook provisions credits.
4. **Deliver** — Send `https://rensto.com/dashboard/{userId}?token={dashboardToken}` (or magic-link).

---

## 5. Implementation Checklist

- [ ] API: `GET /api/video/jobs?userId=...` (proxy to worker).
- [ ] Dashboard video page: when no jobId, show job list.
- [ ] Script: `cleanup-user-demo-data.ts` — delete jobs/clips/R2 for user.
- [ ] Script: `handoff-user.ts` — cleanup + new token + Stripe link.

---

## 6. Feedback & Regenerate Flow

**Status**: Selective regeneration **implemented**. Full feedback→AI mapping still backlog.

**Selective Regeneration (DONE)**:
- **Workflow**: Generate FULL video first. Quality issues (cartoon, style drift) can appear in ANY scene. Fix bad clips only—do not regenerate good ones. Saves credits.
- Mechanism: Same start/end frames for regen clips → Kling interpolates → continuity preserved.
- API: `POST /api/jobs/:id/regenerate` with `{ "clipNumbers": [2, 3] }`
- CLI: `JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts`
- Re-stitch: [good clips] + [regen clips] merged in order with boundary frames.
- **MAX_CLIPS=1 is DEBUG ONLY**—never use for real quality validation. Issues often appear in scenes 2+.

**Still backlog**:
1. Review popup when `status === completed`
2. Feedback textarea + Approve / Give Feedback actions
3. API: `POST /api/jobs/:id/feedback` with free-text feedback
4. AI step: map feedback → list of clip numbers + suggested prompt changes

---

## 7. References

- NotebookLM Zillow-to-Video: `0baf5f36-7ff0-4550-a878-923dbf59de5c`
- DASHBOARD_SaaS_ALIGNMENT.md — P1 "My Videos"
- Worker API: `GET /api/jobs?userId=...` (exists)
