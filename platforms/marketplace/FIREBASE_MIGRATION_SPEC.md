# FB Marketplace Bot: Firestore → Postgres Migration

**Goal**: Eliminate the last Firebase/Firestore dependency from the entire SuperSeller codebase.

**Scope**: Replace `platforms/marketplace/saas-engine/lib/firebase.js` (4 functions, 3 Firestore collections) with Postgres via the existing `pg` dependency already in package.json.

**After this**: Remove `firebase-admin` from `saas-engine/package.json` and `platforms/marketplace/package.json`. Delete `firebase-admin.ts` from web app. Remove Firebase Storage CSP. Zero Firebase references in runtime code.

---

## Firestore Collections → Postgres Tables

### 1. `posting_schedule` → `marketplace_schedules`
```sql
CREATE TABLE marketplace_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'queued',  -- queued | running | done | failed
  scheduled_for TIMESTAMPTZ NOT NULL,
  title         TEXT,
  price         NUMERIC(10,2),
  description   TEXT,
  image_url     TEXT,
  location      TEXT DEFAULT 'Dallas, TX',
  run_id        UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_mkt_sched_status ON marketplace_schedules(status, scheduled_for);
```

### 2. `clients` + `secrets` → `marketplace_clients`
```sql
CREATE TABLE marketplace_clients (
  id            TEXT PRIMARY KEY,  -- client slug (e.g. 'uad', 'missparty')
  category      TEXT DEFAULT 'Property for Rent',
  config        JSONB DEFAULT '{}',
  -- secrets stored encrypted or in JSONB (gologin token, profile ID, FB creds)
  secrets       JSONB DEFAULT '{}',
  last_run      JSONB,            -- {runId, status, timestamp}
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `post_runs` → `marketplace_runs`
```sql
CREATE TABLE marketplace_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     TEXT NOT NULL REFERENCES marketplace_clients(id),
  schedule_id   UUID REFERENCES marketplace_schedules(id),
  status        TEXT NOT NULL,     -- success | error
  marketplace_url TEXT,
  error         JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_mkt_runs_client ON marketplace_runs(client_id, created_at DESC);
```

---

## Function Mapping

| Firestore Function | Postgres Replacement |
|---|---|
| `getPendingSchedule()` | `SELECT * FROM marketplace_schedules WHERE status = 'queued' AND scheduled_for <= NOW() ORDER BY scheduled_for LIMIT 5` |
| `getClientData(clientId)` | `SELECT *, secrets FROM marketplace_clients WHERE id = $1` |
| `updateScheduleStatus(id, status, runId)` | `UPDATE marketplace_schedules SET status = $2, run_id = $3, updated_at = NOW() WHERE id = $1` |
| `logPostRun(clientId, result)` | `INSERT INTO marketplace_runs (...) RETURNING id` + `UPDATE marketplace_clients SET last_run = $2, updated_at = NOW() WHERE id = $1` |

---

## Implementation Steps

1. **Create migration** `platforms/marketplace/migrations/001_firestore_to_postgres.sql` — tables above
2. **Replace `lib/firebase.js`** with `lib/db.js` — same 4 exported functions, Postgres queries instead of Firestore
3. **Update `index.js`** — change `require("./lib/firebase")` → `require("./lib/db")`
4. **Migrate data** — one-time script to read Firestore collections and INSERT into Postgres
5. **Update `seed-configs.ts`** — seed into `marketplace_clients` table instead of Firestore
6. **Remove deps** — `firebase-admin` from `saas-engine/package.json` and `platforms/marketplace/package.json`
7. **Remove env vars** — `FIREBASE_SERVICE_ACCOUNT_PATH`, `FIREBASE_DATABASE_URL` from `.env`
8. **Remove web firebase-admin** — delete `apps/web/superseller-site/src/lib/firebase-admin.ts`, update onboarding route to use R2
9. **Remove CSP** — `firebasestorage.googleapis.com` from `vercel.json`
10. **Remove `firebase-admin`** from `apps/web/superseller-site/package.json`
11. **Final grep** — `grep -ri firebase` across entire repo should return only doc references

---

## Risk

- **Low**: FB Bot is simple CRUD (4 functions). The `pg` package is already a dependency.
- **Data migration**: Small dataset — likely <100 schedule items, <5 clients, <500 runs. Can be done manually or with a quick script.
- **Secrets**: Currently stored in Firestore `secrets/{clientId}`. Moving to Postgres JSONB `secrets` column. Equivalent security since both are on the same VPS. For production hardening, encrypt the JSONB column later.

---

## Acceptance Criteria

- [ ] `grep -ri firebase` returns zero results in runtime code (only docs/comments)
- [ ] `firebase-admin` removed from all `package.json` files
- [ ] `FIREBASE_*` env vars removed from all `.env` files
- [ ] FB Bot posts successfully using Postgres (test with UAD/MissParty)
- [ ] No Firebase CSP entries in `vercel.json`
