# 🔧 Fix: Add workflows.js Script Tag

**Issue**: `workflows.js` not loading - script tag missing  
**Date**: November 2, 2025

---

## ❌ **PROBLEM**

Console shows:
- ✅ `checkout.js` loaded
- ❌ `workflows.js` NOT loading
- ❌ No workflow cards appearing

**Root Cause**: The script tag for `workflows.js` is missing from the "Before </body>" section.

---

## ✅ **SOLUTION**

### **Add Script Tag to Page Settings**

**Current "Before </body>" section** (from your info):
```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>
```

**Updated "Before </body>" section** (add this line):
```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
```

**IMPORTANT**: Scripts must load in this order:
1. `stripe-core.js` (base functionality)
2. `checkout.js` (checkout handlers)
3. `workflows.js` (dynamic loading - depends on RenstoStripe)

---

## 📋 **STEPS TO FIX**

1. **Open Webflow Designer**
   - Go to Marketplace page
   - Click **Settings** (gear icon)

2. **Navigate to Custom Code**
   - Click **Custom Code** tab
   - Scroll to **"Before </body> tag"** section

3. **Add workflows.js Script**
   - Add this line after `checkout.js`:
   ```html
   <script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
   ```

4. **Save & Publish**
   - Click **Save**
   - Click **Publish**

5. **Test**
   - Visit: https://rensto.com/marketplace
   - Open Browser Console (F12)
   - Look for: `✅ Loaded X workflows dynamically`

---

## 🔍 **VERIFICATION**

After adding the script, console should show:
```
✅ Rensto CSS Alignment Fixes injected
🎯 Marketplace Checkout: Initializing...
✅ Marketplace Checkout: Ready
✅ Loaded 8 workflows dynamically  ← THIS should appear
```

---

## ⚠️ **IF workflows.js STILL RETURNS 404**

If Vercel hasn't deployed yet, you can temporarily use the registered Webflow script:

**Alternative**: Use the registered script ID `marketplace_dynamic_workflows_loader`

But the Vercel CDN approach is preferred once it's deployed.

---

**Status**: Script tag needs to be added manually to page settings.

