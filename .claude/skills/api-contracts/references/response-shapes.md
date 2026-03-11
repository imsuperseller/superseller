# Response Shapes — Key API Types

## Standard Error Response
All endpoints should return errors in this shape:
```typescript
{
  error: string;          // Human-readable error message
  details?: unknown;      // Zod error flatten or additional context
}
```
HTTP status codes: `400` (bad input), `401` (unauthorized), `403` (forbidden), `404` (not found), `500` (server error).

---

## Authentication

### Magic Link Send
```typescript
// POST /api/auth/magic-link/send
// Input
{ email: string; redirectTo?: string }
// Output (200)
{ success: true }
```

### Session User (derived from cookie)
```typescript
{
  id: string;          // cuid
  email: string;
  name?: string;
  role: 'user' | 'admin';
  tenantId?: string;
}
```

---

## Video Pipeline

### Job Card
```typescript
{
  id: string;              // uuid
  status: 'pending' | 'processing' | 'stitching' | 'completed' | 'failed';
  progress_percent: number;
  master_video_url?: string;
  listing_id: string;
  user_id: string;
  model: string;           // 'kling-3.0' | 'nano-banana'
  created_at: string;      // ISO 8601
  updated_at: string;
}
```

### Job Detail (with clips)
```typescript
{
  job: JobCard;
  clips: Array<{
    id: string;
    clip_number: number;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    video_url?: string;
    prompt: string;
    duration_seconds: number;
    error_message?: string;
  }>;
  listing: {
    id: string;
    address: string;
    price?: number;
    photos: string[];       // R2 URLs
    floorplan_url?: string;
  };
  _fallback?: boolean;      // true if worker was down, data from DB only
}
```

### Credit Balance
```typescript
// GET /api/video/credits
{ balance: number }        // integer, credits remaining
```

### Usage Events
```typescript
// GET /api/video/usage
{
  events: Array<{
    id: string;
    type: 'video_generation' | 'clip_regeneration' | 'credit_topup' | 'subscription_reset';
    credits: number;        // negative = deduction, positive = addition
    description: string;
    created_at: string;
  }>
}
```

---

## Marketplace

### Template List
```typescript
// GET /api/marketplace/templates
{
  templates: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;          // cents
    tags: string[];
    rating: number;
    downloadCount: number;
    thumbnail_url?: string;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
}
```

### Template Detail
```typescript
// GET /api/marketplace/[id]
{
  workflow: {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    integrations: string[];
    rating: number;
    screenshots: string[];
    category: string;
    version: string;
  }
}
```

---

## Billing

### Billing Status
```typescript
// GET /api/billing/status
{
  billing: {
    currentPeriod: {
      start: string;      // ISO 8601
      end: string;
      plan: 'starter' | 'pro' | 'team' | 'none';
    };
    invoices: Array<{
      id: string;
      amount: number;
      status: string;
      date: string;
    }>;
    usageBreakdown: {
      videosGenerated: number;
      clipsRegenerated: number;
      creditsUsed: number;
      creditsRemaining: number;
    };
    paymentMethod?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
  }
}
```

---

## Admin

### Dashboard Metrics
```typescript
// GET /api/admin/dashboard/metrics
{
  revenue: {
    mrr: number;
    growth: number;        // percentage
    activeSubscriptions: number;
  };
  customers: {
    total: number;
    active: number;
    churn: number;
  };
  usage: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    avgProcessingTime: number;
  };
  system: {
    workerStatus: 'healthy' | 'degraded' | 'down';
    queueDepth: number;
    lastDeployment: string;
  }
}
```

### Client List
```typescript
// GET /api/admin/clients
{
  clients: Array<{
    id: string;
    name: string;
    email: string;
    businessName?: string;
    phone?: string;
    status: string;
    createdAt: string;
    serviceCount: number;
  }>
}
```

### Service Instance (Project)
```typescript
{
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  status: 'pending' | 'provisioning' | 'active' | 'suspended' | 'cancelled';
  progress: number;       // 0-100
  pillar: string;
  configuration: Record<string, unknown>;
  createdAt: string;
  activatedAt?: string;
}
```

---

## Fulfillment

### Initiate Response
```typescript
// POST /api/fulfillment/initiate
{ instanceId: string }
```

### Finalize Response
```typescript
// POST /api/fulfillment/finalize
{ success: true }
```

---

## Worker — RAG

### Ingest Response
```typescript
// POST /api/rag/ingest
{
  documentId: number;
  chunks: number;
  vectorDimensions: number;  // 768 (nomic-embed-text)
}
```

### Search Response
```typescript
// POST /api/rag/search
{
  results: Array<{
    id: number;
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;     // 0-1 cosine similarity
    source: string;
    title?: string;
  }>;
  count: number;
}
```

---

## Cron

### Aitable Sync
```typescript
// GET /api/cron/sync-aitable
{
  ok: true;
  results: {
    leads: {
      synced: number;
      errors: string[];
    }
  };
  remainingUnsynced: number;
  timestamp: string;
}
```

---

## PayPal Webhook Events Handled
| Event | Action |
|-------|--------|
| `CHECKOUT.ORDER.APPROVED` | Provision service, create user, add credits |
| `PAYMENT.SALE.COMPLETED` | Reset monthly credits |
| `BILLING.SUBSCRIPTION.CANCELLED` | Suspend service |

> **Note**: DB columns still named `stripe*` (e.g., `stripeSessionId`) but store PayPal IDs. Stripe deprecated — PayPal is primary.

---

## Versioning Notes

Current API version: **v1 (implicit)** — no version prefix in URLs.

When versioning becomes necessary:
1. Add `/api/v2/` prefix for new version
2. Keep `/api/` (v1) working for 90 days
3. Add `X-API-Version` response header
4. Add `_deprecated` array to v1 responses listing changed fields
