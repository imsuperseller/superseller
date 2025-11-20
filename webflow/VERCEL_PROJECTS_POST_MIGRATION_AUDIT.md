# 🔍 Vercel Projects Post-Migration Audit

**Date**: November 3, 2025  
**Status**: ⚠️ **CRITICAL AUDIT IN PROGRESS**

---

## 🎯 **CURRENT STATE (Post-Migration)**

### **DNS Migration Completed** (Nov 2, 2025):
- ✅ `rensto.com` → Now points to Vercel (`rensto-site` project)
- ✅ `www.rensto.com` → Now points to Vercel (`rensto-site` project)
- ✅ **RULES UPDATED** (Nov 12, 2025): `.cursorrules` now correctly reflects Vercel architecture

---

## 📊 **ALL VERCEL PROJECTS DISCOVERED**

| Project Name | Domain | Source Directory | Purpose | Status |
|-------------|--------|----------------|---------|--------|
| **rensto-site** | `rensto.com`, `www.rensto.com` | `apps/web/rensto-site/` | Main site + APIs | ✅ Active (POST-MIGRATION) |
| **api-rensto-site** | `api.rensto.com` | `apps/web/rensto-site/` | API endpoints only | ✅ Active |
| **rensto-admin** | `admin.rensto.com` | `apps/web/admin-dashboard/` | Admin dashboard | ✅ Active |
| **rensto-webflow-scripts** | (none) | Separate repo | Checkout scripts CDN | ✅ Active |
| **rensto-tax4us-portal** | `tax4us.rensto.com` | Customer project | Tax4Us customer portal | ✅ Active (CUSTOMER) |
| **rensto-lead-machine** | `leadm.rensto.com` | ? | Lead machine service | ⚠️ Verify |
| **rensto-landing-page** | Vercel URL only | ? | Landing page | ⚠️ Verify |
| **rensto-linkedin-verification** | Vercel URL only | ? | LinkedIn tool | ⚠️ Verify |
| **local-il** | Vercel URL only | ? | Local service | ⚠️ Verify |
| **local-il-lead-portal** | Vercel URL only | ? | Lead portal | ⚠️ Verify |
| **privacy-policy-deploy** | Vercel URL only | ? | Privacy policy | ⚠️ Verify |
| **milly-app-builder** | -- | ? | App builder | ⚠️ Verify |
| **rensto** | -- | ? | Unclear | ❌ **ARCHIVE/DELETE** |

---

## ✅ **ARCHITECTURE STATUS** (Updated Nov 12, 2025)

### **Rules Say (Current - Updated Nov 12, 2025)**:
```
rensto.com          → Vercel (Next.js app - main site, marketplace, subscriptions, all public pages) ✅
api.rensto.com      → Vercel (ALL API endpoints: Stripe, webhooks, etc.) ✅
```

### **Historical (Pre-Migration - Oct 30, 2025)**:
```
rensto.com          → Webflow (main site) ❌ OUTDATED - Migrated Nov 2, 2025
```

### **Reality (Post-Migration)**:
```
rensto.com          → Vercel (rensto-site project) ✅ MIGRATED
www.rensto.com      → Vercel (rensto-site project) ✅ MIGRATED
api.rensto.com      → Vercel (api-rensto-site project) ✅ ACTIVE
```

**Problem**: `rensto-site` has BOTH:
1. Main site pages (marketplace, subscriptions, etc.)
2. API routes (`/api/stripe/checkout`, `/api/stripe/webhook`)

**This means**:
- `rensto.com/api/stripe/checkout` ✅ WORKS
- `api.rensto.com/api/stripe/checkout` ✅ WORKS
- Both serve from same source: `apps/web/rensto-site/src/app/api/`

---

## 🔍 **STRIPE CHECKOUT ISSUE ROOT CAUSE**

**The Problem**: Stripe checkout shows "page not found" despite sessions being created successfully.

**Possible Causes**:
1. ✅ Sessions created successfully (`cs_live_...`)
2. ❌ Stripe rejects checkout page when accessed
3. ⚠️ Domain validation: Stripe might be validating `rensto.com` vs `www.rensto.com` vs `api.rensto.com`

**Evidence**:
- `api.rensto.com/api/stripe/checkout` creates sessions
- `rensto.com/api/stripe/checkout` creates sessions
- Both return same session URLs
- Stripe still shows "page not found"

**Hypothesis**: After migration, Stripe account might need domain re-verification or account-level configuration update.

---

## ✅ **ACTION PLAN**

### **Step 1: Verify Environment Variables**

**Check Both Projects**:
- [ ] `rensto-site` project env vars (for `rensto.com`)
- [ ] `api-rensto-site` project env vars (for `api.rensto.com`)

**Required Vars**:
- `STRIPE_SECRET_KEY` (LIVE: `sk_live_...`)
- `STRIPE_PUBLISHABLE_KEY` (LIVE: `pk_live_...`)
- `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
- `AIRTABLE_API_KEY`

### **Step 2: Verify Stripe Webhook Configuration**

**Current State** (from docs):
- URL: `https://api.rensto.com/stripe/webhook` (missing `/api/`)
- OR: `https://api.rensto.com/api/stripe/webhook` (correct?)

**Action**: Verify actual webhook URL in Stripe Dashboard matches deployed route.

### **Step 3: Decide API Architecture**

**Options**:
1. **Keep Both** (`rensto.com/api/*` AND `api.rensto.com/api/*`)
   - Both work currently
   - Frontend calls relative paths (`/api/stripe/checkout`)
   - Works from `rensto.com`

2. **Consolidate to `api.rensto.com` only**
   - Update frontend to call `https://api.rensto.com/api/stripe/checkout`
   - More consistent with rules

3. **Consolidate to `rensto.com/api/*` only**
   - Simpler (one domain)
   - But breaks rules

**Recommendation**: Option 1 (keep both working) - no breaking changes needed.

### **Step 4: Verify Customer Projects**

**Tax4Us** (Customer):
- ✅ `tax4us.rensto.com` → `rensto-tax4us-portal` project
- Status: Active customer project
- **DO NOT MODIFY** - this is customer work

**Other Projects**:
- Verify which are active vs obsolete
- Archive/delete obsolete projects

---

## 📋 **IMMEDIATE FIX FOR STRIPE CHECKOUT**

**Test Both Domains**:
1. Create session via `rensto.com/api/stripe/checkout` → Get URL → Test
2. Create session via `api.rensto.com/api/stripe/checkout` → Get URL → Test

**If both fail**: Account-level Stripe issue (not code)
**If one works**: Domain/configuration issue

---

## 🎯 **PROJECT RECOMMENDATIONS**

### **Keep Active**:
1. ✅ **rensto-site** → Main site + APIs (rensto.com, www.rensto.com)
2. ✅ **api-rensto-site** → API subdomain (api.rensto.com) - might be redundant now?
3. ✅ **rensto-admin** → Admin dashboard (admin.rensto.com)
4. ✅ **rensto-webflow-scripts** → CDN for scripts
5. ✅ **rensto-tax4us-portal** → Customer project (tax4us.rensto.com)

### **Verify/Archive**:
- ⚠️ **rensto-lead-machine** → Verify if still used
- ⚠️ **rensto-landing-page** → Verify if still used
- ⚠️ **rensto-linkedin-verification** → Verify if still used
- ⚠️ **local-il**, **local-il-lead-portal** → Verify if still used
- ⚠️ **privacy-policy-deploy** → Verify if still used
- ❌ **rensto** → Archive/delete (no domain, unclear purpose)
- ❌ **milly-app-builder** → Verify purpose

---

**Next Steps**: Complete environment variable audit and test checkout from both domains.

