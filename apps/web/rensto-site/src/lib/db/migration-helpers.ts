/**
 * Migration Helpers — Dual-write & fallback utilities
 *
 * Used during Firestore → Postgres migration (Phases 1-6).
 * Remove this file entirely in Phase 7 (cleanup).
 *
 * Pattern:
 *   WRITES: Postgres first (primary), then Firestore (backup, non-blocking)
 *   READS:  Postgres first (primary), Firestore fallback if Postgres returns null
 */

/**
 * Write to Firestore as a non-blocking backup.
 * Failures are logged but never break the primary flow.
 */
export async function firestoreBackupWrite(
  label: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.warn(`[Migration] Firestore backup write failed (${label}):`, err);
  }
}

/**
 * Read from Postgres first; if null, fall back to Firestore.
 * Logs fallback usage for monitoring migration completeness.
 */
export async function withFirestoreFallback<T>(
  label: string,
  postgresRead: () => Promise<T | null>,
  firestoreRead: () => Promise<T | null>
): Promise<T | null> {
  const result = await postgresRead();
  if (result !== null) return result;

  console.info(`[Migration] Postgres miss for "${label}", falling back to Firestore`);
  return firestoreRead();
}
