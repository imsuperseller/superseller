# FB Marketplace SaaS - Option C Implementation Plan
## 4-Week Hybrid MVP

**Goal**: Launch SaaS MVP with 3-5 beta customers @ $99-$299/mo.
**Approach**: File-based multi-tenancy (no schema refactor yet), manual onboarding.
**Success**: 3 paying customers, 90% post success rate, positive ROI feedback.

---

## Week 1: Customer Abstraction Layer

### Objective
Add customer abstraction to existing bot without schema refactor. Each customer gets a folder with config files.

### Tasks

#### 1.1 Customer Config Structure
**Create**: `fb marketplace lister/deploy-package/customers/`

**Structure**:
```
customers/
  demo/                          ← Migrate current UAD/MissParty here
    config.json
    schedule.json
    session.json
    references/
      uad/                       ← UAD door images
      missparty/                 ← Bounce house images
  customer-001/
    config.json
    schedule.json
    session.json
    references/
```

**config.json Format**:
```json
{
  "customerId": "demo",
  "businessName": "Demo Customer (UAD + MissParty)",
  "status": "active",
  "products": [
    {
      "productId": "uad",
      "productType": "DOORS",
      "name": "UAD Garage Doors",
      "config": {
        "collections": ["classica", "clopay", "amarr", "chi", "wayne-dalton"],
        "sizes": ["8x7", "9x7", "10x7", "16x7", "16x8", "18x7", "18x8"],
        "designs": ["long_panel", "short_panel"],
        "colors": ["white", "almond", "sandstone", "brown", "gray", "black", "walnut", "desert_tan", "bronze"],
        "constructions": ["steel_insulated", "steel_non_insulated", "aluminum_glass", "wood"],
        "pricing": {
          "8x7": 1800,
          "9x7": 2000,
          "10x7": 2200,
          "16x7": 3400,
          "16x8": 3800,
          "18x7": 4200,
          "18x8": 4600
        },
        "markup": 1.1,
        "priceVariation": 0.05
      },
      "delivery": null,
      "rentalPeriod": null,
      "locations": ["Dallas, TX", "Fort Worth, TX", "Arlington, TX", "..."],
      "phoneNumbers": ["+1-972-954-2407", "+1-469-783-9621", "+1-469-783-9633", "+1-214-810-7074"]
    },
    {
      "productId": "missparty",
      "productType": "BOUNCE_HOUSES",
      "name": "White Bounce House Rental",
      "config": {
        "scenarios": [
          {"setting": "indoors", "kids": "few", "balls": true},
          {"setting": "indoors", "kids": "many", "balls": true},
          {"setting": "outdoors", "kids": "few", "balls": false},
          {"setting": "outdoors", "kids": "many", "balls": true},
          {"setting": "indoors", "kids": "few", "balls": false},
          {"setting": "outdoors", "kids": "many", "balls": false}
        ],
        "pricing": {
          "basePrice": 75,
          "priceVariation": 0
        }
      },
      "delivery": "$1/mile delivery available. Free pickup.",
      "rentalPeriod": "24 hours",
      "locations": ["Dallas, TX", "Richardson, TX", "Garland, TX", "..."],
      "phoneNumbers": ["+1-469-283-9855"]
    }
  ]
}
```

**schedule.json Format**:
```json
{
  "operatingHours": {
    "start": "6am",
    "end": "10pm",
    "timezone": "America/Chicago"
  },
  "cycleInterval": 20,
  "products": {
    "uad": {
      "postLimit": 5,
      "cooldownMinutes": 15
    },
    "missparty": {
      "postLimit": 3,
      "cooldownMinutes": 30
    }
  }
}
```

**session.json Format**:
```json
{
  "profiles": {
    "uad": {
      "profileId": "694b5e53fcacf3fe4b4ff79c",
      "cookies": "<encrypted>",
      "lastVerified": "2026-02-23T22:00:00Z",
      "status": "active"
    },
    "missparty": {
      "profileId": "6949a854f4994b150d430f37",
      "cookies": "<encrypted>",
      "lastVerified": "2026-02-23T22:00:00Z",
      "status": "active"
    }
  }
}
```

#### 1.2 Config Loader Service
**Create**: `fb marketplace lister/deploy-package/config-loader.js`

```javascript
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

// Zod schemas
const ProductConfigSchema = z.object({
  productId: z.string(),
  productType: z.enum(['DOORS', 'BOUNCE_HOUSES', 'FURNITURE']),
  name: z.string(),
  config: z.any(),
  delivery: z.string().nullable(),
  rentalPeriod: z.string().nullable(),
  locations: z.array(z.string()),
  phoneNumbers: z.array(z.string()),
});

const CustomerConfigSchema = z.object({
  customerId: z.string(),
  businessName: z.string(),
  status: z.enum(['active', 'paused', 'suspended']),
  products: z.array(ProductConfigSchema),
});

class ConfigLoader {
  constructor(customersDir = 'customers') {
    this.customersDir = customersDir;
  }

  loadCustomerConfig(customerId) {
    const configPath = path.join(this.customersDir, customerId, 'config.json');
    const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Validate with Zod
    return CustomerConfigSchema.parse(rawConfig);
  }

  loadCustomerSchedule(customerId) {
    const schedulePath = path.join(this.customersDir, customerId, 'schedule.json');
    return JSON.parse(fs.readFileSync(schedulePath, 'utf-8'));
  }

  loadCustomerSession(customerId) {
    const sessionPath = path.join(this.customersDir, customerId, 'session.json');
    return JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
  }

  getAllActiveCustomers() {
    const customers = fs.readdirSync(this.customersDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return customers.filter(customerId => {
      try {
        const config = this.loadCustomerConfig(customerId);
        return config.status === 'active';
      } catch (e) {
        console.error(`[CONFIG] Failed to load ${customerId}: ${e.message}`);
        return false;
      }
    });
  }

  getProductConfig(customerId, productId) {
    const config = this.loadCustomerConfig(customerId);
    const product = config.products.find(p => p.productId === productId);

    if (!product) {
      throw new Error(`Product ${productId} not found for customer ${customerId}`);
    }

    return product;
  }

  getGoLoginProfile(customerId, productId) {
    const session = this.loadCustomerSession(customerId);
    return session.profiles[productId];
  }
}

module.exports = { ConfigLoader };
```

#### 1.3 Migrate Current Setup
**Tasks**:
1. Create `customers/demo/` folder
2. Move UAD config from `product-configs.js` → `customers/demo/config.json`
3. Move MissParty config → same file
4. Move schedules from `bot-config.json` → `customers/demo/schedule.json`
5. Create `customers/demo/session.json` with current GoLogin profiles
6. Copy reference images to `customers/demo/references/`

#### 1.4 Update Webhook Server
**Modify**: `webhook-server.js`

```javascript
const { ConfigLoader } = require('./config-loader');
const configLoader = new ConfigLoader();

// OLD: const product = CONFIG.products.find(p => p.id === clientId);
// NEW:
const [customerId, productId] = clientId.split(':'); // Format: "demo:uad"
const productConfig = configLoader.getProductConfig(customerId, productId);
```

**Update Routes**:
- OLD: `/webhook/v1-uad-jobs`
- NEW: `/webhook/v2/:customerId/:productId/jobs`

Example: `/webhook/v2/demo/uad/jobs`

#### 1.5 Update Scheduler
**Modify**: `scheduler.js`

```javascript
const { ConfigLoader } = require('./config-loader');
const configLoader = new ConfigLoader();

async function runScheduler() {
  const customers = configLoader.getAllActiveCustomers();

  for (const customerId of customers) {
    const config = configLoader.loadCustomerConfig(customerId);
    const schedule = configLoader.loadCustomerSchedule(customerId);

    console.log(`[SCHEDULER] Processing customer: ${customerId} (${config.products.length} products)`);

    for (const product of config.products) {
      const productSchedule = schedule.products[product.productId];

      for (let i = 0; i < productSchedule.postLimit; i++) {
        const exitCode = await runBot(customerId, product.productId);
        console.log(`[${product.productId.toUpperCase()}] Post ${i + 1}/${productSchedule.postLimit} — exit code: ${exitCode}`);

        if (i < productSchedule.postLimit - 1) {
          await delay(productSchedule.cooldownMinutes * 60 * 1000);
        }
      }
    }

    await delay(2 * 60 * 1000); // 2min cooldown between customers
  }
}

// Run every 20 minutes
setInterval(runScheduler, 20 * 60 * 1000);
```

#### 1.6 Testing
- [ ] Verify demo customer loads correctly
- [ ] Verify UAD posts still work
- [ ] Verify MissParty posts still work
- [ ] Add test customer (customer-test) with 1 product
- [ ] Verify scheduler loops through both customers
- [ ] Verify customer isolation (no cross-customer data)

### Deliverables (Week 1)
- ✅ `customers/` folder structure
- ✅ `config-loader.js` with Zod validation
- ✅ Migrated demo customer (UAD + MissParty)
- ✅ Updated webhook-server.js (v2 routes)
- ✅ Updated scheduler.js (multi-customer loop)
- ✅ Deployed to RackNerd
- ✅ E2E test with 2 customers

---

## Week 2: Customer Portal

### Objective
Web UI for customers to manage products, view posts, and connect Facebook sessions.

### Tasks

#### 2.1 Database Schema (Minimal)
**Add to**: `apps/web/superseller-site/prisma/schema.prisma`

```prisma
model MarketplaceCustomer {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  businessName String
  status       MarketplaceCustomerStatus @default(ACTIVE)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("marketplace_customers")
}

enum MarketplaceCustomerStatus {
  ACTIVE
  PAUSED
  SUSPENDED
}
```

**Note**: Products and posts stay in file system for MVP. Only customer record in DB.

#### 2.2 API Routes
**Create**: `apps/web/superseller-site/src/app/api/marketplace/`

**Routes**:
1. `GET /api/marketplace/status` — Customer status, active products count
2. `POST /api/marketplace/products` — Add product (creates config file on RackNerd)
3. `GET /api/marketplace/products` — List products from config file
4. `PATCH /api/marketplace/products/:productId` — Update product
5. `DELETE /api/marketplace/products/:productId` — Remove product
6. `GET /api/marketplace/posts` — List posts from PostgreSQL fb_listings
7. `POST /api/marketplace/session/upload` — Upload GoLogin cookies JSON

**Implementation**:
```typescript
// apps/web/superseller-site/src/app/api/marketplace/products/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { productType, name, config, delivery, rentalPeriod, locations, phoneNumbers } = body;

  // Get customer ID from DB
  const customer = await prisma.marketplaceCustomer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) {
    return NextResponse.json({ error: 'Not a marketplace customer' }, { status: 404 });
  }

  // SSH to RackNerd and update config file
  const productId = name.toLowerCase().replace(/\s+/g, '-');
  const newProduct = {
    productId,
    productType,
    name,
    config,
    delivery,
    rentalPeriod,
    locations,
    phoneNumbers,
  };

  const sshCommand = `ssh root@172.245.56.50 "cd /opt/fb-marketplace-bot/customers/${customer.id} && node add-product.js '${JSON.stringify(newProduct)}'"`;

  await execAsync(sshCommand);

  return NextResponse.json({ success: true, productId });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customer = await prisma.marketplaceCustomer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) {
    return NextResponse.json({ error: 'Not a marketplace customer' }, { status: 404 });
  }

  // SSH to RackNerd and read config file
  const sshCommand = `ssh root@172.245.56.50 "cat /opt/fb-marketplace-bot/customers/${customer.id}/config.json"`;
  const { stdout } = await execAsync(sshCommand);
  const config = JSON.parse(stdout);

  return NextResponse.json({ products: config.products });
}
```

#### 2.3 Customer Portal UI
**Create**: `apps/web/superseller-site/src/app/(main)/dashboard/marketplace/page.tsx`

**Sections**:
1. **Product List**
   - Card per product: name, type, status, posts today
   - Add product button → opens modal
   - Edit/pause/delete buttons

2. **Post History**
   - Table: date, product, title, price, Facebook link, status
   - Calendar view toggle
   - Filter by product, date range

3. **Facebook Session**
   - Status indicator: connected/disconnected
   - Last verified timestamp
   - "Upload Cookies" button → opens file upload modal

**Add Product Modal**:
```tsx
<Dialog>
  <DialogContent>
    <h2>Add Product</h2>
    <form onSubmit={handleAddProduct}>
      <Select name="productType">
        <option value="DOORS">Garage Doors</option>
        <option value="BOUNCE_HOUSES">Bounce Houses</option>
        <option value="FURNITURE">Furniture</option>
      </Select>

      <Input name="name" placeholder="Product Name" />

      <Textarea name="delivery" placeholder="Delivery info (optional)" />
      <Input name="rentalPeriod" placeholder="e.g., 24 hours" />

      <h3>Locations (comma-separated)</h3>
      <Textarea name="locations" placeholder="Dallas, TX, Fort Worth, TX, ..." />

      <h3>Phone Numbers (comma-separated)</h3>
      <Input name="phoneNumbers" placeholder="+1-555-..., +1-555-..." />

      <h3>Product Config (JSON)</h3>
      <Textarea name="config" placeholder='{"pricing": {...}, ...}' />

      <Button type="submit">Add Product</Button>
    </form>
  </DialogContent>
</Dialog>
```

#### 2.4 Helper Scripts (RackNerd)
**Create**: `fb marketplace lister/deploy-package/scripts/add-product.js`

```javascript
const fs = require('fs');
const path = require('path');

const [customerId, productJson] = process.argv.slice(2);
const newProduct = JSON.parse(productJson);

const configPath = path.join(__dirname, '../customers', customerId, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

config.products.push(newProduct);

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`Added product ${newProduct.productId} for customer ${customerId}`);
```

#### 2.5 Testing
- [ ] Sign up test user
- [ ] Create marketplace customer record
- [ ] Add product via UI
- [ ] Verify config file updated on RackNerd
- [ ] View posts in portal
- [ ] Upload GoLogin cookies JSON
- [ ] Verify session works for next post

### Deliverables (Week 2)
- ✅ `MarketplaceCustomer` table
- ✅ 7 marketplace API routes
- ✅ Customer portal UI (products, posts, session)
- ✅ Add/edit/delete product flows
- ✅ Session cookie upload
- ✅ Deployed to Vercel

---

## Week 3: Billing Integration

### Objective
Stripe subscriptions with post limits. Reuse TourReel credit system foundation.

### Tasks

#### 3.1 Subscription Tiers
**Add to**: `apps/web/superseller-site/src/lib/stripe/products.ts`

```typescript
export const MARKETPLACE_PRODUCTS = {
  starter: {
    name: 'Marketplace Starter',
    priceId: 'price_starter_99',
    amount: 9900, // $99.00
    interval: 'month',
    postLimit: 100,
    productLimit: 1,
  },
  pro: {
    name: 'Marketplace Pro',
    priceId: 'price_pro_299',
    amount: 29900, // $299.00
    interval: 'month',
    postLimit: 500,
    productLimit: 3,
  },
  enterprise: {
    name: 'Marketplace Enterprise',
    priceId: 'price_enterprise_999',
    amount: 99900, // $999.00
    interval: 'month',
    postLimit: -1, // unlimited
    productLimit: -1,
  },
};
```

#### 3.2 Usage Tracking
**Add to**: `MarketplaceCustomer` schema

```prisma
model MarketplaceCustomer {
  // ...existing fields
  subscriptionTier String? // starter, pro, enterprise
  postLimit       Int     @default(100)
  postsThisMonth  Int     @default(0)
  resetDate       DateTime?
}
```

**Webhook Update** (webhook-server.js):
```javascript
// After successful post
await updateCustomerUsage(customerId, {
  postsThisMonth: { increment: 1 },
});

// Check limit before posting
const customer = await getCustomer(customerId);
if (customer.postsThisMonth >= customer.postLimit) {
  return { error: 'Post limit reached for this month' };
}
```

#### 3.3 Checkout Flow
**Create**: `apps/web/superseller-site/src/app/(main)/marketplace/pricing/page.tsx`

**Pricing Cards**:
- Starter: $99/mo, 100 posts, 1 product
- Pro: $299/mo, 500 posts, 3 products
- Enterprise: $999/mo, unlimited

**Subscribe Button** → Stripe Checkout

#### 3.4 Webhook Handler
**Update**: `apps/web/superseller-site/src/app/api/webhooks/stripe/route.ts`

Handle `customer.subscription.created`:
```typescript
case 'customer.subscription.created':
  const subscription = event.data.object;
  const priceId = subscription.items.data[0].price.id;

  const tier = Object.entries(MARKETPLACE_PRODUCTS)
    .find(([_, product]) => product.priceId === priceId)?.[0];

  await prisma.marketplaceCustomer.update({
    where: { userId: subscription.metadata.userId },
    data: {
      subscriptionTier: tier,
      postLimit: MARKETPLACE_PRODUCTS[tier].postLimit,
      postsThisMonth: 0,
      resetDate: new Date(subscription.current_period_end * 1000),
    },
  });
  break;
```

#### 3.5 Testing
- [ ] Subscribe to Starter tier (test mode)
- [ ] Verify postLimit set to 100
- [ ] Post 100 listings
- [ ] Verify 101st post blocked
- [ ] Upgrade to Pro
- [ ] Verify postLimit updated to 500
- [ ] Cancel subscription
- [ ] Verify posting paused

### Deliverables (Week 3)
- ✅ 3 Stripe products configured
- ✅ Pricing page
- ✅ Usage tracking (postsThisMonth)
- ✅ Post limit enforcement
- ✅ Subscription webhooks
- ✅ Deployed to production

---

## Week 4: Admin Dashboard + Polish

### Objective
Admin tools for monitoring customers, support, and system health.

### Tasks

#### 4.1 Admin Routes
**Create**: `apps/web/superseller-site/src/app/api/admin/marketplace/`

1. `GET /api/admin/marketplace/customers` — List all customers
2. `GET /api/admin/marketplace/customers/:id` — Customer details
3. `PATCH /api/admin/marketplace/customers/:id/status` — Pause/resume customer
4. `POST /api/admin/marketplace/customers/:id/reset-session` — Reset FB session
5. `GET /api/admin/marketplace/stats` — System stats (total customers, posts today, queue depth)

#### 4.2 Admin Dashboard UI
**Create**: `apps/web/superseller-site/src/app/(admin)/marketplace/page.tsx`

**Sections**:
1. **Overview**
   - Total customers (active/paused/suspended)
   - Posts today/week/month
   - Revenue MRR
   - System health (worker status, queue depth)

2. **Customer List**
   - Table: name, tier, products, posts today, status, actions
   - Search/filter by status, tier
   - Actions: view details, pause, reset session

3. **Customer Detail Page**
   - Products: list with configs
   - Posts: history with Facebook links
   - Session: status, last verified, cookies
   - Billing: tier, usage, limit
   - Support actions: regenerate listings, reset session, pause

#### 4.3 System Health Monitor
**Create**: `fb marketplace lister/deploy-package/health-monitor.js`

```javascript
setInterval(async () => {
  const health = {
    timestamp: new Date().toISOString(),
    workers: {
      webhookServer: await checkProcessStatus('webhook-server'),
      scheduler: await checkProcessStatus('fb-scheduler'),
    },
    queue: {
      uad: await getQueueCount('demo', 'uad'),
      missparty: await getQueueCount('demo', 'missparty'),
    },
    database: {
      postsToday: await getPostsToday(),
      errorRate: await getErrorRate(),
    },
  };

  // Send to admin API
  await fetch('https://superseller.agency/api/admin/marketplace/health', {
    method: 'POST',
    body: JSON.stringify(health),
  });
}, 5 * 60 * 1000); // Every 5 minutes
```

#### 4.4 Customer Notifications
**Email Templates**:
1. Welcome email (after signup)
2. First post success
3. Post limit reached (90% and 100%)
4. Session expired (needs reconnection)
5. Subscription renewed/canceled

**Send via**: Resend, SendGrid, or Postmark

#### 4.5 Documentation
**Create**: `platforms/marketplace/CUSTOMER_ONBOARDING.md`

**Sections**:
1. How to add your first product
2. How to connect Facebook (GoLogin guide)
3. How to upload cookies
4. How to manage products
5. How to view post performance
6. Billing FAQs
7. Support contact

#### 4.6 Testing
- [ ] Admin dashboard loads all customers
- [ ] View customer details
- [ ] Pause customer → verify posting stops
- [ ] Resume customer → verify posting resumes
- [ ] Reset session → verify new cookies work
- [ ] System health monitor updates every 5min
- [ ] Email notifications send correctly

### Deliverables (Week 4)
- ✅ Admin dashboard UI
- ✅ 5 admin API routes
- ✅ System health monitoring
- ✅ Customer notifications (5 templates)
- ✅ Onboarding documentation
- ✅ Deployed to production

---

## Launch Checklist

### Pre-Launch
- [ ] All Week 1-4 deliverables completed
- [ ] E2E tests passing
- [ ] Admin dashboard functional
- [ ] Customer portal functional
- [ ] Billing integration tested (test mode)
- [ ] Documentation complete
- [ ] RackNerd worker stable (99% uptime last 7 days)
- [ ] Health monitoring active

### Beta Launch
- [ ] Switch Stripe to live mode
- [ ] Onboard 3-5 beta customers manually
- [ ] Monitor first 100 posts per customer
- [ ] Collect feedback (survey)
- [ ] Fix critical bugs within 24h
- [ ] Weekly check-ins with beta customers

### Success Metrics (30 days)
- [ ] 3+ paying customers
- [ ] $300-$900 MRR
- [ ] 90%+ posting success rate
- [ ] <5% error rate
- [ ] <5% churn
- [ ] Positive NPS (Net Promoter Score)

### Next Phase Decision
**If MVP succeeds** → Proceed with Option A (6-8 week full multi-tenant refactor)
**If MVP fails** → Pivot or improve based on customer feedback

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Manual onboarding bottleneck** | Limit to 5 beta customers max. Document process thoroughly. |
| **GoLogin session expires** | Auto-refresh weekly. Email customer if refresh fails. |
| **Customer hits post limit mid-month** | Email at 90% usage. Offer easy upgrade. |
| **File-based config doesn't scale** | Acceptable for 5 customers. Refactor to DB in Option A. |
| **Facebook blocks customer** | Clear in TOS: not responsible for FB bans. Guide on best practices. |
| **Worker crashes** | PM2 auto-restart. Health monitor alerts admin. |
| **Kie.ai costs spike** | Monitor daily spend. Cap at $50/day initially. |

---

## Cost Estimates

### Development (4 weeks)
- Developer time: 160 hours @ $100/hr = $16,000
- Or: 1 FTE for 1 month

### Operational (per month)
- RackNerd VPS: $50/mo
- Kie.ai API (500 posts/mo): 500 * 3 images * $0.02 = $30/mo
- Stripe fees (3 customers @ $299): ~$30/mo
- Total: ~$110/mo

### Break-Even
- 3 customers @ $99/mo = $297 MRR
- Break-even: Month 1 (covers operational costs)
- ROI: 6 months (if $16k dev cost, $297 MRR = 54 months to ROI from MRR alone)

**Note**: Dev cost one-time. If successful, scale to 20+ customers = $6k+ MRR = ROI in 3 months.

---

## Next Steps After Week 4

1. **Launch beta** with 3-5 customers
2. **Monitor for 30 days**
3. **Collect feedback**
4. **Evaluate success metrics**
5. **Decide**:
   - ✅ Success → Option A (full refactor for scale)
   - ❌ Fail → Pivot or shut down
   - 🔄 Mixed → Iterate MVP for another month
