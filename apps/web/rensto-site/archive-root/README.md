# Archive: Legacy Root Files

**Purpose**: One-off scripts and configs that lived at rensto-site root. Moved here Feb 2026.

| File | Former use |
|------|------------|
| webflow.json | Webflow component config (Webflow retired) |
| list_all_clients.js | List Firestore clients |
| get_logos_status.js | Logo status check |
| explore_firestore.ts | Firestore exploration |
| master-bot-patched.js | Bot script (patched) |
| mock_event.json | Mock webhook/event payload |
| verify_db.js | DB verification (dev) |
| verify_prod_db.js | DB verification (prod) |
| update_logos_firestore.js | Update logos in Firestore |
| test-provisioning.ts | Provisioning test |
| get_samples.ts | Sample data fetch |
| seed-approvals.cjs | Seed approvals (Firestore) |
| seed-usage.cjs | Seed usage (Firestore) |
| seed_logos.js | Seed logos to Firestore |
| list_clients.js | List clients (variant of list_all_clients) |
| DESIGN_OPTIMIZATION_PLAN.md | Design optimization (legacy) |
| FIRESTORE_REDESIGN_SUMMARY.md | Firestore redesign (deprecated) |
| FIRESTORE_COLLECTION_STRUCTURE.md | Firestore schema (deprecated) |
| ENVIRONMENT_SETUP.md | Env setup (may still be relevant) |
| PRODUCTION_SETUP.md | Prod setup (may still be relevant) |

**Live code**: `src/`, `src/app/api/`, `src/app/admin/`. Do not run these without checking they still work with current Firestore/Postgres setup.
