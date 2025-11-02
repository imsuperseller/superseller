# 🔍 Vercel Projects Audit - Conflict Analysis

**Date**: October 30, 2025
**Purpose**: Identify conflicting, redundant, or misconfigured Vercel projects

---

## 🎯 **Expected Architecture** (From .cursorrules)

```
rensto.com          → Webflow (main site, marketplace, subscriptions, all public pages)
admin.rensto.com    → Vercel (admin dashboard only)
api.rensto.com      → Vercel (ALL API endpoints: Stripe, webhooks, etc.)
portal.rensto.com   → Vercel (customer portals - planned)
```

### **Expected Vercel Projects**:
1. ✅ **admin-dashboard** → `admin.rensto.com`
2. ✅ **api-rensto-site** (or **rensto-api**) → `api.rensto.com`
3. ✅ **rensto-webflow-scripts** → CDN for checkout scripts (no domain)
4. ⏳ **customer-portal** → `portal.rensto.com` (planned)

---

## 🔍 **Discovered Projects** (From Audit)

### **1. rensto-main-website** ⚠️ **POTENTIAL CONFLICT**
- **Status**: Found in Phase 2.5 audit
- **Project ID**: `prj_fUvGuAspkux9ibr21gLDjK5FOnTp`
- **Org ID**: `team_a1gxSHNFg8Pp7qxoUN69QkVl`
- **Expected**: ❌ **SHOULD NOT EXIST** - rensto.com must point to Webflow
- **Issue**: If this project has rensto.com domain assigned, it conflicts with Webflow
- **Action**: ⚠️ **VERIFY** - Check if domain assigned; remove if present

### **2. api-rensto-site** ✅ **CORRECT**
- **Status**: Recently created (Oct 29-30, 2025)
- **Domain**: `api.rensto.com`
- **Source**: `apps/web/rensto-site/` (API routes only)
- **GitHub**: Connected to `imsuperseller/rensto` (13h ago)
- **Root Directory**: Should be `apps/web/rensto-site`
- **Purpose**: Stripe checkout API, webhooks, Webflow OAuth
- **Status**: ✅ **CORRECT SETUP**

### **3. rensto-webflow-scripts** ✅ **CORRECT**
- **Status**: Active, auto-deploying
- **Domain**: None (CDN only)
- **URL**: `https://rensto-webflow-scripts.vercel.app`
- **Source**: Separate repo `imsuperseller/rensto-webflow-scripts`
- **Purpose**: Host checkout JavaScript files for Webflow pages
- **Status**: ✅ **CORRECT SETUP** (separate repo is intentional)

### **4. admin-dashboard** ✅ **EXPECTED**
- **Status**: Should exist
- **Domain**: `admin.rensto.com`
- **Source**: `apps/web/admin-dashboard/`
- **Status**: ⚠️ **VERIFY** - Confirm existence and domain assignment

### **5. customer-portal** ⏳ **PLANNED**
- **Status**: Planned (not yet deployed)
- **Domain**: `portal.rensto.com`
- **Source**: `live-systems/customer-portal/`
- **Status**: ✅ **NOT YET CREATED** (by design)

---

## 🚨 **CONFLICT ANALYSIS**

### **Critical Issue #1: rensto-main-website**
**Problem**: This project name suggests it might be serving rensto.com
**Risk**: If domain assigned to Vercel instead of Webflow, breaks architecture
**Action Required**:
1. Check Vercel dashboard for this project
2. Verify if rensto.com or www.rensto.com is assigned
3. If assigned: **REMOVE DOMAIN** from Vercel project
4. Confirm DNS points to Webflow (not Vercel)

### **Potential Issue #2: Duplicate API Projects**
**Check**: Are there multiple projects trying to serve api.rensto.com?
- `api-rensto-site` ✅ (correct)
- `rensto-api` ⚠️ (might be duplicate)
**Action**: Verify only ONE project has api.rensto.com assigned

---

## 📋 **AUDIT CHECKLIST**

### **Step 1: List All Vercel Projects**
- [ ] Open Vercel dashboard
- [ ] List all projects in team
- [ ] Document project names, IDs, and domains

### **Step 2: Verify Domain Assignments**
For each project, check:
- [ ] Which domains are assigned?
- [ ] Do domain assignments match architecture?
- [ ] Are there conflicting assignments?

### **Step 3: Check GitHub Connections**
- [ ] Which projects are connected to which repos?
- [ ] Are root directories correct?
- [ ] Are auto-deploy settings correct?

### **Step 4: Verify Deployments**
- [ ] Which projects are actively deploying?
- [ ] Are there failed deployments?
- [ ] Are deployments going to wrong projects?

---

## 🔧 **ACTION ITEMS**

### **Immediate**:
1. ⚠️ **VERIFY** `rensto-main-website` project:
   - Check if rensto.com domain assigned
   - If yes: Remove domain immediately
   - If no: Document purpose or archive

2. ✅ **CONFIRM** `api-rensto-site`:
   - Domain: api.rensto.com ✅
   - Root: apps/web/rensto-site ✅
   - GitHub: Connected ✅

3. ✅ **VERIFY** `rensto-webflow-scripts`:
   - No domain assignment ✅
   - CDN serving correctly ✅
   - Auto-deploy working ✅

4. ⚠️ **CHECK** `admin-dashboard`:
   - Exists?
   - Domain: admin.rensto.com?
   - Active?

### **Next Steps**:
- [ ] Document all Vercel projects in CLAUDE.md
- [ ] Remove/archive conflicting projects
- [ ] Update deployment workflows if needed
- [ ] Ensure GitHub Actions point to correct projects

---

## 📊 **EXPECTED PROJECT MATRIX**

| Project Name | Domain | Source | Repo | Status |
|-------------|--------|--------|------|--------|
| **api-rensto-site** | api.rensto.com | apps/web/rensto-site | imsuperseller/rensto | ✅ Active |
| **rensto-webflow-scripts** | (none) | root | imsuperseller/rensto-webflow-scripts | ✅ Active |
| **admin-dashboard** | admin.rensto.com | apps/web/admin-dashboard | imsuperseller/rensto | ⚠️ Verify |
| **rensto-main-website** | (none/should be removed) | ? | ? | ❌ **CONFLICT** |
| **customer-portal** | portal.rensto.com | live-systems/customer-portal | imsuperseller/rensto | ⏳ Planned |

---

## 🎯 **RECOMMENDATIONS**

1. **Archive or Delete** `rensto-main-website` if it's not serving a purpose
2. **Verify** no project has rensto.com domain (should be Webflow only)
3. **Consolidate** if duplicate API projects exist
4. **Document** all active projects in CLAUDE.md
5. **Update** GitHub Actions to reference correct project IDs

---

**Next**: Access Vercel dashboard to complete audit...

