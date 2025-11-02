# 🏠 Homepage Fix Instructions

**Date**: October 30, 2025
**Issue**: Homepage content not rendering (only header/footer visible)
**File**: `webflow/pages/WEBFLOW_EMBED_HOMEPAGE.html` (1,530 lines)

---

## 🎯 Problem

The homepage at https://www.rensto.com only shows header/footer navigation. All main content sections (hero, lead magnet, path selector, features, FAQ) are missing.

The HTML file exists and contains all content, but it's not deployed to Webflow.

---

## ✅ Solution: Deploy Homepage HTML

### Step 1: Open Webflow Designer
1. Go to https://webflow.com/dashboard
2. Select site: **Rensto** (ID: `66c7e551a317e0e9c9f906d8`)
3. Open **Designer**

### Step 2: Navigate to Homepage
1. In Pages panel (left sidebar), click **Home** (or the page with slug `/`)
2. This opens the homepage editor

### Step 3: Add Custom Code
1. Click **Page Settings** (gear icon in top right)
2. Scroll to **Custom Code** section
3. Find **"Code in <head> tag"** or **"Code before </body> tag"**
4. Use **"Code before </body> tag"** (this is where page content goes)

### Step 4: Paste Homepage HTML
1. Open file: `/Users/shaifriedman/New Rensto/rensto/webflow/pages/WEBFLOW_EMBED_HOMEPAGE.html`
2. Copy **ENTIRE CONTENTS** (all 1,530 lines)
3. Paste into **"Code before </body> tag"** field
4. Click **Save**

### Step 5: Publish
1. Click **Publish** button (top right)
2. Select **Publish to production**
3. Wait for publish to complete (~30-60 seconds)

---

## ✅ Verification

After publishing, visit https://www.rensto.com and verify:
- [ ] Hero section with headline visible
- [ ] Social proof stats (500+ businesses, 80% time saved)
- [ ] Path selector (4 service type cards)
- [ ] Lead magnet form appears
- [ ] Features/benefits section visible
- [ ] Process explanation visible
- [ ] FAQ accordion visible
- [ ] Final CTA section visible

---

## 📝 Notes

- **File location**: `webflow/pages/WEBFLOW_EMBED_HOMEPAGE.html`
- **Version**: 1.0 (Oct 8, 2025)
- **Lead Magnet**: Form sends to `https://n8n.rensto.com/webhook/customer-data-sync`
- **Scripts**: Uses GSAP for animations (loaded from CDN)
- **No Stripe checkout**: Homepage is routing hub, not a payment page

---

## 🐛 If Content Still Missing After Deployment

1. Check browser console for JavaScript errors
2. Verify scripts load: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`
3. Check Webflow Designer → Page Settings → Custom Code (verify code is there)
4. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
5. Check if page is in draft mode (should be published)

---

**Status**: ⏳ Awaiting manual deployment in Webflow Designer

