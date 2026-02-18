# Migrating from n8n to Antigravity

## When to Migrate
- Workflow runs in production (not just prototyping)
- Workflow has complex logic that n8n struggles with (loops, error handling)
- Workflow needs to scale beyond n8n's memory limits
- OOM errors in n8n (heavy processing must be programmatic)

## Migration Checklist
1. [ ] Export n8n workflow JSON
2. [ ] Document triggers (webhook, cron, manual)
3. [ ] Document all nodes and their transformations
4. [ ] Document external API calls (credentials needed)
5. [ ] Implement in TypeScript
6. [ ] Add BullMQ queue for async processing
7. [ ] Add error handling (UnrecoverableError for permanent failures)
8. [ ] Test with dry-run
9. [ ] Deploy to RackNerd
10. [ ] Deactivate n8n workflow (don't delete — keep as reference)
11. [ ] Update docs/n8n/N8N_WORKFLOWS_CATALOG.md

## Common n8n → TypeScript Translations

| n8n Node | TypeScript Equivalent |
|----------|----------------------|
| HTTP Request | `fetch()` or `axios` |
| Set | Object spread / Object.assign |
| IF | Standard `if/else` |
| Switch | `switch` statement |
| Code | Direct TypeScript function |
| Cron | BullMQ repeatable job |
| Webhook | Express/Fastify route |
| Postgres | Prisma / Drizzle query |
| Send Email | Resend API |

## Lessons Learned
- **n8n OOM**: Heavy video processing in n8n caused OOM errors. All heavy lifting must be programmatic.
- **n8n Firestore**: Many n8n workflows still reference Firestore. These are STALE. Use PostgreSQL.
- **n8n as primary**: Was primary before Feb 2026. Now backup only. Antigravity handles all new automation.
