/**
 * Provider Adapter Interface
 *
 * Unified contract for all AI video/media providers (Kie.ai, fal.ai, etc.).
 * The router calls these methods without knowing which provider is used.
 */

import type { ShotRequest } from '../shot-types';

/** Result of submitting a job to a provider */
export interface AdapterJobResult {
    /** Provider-specific job/request ID */
    externalJobId: string;
    /** Which provider handled the job */
    provider: 'kie' | 'fal';
}

/** Normalized status from polling a provider */
export interface AdapterPollResult {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    /** URL to the generated media (set when status = 'completed') */
    resultUrl?: string;
    /** Error message (set when status = 'failed') */
    error?: string;
}

/**
 * Unified interface all provider adapters must implement.
 * Implementations must never throw on auth errors — they should return
 * a failed AdapterPollResult or propagate only to let the router handle.
 */
export interface ProviderAdapter {
    /**
     * Submit a generation job to the provider.
     * @param req - Normalized shot request
     * @param modelId - Provider-specific model identifier
     * @param kieParam - Optional Kie.ai model param (for Kie adapter)
     */
    submitJob(req: ShotRequest, modelId: string, kieParam?: string): Promise<AdapterJobResult>;

    /**
     * Poll the status of a previously submitted job.
     * @param jobId - externalJobId from submitJob (may be composite, e.g. "modelId::requestId")
     */
    pollStatus(jobId: string): Promise<AdapterPollResult>;

    /**
     * Cancel a running job.
     * @param jobId - externalJobId from submitJob
     */
    cancelJob(jobId: string): Promise<void>;

    /**
     * Estimate the cost of a shot request given the model's cost per unit.
     * @param req - Shot request (uses durationSeconds for video)
     * @param costPerUnit - USD cost per 5-second unit (or per call for music/image)
     */
    estimateCost(req: ShotRequest, costPerUnit: number): number;
}
