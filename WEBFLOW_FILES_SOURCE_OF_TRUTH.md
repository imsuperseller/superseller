# 📁 WEBFLOW FILES - SINGLE SOURCE OF TRUTH

**Date**: October 5, 2025
**Status**: ✅ Cleaned up, duplicates archived

---

## ✅ **SOURCE OF TRUTH: 27 Files at ROOT**

**Location**: `/Users/shaifriedman/New Rensto/rensto/`

**All files named**: `WEBFLOW_EMBED_*.html`

These 27 files are the ONLY HTML files you should use for Webflow deployment.

---

## 📊 **THE 27 FILES**:

### **✅ UPDATED TODAY (Oct 5, 2025) - WITH STRIPE INTEGRATION**:
1. `WEBFLOW_EMBED_MARKETPLACE_CVJ.html` (55KB, v2.0)
   - 6 Stripe checkout buttons integrated
   - DIY: $29, $97, $197
   - Install: $797, $1,997, $3,500+

2. `WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html` (43KB, v2.0)
   - 3 Stripe checkout buttons integrated
   - Starter: $299/mo, Professional: $599/mo, Enterprise: $1,499/mo

### **🔧 NOT YET UPDATED (Oct 3, 2025) - NO STRIPE YET**:
3. `WEBFLOW_EMBED_CUSTOM_SOLUTIONS_CVJ.html`
4. `WEBFLOW_EMBED_READY_SOLUTIONS_CVJ.html`
5. `WEBFLOW_EMBED_ABOUT.html`
6. `WEBFLOW_EMBED_PRICING.html`
7. `WEBFLOW_EMBED_HELP_CENTER.html`

### **📄 NICHE PAGES (Oct 3, 2025) - CVJ OPTIMIZED**:
8. `WEBFLOW_EMBED_AMAZON-SELLER.html`
9. `WEBFLOW_EMBED_BOOKKEEPING.html`
10. `WEBFLOW_EMBED_BUSY-MOM.html`
11. `WEBFLOW_EMBED_DENTIST.html`
12. `WEBFLOW_EMBED_ECOMMERCE.html`
13. `WEBFLOW_EMBED_FENCE-CONTRACTOR.html`
14. `WEBFLOW_EMBED_HVAC.html`
15. `WEBFLOW_EMBED_INSURANCE.html`
16. `WEBFLOW_EMBED_LAWYER.html`
17. `WEBFLOW_EMBED_LOCKSMITH.html`
18. `WEBFLOW_EMBED_PHOTOGRAPHER.html`
19. `WEBFLOW_EMBED_PRODUCT-SUPPLIER.html`
20. `WEBFLOW_EMBED_REALTOR.html`
21. `WEBFLOW_EMBED_ROOFER.html`
22. `WEBFLOW_EMBED_SYNAGOGUE.html`
23. `WEBFLOW_EMBED_TORAH-TEACHER.html`

### **📝 TEMPLATES (Oct 3, 2025)**:
24. `WEBFLOW_EMBED_BLOG_POST_TEMPLATE.html`
25. `WEBFLOW_EMBED_CASE_STUDY_TEMPLATE.html`
26. `WEBFLOW_EMBED_DOCS_TEMPLATE.html`
27. `WEBFLOW_EMBED_PRODUCT_TEMPLATE.html`

---

## ❌ **DUPLICATES ARCHIVED**:

**Archived Directory**: `/archives/outdated-webflow-ready-oct1-2025/`

This directory contained:
- 11 pages (marketplace.html, about.html, etc.) - ALL Oct 1, 2025
- 50 total HTML files
- **NO Stripe integration**
- **4 days outdated**

**Action taken**: Moved to archives to prevent confusion.

---

## 📂 **OTHER WEBFLOW-RELATED DIRECTORIES** (Not HTML files):

1. **`apps/web/rensto-site/webflow-components/`**
   - React/TSX components (PricingPage.tsx, etc.)
   - For Vercel deployment, not Webflow
   - **Keep as is** ✅

2. **`webflow-devlink-project/`**
   - Webflow Devlink integration project
   - Node modules, TypeScript config
   - For syncing Webflow designs to code
   - **Keep as is** ✅

3. **`docs/webflow/`**
   - Documentation files (MD files)
   - Implementation guides
   - **Keep as is** ✅

4. **`infra/mcp-servers/webflow-mcp-server/`**
   - MCP server for Webflow API
   - **Keep as is** ✅

---

## 🎯 **DEPLOYMENT WORKFLOW**:

### **Step 1: Identify the file**
Look at root directory, find `WEBFLOW_EMBED_[PAGE_NAME].html`

### **Step 2: Copy entire file**
Open file, copy ALL contents (including version header if it has one)

### **Step 3: Paste into Webflow**
1. Open Webflow Designer
2. Go to the page
3. Page Settings → Custom Code
4. Paste in "Before </body> tag"
5. Save and Publish

---

## ✅ **VERIFICATION**:

**To verify you're using the correct file**:
1. Check file location: Must be at `/Users/shaifriedman/New Rensto/rensto/WEBFLOW_EMBED_*.html`
2. Check file date: Marketplace and Subscriptions should be Oct 5, 2025
3. Check for version header: `<!-- FILE: WEBFLOW_EMBED_... VERSION: 2.0 -->`
4. Check file size: Marketplace should be ~55KB, Subscriptions ~43KB

**To verify Stripe integration is in file**:
```bash
grep -c "Stripe Checkout Integration" WEBFLOW_EMBED_MARKETPLACE_CVJ.html
```
Should return: `1` (means Stripe code is there)

---

## 🚨 **NEVER USE**:

- ❌ `/archives/outdated-webflow-ready-oct1-2025/` - Old Oct 1 files
- ❌ `/docs/webflow/*.html` - Documentation examples (deleted my duplicates)
- ❌ Any file NOT at root level
- ❌ Any file NOT starting with `WEBFLOW_EMBED_`

---

## 📋 **SUMMARY**:

**Total HTML files**: 27 at root
**Updated with Stripe**: 2 (Marketplace, Subscriptions)
**Ready to deploy**: 2 (same as above)
**Duplicates**: 0 (archived)
**Conflicts**: 0 (resolved)

**You can NOW deploy Marketplace and Subscriptions with confidence.**

---

**Last verified**: October 5, 2025, 4:45 PM
