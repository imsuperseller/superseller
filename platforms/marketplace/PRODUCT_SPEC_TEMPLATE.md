# Product Spec Template — Rensto SaaS

**Version**: 1.0  
**Purpose**: Reusable structure for product PRDs. Use for video products (TourReel, Winner), non-video products, and different niches.

> **Source**: Pattern extracted from Winner Video Automator PRD + TourReel TOURREEL_REALTOR_HANDOFF_SPEC. Adapt sections as needed—not all apply to every product.

---

## 1. Product Identity

| Field | Example (TourReel) | Example (Winner) |
|-------|--------------------|------------------|
| **Name** | TourReel / Zillow-to-Video | Winner Video Automator |
| **Input** | Property photos, Zillow URL | Voice note + reference image |
| **Output** | 60–90s property tour MP4 | 20–30s branded MP4 |
| **Niche** | Real estate listings | Israeli RE professionals |
| **Value Prop** | $5K+ production → $149–$2,500 outcome | Traditional $5K–$25K → sub-24h |

---

## 2. High-Level Pipeline

```
User Input → [Processing Stage] → [Generation Stage] → [Post-Processing] → Delivery
```

| Stage | Purpose | Service |
|-------|---------|---------|
| **Processing** | Script rewrite, model routing, validation | Gemini / Kie AI |
| **Generation** | Video/audio from AI models | Kie (Kling, Suno, etc.) |
| **Post-Processing** | Logo, music, upscale, concat | FFmpeg (Racknerd) |
| **Delivery** | R2, WhatsApp, dashboard | R2, WAHA, Vercel |

---

## 3. Orchestration Principles

| Principle | Description |
|-----------|-------------|
| **Callback-first, poll-fallback** | External APIs POST to `/api/callbacks/*`. Cron polls for stuck tasks. |
| **State machine** | Job has `state`; callbacks drive transitions. |
| **Redis task map** | `{service}:task:{taskId}` → `{jobId, stage, createdAt}`. |
| **Model-agnostic** | Registry maps content → model. Add models via config, not code. |

---

## 4. Credit & Billing

| Element | Example |
|---------|---------|
| **1 credit** | 1 complete generation |
| **Reserve on start** | Deduct at generation start; refund on failure. |
| **Tiers** | Starter, Pro, Elite with different caps. |
| **COGS tracking** | Log API costs per generation for margin alerts. |

---

## 5. Error Handling

| Error Type | Action |
|------------|--------|
| 429 (rate limit) | Retry with backoff |
| 402 (balance) | Halt, refund, admin alert |
| 400/422 (bad params) | Don't retry; log |
| Timeout | Poll, then retry or fail |

---

## 6. Data Model (Common)

| Table | Purpose |
|-------|---------|
| `users` | Auth, avatar, tier |
| `user_credits` | Balance, caps, subscription |
| `generations` / `video_jobs` | State, inputs, outputs, stage |
| `credit_transactions` | Audit trail |

---

## 7. Flexible Sections (Product-Specific)

- **Script Processing**: Only for voice→video. Skip for photo→video.
- **Music Generation**: Always for Winner; optional for TourReel.
- **Delivery Channel**: WhatsApp, dashboard, both.
- **Identity Consistency**: Nano Banana for realtor; Gemini routing for Winner.

---

## 8. References

- **TourReel**: `apps/worker/TOURREEL_REALTOR_HANDOFF_SPEC.md`, `VIDEO_APP_USER_GUIDE.md`
- **Winner PRD**: External document (provided by user)
- **Infra**: `docs/INFRA_SSOT.md`
- **NotebookLM**: Production instructions per product
