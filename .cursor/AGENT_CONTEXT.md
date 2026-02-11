# Agent context – business and priorities

**Purpose:** So any agent (or human) knows who we serve, what success is, what we're considering, and what to focus on. Update this when things change.

---

## 1. Who the main customers are

- **Base:** Israeli community (Israel + diaspora).
- **Reference:** The WhatsApp group export **`_chat 2.txt`** in the repo root is a sample of this audience (names, tone, mix of Hebrew/English). Use it only as context for "who we're building for"; do not commit or copy personal data from it elsewhere.
- **Channel:** WhatsApp group is one of the main touchpoints for this base.

---

## 2. What "success" looks like

- **Target:** **$20,000 profit per month by 2027.**
- **As of:** Feb 8, 2026 — about a year to target.
- Use this to prioritize work that drives revenue, margin, or clear path to that number.

---

## 3. PostgreSQL + Redis (primary)

- **Target:** **PostgreSQL** and **Redis** are the primary database stack.
- **Status:** Migration from Firestore in progress. Code may still use Firestore during transition.
  - PostgreSQL: app/customer data (e.g. user `admin`, database `app_db`).
  - Redis: cache, sessions, job queues.
- **Credentials:** Never put real DB/Redis passwords in the repo. Use:
  - **`.env`** (gitignored) for local/dev, or
  - **Vault** (or Vercel/env) for production.
- **Placeholders:** See **`.env.example`** for `POSTGRES_*` and `REDIS_*`; fill real values only in `.env` or in your host's secret store.
- **When implementing:** Prefer reversible steps (feature flags, dual-write). Document migration steps in `docs/` or `docs/migrations/`.

---

## 4. What matters most right now

- **Cleanup, order, and updateness** — so the repo and docs are consistent and up to date.
- **Knowing "all is good to progress smartly"** — no conflicting docs, no broken references, clear architecture and priorities (like this file and CLAUDE.md).
- **Then:** Progress toward the $20k/month goal (product, automation, sales, retention) without tripping over tech or doc debt.

---

## 5. Where to look next

- **Architecture and stack:** CLAUDE.md, ARCHITECTURE.md (folder map).
- **Cleanup and file layout:** CODEBASE_AUDIT.md.
- **Rules for agents:** .cursorrules, .cursor/rules.md.
