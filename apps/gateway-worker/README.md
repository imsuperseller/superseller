# Rensto Gateway Worker

**Platform:** Cloudflare Workers
**Stack:** TypeScript + Cloudflare KV

## 📋 Overview

The Rensto Gateway Worker is a Cloudflare Worker that acts as an intelligent API gateway and orchestration layer for the Rensto platform. It handles:

- **Multi-tenant routing** - Routes requests to appropriate n8n workflows based on tenant configuration
- **Idempotency** - Prevents duplicate request processing using KV-based deduplication
- **Rate limiting & throttling** - Per-tenant rate limits with configurable burst and sustained rates
- **Request signing & verification** - HMAC signature validation for secure webhook handling
- **Integration orchestration** - Unified interface to Stripe, Airtable, n8n, Webflow, QuickBooks, etc.

## 🏗️ Architecture

```
src/
├── index.ts              # Main worker entry point
├── handlers/             # Request handlers
│   ├── typeform-webhook.js      # Typeform webhook handler
│   └── admin-dashboard-mcp.js   # Admin dashboard MCP handler
├── middleware/           # Auth, validation, rate limiting
├── services/             # Integration services
│   ├── stripe/
│   ├── airtable/
│   ├── n8n/
│   └── webflow/
├── utils/                # Helpers and utilities
└── types/                # TypeScript type definitions

scripts/
└── tenant-admin.ts       # Tenant management CLI
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with Workers enabled

### Installation

```bash
cd apps/gateway-worker
npm install
```

### Local Development

```bash
# Start local development server
npm run dev

# This will start the worker at http://localhost:8787
```

### Cloudflare KV Setup

The worker requires three KV namespaces. Create them via Cloudflare dashboard or CLI:

```bash
# Create KV namespaces
wrangler kv:namespace create "TENANT_REGISTRY_KV"
wrangler kv:namespace create "IDEMPOTENCY_KV"
wrangler kv:namespace create "THROTTLE_KV"
```

Update `wrangler.toml` with the returned KV namespace IDs.

## ⚙️ Configuration

### wrangler.toml

Update the KV namespace IDs in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "TENANT_REGISTRY_KV"
id = "your-tenant-registry-kv-id"

[[kv_namespaces]]
binding = "IDEMPOTENCY_KV"
id = "your-idempotency-kv-id"

[[kv_namespaces]]
binding = "THROTTLE_KV"
id = "your-throttle-kv-id"
```

### Environment Variables

Configure via `.dev.vars` (local) or `wrangler secret put` (production):

```bash
# Required secrets (use wrangler secret put)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put OPENROUTER_API_KEY
wrangler secret put AIRTABLE_API_KEY
wrangler secret put N8N_API_KEY
wrangler secret put WEBFLOW_API_TOKEN
wrangler secret put QUICKBOOKS_CLIENT_ID
wrangler secret put QUICKBOOKS_CLIENT_SECRET
wrangler secret put PARTNERSTACK_API_KEY
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put ROLLBAR_ACCESS_TOKEN
```

**Public variables** (in `wrangler.toml` `[vars]` section):
- `N8N_WEBHOOK_PATH` - n8n webhook path
- `DRY_RUN` - Set to "false" in production
- `SIGNATURE_TTL_SECONDS` - Signature validity window (default: 300)
- `THROTTLE_DEFAULT_BURST` - Default burst limit (default: 10)
- `THROTTLE_DEFAULT_RATE_PER_MIN` - Default rate limit per minute (default: 60)
- `LOG_SAMPLE_RATE` - Sampling rate for logs (0.0 to 1.0)

## 🔑 Tenant Management

### Register a New Tenant

```bash
npm run tenant:set -- \
  --tenant-id "customer-123" \
  --n8n-workflow-id "abc123def456" \
  --api-key "tenant-secret-key" \
  --rate-limit-per-min 120 \
  --rate-limit-burst 20
```

### Get Tenant Configuration

```bash
npm run tenant:get -- --tenant-id "customer-123"
```

### List All Tenants

```bash
npm run tenant:list
```

## 📡 API Routes

### Webhook Endpoints

**POST `/webhook/:tenant_id`**
- Receives webhooks from external services (Stripe, Typeform, etc.)
- Routes to appropriate n8n workflow based on tenant configuration
- Validates HMAC signatures
- Enforces rate limits
- Returns: `200 OK` with execution details

**Headers Required:**
- `X-Signature` - HMAC signature (SHA-256)
- `X-Timestamp` - Request timestamp (Unix milliseconds)
- `Content-Type: application/json`

### Health Check

**GET `/health`**
- Returns worker health status
- Response: `{ status: "ok", timestamp: "..." }`

## 🎯 Webhook Handlers

The gateway worker includes specialized handlers for different webhook sources:

### **Typeform Webhook Handler** (`src/handlers/typeform-webhook.js`)

Processes Typeform form submissions through the MCP ecosystem.

**Features:**
- CORS preflight handling
- Typeform signature verification
- Routes submissions to n8n, Airtable, or Make.com
- Parallel processing to multiple destinations
- Error handling and logging

**Webhook URL:** `/webhook/typeform` (or configure via tenant routing)

**Required Secrets:**
- `TYPEFORM_WEBHOOK_SECRET` - Typeform webhook secret for signature validation
- `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` - For Airtable integration
- `N8N_BASE_URL`, `N8N_API_KEY` - For n8n integration
- `MAKE_BASE_URL`, `MAKE_API_KEY` - For Make.com integration

**Use Cases:**
- Lead capture forms
- Customer onboarding forms
- Survey responses
- Consultation requests

### **Admin Dashboard MCP Handler** (`src/handlers/admin-dashboard-mcp.js`)

Handles Model Context Protocol (MCP) requests for the admin dashboard.

**Features:**
- Health check endpoint
- MCP configuration reference
- Admin dashboard integrations

**Endpoints:**
- `/health` - Health status
- `/mcp/admin-dashboard` - MCP requests

**MCP Servers Referenced:**
- n8n-mcp (Docker, 63 tools)
- webflow-mcp (NPX, 42 tools)
- airtable-mcp (NPX)
- stripe-mcp (Docker)
- pipedream-mcp
- supabase-mcp (NPX)

**Note:** This handler was consolidated from the root-level `cloudflare-workers/` directory on Oct 5, 2025.

## 🔒 Security Features

### 1. HMAC Signature Verification
All webhook requests must include a valid HMAC signature:

```javascript
const signature = crypto.createHmac('sha256', tenantApiKey)
  .update(timestamp + requestBody)
  .digest('hex');
```

### 2. Replay Protection
- Timestamps must be within `SIGNATURE_TTL_SECONDS` (default: 5 minutes)
- Prevents replay attacks

### 3. Rate Limiting
- Per-tenant rate limits stored in KV
- Configurable burst and sustained rates
- Token bucket algorithm

### 4. Idempotency
- Duplicate requests detected via idempotency keys
- Cached responses served for duplicate requests
- Configurable TTL (default: 24 hours)

## 🔗 Integration Services

### n8n
- Webhook routing and execution
- Workflow triggering
- Execution tracking

### Stripe
- Webhook validation
- Payment event processing
- Subscription management

### Airtable
- Usage tracking
- Lead data syncing
- Business intelligence

### Webflow
- CMS data synchronization
- Dynamic content updates

### QuickBooks
- Financial data integration
- Invoice syncing

### OpenRouter
- AI/LLM routing
- Multiple model support

### PartnerStack
- Affiliate tracking
- Commission management

## 🚀 Deployment

### Staging Deployment

```bash
npm run deploy:staging
```

### Production Deployment

```bash
npm run deploy:prod
```

**Pre-Deployment Checklist:**
- [ ] All secrets configured via `wrangler secret put`
- [ ] KV namespace IDs updated in `wrangler.toml`
- [ ] Routes configured for staging/production environments
- [ ] `DRY_RUN` set to "false" in production `[vars]`
- [ ] Rate limits configured appropriately
- [ ] Rollbar/monitoring configured
- [ ] Test webhook endpoints with staging data

### Custom Routes

Update `wrangler.toml` with your domain routes:

```toml
[env.production]
route = "gateway.rensto.com/*"
```

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run typecheck

# Lint
npm run lint
```

### Test a Webhook Locally

```bash
curl -X POST http://localhost:8787/webhook/test-tenant \
  -H "Content-Type: application/json" \
  -H "X-Signature: <calculated-hmac>" \
  -H "X-Timestamp: $(date +%s)000" \
  -d '{"event": "test", "data": "hello"}'
```

## 📊 Monitoring

### Cloudflare Analytics
- Request volume and errors visible in Cloudflare dashboard
- Workers Analytics shows invocations, errors, CPU time

### Rollbar Integration
- Errors automatically sent to Rollbar (if configured)
- Configure `ROLLBAR_ACCESS_TOKEN` secret

### Logging
- `LOG_SAMPLE_RATE` controls sampling (1.0 = 100% of requests)
- Logs visible in Cloudflare Workers Logs
- Structured logging for easy parsing

## 🤝 Related Services

- **apps/api/** - Rensto SaaS API (backend)
- **n8n workflows** - Workflow execution engine
- **Stripe** - Payment processing
- **Airtable** - Data storage and BI
- **Webflow** - CMS and website

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)

## 🐛 Known Issues

- [ ] KV namespace IDs need to be configured (marked as TODO in wrangler.toml)
- [ ] Routes for staging/production not yet defined
- [ ] Test coverage needs improvement

## 📞 Support

For issues related to the gateway worker, contact the Rensto development team or file an issue in the repository.

---

**Last Updated:** October 5, 2025
**Maintained By:** Rensto Team
**Deployed At:** Cloudflare Workers (gateway.rensto.com - pending configuration)
