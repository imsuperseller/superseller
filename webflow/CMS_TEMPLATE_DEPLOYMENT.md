# ⚠️ OUTDATED: CMS Template Deployment Guide

**Date**: October 7, 2025 (PRE-MIGRATION)  
**Status**: ⚠️ **OUTDATED** - Site migrated to Vercel Nov 2, 2025  
**Current Status**: rensto.com is on Vercel (Next.js), not Webflow

**⚠️ NOTE**: This document references Webflow CMS templates. The site is now on Vercel. This guide is for historical reference only.

---

## 🔍 What We Discovered

**The niche pages are NOT static pages** - they're powered by a **CMS Collection Template**!

This is actually **GOOD NEWS** because:
- You only need to update **ONE template page**
- All 16 niche pages inherit from this template
- One change updates everything automatically

---

## 📋 Step-by-Step Instructions

### **Step 1: Find the CMS Template** (2 minutes)

1. Open **Webflow Designer**
2. Look for one of these locations:

   **Option A: CMS Collections Panel**
   - Click **"CMS"** icon (database icon in left sidebar)
   - Find **"Niche Solutions"** collection (or similar name)
   - Click on the collection
   - Look for **"Collection Template"** or **"Template Page"**

   **Option B: Pages Panel**
   - Click **"Pages"** (left sidebar)
   - Look for a folder or section called **"Collections"** or **"CMS"**
   - Find **"Niche Solution Template"** or **"Niche Solutions"**

   **Option C: Direct URL**
   - The template is likely at: `/niche-solution` (singular)
   - This is the page with placeholders like `{{NICHE_NAME}}`

### **Step 2: Update the Template** (3 minutes)

1. **Open the template page** you found in Step 1
2. Click the **gear icon** (Page Settings)
3. Scroll to **"Custom Code"** section
4. Find **"Before </body> tag"** field
5. **Paste this code**:

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js"></script>
```

6. Click **"Save"**
7. Close the settings panel

### **Step 3: Publish** (2 minutes)

1. Click **"Publish"** button (top right, blue button)
2. Select **all domains** (rensto.com, www.rensto.com)
3. Click **"Publish to selected domains"**
4. **Wait for publish to complete** (1-2 minutes)

---

## ✅ What Happens When You Publish

**ALL 16 niche pages will update automatically**:
1. HVAC
2. Realtor
3. Roofers
4. Amazon Seller
5. Bookkeeping
6. Busy Mom
7. Dentist
8. E-commerce
9. Fence Contractors (fix URL typo separately)
10. Insurance
11. Lawyer
12. Locksmith
13. Photographers
14. Product Supplier
15. Synagogues
16. Torah Teacher

**One publish = 16 pages updated!** 🎉

---

## 🧪 How to Verify It Worked

### **Test 1: Check Source Code** (1 minute)

1. Open any niche page: https://www.rensto.com/hvac
2. Right-click → **"View Page Source"**
3. Search for: `rensto-webflow-scripts.vercel.app`
4. You should find **2 script tags** near the bottom before `</body>`

### **Test 2: Check Browser Console** (2 minutes)

1. Open any niche page: https://www.rensto.com/hvac
2. Press **F12** (or **Cmd+Option+I** on Mac)
3. Click **"Console"** tab
4. Look for these messages:
   ```
   🎯 [Rensto Stripe] Rensto Stripe Core loaded
   ✅ Ready Solutions Checkout: Ready (X buttons initialized)
   ```

### **Test 3: Test a Pricing Button** (1 minute)

1. Scroll to pricing section on any niche page
2. Click any **"Get Started"** or pricing button
3. Should redirect to Stripe checkout page
4. If it works → Scripts are working! ✅

---

## 🚨 If It Doesn't Work

### **Problem: Template page not found**

**Solution**:
1. Check if pages are using a different template system
2. Look for a page called "Niche Solutions Collection Template"
3. Search Webflow Designer for "niche" to find the template
4. Contact Webflow support if you can't find it

### **Problem: Scripts not appearing after publish**

**Solution**:
1. Wait 3-5 minutes for Webflow CDN to update
2. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+F5 on Windows)
3. Try in incognito/private browser window
4. Check if you published to the correct domain

### **Problem: Published but still no scripts**

**Solution**:
1. Go back to the template page
2. Check if the code is still in "Before </body> tag" field
3. Make sure you clicked "Save" in Page Settings
4. Try publishing again

---

## 📊 Before vs After

| Metric | Before (Static Pages) | After (CMS Template) |
|--------|----------------------|---------------------|
| **Pages to Update** | 16 individual pages | 1 template page |
| **Time Required** | 30-50 minutes | 5-10 minutes |
| **Risk of Errors** | High (16x paste) | Low (1x paste) |
| **Future Updates** | Update all 16 again | Update template once |
| **Maintenance** | 16x work | 1x work |

**CMS templates are MUCH better!** 🎯

---

## 🎁 Bonus: Why CMS Is Better

### **For Current Deployment**:
- Update once, all pages get the scripts
- No mistakes from repetitive pasting
- Much faster (5 min vs 50 min)

### **For Future Changes**:
- Change JavaScript → Update template → Publish → Done
- Add new features → Update template → All pages get them
- Fix bugs → Update template → All pages fixed

### **For Scaling**:
- Add 10 more niche pages? They inherit the template automatically
- Consistent experience across all pages
- Easy to maintain

---

## 📝 Next Steps After Template Update

### **Step 4: Update Service Pages** (20 minutes)

The 4 service pages are NOT using the template, update them individually:

1. **Marketplace** (`/marketplace`)
   - Script: `marketplace/checkout.js`

2. **Subscriptions** (`/subscriptions`)
   - Script: `subscriptions/checkout.js`

3. **Ready Solutions** (`/ready-solutions`)
   - Script: `ready-solutions/checkout.js`

4. **Custom Solutions** (`/custom-solutions`)
   - Script: `custom-solutions/checkout.js`

**For each page**:
- Open in Webflow Designer
- Page Settings → Custom Code → Before </body> tag
- Paste:
  ```html
  <!-- External Scripts from GitHub CDN (v2.0) -->
  <script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
  <script src="https://rensto-webflow-scripts.vercel.app/{service-type}/checkout.js"></script>
  ```
- Replace `{service-type}` with the correct folder name
- Save and Publish

---

## 🐛 URL Fixes Needed

### **Issue 1: Fence Contractors Typo**
- **Current URL**: `/frence-contractors` (typo)
- **Should be**: `/fence-contractor` (correct)
- **Action**: Set up 301 redirect in Webflow
  - Dashboard → Project Settings → Redirects
  - Old: `/frence-contractors`
  - New: `/fence-contractor`
  - Type: 301 Permanent

### **Issue 2: Plural URLs (Document Only)**
These URLs work, just noting for reference:
- `/roofers` (not /roofer)
- `/photographers` (not /photographer)
- `/synagogues` (not /synagogue)

**No action needed** - just document in codebase

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Find CMS template | 2 min |
| Update template | 3 min |
| Publish | 2 min |
| Verify (3 pages) | 5 min |
| **TOTAL** | **12 minutes** |

**vs 50 minutes for 16 individual pages** ✅

---

## 🎉 Success Criteria

After completing this guide, you should have:

✅ All 16 niche pages with GitHub scripts
✅ Scripts loading on every niche page
✅ Stripe checkout buttons working
✅ Console logs showing script initialization
✅ One-time template update (easy future maintenance)

---

**Created**: October 7, 2025
**Purpose**: CMS template deployment solution
**Impact**: 16 pages updated with 1 template change
**Time Saved**: 80% faster deployment
