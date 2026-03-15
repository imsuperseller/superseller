/**
 * Kie.ai Provider Adapter
 *
 * Wraps existing kie.ts client functions — does NOT make raw fetch calls
 * to Kie.ai. Reuses the established auth + retry logic from kie.ts.
 */

import { createKlingTask, getTaskStatus, createVeoTask, getVeoTaskStatus } from '../../kie';
import { logger } from '../../../utils/logger';
import type { ProviderAdapter, AdapterJobResult, AdapterPollResult } from './types';
import type { ShotRequest } from '../shot-types';

/** Shot types that use Kling video generation */
const VIDEO_SHOT_TYPES = new Set(['dialogue', 'narrative', 'environment', 'product', 'social']);

export class KieAdapter implements ProviderAdapter {
    /**
     * Submit a job to Kie.ai.
     * - Video shot types: delegates to createKlingTask
     * - Music shot type: calls Kie.ai Suno endpoint
     */
    async submitJob(req: ShotRequest, modelId: string, _kieParam?: string): Promise<AdapterJobResult> {
        if (req.shotType === 'music') {
            return this._submitMusicJob(req, modelId);
        }
        return this._submitVideoJob(req, modelId);
    }

    private async _submitVideoJob(req: ShotRequest, modelId: string): Promise<AdapterJobResult> {
        // Route Veo 3.1 shots to createVeoTask; all other shots use createKlingTask
        if (modelId.includes('veo')) {
            return this._submitVeoJob(req, modelId);
        }

        // createKlingTask returns a task_id string directly
        const taskId = await createKlingTask({
            prompt: req.prompt,
            image_url: req.imageUrl ?? '',
            duration: req.durationSeconds ?? 5,
            mode: 'pro',
        });

        logger.info({
            msg: 'KieAdapter: video job submitted',
            taskId,
            shotType: req.shotType,
        });

        return {
            externalJobId: taskId,
            provider: 'kie',
        };
    }

    private async _submitVeoJob(req: ShotRequest, _modelId: string): Promise<AdapterJobResult> {
        const taskId = await createVeoTask(req.prompt, {
            image_url: req.imageUrl,
            duration: req.durationSeconds ?? 8,
            mode: 'fast',
            aspect_ratio: '16:9',
            sound: false,
        });

        logger.info({
            msg: 'KieAdapter: veo job submitted',
            taskId,
            shotType: req.shotType,
        });

        // 'veo::' prefix encodes provider variant for pollStatus routing
        return {
            externalJobId: `veo::${taskId}`,
            provider: 'kie',
        };
    }

    private async _submitMusicJob(req: ShotRequest, modelId: string): Promise<AdapterJobResult> {
        // Kie.ai Suno endpoint — POST /api/v1/generate with model=suno-v5
        const { config } = await import('../../../config');
        const kieBase = config.kie.baseUrl;
        const kieKey = config.kie.apiKey;

        const response = await fetch(`${kieBase}/v1/generate`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${kieKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelId || 'suno-v5',
                prompt: req.prompt,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`KieAdapter music job failed: ${response.status} ${err}`);
        }

        const data = await response.json() as { task_id?: string; data?: { task_id: string } };
        const taskId = data.task_id ?? data.data?.task_id ?? '';

        logger.info({ msg: 'KieAdapter: music job submitted', taskId });

        return {
            externalJobId: taskId,
            provider: 'kie',
        };
    }

    async pollStatus(jobId: string): Promise<AdapterPollResult> {
        // Route Veo jobs by 'veo::' prefix; everything else is Kling
        if (jobId.startsWith('veo::')) {
            const veoTaskId = jobId.slice(5);
            const response = await getVeoTaskStatus(veoTaskId);

            let resultUrl: string | undefined;
            if (response.status === 'completed' && response.result) {
                resultUrl = response.result.video_url
                    ?? (response.result.resultUrls?.[0])
                    ?? response.result.audio_url
                    ?? response.result.image_url;
            }

            return {
                status: response.status,
                resultUrl,
                error: response.error,
            };
        }

        const response = await getTaskStatus(jobId, 'kling');

        let resultUrl: string | undefined;
        if (response.status === 'completed' && response.result) {
            resultUrl = response.result.video_url
                ?? (response.result.resultUrls?.[0])
                ?? response.result.audio_url
                ?? response.result.image_url;
        }

        return {
            status: response.status,
            resultUrl,
            error: response.error,
        };
    }

    async cancelJob(jobId: string): Promise<void> {
        // kie.ts does not expose a cancel function — log and no-op.
        // Cancellation via Kie.ai API is not currently supported.
        logger.warn({ msg: 'KieAdapter.cancelJob: cancel not supported by kie.ts', jobId });
    }

    /**
     * Estimate cost.
     * - Video: costPerUnit (per 5s) * (durationSeconds / 5)
     * - Music: flat costPerUnit per call
     */
    estimateCost(req: ShotRequest, costPerUnit: number): number {
        if (req.shotType === 'music') {
            return costPerUnit;
        }
        const duration = req.durationSeconds ?? 5;
        return costPerUnit * (duration / 5);
    }
}
