---
name: resilience-patterns
description: >-
  Cross-cutting resilience patterns for SuperSeller AI's external API dependencies.
  Covers exponential backoff, circuit breakers, fallback chains, graceful degradation,
  error budgets, and SLA tracking. Applies to ALL products (TourReel, Winner Studio,
  FB Bot, AgentForge). Created after Kie.ai outage caused 0% success rate.
  Use when adding retry logic, circuit breakers, fallback providers, or handling
  API outages. Not for UI design, database schema, or business logic.
  Example: "Add circuit breaker to Kie.ai calls" or "Implement fallback for Gemini".
autoTrigger:
  - "retry"
  - "circuit breaker"
  - "fallback"
  - "resilience"
  - "exponential backoff"
  - "graceful degradation"
  - "error budget"
  - "SLA"
  - "API outage"
  - "Kie.ai down"
  - "timeout"
  - "rate limit"
negativeTrigger:
  - "UI design"
  - "schema migration"
  - "landing page"
  - "admin portal"
  - "PayPal billing"
---

# Resilience Patterns

## Critical
- **Kie.ai outage (Feb 24, 2026) caused 0% success rate** — zero retry, zero circuit-breaker, zero fallback. This is why this skill exists.
- **Every external API call MUST have retry logic** — no exceptions.
- **Circuit breakers prevent cascade failures** — stop calling a dead service.
- **Fallback chains provide degraded service** — better than total failure.
- **This is cross-cutting** — applies to TourReel, Winner Studio, FB Bot, AgentForge, FrontDesk.

## External API Dependencies

| Service | Used By | Failure Impact |
|---------|---------|---------------|
| Kie.ai (Kling, Suno, Nano, Avatar) | TourReel, Winner Studio | Total pipeline failure |
| Gemini (Flash, Vision) | TourReel, Winner Studio, FB Bot | No AI analysis/prompts |
| PayPal | All products | No payments, no provisioning |
| Resend | All products | No email notifications |
| WAHA | Winner Studio, Lead Pages | No WhatsApp delivery |
| Apify | TourReel | No Zillow scraping |
| Telnyx | FrontDesk, FB Bot | No voice/phone |
| Ollama | RAG | No embeddings |
| GoLogin | FB Bot | No browser profiles |

## Pattern 1: Exponential Backoff with Jitter (IMPLEMENTED)

**Canonical implementation: `apps/worker/src/utils/retry.ts`**

```typescript
import { withRetry } from "../../utils/retry";

// Usage in video pipeline:
const taskId = await withRetry(
  () => createKlingTask(request),
  { label: "createKlingTask clip 3" }
);

// Options:
// maxAttempts: 3 (default)
// initialDelayMs: 2000 (default, doubles each retry)
// maxDelayMs: 30000 (cap)
// label: string for logging

// Auto-detects transient errors:
// - TimeoutError, AbortError, ECONNRESET, ECONNREFUSED, ETIMEDOUT
// - HTTP 429, 500, 502, 503
// - "rate limit" in message
// Does NOT retry 4xx client errors (except 429)
```

**Currently wired into:**
- `createKlingTask()` — each clip generation in video-pipeline.worker.ts
- `createSunoTask()` — music generation in video-pipeline.worker.ts

## Pattern 2: Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,      // failures before opening
    private resetTimeMs: number = 60000  // time before half-open
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.resetTimeMs) {
        this.state = 'half-open';
      } else {
        throw new CircuitOpenError(`Circuit open, retry after ${this.resetTimeMs}ms`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

## Pattern 3: Fallback Chain

```typescript
// Per-service fallback chains
const FALLBACK_CHAINS = {
  // Video generation
  'video': [
    { provider: 'kie-kling-pro', model: 'kling-3.0/video', mode: 'pro' },
    { provider: 'kie-kling-std', model: 'kling-3.0/video', mode: 'std' },
    // Future: { provider: 'openai-sora', model: 'sora-2' },
  ],

  // Avatar/lip-sync
  'avatar': [
    { provider: 'kie-avatar-pro', model: 'kling/ai-avatar-pro' },
    { provider: 'kie-infinitalk', model: 'infinitalk/from-audio' },
    { provider: 'kie-kling', model: 'kling-3.0/video' },  // degraded: no lip-sync
  ],

  // Vision/analysis
  'vision': [
    { provider: 'gemini-flash', model: 'gemini-2.0-flash' },
    // Future: { provider: 'claude-vision', model: 'claude-sonnet' },
  ],

  // Music generation
  'music': [
    { provider: 'kie-suno', model: 'suno' },
    { provider: 'database', model: 'cached-tracks' },  // reuse existing tracks
  ],
};
```

## Pattern 4: Graceful Degradation

| Full Service | Degraded Service | What User Gets |
|-------------|-----------------|----------------|
| Avatar Pro (lip-sync) | Kling 3.0 (B-roll) | Video without lip-sync |
| Suno (fresh music) | Database (cached track) | Reused music from DB |
| Gemini (AI prompts) | Hardcoded defaults | Generic prompts, lower quality |
| Pro quality (1080p) | Std quality (720p) | Lower resolution |
| WhatsApp delivery | Email delivery | Different notification channel |

## Per-Service Configuration

| Service | Retry | Backoff | Circuit Threshold | Circuit Reset | Fallback |
|---------|-------|---------|-------------------|---------------|----------|
| Kie.ai | 3 | 2s/4s/8s | 5 failures | 60s | Degrade quality/model |
| Gemini | 2 | 1s/3s | 3 failures | 30s | Hardcoded defaults |
| PayPal | 3 | 1s/2s/4s | 5 failures | 120s | Queue for retry |
| Resend | 2 | 1s/3s | 5 failures | 60s | Log, skip notification |
| WAHA | 1 | 2s | 3 failures | 30s | Email fallback |
| Apify | 2 | 5s/15s | 3 failures | 300s | Manual URL input |
| Telnyx | 2 | 1s/3s | 3 failures | 60s | Voicemail |
| Ollama | 1 | 2s | 3 failures | 30s | Skip RAG, use raw |

## Error Budget Tracking

```typescript
// Track success/failure rates per service per day
interface ErrorBudget {
  service: string;
  date: string;
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  successRate: number;  // target: 99.5%
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

// Alert when success rate drops below threshold
// PostgreSQL: 99.9%, Kie.ai: 99%, Gemini: 99%, PayPal: 99.5%
```

## Implementation Priority

1. **Kie.ai** — add retry + circuit breaker to `apps/worker/src/services/kie.ts` and `apps/studio/src/lib/kie.ts`
2. **Gemini** — add retry to `apps/worker/src/services/gemini.ts` and `apps/studio/src/lib/gemini.ts`
3. **Winner Studio fallback** — already has avatar-pro → kling-3.0 fallback (verify it works)
4. **TourReel fallback** — add pro → std degradation on Kie errors
5. **Error budget tracking** — extend `api_expenses` table or create `error_budget` table

## Key Files to Modify

| File | What to Add |
|------|------------|
| `apps/worker/src/services/kie.ts` | withRetry() wrapper on all API calls |
| `apps/worker/src/services/gemini.ts` | withRetry() + hardcoded fallback defaults |
| `apps/studio/src/lib/kie.ts` | withRetry() + circuit breaker |
| `apps/studio/src/lib/pipeline.ts` | Fallback chain (already has basic fallback) |
| `apps/worker/src/queue/workers/video-pipeline.worker.ts` | Wrap Kling/Suno calls with retry |

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| 0% success rate during outage | No retry/circuit-breaker/fallback | Add all three patterns to the failing service |
| Circuit stays open permanently | Reset time too long | Reduce `resetTimeMs`, add half-open probe |
| Retry storms overwhelm API | No jitter on backoff | Add random jitter: `+ Math.random() * 1000` |
| Fallback produces lower quality | Expected — degraded service | Log degradation, notify user of lower quality |
| Rate limit (429) with retry | Retry too aggressive | Respect `Retry-After` header, increase backoff |

## References

- `findings.md` — Kie.ai outage root cause analysis (Feb 24, 2026)
- `progress.md` — Week 1 audit findings, 0% success rate
- NotebookLM 3e820274 — Kie.ai API docs, rate limits
- NotebookLM 02c3946b — AI Cost & Performance benchmarks
