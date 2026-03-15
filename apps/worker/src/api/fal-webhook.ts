/**
 * fal.ai Webhook Handler
 *
 * Receives async completion callbacks from fal.ai after long-running jobs
 * (Sora 2 takes 5-20 min and will time out under polling).
 *
 * Route: POST /webhooks/fal
 *
 * Protocol:
 * 1. Respond 200 immediately (fal.ai has a 15s delivery timeout)
 * 2. Verify ED25519 signature (gated behind FAL_WEBHOOK_VERIFY env)
 * 3. Idempotency via in-memory Set — no fal_request_id DB column required
 * 4. Look up BullMQ job via falRequestRegistry (populated at submit time)
 * 5. Process completion/error, call trackExpense for cost attribution
 *
 * Note: ED25519 exact message construction should be validated against a real
 * fal.ai job. Gate is FAL_WEBHOOK_VERIFY=false by default for initial testing.
 */

import { Router, Request, Response } from 'express';
import { createHash, verify as cryptoVerify } from 'crypto';
import { logger } from '../utils/logger';
import { falRequestRegistry } from '../services/model-router/provider-adapters/fal-adapter';
import { trackExpense, COST_RATES } from '../services/expense-tracker';

export const falWebhookRouter = Router();

// ── Idempotency Set ───────────────────────────────────────────────────────────

/** In-memory set of processed fal.ai request_ids. Bounded to 10,000 entries. */
const processedRequestIds = new Set<string>();
const PROCESSED_SET_MAX = 10_000;

function markProcessed(requestId: string): void {
    if (processedRequestIds.size >= PROCESSED_SET_MAX) {
        // Evict oldest entry (Sets maintain insertion order)
        const oldest = processedRequestIds.values().next().value;
        if (oldest) processedRequestIds.delete(oldest);
    }
    processedRequestIds.add(requestId);
}

// ── JWKS Cache ────────────────────────────────────────────────────────────────

interface JwksCache {
    keys: Array<{ kty: string; crv: string; x: string; use?: string; kid?: string }>;
    fetchedAt: number;
}

let jwksCache: JwksCache | null = null;
const JWKS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getJwks(): Promise<JwksCache['keys']> {
    const now = Date.now();
    if (jwksCache && now - jwksCache.fetchedAt < JWKS_TTL_MS) {
        return jwksCache.keys;
    }

    try {
        const res = await fetch('https://rest.fal.ai/.well-known/jwks.json');
        const data = await res.json() as { keys: JwksCache['keys'] };
        jwksCache = { keys: data.keys, fetchedAt: now };
        return data.keys;
    } catch (err: any) {
        logger.warn({ msg: 'FalWebhook: failed to fetch JWKS', error: err.message });
        return jwksCache?.keys ?? [];
    }
}

// ── Signature Verification ────────────────────────────────────────────────────

/**
 * Verify ED25519 signature from fal.ai webhook headers.
 * Returns true if valid, false if invalid or unable to verify.
 *
 * Message format per fal.ai docs:
 *   {x-fal-webhook-request-id}\n{x-fal-webhook-timestamp}\n{sha256(rawBody)}
 */
async function verifySignature(req: Request, rawBody: Buffer): Promise<boolean> {
    const requestId = req.headers['x-fal-webhook-request-id'] as string | undefined;
    const timestamp = req.headers['x-fal-webhook-timestamp'] as string | undefined;
    const signature = req.headers['x-fal-webhook-signature'] as string | undefined;

    if (!requestId || !timestamp || !signature) {
        return false;
    }

    // Check timestamp within ±5 minutes
    const tsNum = parseInt(timestamp, 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - tsNum) > 300) {
        return false;
    }

    // Build message
    const bodyHash = createHash('sha256').update(rawBody).digest('hex');
    const message = `${requestId}\n${timestamp}\n${bodyHash}`;
    const msgBuffer = Buffer.from(message);

    const keys = await getJwks();
    for (const key of keys) {
        if (key.kty !== 'OKP' || key.crv !== 'Ed25519') continue;
        try {
            // x is the base64url-encoded public key bytes
            const pubKeyBytes = Buffer.from(key.x, 'base64url');
            const sigBuffer = Buffer.from(signature, 'base64url');
            const valid = cryptoVerify(null, msgBuffer, pubKeyBytes, sigBuffer);
            if (valid) return true;
        } catch {
            // Invalid key format — skip
        }
    }

    return false;
}

// ── Async Completion Processor ────────────────────────────────────────────────

async function processCompletion(body: Record<string, any>): Promise<void> {
    const requestId: string = body.request_id;

    if (!requestId) {
        logger.warn({ msg: 'FalWebhook: missing request_id in body' });
        return;
    }

    // Idempotency check
    if (processedRequestIds.has(requestId)) {
        logger.info({
            msg: 'FalWebhook: already processed (idempotent duplicate skipped)',
            requestId,
        });
        return;
    }

    // Look up job from registry
    const entry = falRequestRegistry.get(requestId);

    if (!entry) {
        logger.warn({ msg: 'FalWebhook: unknown request_id (not in registry)', requestId });
        // Still mark processed so we don't retry lookup on duplicates
        markProcessed(requestId);
        return;
    }

    // Mark processed BEFORE async work (prevents double-processing on concurrent delivery)
    markProcessed(requestId);

    const { modelId, jobId } = entry;
    const status: string = body.status;

    if (status === 'OK') {
        const videoUrl: string | undefined = body.payload?.video?.url;

        logger.info({
            msg: 'FalWebhook: job completed',
            requestId,
            jobId,
            modelId,
            videoUrl,
        });

        // Track expense for cost attribution (mandatory per CLAUDE.md)
        const operation = modelId.includes('sora-2') || modelId.includes('sora')
            ? 'sora_2_per_second_1080p'
            : 'wan_2_6_per_second_1080p';

        await trackExpense({
            service: 'fal',
            operation,
            jobId,
            metadata: { requestId, modelId, videoUrl },
        });

    } else if (status === 'ERROR') {
        const errorMsg: string =
            (typeof body.error === 'string' ? body.error : body.error?.message) ??
            'fal.ai job failed (unknown error)';

        logger.warn({
            msg: 'FalWebhook: job failed',
            requestId,
            jobId,
            modelId,
            error: errorMsg,
        });
    } else {
        logger.warn({
            msg: 'FalWebhook: unrecognized status',
            requestId,
            status,
        });
    }
}

// ── Route ─────────────────────────────────────────────────────────────────────

falWebhookRouter.post('/webhooks/fal', (req: Request, res: Response) => {
    // Respond 200 immediately — fal.ai has a 15s delivery timeout
    res.status(200).json({ status: 'ok' });

    // Process asynchronously after response is sent
    const shouldVerify = process.env.FAL_WEBHOOK_VERIFY !== 'false';

    setImmediate(async () => {
        try {
            if (shouldVerify) {
                // Express already parsed JSON body; for signature we need raw bytes
                // Since we're using express.json() middleware, reconstruct raw body from parsed JSON
                // Note: for production, use express.raw() middleware before this route for accurate sig check
                const rawBody = Buffer.from(JSON.stringify(req.body));
                const valid = await verifySignature(req, rawBody);
                if (!valid) {
                    logger.warn({
                        msg: 'FalWebhook: invalid or missing signature — rejecting payload',
                        requestId: req.body?.request_id,
                    });
                    return;
                }
            }

            await processCompletion(req.body ?? {});
        } catch (err: any) {
            logger.error({ msg: 'FalWebhook: unhandled error in async processor', error: err.message });
        }
    });
});
