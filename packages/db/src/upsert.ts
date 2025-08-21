import { Pool, PoolClient } from 'pg';
import { createId } from '@paralleldrive/cuid2';
import crypto from 'crypto';

export interface Identity {
  provider: string;
  external_id: string;
  source_version?: string;
}

export interface UpsertResult {
  rgid: string;
  created: boolean;
  updated: boolean;
}

/**
 * Canonical "upsert by identity" helper used across all adapters
 * Ensures global uniqueness and prevents duplicates
 */
export async function upsertByIdentity(
  db: Pool | PoolClient,
  kind: string,
  slug: string,
  identity?: Identity
): Promise<UpsertResult> {
  const client = 'query' in db ? db : await db.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');

    // Upsert entity by (kind, slug)
    const entityResult = await client.query(`
      INSERT INTO entities (rgid, kind, slug)
      VALUES ($1, $2, $3)
      ON CONFLICT (kind, slug) 
      DO UPDATE SET 
        updated_at = now(),
        rgid = EXCLUDED.rgid
      RETURNING rgid, 
        (xmax = 0) as created,
        (xmax != 0) as updated
    `, [createId(), kind, slug]);

    const { rgid, created, updated } = entityResult.rows[0];

    // If external identity provided, upsert it
    if (identity) {
      await client.query(`
        INSERT INTO external_identities (provider, external_id, rgid, source_version)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (provider, external_id)
        DO UPDATE SET 
          rgid = EXCLUDED.rgid, 
          source_version = EXCLUDED.source_version, 
          last_seen_at = now()
      `, [identity.provider, identity.external_id, rgid, identity.source_version ?? null]);
    }

    await client.query('COMMIT');

    return {
      rgid,
      created: Boolean(created),
      updated: Boolean(updated)
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    if ('release' in client) {
      client.release();
    }
  }
}

/**
 * Check if idempotency key exists to prevent duplicate processing
 */
export async function checkIdempotency(
  db: Pool | PoolClient,
  scope: string,
  key: string,
  payloadHash: string
): Promise<boolean> {
  const client = 'query' in db ? db : await db.connect();
  
  try {
    const result = await client.query(`
      INSERT INTO idempotency_keys (scope, key, payload_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (scope, key) 
      DO UPDATE SET seen_at = now()
      RETURNING payload_hash
    `, [scope, key, payloadHash]);

    // If payload hash matches, this is a duplicate
    return result.rows[0].payload_hash === payloadHash;
  } finally {
    if ('release' in client) {
      client.release();
    }
  }
}

/**
 * Generate deterministic idempotency key
 */
export function generateIdempotencyKey(
  scope: string,
  rgid: string,
  payload: any
): string {
  const payloadHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return `${scope}:${rgid}:${payloadHash}`;
}

/**
 * Record usage event with deduplication
 */
export async function recordUsageEvent(
  db: Pool | PoolClient,
  rgid: string,
  eventType: string,
  provider: string,
  externalId?: string,
  cost?: number,
  metadata?: any
): Promise<void> {
  const client = 'query' in db ? db : await db.connect();
  
  const dedupeKey = generateIdempotencyKey(
    'usage',
    rgid,
    { eventType, provider, externalId, cost, metadata }
  );

  try {
    await client.query(`
      INSERT INTO usage_events (rgid, event_type, provider, external_id, cost, metadata, dedupe_key)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (dedupe_key) DO NOTHING
    `, [rgid, eventType, provider, externalId, cost, metadata, dedupeKey]);
  } finally {
    if ('release' in client) {
      client.release();
    }
  }
}
