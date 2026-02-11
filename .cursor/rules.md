# Cursor Rensto Rules (Authoritative)

## 🚨 ARCHITECTURE - READ FIRST (MANDATORY)

### **Domain Architecture** (NEVER DEVIATE):
```
rensto.com          → Vercel (Next.js - main site, marketplace, all public pages) — apps/web/rensto-site/
www.rensto.com      → Vercel (same as rensto.com)
admin.rensto.com    → Vercel (admin dashboard — integrated in rensto-site/src/app/admin)
api.rensto.com      → Vercel (API endpoints — same app, rensto.com/api/*)
portal.rensto.com   → Vercel (customer portals - planned)
```
**Webflow**: Retired. All pages served by Next.js on Vercel.

### **Critical Architecture Rules**:
- ✅ **rensto.com is on Vercel** — main Next.js app is `apps/web/rensto-site/`
- ✅ **ALWAYS** read brain.md first (Mission Control), then CLAUDE.md before architectural decisions
- ✅ **ALWAYS** deploy API routes to `/apps/web/rensto-site/src/app/api/`

### **Single Source of Truth**:
- Before ANY major change, read: brain.md (Mission Control), then `/Users/shaifriedman/New Rensto/rensto/CLAUDE.md`
- Contains: Complete architecture, active systems, service offerings, tech stack
- Last Updated: February 2026

---

## Core Principles
1) **Before writing code**: SEARCH repo for an existing function/module that fits; REUSE > EXTEND > REFACTOR; never duplicate.
2) **Never create new top-level folders**. Allowed top-level: .github, .vscode, apps, packages, services, infra, scripts, docs, tests, assets, examples, experiments, archived.
3) **Data models / schema**: Repo has no root `packages/schema` yet – put shared types in `apps/web/rensto-site/src/types/` or app-local; include `rgid` where applicable (see CLAUDE.md).
4) **External integrations**: No root `services/adapters` yet – add integration logic in `apps/web/rensto-site/src/lib/` or `infra/` as appropriate.
5) **Idempotency is MANDATORY**: outbound POSTs must set `Idempotency-Key`; inbound webhooks must be deduped by `(source, event_id)`.
6) **Migrations**: No root `packages/db` – put SQL in `infra/migrations/`; document in CODEBASE_AUDIT or docs.
7) **No spaces in file/dir names**. Use kebab-case. Move "Examples/ Rensto System" to examples/rensto-system.
9) **If a function you're writing computes or fetches a record**, add a deterministic `dedupe_key` and call `upsert_by_identity(...)`.
10) **On pull requests**: fail CI if any file violates rules above or if duplicate keys are detected by the duplicate scanner.

## B.L.A.S.T. Methodology
11) **Always use B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)** for any infrastructure changes or optimizations. See .cursorrules.
12) **Before implementing**: Check CLAUDE.md and existing docs for similar implementations.
13) **After implementation**: Update CLAUDE.md and optimization plans as needed.

## Rensto Brand Guidelines
15) **Use Rensto brand colors**: #fe3d51 (primary), #bf5700 (secondary), #1eaef7 (accent), #5ffbfd (highlight), #110d28 (dark).
16) **Include Rensto logo** in all design outputs and avoid using the weird K letter.
17) **Use GSAP animations** and Shadcn components consistently throughout the codebase.
18) **Follow modern JavaScript/TypeScript best practices** with async/await for asynchronous code.

## Security & Performance
19) **Never hardcode API keys** - use Cursor AI settings 'secrets' feature or environment variables.
20) **Implement proper error handling** and logging for all external API calls.
21) **Use programmatic, API-driven solutions** instead of manual or quick-fix approaches.
22) **Always include necessary import statements** and dependencies.

## Documentation
23) **Update CLAUDE.md** for any architectural changes (single source of truth).
24) **Use Markdown files** for documentation rather than relying on first files found.
25) **Clean up and update** Markdown documentation files when making changes.


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_CONFIGURATION_STATUS.md](./MCP_CONFIGURATION_STATUS.md)