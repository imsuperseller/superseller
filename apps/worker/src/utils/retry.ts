/**
 * withRetry — exponential backoff wrapper for external API calls.
 * Usage: const result = await withRetry(() => createKlingTask(req), { maxAttempts: 3 });
 *
 * Retries on transient errors (network timeouts, 429, 500-503).
 * Does NOT retry on 4xx client errors (except 429).
 */
import { logger } from "./logger";

interface RetryOptions {
  /** Max number of attempts (default 3). */
  maxAttempts?: number;
  /** Initial delay in ms (default 2000). Doubles each retry. */
  initialDelayMs?: number;
  /** Max delay cap in ms (default 30000). */
  maxDelayMs?: number;
  /** Label for logging (e.g. "createKlingTask"). */
  label?: string;
}

const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504, 524, 525, 526]);

function isTransient(err: any): boolean {
  // Network / timeout errors
  if (err.name === "TimeoutError" || err.name === "AbortError") return true;
  if (err.code === "ECONNRESET" || err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") return true;
  if (err.message?.includes("timeout") || err.message?.includes("ECONNRESET")) return true;
  // HTTP status codes (axios stores in err.response.status, fetch errors in message)
  const status = err.response?.status || err.status;
  if (status && TRANSIENT_STATUS_CODES.has(status)) return true;
  // Kie.ai specific: "rate limit" in message
  if (err.message?.toLowerCase().includes("rate limit")) return true;
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions
): Promise<T> {
  const maxAttempts = opts?.maxAttempts ?? 3;
  const initialDelay = opts?.initialDelayMs ?? 2000;
  const maxDelay = opts?.maxDelayMs ?? 30_000;
  const label = opts?.label ?? "withRetry";

  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (attempt === maxAttempts || !isTransient(err)) {
        break; // Don't retry non-transient or on last attempt
      }
      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
      logger.warn({ msg: `${label} attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms`, error: err.message });
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
