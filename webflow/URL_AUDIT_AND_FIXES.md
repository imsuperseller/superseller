# 🔗 URL Audit & Fixes

**Date**: October 7, 2025
**Purpose**: Document URL mismatches and required fixes
**Discovered**: During sitemap verification

---

## 🚨 Critical Issue: Typo in URL

### **Fence Contractors Page**

**Current URL**: `/frence-contractors` ❌ (typo: "frence")
**Should be**: `/fence-contractor` ✅ (correct spelling)
**Status**: Returns **404 error**

**Fix Required**: Set up 301 redirect in Webflow

---

## 📋 How to Fix the Typo

### **Option 1: Set Up 301 Redirect** (Recommended)

1. **Open Webflow Dashboard**
2. Go to **Project Settings**
3. Click **"Hosting"** tab
4. Scroll to **"301 Redirects"** section
5. Click **"Add redirect"**
6. **Old path**: `/frence-contractors`
7. **New path**: `/fence-contractor`
8. **Type**: 301 Permanent
9. Click **"Save"**
10. **Publish** the site

**Result**:
- `/frence-contractors` → automatically redirects to → `/fence-contractor`
- No broken links
- SEO preserved

---

### **Option 2: Rename the CMS Item**

If the page is in the CMS collection:

1. **Open Webflow Designer**
2. Go to **CMS Collections**
3. Find **"Niche Solutions"** collection
4. Find the **"Fence Contractors"** item
5. Edit the **slug field**
6. Change from: `frence-contractors`
7. Change to: `fence-contractor`
8. **Save**
9. **Publish**

**Result**: Page now lives at `/fence-contractor`

**⚠️ Warning**: This will break any existing links to `/frence-contractors`. Use Option 1 to avoid this.

---

## ℹ️ Plural URLs (No Action Needed)

These URLs work fine, just documenting for reference:

### **Pages with Plural URLs**:

| Page | URL | Local File | Status |
|------|-----|------------|--------|
| **Roofers** | `/roofers` | `WEBFLOW_EMBED_ROOFER.html` | ✅ Works (URL plural, file singular) |
| **Photographers** | `/photographers` | `WEBFLOW_EMBED_PHOTOGRAPHER.html` | ✅ Works (URL plural, file singular) |
| **Synagogues** | `/synagogues` | `WEBFLOW_EMBED_SYNAGOGUE.html` | ✅ Works (URL plural, file singular) |

**Why the mismatch?**
- Webflow uses the CMS item slug for the URL
- CMS slugs were set to plural
- Local files use singular naming
- **No action needed** - both work, just inconsistent naming

---

## 📊 Complete URL Inventory

### **Niche Pages** (16 total)

| # | Page Name | Live URL | Local File | Status |
|---|-----------|----------|------------|--------|
| 1 | HVAC | `/hvac` | `WEBFLOW_EMBED_HVAC.html` | ✅ Match |
| 2 | Realtor | `/realtor` | `WEBFLOW_EMBED_REALTOR.html` | ✅ Match |
| 3 | Roofers | `/roofers` | `WEBFLOW_EMBED_ROOFER.html` | ⚠️ Plural URL |
| 4 | Amazon Seller | `/amazon-seller` | `WEBFLOW_EMBED_AMAZON-SELLER.html` | ✅ Match |
| 5 | Bookkeeping | `/bookkeeping` | `WEBFLOW_EMBED_BOOKKEEPING.html` | ✅ Match |
| 6 | Busy Mom | `/busy-mom` | `WEBFLOW_EMBED_BUSY-MOM.html` | ✅ Match |
| 7 | Dentist | `/dentist` | `WEBFLOW_EMBED_DENTIST.html` | ✅ Match |
| 8 | E-commerce | `/ecommerce` | `WEBFLOW_EMBED_ECOMMERCE.html` | ✅ Match |
| 9 | Fence Contractors | `/frence-contractors` | `WEBFLOW_EMBED_FENCE-CONTRACTOR.html` | ❌ Typo |
| 10 | Insurance | `/insurance` | `WEBFLOW_EMBED_INSURANCE.html` | ✅ Match |
| 11 | Lawyer | `/lawyer` | `WEBFLOW_EMBED_LAWYER.html` | ✅ Match |
| 12 | Locksmith | `/locksmith` | `WEBFLOW_EMBED_LOCKSMITH.html` | ✅ Match |
| 13 | Photographers | `/photographers` | `WEBFLOW_EMBED_PHOTOGRAPHER.html` | ⚠️ Plural URL |
| 14 | Product Supplier | `/product-supplier` | `WEBFLOW_EMBED_PRODUCT-SUPPLIER.html` | ✅ Match |
| 15 | Synagogues | `/synagogues` | `WEBFLOW_EMBED_SYNAGOGUE.html` | ⚠️ Plural URL |
| 16 | Torah Teacher | `/torah-teacher` | `WEBFLOW_EMBED_TORAH-TEACHER.html` | ✅ Match |

**Summary**:
- ✅ **13 URLs match** perfectly
- ⚠️ **3 URLs are plural** (but work fine)
- ❌ **1 URL has typo** (needs redirect)

---

## 🎯 Action Plan

### **Priority 1: Fix the Typo** (5 minutes)
- [ ] Set up 301 redirect: `/frence-contractors` → `/fence-contractor`
- [ ] Publish Webflow site
- [ ] Test the redirect

### **Priority 2: Document Plural URLs** (Already done)
- [x] Document roofers, photographers, synagogues
- [x] No action needed - URLs work
- [x] Keep for reference

### **Priority 3: Update Local Files** (Optional, future)
Consider renaming local files to match plural URLs:
- `WEBFLOW_EMBED_ROOFER.html` → `WEBFLOW_EMBED_ROOFERS.html`
- `WEBFLOW_EMBED_PHOTOGRAPHER.html` → `WEBFLOW_EMBED_PHOTOGRAPHERS.html`
- `WEBFLOW_EMBED_SYNAGOGUE.html` → `WEBFLOW_EMBED_SYNAGOGUES.html`

**Benefit**: Consistency between URLs and file names
**Downside**: Not critical, low priority

---

## 📝 Update Sitemap

After fixing the typo, update any sitemaps or documentation:

**Old sitemap entry** (wrong):
```
https://www.rensto.com/frence-contractors
```

**New sitemap entry** (correct):
```
https://www.rensto.com/fence-contractor
```

---

## 🔍 How to Verify Fixes

### **Test Redirect**:
1. Open: `https://www.rensto.com/frence-contractors`
2. Should automatically redirect to: `https://www.rensto.com/fence-contractor`
3. Check browser network tab - should show 301 status

### **Test All URLs**:
Visit each URL and verify:
- [ ] Page loads (not 404)
- [ ] Scripts load (check console)
- [ ] Pricing buttons work

---

## 📊 URL Best Practices (For Future)

### **Naming Conventions**:
1. **Use lowercase**: `/hvac` not `/HVAC`
2. **Use hyphens**: `/amazon-seller` not `/amazon_seller`
3. **Be consistent**: Either all singular OR all plural, not mixed
4. **No typos**: Double-check spelling before publishing
5. **Keep short**: `/hvac` is better than `/hvac-business-automation-solutions`

### **Recommended Structure**:
```
/niche/{industry}  (e.g., /niche/hvac, /niche/realtor)
```
OR
```
/{industry}  (e.g., /hvac, /realtor)
```

**Current structure** (second option) is fine!

---

## 🎉 After Fixes

Once the fence-contractors redirect is set up:

**✅ All 16 niche pages accessible**
**✅ No 404 errors**
**✅ Consistent URL structure**
**✅ SEO preserved with 301 redirects**

---

**Created**: October 7, 2025
**Purpose**: URL audit and fix documentation
**Critical Fix**: Fence contractors typo redirect
**Reference**: Plural URL patterns documented
