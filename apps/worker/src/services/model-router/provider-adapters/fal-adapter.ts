/**
 * fal.ai Provider Adapter
 *
 * Uses fal.ai's queue REST API via native fetch — no SDK dependency.
 * Auth: Bearer token from FAL_API_KEY env var.
 *
 * fal.ai queue API reference:
 *   POST   https://queue.fal.run/{modelId}                              → submit
 *   GET    https://queue.fal.run/{modelId}/requests/{requestId}/status  → poll
 *   POST   https://queue.fal.run/{modelId}/requests/{requestId}/cancel  → cancel
 *
 * jobId encoding: "{modelId}::{requestId}" — both parts needed for poll/cancel.
 */

import { logger } from '../../../utils/logger';
import type { ProviderAdapter, AdapterJobResult, AdapterPollResult } from './types';
import type { ShotRequest } from '../shot-types';

const FAL_QUEUE_BASE = 'https://queue.fal.run';

/** fal.ai status strings → normalized AdapterPollResult status */
const FAL_STATUS_MAP: Record<string, AdapterPollResult['status']> = {
    IN_QUEUE: 'pending',
    IN_PROGRESS: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

/** Sora 2 valid duration enum values (seconds, numeric) */
const SORA_DURATION_ENUM = [4, 8, 12, 16, 20] as const;
/** Wan 2.6 valid duration enum values (seconds, string) */
const WAN_DURATION_ENUM = [5, 10, 15] as const;

/** Snap a numeric value to the nearest value in an enum array */
function snapToNearest(value: number, enumValues: readonly number[]): number {
    return enumValues.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
}

/**
 * Module-level registry mapping fal.ai requestId → BullMQ job info.
 * Populated by submitJob; consumed by the fal-webhook handler for job lookup.
 * Bounded to 10,000 entries — oldest entries cleared when limit is reached.
 */
export const falRequestRegistry = new Map<string, { modelId: string; jobId: string }>();

const FAL_REQUEST_REGISTRY_MAX = 10_000;

export class FalAdapter implements ProviderAdapter {
    private readonly apiKey: string;

    constructor() {
        const key = process.env.FAL_API_KEY;
        if (!key) {
            logger.warn({ msg: 'FalAdapter: FAL_API_KEY not set — requests will fail at runtime' });
        }
        this.apiKey = key ?? '';
    }

    private get authHeaders(): Record<string, string> {
        return {
            Authorization: `Key ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Build model-specific request body for fal.ai queue submission.
     * - Sora 2: numeric duration enum, resolution, aspect_ratio, delete_video: false
     * - Wan 2.6: string duration enum, resolution
     * - Default: numeric duration (backward compat)
     */
    private _buildRequestBody(req: ShotRequest, modelId: string): Record<string, any> {
        const webhookUrl = process.env.WORKER_PUBLIC_URL
            ? `${process.env.WORKER_PUBLIC_URL}/api/webhooks/fal`
            : undefined;

        const baseInput = {
            prompt: req.prompt,
            image_url: req.imageUrl,
        };

        let modelInput: Record<string, any>;

        if (modelId.includes('sora-2') || modelId.includes('sora')) {
            // Sora 2: numeric duration enum, 1080p, no video deletion
            const rawDuration = req.durationSeconds ?? 5;
            const duration = snapToNearest(rawDuration, SORA_DURATION_ENUM);
            modelInput = {
                ...baseInput,
                duration,
                resolution: '1080p',
                aspect_ratio: 'auto',
                delete_video: false,
            };
        } else if (modelId.includes('wan')) {
            // Wan 2.6: string duration enum, 1080p
            const rawDuration = req.durationSeconds ?? 5;
            const durationNum = snapToNearest(rawDuration, WAN_DURATION_ENUM);
            modelInput = {
                ...baseInput,
                duration: String(durationNum),
                resolution: '1080p',
            };
        } else {
            // Default fallback: generic body (backward compat)
            modelInput = {
                ...baseInput,
                duration: req.durationSeconds ?? 5,
            };
        }

        const body: Record<string, any> = { input: modelInput };
        if (webhookUrl) {
            body.webhook_url = webhookUrl;
        }
        return body;
    }

    /**
     * Submit a job to fal.ai queue.
     * Returns externalJobId encoded as "{modelId}::{requestId}".
     */
    async submitJob(req: ShotRequest, modelId: string): Promise<AdapterJobResult> {
        const url = `${FAL_QUEUE_BASE}/${modelId}`;

        const body = this._buildRequestBody(req, modelId);

        const response = await fetch(url, {
            method: 'POST',
            headers: this.authHeaders,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`FalAdapter submitJob failed: ${response.status} ${errText}`);
        }

        const data = await response.json() as { request_id: string };

        logger.info({
            msg: 'FalAdapter: job submitted',
            requestId: data.request_id,
            modelId,
            shotType: req.shotType,
            webhookEnabled: !!process.env.WORKER_PUBLIC_URL,
        });

        // Register requestId → job info for webhook handler lookup
        if (falRequestRegistry.size >= FAL_REQUEST_REGISTRY_MAX) {
            // Evict oldest entry when at capacity
            const oldestKey = falRequestRegistry.keys().next().value;
            if (oldestKey) falRequestRegistry.delete(oldestKey);
        }
        falRequestRegistry.set(data.request_id, {
            modelId,
            jobId: req.jobId ?? '',
        });

        // Encode modelId into jobId so pollStatus/cancelJob know the endpoint
        return {
            externalJobId: `${modelId}::${data.request_id}`,
            provider: 'fal',
        };
    }

    /**
     * Poll fal.ai for job status.
     * @param jobId - encoded as "{modelId}::{requestId}"
     */
    async pollStatus(jobId: string): Promise<AdapterPollResult> {
        const [modelId, requestId] = this._parseJobId(jobId);
        const url = `${FAL_QUEUE_BASE}/${modelId}/requests/${requestId}/status`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.authHeaders,
        });

        if (!response.ok) {
            const errText = await response.text();
            return { status: 'failed', error: `Poll failed: ${response.status} ${errText}` };
        }

        const data = await response.json() as {
            status: string;
            output?: {
                video?: { url: string };
                video_url?: string;
            };
            error?: { message: string } | string;
        };

        const normalizedStatus = FAL_STATUS_MAP[data.status] ?? 'pending';

        let resultUrl: string | undefined;
        if (normalizedStatus === 'completed' && data.output) {
            resultUrl = data.output.video?.url ?? data.output.video_url;
        }

        let errorMessage: string | undefined;
        if (normalizedStatus === 'failed' && data.error) {
            errorMessage = typeof data.error === 'string'
                ? data.error
                : data.error.message;
        }

        return {
            status: normalizedStatus,
            resultUrl,
            error: errorMessage,
        };
    }

    /**
     * Cancel a fal.ai job.
     * @param jobId - encoded as "{modelId}::{requestId}"
     */
    async cancelJob(jobId: string): Promise<void> {
        const [modelId, requestId] = this._parseJobId(jobId);
        const url = `${FAL_QUEUE_BASE}/${modelId}/requests/${requestId}/cancel`;

        await fetch(url, {
            method: 'POST',
            headers: this.authHeaders,
        });
    }

    /**
     * Estimate cost.
     * Video: costPerUnit (per 5s) * (durationSeconds / 5)
     */
    estimateCost(req: ShotRequest, costPerUnit: number): number {
        const duration = req.durationSeconds ?? 5;
        return costPerUnit * (duration / 5);
    }

    private _parseJobId(jobId: string): [modelId: string, requestId: string] {
        const sep = jobId.lastIndexOf('::');
        if (sep === -1) {
            // Fallback: treat entire string as requestId with unknown model
            return ['unknown', jobId];
        }
        return [jobId.slice(0, sep), jobId.slice(sep + 2)];
    }
}
