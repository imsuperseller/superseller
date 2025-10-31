# 🎨 UI Alignment Fixes

**Date**: October 30, 2025  
**Issues**: 
1. Logo on left higher than other navigation elements
2. Payment option card buttons have different heights

---

## 🔍 **ISSUE 1: Logo Alignment**

### **Problem**: Logo appears higher than other navigation items

### **Solution**: Add CSS to align logo vertically

**Add to Webflow Custom Code → Code in <head> tag** (site-wide fix):

```css
<style>
/* Logo Alignment Fix */
.navbar-brand,
.navbar-logo,
.header-logo,
[class*="logo"],
.navbar-wrapper > a:first-child img,
.navbar a img:first-of-type {
  vertical-align: middle !important;
  display: inline-flex !important;
  align-items: center !important;
}

/* Navigation Container Alignment */
.navbar,
.nav-menu,
.navbar-wrapper {
  display: flex !important;
  align-items: center !important;
}

/* Logo Container */
.navbar-brand-container,
.logo-container {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
}
</style>
```

---

## 🔍 **ISSUE 2: Button Height Alignment**

### **Problem**: Payment option buttons have different heights

### **Solution**: Standardize button heights

**Add to Webflow Custom Code → Code in <head> tag** (site-wide fix):

```css
<style>
/* Button Height Alignment Fix */
.pricing-button,
.subscription-button,
[class*="pricing"] button,
[class*="plan"] button,
.pricing-card button,
.plan-card button {
  min-height: 48px !important;
  height: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 12px 24px !important;
  box-sizing: border-box !important;
}

/* Ensure all buttons in same row are same height */
.pricing-row button,
.plan-row button,
[class*="pricing"] .button-wrapper,
[class*="pricing"] .button-container {
  height: 48px !important;
  min-height: 48px !important;
}
</style>
```

---

## 📋 **COMPLETE FIX - PASTE BOTH**

**Add this to Webflow → Site Settings → Custom Code → Code in <head> tag**:

```css
<style>
/* ============================================
   LOGO ALIGNMENT FIX
   ============================================ */
.navbar-brand,
.navbar-logo,
.header-logo,
[class*="logo"],
.navbar-wrapper > a:first-child img,
.navbar a img:first-of-type {
  vertical-align: middle !important;
  display: inline-flex !important;
  align-items: center !important;
}

.navbar,
.nav-menu,
.navbar-wrapper {
  display: flex !important;
  align-items: center !important;
}

.navbar-brand-container,
.logo-container {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
}

/* ============================================
   BUTTON HEIGHT ALIGNMENT FIX
   ============================================ */
.pricing-button,
.subscription-button,
[class*="pricing"] button,
[class*="plan"] button,
.pricing-card button,
.plan-card button {
  min-height: 48px !important;
  height: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 12px 24px !important;
  box-sizing: border-box !important;
}

.pricing-row button,
.plan-row button,
[class*="pricing"] .button-wrapper,
[class*="pricing"] .button-container {
  height: 48px !important;
  min-height: 48px !important;
}
</style>
```

---

## 🎯 **DEPLOYMENT STEPS**

### **For Logo Fix**:
1. Webflow Designer → Site Settings (bottom left)
2. Custom Code → Code in <head> tag
3. Paste logo alignment CSS above
4. Save

### **For Button Fix**:
1. Same location (Site Settings → Custom Code → Code in <head>)
2. Paste button alignment CSS above
3. Save

**Or paste both together** (recommended)

---

## ✅ **VERIFICATION**

After deployment:
1. **Logo**: Should be vertically centered with navigation items
2. **Buttons**: All buttons in pricing cards should have same height (48px)

---

*Created: October 30, 2025*

