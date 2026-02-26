# Firestore → PostgreSQL Migration Plan

**Status**: ✅ COMPLETE (Feb 2026)
**Completed**: February 2026
**Scope**: ~55 files migrated, dual-write strategy used

> **This document is kept for historical reference only.** The migration is fully complete. PostgreSQL is the primary database. Firestore fallback reads remain in ~17 routes as a safety net (can be removed after 1-2 weeks of clean production).

---

## What Was Done

### Strategy Used: Dual-Write (Option A)

1. Extended Prisma schema with all business entities (25+ models)
2. Created Data Access Layer (DAL) with `firestoreBackupWrite` and `withFirestoreFallback`
3. Migrated all ~55 API routes in 5 phases (one domain at a time)
4. Ran historical data migration script against production Postgres
5. Stripped all `firestoreBackupWrite` calls (Feb 2026)
6. Deleted migration helpers, verification scripts, and temp endpoints

### Migration Phases (Completed)

| Phase | Domain | Status |
|-------|--------|--------|
| 1 | Foundation: Prisma schema, lib/db.ts, User model | ✅ Complete |
| 2 | Auth, magic-link, templates, payments, purchases | ✅ Complete |
| 3 | Leads, proposals, support, content, fulfillment | ✅ Complete |
| 4 | Admin routes, dashboard, analytics | ✅ Complete |
| 5 | Subscriptions, billing, usage, remaining routes | ✅ Complete |
| Cleanup | Strip firestoreBackupWrite, delete helpers, update docs | ✅ Complete |

### Current State

- **Primary DB**: PostgreSQL on RackNerd (172.245.56.50)
- **ORM**: Prisma v5
- **Schema**: `apps/web/superseller-site/prisma/schema.prisma` (25+ models)
- **Firestore**: Legacy fallback reads only (~17 routes) — remove after verification period

---

## References

- Prisma schema: `apps/web/superseller-site/prisma/schema.prisma`
- Prisma README: `apps/web/superseller-site/prisma/README.md`
- CLAUDE.md: Data Storage Strategy section
