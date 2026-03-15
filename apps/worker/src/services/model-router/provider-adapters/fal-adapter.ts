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
     * Submit a job to fal.ai queue.
     * Returns externalJobId encoded as "{modelId}::{requestId}".
     */
    async submitJob(req: ShotRequest, modelId: string): Promise<AdapterJobResult> {
        const url = `${FAL_QUEUE_BASE}/${modelId}`;

        const body = {
            input: {
                prompt: req.prompt,
                image_url: req.imageUrl,
                duration: req.durationSeconds ?? 5,
            },
        };

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
