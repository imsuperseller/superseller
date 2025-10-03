# Cursor Rensto Rules (Authoritative)

## Core Principles
1) **Before writing code**: SEARCH repo for an existing function/module that fits; REUSE > EXTEND > REFACTOR; never duplicate.
2) **Never create new top-level folders**. Allowed top-level: .github, .vscode, apps, packages, services, infra, scripts, docs, tests, assets, examples, experiments, archived.
3) **All new data models must be added to packages/schema** (not scattered). Any record written MUST include `rgid` (Rensto Global ID).
4) **Any new external integration must add an adapter in services/adapters/<provider>** and register mapping in packages/identity.
5) **Idempotency is MANDATORY**: outbound POSTs must set `Idempotency-Key`; inbound webhooks must be deduped by `(source, event_id)`.
6) **Any migration must include**: SQL (packages/db/migrations), Types (packages/schema/src), Tests (tests/integration), Docs (docs/adr/).
7) **No spaces in file/dir names**. Use kebab-case. Move "Examples/ Rensto System" to examples/rensto-system.
9) **If a function you're writing computes or fetches a record**, add a deterministic `dedupe_key` and call `upsert_by_identity(...)`.
10) **On pull requests**: fail CI if any file violates rules above or if duplicate keys are detected by the duplicate scanner.

## BMAD Methodology Integration
11) **Always use BMAD (Build, Measure, Analyze, Deploy)** for any infrastructure changes or optimizations.
12) **Before implementing**: Check existing BMAD projects in data/bmad-projects/ for similar implementations.
13) **After implementation**: Create BMAD project documentation and update optimization plans.

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
23) **Update ONE_SOURCE_OF_TRUTH.md** for any architectural changes.
24) **Use Markdown files** for documentation rather than relying on first files found.
25) **Clean up and update** Markdown documentation files when making changes.


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)