# 🔧 Button Selector Fix - Deployment Instructions

**Date**: October 30, 2025
**Issue**: Checkout scripts use wrong button selectors, causing checkout buttons to not work
**Status**: ✅ Fixed scripts ready for deployment

---

## 🐛 Problem Identified

**Subscriptions Page**:
- Script expects: `.subscription-button`
- Page has: `.pricing-button`
- **Result**: Buttons navigate via href instead of intercepting for checkout

**Other Pages**:
- Marketplace, Ready Solutions, Custom Solutions may have similar mismatches
- Fixes include fallback selectors for maximum compatibility

---

## ✅ Fixed Scripts Created

All fixed scripts are in `/webflow/scripts-fix/`:

1. ✅ `subscriptions-checkout.js` - Changed `.subscription-button` → `.pricing-button`
2. ✅ `marketplace-checkout.js` - Added `.pricing-button` fallback support
3. ✅ `ready-solutions-checkout.js` - Added `.pricing-button` fallback support
4. ✅ `custom-solutions-checkout.js` - Added `.pricing-button` fallback support

---

## 🚀 Deployment Steps

### **Step 1: Access GitHub Repo**

The scripts are deployed from: **https://github.com/imsuperseller/rensto-webflow-scripts**

**Repository Structure**:
```
rensto-webflow-scripts/
├── subscriptions/
│   └── checkout.js  ← Update this
├── marketplace/
│   └── checkout.js  ← Update this
├── ready-solutions/
│   └── checkout.js  ← Update this
├── custom-solutions/
│   └── checkout.js  ← Update this
└── shared/
    └── stripe-core.js (no changes needed)
```

---

### **Step 2: Copy Fixed Scripts to GitHub Repo**

**For Each Script**:

1. Open the fixed script from `/webflow/scripts-fix/[script-name].js`
2. Copy entire contents
3. Go to GitHub repo: `https://github.com/imsuperseller/rensto-webflow-scripts`
4. Navigate to the matching file (e.g., `subscriptions/checkout.js`)
5. Click "Edit" (pencil icon)
6. Replace entire file contents
7. Commit with message: `fix: Update button selector to .pricing-button for [page-name]`

**Files to Update**:

| Local File | GitHub Path | Description |
|------------|-------------|-------------|
| `subscriptions-checkout.js` | `subscriptions/checkout.js` | Fixed: Uses `.pricing-button` |
| `marketplace-checkout.js` | `marketplace/checkout.js` | Fixed: Added `.pricing-button` fallback |
| `ready-solutions-checkout.js` | `ready-solutions/checkout.js` | Fixed: Added `.pricing-button` fallback |
| `custom-solutions-checkout.js` | `custom-solutions/checkout.js` | Fixed: Added `.pricing-button` fallback |

---

### **Step 3: Vercel Auto-Deploy**

✅ **Automatic**: Once pushed to GitHub, Vercel will auto-deploy in ~30 seconds

**CDN URLs** (will update automatically):
- `https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js`
- `https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js`
- `https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js`
- `https://rensto-webflow-scripts.vercel.app/custom-solutions/checkout.js`

---

### **Step 4: Clear Browser Cache (Testing)**

After deployment, clear cache or test in incognito:
- Chrome: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Or test in Incognito/Private window

---

### **Step 5: Verify Fix**

**Test on Live Pages**:

1. **Subscriptions** (`https://rensto.com/subscriptions`)
   - Click any "Start Free Trial" button
   - ✅ Should POST to `api.rensto.com/api/stripe/checkout`
   - ✅ Should redirect to Stripe Checkout (not navigate to `/checkout?plan=...`)

2. **Marketplace** (`https://rensto.com/marketplace`)
   - Click "DIY Installation" or "Full-Service Install"
   - ✅ Should trigger checkout flow

3. **Ready Solutions** (`https://rensto.com/ready-solutions`)
   - Click any package button
   - ✅ Should trigger checkout flow

4. **Custom Solutions** (`https://rensto.com/custom-solutions`)
   - Click any service button
   - ✅ Should trigger checkout flow

**Expected Console Logs**:
```
🎯 [Page] Checkout: Initializing...
✅ [Page] Checkout: Ready
💳 Creating checkout session...
✅ Checkout session created, redirecting...
```

---

## 📋 Changes Summary

### **Subscriptions Checkout** (`subscriptions/checkout.js`)
**Changed**:
```javascript
// BEFORE
'.subscription-button',

// AFTER
'.pricing-button',  // Matches Webflow page class
```

### **Marketplace Checkout** (`marketplace/checkout.js`)
**Added**:
- Fallback support for `.pricing-button` if specific classes not found
- Dynamic detection of button types on page

### **Ready Solutions Checkout** (`ready-solutions/checkout.js`)
**Added**:
- Automatic fallback: `.ready-solutions-button` → `.pricing-button`
- Works with either class structure

### **Custom Solutions Checkout** (`custom-solutions/checkout.js`)
**Added**:
- Automatic fallback: `.custom-solutions-button` → `.pricing-button`
- Works with either class structure

---

## ⚡ Quick Deploy (One-Liner)

If you have GitHub CLI (`gh`) installed:

```bash
cd /path/to/rensto-webflow-scripts
git pull origin main
# Copy fixed files from webflow/scripts-fix/ to matching locations
git add subscriptions/checkout.js marketplace/checkout.js ready-solutions/checkout.js custom-solutions/checkout.js
git commit -m "fix: Update button selectors to support .pricing-button class"
git push origin main
```

Vercel will auto-deploy in ~30 seconds.

---

## ✅ Success Criteria

**After Deployment**:
- ✅ All 4 checkout scripts updated in GitHub
- ✅ Vercel deployment successful (check Vercel dashboard)
- ✅ CDN URLs return updated scripts (check file timestamps)
- ✅ Buttons on live pages trigger checkout flow (no href navigation)
- ✅ Console shows checkout initialization messages
- ✅ Network requests show POST to `api.rensto.com/api/stripe/checkout`

---

**Rollback** (if needed:
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

**Created**: October 30, 2025
**Status**: ✅ Ready for deployment
**Estimated Time**: 5-10 minutes (GitHub edits + verification)

