/**
 * Data Access Layer — Central export
 *
 * Each domain module exports typed functions that wrap Prisma queries.
 * During migration, these can be swapped to read from Firestore as fallback.
 *
 * Usage:
 *   import { db } from '@/lib/db';
 *   const user = await db.users.getByEmail('john@example.com');
 */

export * as users from './users';
export * as payments from './payments';
export * as services from './services';
export * as marketplace from './marketplace';
export * as leads from './leads';
export * as dashboard from './dashboard';
export * as admin from './admin';
