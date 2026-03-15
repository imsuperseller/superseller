/**
 * Model Router — Public API
 *
 * Single import point for all Phase 4+ consumers.
 *
 * Usage:
 *   import { routeShot, ShotType, BudgetTier, ShotRequest } from '../model-router';
 */

// ── Primary public API ─────────────────────────────────────────────────────

export { routeShot } from './router';
export type { RouterResult } from './router';

// ── Type re-exports for consumers ─────────────────────────────────────────

export type { ShotType, BudgetTier, ShotRequest } from './shot-types';
export { SHOT_DEFAULT_MODELS, BUDGET_CEILINGS, SHOT_TYPE_LABELS } from './shot-types';

// ── Adapter re-exports (consumers may need to type-check adapter instances) ─

export type { ProviderAdapter, AdapterJobResult, AdapterPollResult } from './provider-adapters/types';
export { KieAdapter } from './provider-adapters/kie-adapter';
export { FalAdapter } from './provider-adapters/fal-adapter';
