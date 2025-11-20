# 🔧 Final Fix: Add workflows.js Script Tag

**Issue**: Script not loading - missing script tag in "Before </body>" section  
**Console Shows**: Only `checkout.js` loading, no `workflows.js`

---

## ✅ **QUICK FIX (30 seconds)**

### **Add This Line to "Before </body>" Section**

In **Webflow Designer**:
1. Marketplace page → **Settings** → **Custom Code**
2. Scroll to **"Before </body> tag"**
3. **Add this line** after `checkout.js`:

```html
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
```

---

## 📋 **COMPLETE SCRIPT SECTION**

Your "Before </body>" section should be:

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
<script>
(function(){
  if(!window.RenstoStripe){return;}
  window.RenstoStripe.initCheckoutButtons(
    '.pricing-button',
    'marketplace',
    'marketplace'
  );
})();
</script>
```

---

## ⚠️ **IF workflows.js STILL RETURNS 404**

If Vercel hasn't deployed yet, check:

1. **Verify GitHub push**:
   ```bash
   cd /Users/shaifriedman/New\ Rensto/rensto-webflow-scripts
   git log --oneline -1 -- marketplace/workflows.js
   ```
   Should show commit `1342be6`

2. **Check Vercel deployment**:
   - Go to: https://vercel.com/dashboard
   - Check `rensto-webflow-scripts` project
   - Wait 1-2 minutes for auto-deploy

3. **Temporary Workaround**: 
   Once workflows.js deploys, it will work automatically. The script tag is already correct.

---

## ✅ **AFTER ADDING SCRIPT TAG**

1. **Save** page settings
2. **Publish** site
3. **Test** on https://rensto.com/marketplace
4. **Console should show**:
   ```
   ✅ Rensto CSS Alignment Fixes injected
   🎯 Marketplace Checkout: Initializing...
   ✅ Marketplace Checkout: Ready
   ✅ Loaded 8 workflows dynamically  ← NEW
   ```

---

## 📍 **WHERE TO ADD THE CONTAINER**

Based on your HTML structure, the `<div class="workflows-container"></div>` should be added in the **"Featured Templates"** section (H-08), replacing or alongside the static template cards.

**Location**: Around line where `.templates-grid` is, add:
```html
<div class="workflows-container"></div>
```

---

**Status**: Just needs the script tag added to page settings + wait for Vercel deployment.

