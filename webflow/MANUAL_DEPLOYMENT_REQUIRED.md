# ⚠️ Manual Deployment Required - UI Alignment Fixes

**Date**: October 30, 2025  
**Status**: Automated deployment failed - manual deployment required  
**Reason**: Webflow API doesn't support custom head code via API

---

## 🎯 **WHAT TO DEPLOY**

Two CSS fixes:
1. ✅ Logo alignment (fixes logo appearing higher than nav items)
2. ✅ Button height alignment (fixes different button heights in pricing cards)

---

## 📋 **QUICK DEPLOYMENT STEPS** (2 minutes)

### **Step 1: Open Webflow Designer**
- Go to https://webflow.com/designer
- Open site: `66c7e551a317e0e9c9f906d8`

### **Step 2: Open Site Settings**
- Bottom left → Click **Settings** icon (⚙️)
- Or: **Site Settings** from left sidebar

### **Step 3: Find Custom Code Section**
- Scroll down in Settings panel
- Find **"Custom Code"** section
- Click **"Code in <head> tag"** field

### **Step 4: Paste Code**
- Copy ALL code from: `webflow/UI_FIXES_DEPLOYMENT_CODE.txt`
- Paste into the `<head>` field
- Click **Save**

### **Step 5: Publish**
- Click **Publish** button (top right)
- Select domains: rensto.com, www.rensto.com
- Click **Publish**

---

## 📁 **CODE LOCATION**

**File**: `webflow/UI_FIXES_DEPLOYMENT_CODE.txt`

**Or copy from here**:

```html
<!-- UI Alignment Fixes - Paste in Webflow Site Settings → Custom Code → Code in <head> tag -->
<style>
/* ============================================
   LOGO ALIGNMENT FIX
   Fixes: Logo appears higher than navigation items
   ============================================ */
.navbar-brand,
.navbar-logo,
.header-logo,
[class*="logo"],
.navbar-wrapper > a:first-child img,
.navbar a img:first-of-type,
header img:first-of-type,
.nav-logo img {
  vertical-align: middle !important;
  display: inline-flex !important;
  align-items: center !important;
  max-height: 100% !important;
}

/* Navigation Container Alignment */
.navbar,
.nav-menu,
.navbar-wrapper,
.nav-container,
header > div:first-child {
  display: flex !important;
  align-items: center !important;
}

/* Logo Container */
.navbar-brand-container,
.logo-container,
.nav-logo {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
}

/* ============================================
   BUTTON HEIGHT ALIGNMENT FIX
   Fixes: Payment option buttons have different heights
   ============================================ */
.pricing-button,
.subscription-button,
[class*="pricing"] button,
[class*="plan"] button,
.pricing-card button,
.plan-card button,
[data-tier] button,
.checkout-button {
  min-height: 48px !important;
  height: auto !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 12px 24px !important;
  box-sizing: border-box !important;
  line-height: 1.4 !important;
}

/* Ensure all buttons in same row/container are same height */
.pricing-row button,
.plan-row button,
[class*="pricing"] .button-wrapper button,
[class*="pricing"] .button-container button,
.pricing-grid button,
.plan-grid button {
  height: 48px !important;
  min-height: 48px !important;
}

/* Button wrapper alignment */
.button-wrapper,
.button-container,
[class*="button"] {
  display: flex !important;
  align-items: center !important;
}
</style>
```

---

## ✅ **VERIFICATION AFTER DEPLOYMENT**

1. **Logo Check**: Visit any page → Logo should be vertically centered with nav items
2. **Button Check**: Visit `/subscriptions` or `/marketplace` → All buttons same height (48px)

---

## 📊 **AUTOMATION ATTEMPT RESULTS**

- ✅ Deployment script created (`webflow/deploy-ui-fixes.js`)
- ✅ Code files prepared and ready
- ❌ Webflow API limitation: No endpoint for custom head code
- ✅ Manual deployment instructions documented

**Time Required**: 2 minutes  
**Impact**: Fixes logo and button alignment across all pages

---

*Last Updated: October 30, 2025*

