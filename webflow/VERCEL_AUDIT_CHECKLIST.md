# 🔍 Vercel Projects Audit Checklist

**Date**: October 30, 2025
**Goal**: Identify all Vercel projects, verify domain assignments, find conflicts

---

## 📋 **Step-by-Step Audit Process**

### **Step 1: Access Vercel Dashboard**

1. Go to: https://vercel.com/dashboard
2. Navigate to your team: `shais-projects-f9b9e359` (or your team name)
3. List ALL projects in the team

---

## 🎯 **Expected Projects** (From Architecture)

| Project Name | Expected Domain | Source Directory | Purpose | Status |
|-------------|----------------|-----------------|---------|--------|
| **api-rensto-site** | api.rensto.com | `apps/web/rensto-site` | Stripe API, webhooks | ✅ Should exist |
| **rensto-webflow-scripts** | (none) | Separate repo | Checkout scripts CDN | ✅ Should exist |
| **admin-dashboard** | admin.rensto.com | `apps/web/admin-dashboard` | Admin portal | ⚠️ Verify |
| **rensto-main-website** | **NONE** | ❌ Should not exist | ❌ CONFLICT | ❌ **DELETE** |

---

## 🚨 **CRITICAL: Check for Conflicts**

### **Check #1: rensto-main-website**

**Action**: Open project → Settings → Domains
**Verify**:
- [ ] Does it have `rensto.com` assigned? ❌ **REMOVE IMMEDIATELY**
- [ ] Does it have `www.rensto.com` assigned? ❌ **REMOVE IMMEDIATELY**
- [ ] Does it have NO domains? ✅ **SAFE - can archive**
- [ ] What's the purpose? Document or delete

**If domains found**: 
1. Remove domains from project
2. Verify DNS still points to Webflow
3. Archive or delete project

---

### **Check #2: api-rensto-site**

**Action**: Open project → Settings → Domains
**Verify**:
- [ ] Domain: `api.rensto.com` ✅ **CORRECT**
- [ ] Root Directory: `apps/web/rensto-site` ✅ **CORRECT**
- [ ] GitHub Repo: `imsuperseller/rensto` ✅ **CORRECT**
- [ ] Latest deployment: Recent ✅

**If incorrect**:
- Update root directory to `apps/web/rensto-site`
- Verify GitHub connection
- Re-deploy if needed

---

### **Check #3: rensto-webflow-scripts**

**Action**: Open project → Settings → Domains
**Verify**:
- [ ] NO domains assigned ✅ **CORRECT** (CDN only)
- [ ] GitHub Repo: `imsuperseller/rensto-webflow-scripts` ✅
- [ ] Latest deployment: Recent ✅
- [ ] CDN URL working: `https://rensto-webflow-scripts.vercel.app` ✅

**If domains found**:
- Remove any domain assignments (should be CDN only)

---

### **Check #4: admin-dashboard**

**Action**: Find project → Settings → Domains
**Verify**:
- [ ] Project exists? ⚠️ **VERIFY**
- [ ] Domain: `admin.rensto.com` ✅ **EXPECTED**
- [ ] Root Directory: `apps/web/admin-dashboard` ✅ **EXPECTED**
- [ ] GitHub Repo: `imsuperseller/rensto` ✅ **EXPECTED**

**If missing**:
- Create project pointing to `apps/web/admin-dashboard`
- Assign domain `admin.rensto.com`
- Connect to GitHub repo

---

### **Check #5: Duplicate Projects**

**Look for**:
- Multiple projects trying to serve `api.rensto.com`
- Multiple projects for same source directory
- Old/archived projects with conflicting names

**Action**:
- [ ] List all projects with "rensto" in name
- [ ] Identify duplicates
- [ ] Archive or delete redundant ones

---

## 📊 **Audit Results Template**

Copy this and fill in:

```
PROJECT AUDIT RESULTS - [DATE]

1. api-rensto-site
   - Domain: [api.rensto.com / OTHER / NONE]
   - Root: [apps/web/rensto-site / OTHER]
   - GitHub: [Connected / Not Connected]
   - Status: [✅ CORRECT / ⚠️ NEEDS FIX / ❌ CONFLICT]
   - Action: [NONE / FIX / DELETE]

2. rensto-webflow-scripts
   - Domain: [NONE / OTHER]
   - Root: [root / OTHER]
   - GitHub: [Connected / Not Connected]
   - Status: [✅ CORRECT / ⚠️ NEEDS FIX]
   - Action: [NONE / FIX]

3. admin-dashboard
   - Domain: [admin.rensto.com / OTHER / NONE]
   - Root: [apps/web/admin-dashboard / OTHER]
   - GitHub: [Connected / Not Connected]
   - Status: [✅ CORRECT / ⚠️ NEEDS FIX / ❌ MISSING]
   - Action: [NONE / FIX / CREATE]

4. rensto-main-website
   - Domain: [NONE / rensto.com / www.rensto.com / OTHER]
   - Root: [?]
   - GitHub: [?]
   - Status: [❌ CONFLICT / ⚠️ REDUNDANT / ✅ SAFE TO DELETE]
   - Action: [DELETE / ARCHIVE / REMOVE DOMAIN]

5. [Other Projects]
   - [Document any other rensto-related projects]
```

---

## 🔧 **Actions Based on Findings**

### **If rensto-main-website has rensto.com domain**:
1. ⚠️ **CRITICAL**: Remove domain immediately
2. Verify DNS still points to Webflow
3. Archive or delete project

### **If multiple API projects exist**:
1. Identify which one serves api.rensto.com
2. Archive other duplicate projects
3. Update GitHub Actions if needed

### **If admin-dashboard missing**:
1. Create new project
2. Connect to `apps/web/admin-dashboard`
3. Assign `admin.rensto.com` domain

### **If projects have wrong root directories**:
1. Update root directory in project settings
2. Re-deploy project
3. Verify deployment works

---

## ✅ **Success Criteria**

After audit:
- [ ] Only ONE project serves api.rensto.com
- [ ] NO project has rensto.com or www.rensto.com assigned
- [ ] rensto-webflow-scripts has NO domains (CDN only)
- [ ] admin-dashboard exists and serves admin.rensto.com
- [ ] All redundant/conflicting projects archived or deleted
- [ ] All projects documented in CLAUDE.md

---

## 📝 **Documentation Update**

After completing audit:
1. Update `CLAUDE.md` with verified project list
2. Update `.cursorrules` if architecture changes
3. Update GitHub Actions if project IDs change
4. Document any project deletions/archivals

---

**Next**: Complete audit in Vercel dashboard, then report findings...

