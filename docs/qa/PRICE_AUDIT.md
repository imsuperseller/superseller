# 💰 Price & Stripe Alignment Audit

**Created**: January 4, 2026
**Status**: Needs Stripe Dashboard Verification

---

## Core Products (One-Time)

| Product | Code Price | Stripe Env Var | Status |
| :--- | :--- | :--- | :--- |
| Automation Audit | $497 | `NEXT_PUBLIC_STRIPE_LINK_AUDIT` | ⚠️ Verify |
| The Lead Machine | $997 | `NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE` | ⚠️ Verify |
| Autonomous Secretary | $497 | `NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE` | ⚠️ Shared link? |
| Knowledge Engine | $1,497 | `NEXT_PUBLIC_STRIPE_LINK_SPRINT` | ⚠️ Wrong name? |
| The Content Engine | $1,497 | `NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER` | ⚠️ Verify |
| Full Ecosystem | $5,497 | `NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM` | ⚠️ Verify |

---

## Care Plans (Monthly Subscriptions)

| Plan | Code Price | Stripe Env Var | Status |
| :--- | :--- | :--- | :--- |
| Starter Care | $497/mo | `NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER` | ⚠️ Verify |
| Growth Care | $997/mo | `NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH` | ⚠️ Verify |
| Scale Care | $2,497/mo | `NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE` | ⚠️ Verify |

---

## Marketplace Products

| Category | Price Range | Source |
| :--- | :--- | :--- |
| Templates | $147 - $497 | `/marketplace/page.tsx` |
| Install Price | $797 (default) | `/marketplace/[id]/page.tsx` |
| Custom Price | $1,497 (default) | `/marketplace/[id]/page.tsx` |

---

## Other Pricing Found

| Page | Product | Price |
| :--- | :--- | :--- |
| `/whatsapp` | WhatsApp Agent | $249/mo |
| `/whatsapp` | Extra Numbers | $149/mo + $99 setup |
| `/whatsapp` | OpenAI Key Add-on | $20/mo |
| `/subscriptions` | Lead Volume Low | $199 |
| `/subscriptions` | Lead Volume Medium | $499 |
| `/subscriptions` | Lead Volume High | $999 |
| `/subscriptions` | Lead Volume Enterprise | $1,999 |
| `/components/seo/Schema.tsx` | Schema pricing | $497, $997, $2,497 |
| `/components/admin/RevenueMetrics.tsx` | Display tiers | $97, $297, $997/mo |

---

## ⚠️ Potential Issues Found

### 1. Shared Payment Links
- `Autonomous Secretary` uses same link as `Lead Machine` (`LEAD_INTAKE`)
- Should have separate link?

### 2. Misnamed Links
- `Knowledge Engine` uses `STRIPE_LINK_SPRINT` - naming mismatch

### 3. Schema.org Pricing Mismatch
- Schema shows: $497, $997, $2,497
- Actual Core Products: $497, $997, $1,497, $5,497
- **Needs update**

### 4. Admin Dashboard Mock Data
- Shows $97, $297, $997/mo - are these real tiers?

---

## Action Items

1. [ ] **Verify Stripe Dashboard** - Check all payment links exist and prices match
2. [ ] **Fix Schema.org** - Update `/components/seo/Schema.tsx` with correct prices
3. [ ] **Create separate links** - Secretary should have own Stripe link
4. [ ] **Rename env vars** - `SPRINT` → `KNOWLEDGE_ENGINE` for clarity
5. [ ] **Update PRODUCTS.md** - Ensure Bible reflects all prices

---

## Stripe Link Mapping

From `/app/offers/page.tsx`:
```typescript
const links = {
  'Automation Audit': env.NEXT_PUBLIC_STRIPE_LINK_AUDIT,
  'The Lead Machine': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
  'The Content Engine': env.NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER,
  'Autonomous Secretary': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE, // Shared!
  'Knowledge Engine': env.NEXT_PUBLIC_STRIPE_LINK_SPRINT,
  'Full Ecosystem': env.NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM,
  'Starter Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER,
  'Growth Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH,
  'Scale Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE,
};
```

---

## Dynamic Pricing (Custom Products)

The `/api/checkout/route.ts` supports dynamic pricing via:
- `customAmount` parameter
- Used for `/custom` page and marketplace customization

**Requires verification**: Does Stripe handle custom amounts correctly?
