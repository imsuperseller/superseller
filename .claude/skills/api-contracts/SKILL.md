---
name: api-contracts
description: >
  API contract governance for SuperSeller AI's 80+ endpoints across web (Next.js) and worker (Express).
  Covers route inventory, input/output types, auth patterns, versioning strategy,
  and breaking-change detection.
autoTrigger:
  - "api route"
  - "endpoint"
  - "api contract"
  - "breaking change"
  - "api version"
  - "route handler"
  - "request body"
  - "response shape"
  - "api auth"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "n8n"
  - "schema migration"
---

# API Contracts

## When to Use
Use when adding/modifying API routes, reviewing endpoint auth, checking request/response shapes, detecting breaking changes, or auditing the API surface. Not for video pipeline internals, UI design, n8n workflows, or ORM migration work (use migration-validator for that).

## Critical Rules
1. **Every new route must have Zod validation** on request body (POST/PATCH/PUT).
2. **Never change response shape** of a production endpoint without a deprecation path.
3. **Auth must be explicit** — every route is either public, session-gated, or token-gated. No implicit auth.
4. **Rate-limit public endpoints** — contact forms, magic-link sends, checkout creation.
5. **Worker routes use query params for userId** — no session cookies on Express.
6. **Document new routes** in the API catalog below and update this skill.

## Architecture

### Route Locations
| App | Framework | Route Dir | Auth Method |
|-----|-----------|-----------|-------------|
| Web | Next.js 14+ (App Router) | `apps/web/superseller-site/src/app/api/` | Session cookie (magic link) |
| Worker | Express.js | `apps/worker/src/api/routes.ts` | Query params (`?userId=`) |

### Auth Patterns
| Pattern | Implementation | Used By |
|---------|---------------|---------|
| Public | No auth check | `/api/health`, `/api/contact`, `/api/marketplace/templates` |
| Session | `verifySession()` (magic-link based, not NextAuth) | All `/api/app/*`, `/api/video/*`, `/api/billing/*` |
| Admin Session | Session + `role === 'admin'` check | All `/api/admin/*` |
| Cron Secret | `?key=CRON_SECRET` query param | `/api/cron/sync-aitable` |
| PayPal Signature | PayPal transmission signature verification | `/api/webhooks/paypal` |
| Token-based | One-time token in URL | `/api/auth/magic-link/verify`, `/api/marketplace/download/[token]` |
| Rate-limited | IP-based rate limiting middleware | `/api/contact`, `/api/auth/magic-link/send`, `/api/checkout` |

### Validation Stack
- **Web**: No unified validation — some routes use manual checks, some use Zod
- **Worker**: Zod schemas in `routes.ts` for all POST endpoints
- **Target**: All routes should use Zod for request validation

## API Catalog

### Health & Monitoring (3 routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health/check` | Public | Full service audit |
| GET | `/api/admin/health-check` | Admin | n8n, WAHA, Marketplace status |
| GET, POST | `/api/admin/monitoring` | Admin | SSH diagnostics, remote actions |

### Authentication (3 routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/magic-link/send` | Rate-limited | Send login token |
| GET | `/api/auth/magic-link/verify` | Token | Verify + set session cookie |
| POST | `/api/auth/logout` | Session | Clear auth cookie |

### Billing & Payments (4 routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/billing/status` | Session | Billing period, invoices, usage |
| POST | `/api/video/subscribe` | Session | PayPal checkout for video plan |
| POST | `/api/checkout` | Rate-limited | Universal PayPal checkout |
| POST | `/api/webhooks/paypal` | PayPal sig | Payment event handler |

### Video Pipeline (7 routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/video/jobs` | Session | List user's jobs |
| POST | `/api/video/jobs` | Session | Create job from listing |
| POST | `/api/video/jobs/from-zillow` | Session+Credits | Scrape Zillow + create job |
| GET | `/api/video/jobs/[id]` | Session | Single job details |
| POST | `/api/video/jobs/[id]/regenerate` | Session+Credits | Regenerate clips |
| GET | `/api/video/credits` | Session | Credit balance |
| GET | `/api/video/usage` | Session | Usage event history |

### Marketplace (5 routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/marketplace/templates` | Public | List/search templates |
| GET | `/api/marketplace/[id]` | Public | Template details |
| POST | `/api/marketplace/downloads` | Internal | Generate download link |
| GET | `/api/marketplace/download/[token]` | Token | Secure file download |
| POST | `/api/marketplace/customize` | Rate-limited | Customization request |

### Admin (15+ routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET, POST, PATCH, DELETE | `/api/admin/clients` | Admin | Client CRUD |
| GET | `/api/admin/projects` | Admin | Service instances |
| GET | `/api/admin/impersonate` | Admin | Client impersonation |
| POST | `/api/admin/onboarding/[id]/approve` | Admin | Approve onboarding |
| GET | `/api/admin/intelligence` | Admin | AI recommendations |
| GET | `/api/admin/financials` | Admin | Revenue metrics |
| GET | `/api/admin/dashboard/metrics` | Admin | Dashboard summary |
| GET | `/api/admin/workflows/status` | Admin | n8n workflow status |
| GET, POST | `/api/admin/n8n` | Admin | n8n diagnostics + actions |
| GET, POST, PATCH | `/api/admin/launch-tasks` | Admin | Launch checklist |
| POST | `/api/admin/products/create` | Admin | Create PayPal product |
| GET, POST | `/api/admin/testimonials` | Admin | Testimonial management |

### Client Dashboard (6 routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/app/dashboard` | Session | Services + usage logs |
| GET | `/api/app/agents` | Session | Client's agents |
| GET | `/api/app/approvals` | Session | Approval requests |
| POST | `/api/app/approvals/[id]/respond` | Session | Respond to approval |
| GET | `/api/app/runs` | Session | Workflow runs |
| POST | `/api/app/onboarding/submit` | Session | Onboarding form |

### Worker Routes (15 routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/jobs` | Query userId | List user's jobs |
| POST | `/api/jobs` | Zod body | Create job |
| GET | `/api/jobs/:id` | Path param | Job details |
| POST | `/api/jobs/from-zillow` | Zod body | Zillow scrape + job |
| POST | `/api/jobs/:id/regenerate` | Zod body | Clip regeneration |
| POST | `/api/jobs/:id/retry-fresh` | Path param | Full retry |
| POST | `/api/rag/ingest` | Zod body | Document ingestion |
| POST | `/api/rag/search` | Zod body | Vector/hybrid search |
| GET | `/api/rag/documents` | Query params | List documents |
| DELETE | `/api/rag/documents/:id` | Path param | Delete document |
| DELETE | `/api/rag/documents` | Query params | Bulk delete |
| POST | `/api/dev/ensure-test-user` | None | E2E test setup |
| GET | `/api/health` | None | Health check |

### Other (8+ routes)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/contact` | Rate-limited | Contact form |
| POST | `/api/custom-solutions/intake` | Public | Solution request |
| POST | `/api/custom-solutions/checkout` | Public | Solution payment |
| POST | `/api/fulfillment/initiate` | Admin | Start fulfillment |
| POST | `/api/fulfillment/finalize` | Admin | Complete fulfillment |
| POST | `/api/knowledge/index` | Session | Document indexing |
| POST | `/api/cron/sync-aitable` | Cron secret | Aitable sync |
| POST | `/api/webhooks/usage` | Secret token | Usage event ingestion |

## Common Patterns

### Adding a New API Route (Web)
```typescript
// apps/web/superseller-site/src/app/api/example/route.ts
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth'; // magic-link session check
import { z } from 'zod';

const RequestSchema = z.object({
  name: z.string().min(1),
  value: z.number().optional(),
});

export async function POST(request: Request) {
  // 1. Auth check
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate input
  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 3. Business logic
  const result = await doSomething(parsed.data);

  // 4. Return typed response
  return NextResponse.json({ ok: true, data: result });
}
```

### Adding a New Worker Route
```typescript
// In apps/worker/src/api/routes.ts
import { z } from 'zod';

const schema = z.object({
  tenantId: z.string(),
  payload: z.record(z.unknown()),
});

app.post('/api/new-endpoint', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  // ... business logic
  res.json({ ok: true });
});
```

### Breaking Change Detection
Before modifying an existing route's response shape:
1. Search for all consumers: `grep -r "api/the-route" apps/`
2. Check if any external service calls it (n8n webhooks, PayPal webhooks)
3. If consumers exist: add new fields alongside old, deprecate old with deadline
4. If no consumers: safe to modify

### Deprecation Pattern
```typescript
export async function GET(request: Request) {
  // Old response shape (deprecated, remove after 2026-04-01)
  const legacyResponse = { items: result };
  // New response shape
  const response = { data: result, pagination: { total, page } };

  return NextResponse.json({
    ...response,
    ...legacyResponse, // keep old shape temporarily
    _deprecated: ['items field — use data instead'],
  });
}
```

## Pre-Deploy Checklist
- [ ] New route has Zod validation on request body
- [ ] Auth check matches route sensitivity (public vs session vs admin)
- [ ] Response shape documented in this skill's catalog
- [ ] No breaking changes to existing response shapes
- [ ] Rate limiting on public POST endpoints
- [ ] Error responses use consistent shape: `{ error: string, details?: any }`

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| `405 Method Not Allowed` (Next.js) | HTTP method not exported from route file. | Ensure `export async function POST` (or GET/PATCH/DELETE) is exported. File must be `route.ts` not `page.ts`. |
| `405 Method Not Allowed` (Worker) | Express route registration order — earlier route matches first. | Check `routes.ts` for conflicting paths. More specific routes must come before wildcards. |
| `401 Unauthorized` on Vercel, works locally | Session cookie not set or stripped by edge runtime. | Check `Set-Cookie` in `/api/auth/magic-link/verify`. Add `export const runtime = 'nodejs'` to route. |
| `CORS error` from client | `Access-Control-Allow-Origin` missing or mismatched. | Web: check `vercel.json` headers for `/api/*`. Worker: verify CORS middleware in Express config. |
| Response shape changed unexpectedly | Prisma model field added/renamed → raw model leaks into response. | `git log --oneline -20 -- apps/web/superseller-site/src/app/api/the-route/`. Run Schema Sentinel for drift. |
| `400 Bad Request` on POST | Zod validation rejecting input. Client sending wrong field names or types. | Check `parsed.error.flatten()` in response. Compare client payload against Zod schema. |
| Route works on `next dev` but 500 on Vercel | Missing env var, or importing server-only module in edge runtime. | Check Vercel function logs. Verify all env vars exist in Vercel dashboard. |

## References
- `apps/web/superseller-site/src/app/api/` — All web API routes
- `apps/worker/src/api/routes.ts` — All worker routes
- `apps/web/superseller-site/vercel.json` — CORS headers, cron config
- `.claude/skills/api-contracts/references/route-inventory.md` — Full route details
- `.claude/skills/api-contracts/references/response-shapes.md` — Key response types
