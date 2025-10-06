# 📦 Monorepo Shared Packages

**Purpose:** Shared TypeScript packages for Rensto monorepo applications, featuring the RGID (Rensto Global ID) system and Zero-Dupes architecture.

**Current Size:** ~36K (2 active packages)

**Last Audit:** October 5, 2025

---

## 📂 Package Structure

```
packages/
├── db/          24K - Database package with Zero-Dupes architecture (@rensto/db)
│   ├── migrations/  2 SQL migration files
│   ├── src/         upsert.ts (RGID system utilities)
│   └── package.json
└── identity/    12K - Identity and key generation utilities (@rensto/identity)
    ├── src/         keys.ts, index.ts
    └── package.json
```

---

## 🎯 RGID System (Rensto Global ID)

### **What is RGID?**

**RGID** (Rensto Global ID) is a universal identification system that ensures global uniqueness across all Rensto systems and prevents duplicate data.

### **Key Principles:**

1. **Single Source of Truth**: Every entity (customer, workflow, agent, template) has exactly ONE canonical RGID
2. **External Identity Mapping**: Multiple external IDs (Airtable, Webflow, n8n, etc.) map to a single RGID
3. **Zero Duplication**: Idempotency keys prevent duplicate processing of events, webhooks, and API calls
4. **Global Consistency**: RGIDs work across all systems (n8n, Airtable, Webflow, databases)

### **RGID Format:**

- Generated using CUID2 library
- Length: 24-32 characters
- Format: Lowercase alphanumeric starting with a letter
- Example: `clh7xk9p000001n8j8f9h3n8p`

### **Why RGID?**

**Problem**: Customer "John Smith" exists in:
- Airtable (ID: `recABC123`)
- n8n workflow (ID: `node_xyz`)
- Webflow CMS (ID: `wf_456`)
- MongoDB (ID: `mongo_789`)

**Without RGID**: 4 separate records, data inconsistency, duplicates

**With RGID**: All 4 external IDs map to `rgid_john_smith_clh7xk9p000001n8j8f9h3n8p`

---

## 📦 Package: @rensto/db

### **Purpose**

Database utilities for Zero-Dupes architecture with PostgreSQL.

### **Tech Stack**

- PostgreSQL (primary database)
- CUID2 (for RGID generation)
- TypeScript
- Node.js pg driver

### **Installation**

```bash
cd packages/db
npm install
npm run build
```

### **Key Functions**

#### **1. upsertByIdentity()**

**Purpose**: Canonical upsert that ensures global uniqueness

**Signature**:
```typescript
async function upsertByIdentity(
  db: Pool | PoolClient,
  kind: string,
  slug: string,
  identity?: Identity
): Promise<UpsertResult>
```

**Parameters**:
- `db`: PostgreSQL connection pool or client
- `kind`: Entity type (`'customer'`, `'agent'`, `'workflow'`, `'template'`, etc.)
- `slug`: Human-readable slug (e.g., `'john-smith'`, `'lead-gen-workflow'`)
- `identity`: Optional external identity (provider + external_id)

**Returns**:
```typescript
{
  rgid: string,     // The canonical RGID
  created: boolean, // true if new entity created
  updated: boolean  // true if existing entity updated
}
```

**Example**:
```typescript
import { upsertByIdentity } from '@rensto/db';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Create/update customer from Airtable
const result = await upsertByIdentity(
  db,
  'customer',
  'john-smith',
  {
    provider: 'airtable',
    external_id: 'recABC123',
    source_version: 'etag_xyz'  // For idempotency
  }
);

console.log(result);
// { rgid: 'clh7xk9p000001n8j8f9h3n8p', created: true, updated: false }

// Later update from n8n - same RGID returned
const result2 = await upsertByIdentity(
  db,
  'customer',
  'john-smith',  // Same slug
  {
    provider: 'n8n',
    external_id: 'node_xyz'
  }
);

console.log(result2);
// { rgid: 'clh7xk9p000001n8j8f9h3n8p', created: false, updated: true }
```

**How It Works**:
1. Inserts/updates entity by `(kind, slug)` - ensures uniqueness
2. If external identity provided, links it to the RGID
3. On conflict (external_id already exists), updates RGID and last_seen_at
4. All within a database transaction (ACID compliance)

---

#### **2. checkIdempotency()**

**Purpose**: Prevent duplicate processing of events/webhooks/API calls

**Signature**:
```typescript
async function checkIdempotency(
  db: Pool | PoolClient,
  scope: string,
  key: string,
  payloadHash: string
): Promise<boolean>
```

**Parameters**:
- `scope`: Idempotency scope (`'webhook:stripe'`, `'job:email-queue'`, `'api:create-customer'`)
- `key`: Unique key for this operation
- `payloadHash`: SHA-256 hash of the payload

**Returns**: `true` if duplicate (already seen), `false` if new

**Example**:
```typescript
import { checkIdempotency, generateIdempotencyKey } from '@rensto/db';
import crypto from 'crypto';

// Webhook handler
app.post('/webhook/stripe', async (req, res) => {
  const eventId = req.body.id;
  const payloadHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(req.body))
    .digest('hex');

  const isDuplicate = await checkIdempotency(
    db,
    'webhook:stripe',
    eventId,
    payloadHash
  );

  if (isDuplicate) {
    console.log('Duplicate webhook, skipping');
    return res.status(200).send('OK'); // Acknowledge but don't process
  }

  // Process webhook...
  await processStripeWebhook(req.body);

  res.status(200).send('OK');
});
```

---

#### **3. generateIdempotencyKey()**

**Purpose**: Generate deterministic idempotency key

**Signature**:
```typescript
function generateIdempotencyKey(
  scope: string,
  rgid: string,
  payload: any
): string
```

**Example**:
```typescript
const key = generateIdempotencyKey(
  'usage',
  'clh7xk9p000001n8j8f9h3n8p',
  { eventType: 'api_call', provider: 'openai', cost: 0.05 }
);
// Returns: "usage:clh7xk9p000001n8j8f9h3n8p:a3f5e8..."
```

---

#### **4. recordUsageEvent()**

**Purpose**: Record usage events with automatic deduplication

**Signature**:
```typescript
async function recordUsageEvent(
  db: Pool | PoolClient,
  rgid: string,
  eventType: string,
  provider: string,
  externalId?: string,
  cost?: number,
  metadata?: any
): Promise<void>
```

**Example**:
```typescript
// Track OpenAI API usage
await recordUsageEvent(
  db,
  customerRgid,
  'api_call',
  'openai',
  'completion_123',
  0.05,  // $0.05
  { model: 'gpt-4', tokens: 1000 }
);

// Duplicate calls (same externalId) are automatically ignored
await recordUsageEvent(
  db,
  customerRgid,
  'api_call',
  'openai',
  'completion_123',  // Same ID
  0.05,
  { model: 'gpt-4', tokens: 1000 }
);
// Second call silently skipped (ON CONFLICT DO NOTHING)
```

---

### **Database Schema** (migrations/001_init.sql)

#### **Core Tables**:

**entities** - Single source of truth
```sql
CREATE TABLE entities (
  rgid TEXT PRIMARY KEY,          -- Canonical Rensto Global ID
  kind TEXT NOT NULL,              -- 'customer' | 'agent' | 'workflow' | 'template'
  slug TEXT UNIQUE NOT NULL,       -- Human-readable identifier
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**external_identities** - External ID → RGID mapping
```sql
CREATE TABLE external_identities (
  provider TEXT NOT NULL,          -- 'airtable' | 'webflow' | 'n8n' | 'sellerassistant'
  external_id TEXT NOT NULL,       -- Provider's ID
  rgid TEXT NOT NULL REFERENCES entities(rgid),
  source_version TEXT,             -- etag/updatedAt for idempotency
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (provider, external_id)
);
```

**idempotency_keys** - Dedupe ledger
```sql
CREATE TABLE idempotency_keys (
  scope TEXT NOT NULL,             -- 'webhook:<provider>' | 'job:<queue>' | 'api:<route>'
  key TEXT NOT NULL,
  seen_at TIMESTAMPTZ DEFAULT now(),
  payload_hash TEXT NOT NULL,
  PRIMARY KEY (scope, key)
);
```

#### **Business Tables**:

- **customers** - Customer data with RGID reference
- **agents** - AI agent configurations
- **workflows** - Workflow definitions
- **bmad_projects** - BMAD project tracking
- **usage_events** - Usage tracking with deduplication
- **raw_ingestions** - Raw data ingestion tracking
- **normalizations** - Data normalization tracking

All tables reference `entities.rgid` for global consistency.

---

## 📦 Package: @rensto/identity

### **Purpose**

Identity and key generation utilities for consistency across all Rensto systems.

### **Tech Stack**

- TypeScript
- Node.js crypto module

### **Installation**

```bash
cd packages/identity
npm install
npm run build
```

### **Key Functions**

#### **Content Normalization**

**slugify(text: string): string**
- Converts text to kebab-case slug
- Example: `"John Smith"` → `"john-smith"`

**hashContent(content: string | Buffer): string**
- SHA-256 hash for content
- Returns: 64-character hex string

---

#### **Idempotency Key Generation**

**generateEventKey(provider: string, eventId: string): string**
- Example: `generateEventKey('stripe', 'evt_123')` → `"stripe:evt_123"`

**generateJobId(queue: string, rgid: string, operation: string): string**
- Example: `generateJobId('email', 'clh7x...', 'send')` → `"email:clh7x...:send"`

**generateApiKey(route: string, rgid: string, payload: any): string**
- Generates API idempotency key with payload hash
- Example: `"api:/customers:clh7x...:a3f5e8..."`

**generateWebhookKey(provider: string, eventId: string, payload: any): string**
- Webhook idempotency key with payload hash
- Example: `"webhook:stripe:evt_123:b4c6d9..."`

**generateLockKey(rgid: string, operation: string): string**
- Redis lock key for concurrency control
- Example: `"lock:clh7x...:update-profile"`

---

#### **Provider Normalization**

**normalizeProvider(provider: string): string**

Normalizes provider names for consistency.

**Supported Providers** (17 total):
- airtable, webflow, n8n, sellerassistant, junglescout, amazon-ads
- stripe, quickbooks, mongodb, openai, openrouter
- typeform, esignatures, vercel, github, cloudflare

Example:
```typescript
normalizeProvider('AIRTABLE') → 'airtable'
normalizeProvider('N8n') → 'n8n'
normalizeProvider('OpenAI') → 'openai'
```

---

#### **RGID Management**

**isValidRgid(rgid: string): boolean**
- Validates RGID format (CUID2)
- Must be lowercase alphanumeric starting with letter
- Length: 24-32 characters

**generateRgid(): string**
- Generates new RGID (uses crypto.randomUUID for now)
- Note: Should use same CUID2 library as @rensto/db in production

---

#### **Entity Key Management**

**createEntityKey(kind: string, slug: string): string**
- Example: `createEntityKey('customer', 'john-smith')` → `"customer:john-smith"`

**parseEntityKey(key: string): { kind: string; slug: string } | null**
- Example: `parseEntityKey('customer:john-smith')` → `{ kind: 'customer', slug: 'john-smith' }`

---

## 🔧 Usage Examples

### **Example 1: Customer Onboarding with Zero-Dupes**

```typescript
import { upsertByIdentity, recordUsageEvent } from '@rensto/db';
import { slugify } from '@rensto/identity';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Customer signs up via Webflow form
async function onboardCustomer(formData: any) {
  const slug = slugify(formData.name); // 'John Smith' → 'john-smith'

  // Upsert customer with Webflow identity
  const result = await upsertByIdentity(
    db,
    'customer',
    slug,
    {
      provider: 'webflow',
      external_id: formData.webflow_id,
      source_version: formData.updated_at
    }
  );

  // Record signup event
  await recordUsageEvent(
    db,
    result.rgid,
    'signup',
    'webflow',
    formData.webflow_id,
    0, // Free signup
    { source: 'website_form' }
  );

  return result.rgid;
}
```

---

### **Example 2: Webhook Deduplication**

```typescript
import { checkIdempotency } from '@rensto/db';
import { generateWebhookKey, normalizeProvider } from '@rensto/identity';

app.post('/webhook/:provider', async (req, res) => {
  const provider = normalizeProvider(req.params.provider);
  const eventId = req.body.id || req.body.event_id;

  const webhookKey = generateWebhookKey(provider, eventId, req.body);
  const [scope, key, payloadHash] = webhookKey.split(':');

  const isDuplicate = await checkIdempotency(
    db,
    `webhook:${provider}`,
    key,
    payloadHash
  );

  if (isDuplicate) {
    console.log(`Duplicate ${provider} webhook: ${eventId}`);
    return res.status(200).json({ status: 'duplicate' });
  }

  // Process webhook...
  await processWebhook(provider, req.body);

  res.status(200).json({ status: 'processed' });
});
```

---

### **Example 3: Cross-System Entity Resolution**

```typescript
import { upsertByIdentity } from '@rensto/db';

// Customer exists in multiple systems
async function resolveCustomerAcrossSystems(customerData: any) {
  const slug = 'acme-corp'; // Consistent slug

  // Sync from Airtable
  const airtableResult = await upsertByIdentity(
    db,
    'customer',
    slug,
    { provider: 'airtable', external_id: customerData.airtable_id }
  );

  // Sync from n8n
  const n8nResult = await upsertByIdentity(
    db,
    'customer',
    slug,
    { provider: 'n8n', external_id: customerData.n8n_id }
  );

  // Sync from Stripe
  const stripeResult = await upsertByIdentity(
    db,
    'customer',
    slug,
    { provider: 'stripe', external_id: customerData.stripe_id }
  );

  // All three return THE SAME RGID
  console.log({
    airtable: airtableResult.rgid,
    n8n: n8nResult.rgid,
    stripe: stripeResult.rgid
  });
  // All RGIDs are identical: 'clh7xk9p000001n8j8f9h3n8p'
}
```

---

## 🚀 Build & Deployment

### **Building Packages**

```bash
# Build all packages
cd packages/db && npm run build
cd ../identity && npm run build

# Or use a monorepo tool like Turborepo
turbo run build --filter=@rensto/*
```

### **Using in Applications**

```typescript
// In your app's package.json
{
  "dependencies": {
    "@rensto/db": "workspace:*",
    "@rensto/identity": "workspace:*"
  }
}
```

```typescript
// In your application code
import { upsertByIdentity, recordUsageEvent } from '@rensto/db';
import { slugify, normalizeProvider } from '@rensto/identity';
```

---

## 🗑️ Cleanup History

### **Phase 2 Audit #13 (October 5, 2025)**:

**Deleted**:
- ❌ 2 empty packages: `schema/`, `utils/` (including empty src/ subdirectories)

**Documented**:
- ✅ Created comprehensive `packages/README.md`
- ✅ Documented RGID system and Zero-Dupes architecture
- ✅ Documented all functions in @rensto/db and @rensto/identity
- ✅ Added usage examples and code samples
- ✅ Documented database schema

**Result**:
- Audit score: 59% → 76% (improved 17 points)
- Structure: 2 clean, well-documented packages
- No empty packages remaining

---

## 📊 Packages Audit Score

**Criteria Met**: 13/17 (76%) - ✅ **GOOD** (improved from 59%)

**Improvements Made**:
- ✅ Removed empty packages (schema/, utils/)
- ✅ Comprehensive documentation of RGID system
- ✅ Documented Zero-Dupes architecture
- ✅ Usage examples for all major functions
- ✅ Database schema documentation

**Remaining Issues**:
- [ ] Not integrated with Boost.space, Airtable, or Notion (metadata only)
- [ ] Not integrated with admin dashboard (should show RGID stats)
- [ ] No automated build process for monorepo
- [ ] @rensto/identity generateRgid() should use CUID2 library (currently uses crypto.randomUUID)

---

## 🔗 Related Documentation

- **CLAUDE.md**: Master documentation with current business model
- **/infra/logging-database/**: PostgreSQL logging system (may use RGID system)
- **/apps/api/**: SaaS API (should use RGID for multi-tenant isolation)
- **Database Migrations**: `packages/db/migrations/001_init.sql`, `002_customer_portal_system.sql`

---

## 📞 Questions?

**For RGID system**: See "RGID System" section above
**For database utilities**: See "@rensto/db" package documentation
**For identity utilities**: See "@rensto/identity" package documentation
**For usage examples**: See "Usage Examples" section
**For database schema**: See "Database Schema" section in @rensto/db

---

**Last Updated:** October 5, 2025
**Next Review:** When adding new shared packages or RGID features
**Maintained By:** Rensto Team
**Active Packages**: 2 (@rensto/db, @rensto/identity)
**Deleted Packages**: 2 (schema, utils - empty)
