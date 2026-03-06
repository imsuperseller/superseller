---
name: marketplace-saas
description: >-
  FB Marketplace bot SaaS platform. Covers multi-tenant architecture, customer onboarding,
  product configuration, GoLogin session management, Kie.ai image generation per listing,
  scheduled posting, and admin/customer portals. Use when working on marketplace automation,
  FB bot, listing generation, customer isolation, or SaaS billing for marketplace products.
  Not for TourReel video pipeline, UI/UX design, or non-marketplace backend code.
  Example: "Add customer product configuration UI" or "Fix delivery field bug".
autoTrigger:
  - "FB Marketplace"
  - "marketplace bot"
  - "UAD doors"
  - "MissParty"
  - "listing generation"
  - "GoLogin"
  - "marketplace SaaS"
  - "customer products"
  - "marketplace automation"
negativeTrigger:
  - "TourReel"
  - "video pipeline"
  - "Kling"
  - "real estate video"
  - "landing page design"
---

# FB Marketplace SaaS

## When to Use
Use this skill when working on FB Marketplace bot automation, listing generation, customer product management, or marketplace SaaS features. Not for TourReel video pipeline, UI/UX design, or non-marketplace backend.

## Critical Rules
1. **NEVER use overlaid images as Seedream references** — AI reproduces text from reference causing double phone overlays
2. **ALL schema fields MUST be in INSERT queries** — delivery, rental_period, includes caused production bug when missing
3. **Customer isolation MANDATORY** — all queries filtered by customerId (no cross-customer data leaks)
4. **GoLogin sessions per customer** — NEVER share profiles across customers
5. **Zod validation before DB writes** — prevent schema drift bugs

## Architecture (Current - Single Tenant)

### Key Files
| File | Purpose |
|------|---------|
| `fb-marketplace-lister/deploy-package/webhook-server.js` | Job serving, replenishment, status updates |
| `fb-marketplace-lister/deploy-package/scheduler.js` | 20min cycles, operating hours, cooldowns |
| `fb-marketplace-lister/deploy-package/product-configs.js` | UAD/MissParty configs, pricing, scenarios |
| `fb-marketplace-lister/deploy-package/image-generator.js` | Kie.ai image gen (Seedream 4.5, Flux 2), overlay |
| `fb-marketplace-lister/deploy-package/content-generator.js` | Gemini AI copy generation |
| `fb-marketplace-lister/deploy-package/facebook-bot-final.js` | GoLogin automation, posting |
| `fb-marketplace-lister/deploy-package/bot-config.json` | Phones, locations, schedules, GoLogin profiles |

### Database (PostgreSQL)
**Current**: Single `fb_listings` table (no multi-tenancy)
```sql
fb_listings: id, unique_hash, client_id (product, not customer), status,
  product_name, size, color, price, listing_price, phone_number, location,
  listing_title, listing_description, delivery, rental_period, includes,
  image_url, image_url2, image_url3, video_url,
  facebook_url, posted_at, config_data (JSONB)
```

**Required for SaaS**: Multi-tenant schema
```prisma
MarketplaceCustomer { id, userId, businessName, subscription, credits, status }
MarketplaceProduct { id, customerId, productType, config (JSON), images, pricing, schedule }
FacebookSession { id, customerId, profileId, cookies (encrypted), status }
MarketplacePost { id, productId, customerId, status, facebookUrl, configData }
```

## SaaS Architecture (Hybrid MVP - Option C)

### Phase 1: Customer Abstraction (Week 1)
**File-based multi-tenancy** (no schema refactor yet)
```
customers/
  <customerId>/
    config.json          ← Product configs (UAD options, MissParty scenarios, etc.)
    schedule.json        ← Operating hours, cooldowns, post limits
    session.json         ← GoLogin profile ID, cookies (encrypted)
    references/          ← Base product images
```

**Dynamic Config Loader**:
```typescript
// config-loader.ts
export class ConfigLoader {
  loadCustomerConfig(customerId: string): CustomerConfig {
    const configPath = `customers/${customerId}/config.json`;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Validate with Zod
    return CustomerConfigSchema.parse(config);
  }

  getAllActiveCustomers(): string[] {
    return fs.readdirSync('customers/')
      .filter(dir => this.isCustomerActive(dir));
  }
}
```

**Scheduler Update** (loop customers instead of hardcoded products):
```typescript
// scheduler.js
const configLoader = new ConfigLoader();

setInterval(async () => {
  const customers = configLoader.getAllActiveCustomers();

  for (const customerId of customers) {
    const config = configLoader.loadCustomerConfig(customerId);

    for (const product of config.products) {
      await postProduct(customerId, product);
      await delay(product.cooldownMinutes * 60 * 1000);
    }
  }
}, 20 * 60 * 1000); // 20min cycles
```

### Phase 2: Customer Portal (Week 2)
**Routes** (`apps/web/superseller-site/src/app/api/marketplace/`):
- `POST /api/marketplace/products` — Add product (creates customer config file)
- `GET /api/marketplace/products` — List products
- `GET /api/marketplace/posts` — List posts with Facebook links
- `POST /api/marketplace/session` — Upload GoLogin cookies

**UI** (`apps/web/superseller-site/src/app/[locale]/(main)/dashboard/marketplace/`):
- Product management: add/edit/pause products
- Post history: calendar view, Facebook links, status
- Session status: connected/disconnected, reconnect button

### Phase 3: Billing (Week 3)
**PayPal Integration** (reuse unified billing-credits system):
- Subscription tiers: DEPRECATED standalone pricing. Uses unified SaaS tiers: Starter ($79/mo), Pro ($149/mo), Team ($299/mo)
- Post limits: 100/500/unlimited per month
- Credit-based: $0.30-$0.50 per post (includes Kie.ai generation)

**Usage Tracking**:
```typescript
// Track post usage per customer
await db.marketplaceUsage.create({
  customerId,
  postId,
  cost: 0.30, // $0.30/post
  creditsBefore,
  creditsAfter,
});
```

### Phase 4: Admin Dashboard (Week 4)
**Admin Routes** (`admin.superseller.agency/marketplace`):
- Customer list: status, active products, posts today, credits
- Per-customer view: products, posts, session health
- Support actions: pause customer, reset session, regenerate listings
- System health: worker status, queue depth, error rate

## Common Patterns

### Pattern 1: Image Cohesion (Use Image 1 as Reference for 2-3)
```typescript
// image-generator.js
let firstRawUrl = null;

for (let i = 0; i < 3; i++) {
  // Image 1: use product reference or text-to-image
  // Images 2-3: use image 1 as reference for cohesion
  const activeRef = (i === 0) ? referenceUrl : (firstRawUrl || referenceUrl);

  if (activeRef) {
    resultUrl = await generateImageWithReference(activeRef, prompt);
  }
  if (!resultUrl) {
    resultUrl = await generateImageFromText(prompt);
  }

  if (i === 0) {
    firstRawUrl = resultUrl; // Save for images 2-3
  }

  // Apply phone overlay (clean images only!)
  await applyPhoneOverlay(resultUrl, phone);
}
```

### Pattern 2: Schema Validation (Prevent Missing Fields)
```typescript
// product-config.schema.ts
import { z } from 'zod';

export const MarketplaceProductConfigSchema = z.object({
  productType: z.enum(['DOORS', 'BOUNCE_HOUSES', 'FURNITURE']),
  name: z.string().min(1),
  delivery: z.string().optional(),
  rentalPeriod: z.string().optional(),
  pricing: z.object({
    basePrice: z.number().positive(),
    sizeModifiers: z.record(z.number()).optional(),
  }),
  schedule: z.object({
    operatingHours: z.object({
      start: z.string().regex(/^\d{1,2}(am|pm)$/),
      end: z.string().regex(/^\d{1,2}(am|pm)$/),
      timezone: z.string(),
    }),
    postLimit: z.number().int().positive(),
    cooldownMinutes: z.number().int().positive(),
  }),
});

// Validate before DB insert
const config = MarketplaceProductConfigSchema.parse(rawConfig);
```

### Pattern 3: Customer Isolation (WHERE customerId)
```typescript
// ALWAYS filter by customerId for queries
const listings = await db.query(`
  SELECT * FROM fb_listings
  WHERE customer_id = $1 AND status = 'queued'
  ORDER BY created_at ASC
`, [customerId]);

// NEVER allow cross-customer queries
// BAD: SELECT * FROM fb_listings WHERE status = 'queued'
// GOOD: SELECT * FROM fb_listings WHERE customer_id = $1 AND status = 'queued'
```

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| "Local pickup only" shown on Facebook | `delivery` field empty in DB | INSERT query missing delivery field. Add `delivery, rental_period, includes` to INSERT columns and values. |
| Double phone overlay on images | Using overlaid images as Seedream reference | Change reference to clean originals (no overlay). Seedream reproduces text from reference. |
| Images 1-3 look like different products | Each image generated independently | Use image 1's raw URL as reference for images 2-3 (maintains product consistency). |
| Video doesn't match product | Video uses overlaid image as reference | Use clean product reference or raw image 1 (no overlay) for video generation. |
| Kie.ai video timeout (300s) | Kie API latency or failure | Use static fallback video (`michal_video.mp4`). System already handles this automatically. |
| Missing delivery/$1/mile on FB post | AI description doesn't include delivery text | Enforce in content-generator.js: if MissParty and no "$1/mile", append to description. |
| Customer sees other customer's posts | Missing `WHERE customer_id = $1` filter | ALWAYS filter by customerId in all queries. Add E2E test to verify isolation. |
| GoLogin session expired | Cookies outdated (>30 days) | Auto-refresh session weekly. Add session health check cron. Notify customer to reconnect. |

## Deployment

### RackNerd (172.245.56.50)
```bash
# Deploy FB bot
rsync -avz --exclude node_modules \
  "fb-marketplace-lister/deploy-package/" \
  root@172.245.56.50:/opt/fb-marketplace-bot/

# Restart services
ssh root@172.245.56.50 "pm2 restart webhook-server"
ssh root@172.245.56.50 "pm2 restart fb-scheduler"

# Verify
curl -s http://172.245.56.50:8082/health | jq
```

### Health Checks
```bash
# Webhook server
curl -s http://172.245.56.50:8082/health

# PostgreSQL
ssh root@172.245.56.50 "PGPASSWORD='${POSTGRES_PASSWORD}' psql -U admin -h localhost -d app_db -c 'SELECT COUNT(*) FROM fb_listings WHERE status = '\''queued'\'';'"

# PM2 processes
ssh root@172.245.56.50 "pm2 list"
```

## References

### Level 2 (loaded on demand)
- `references/schema-migration.md` — Multi-tenant schema migration plan
- `references/gologin-automation.md` — Session management, cookie encryption
- `references/kie-image-generation.md` — Seedream 4.5 Edit, Flux 2 Pro patterns

### Other
- NotebookLM cb99e6aa — FB Marketplace, social media, lead gen
- Codebase: `fb-marketplace-lister/deploy-package/`
- `/tmp/saas-gap-analysis.md` — Full SaaS productization analysis (Option A/B/C)
- `platforms/marketplace/PLATFORM_BIBLE.md` — Product specs, features
- `PRODUCT_STATUS.md` §2 — Feature matrix, implementation status
