# 🔧 Subscriptions Fix - Exact Replacement

**Date**: October 30, 2025  
**Current Code Found**: Includes initialization script  
**Action**: Update script URL, keep initialization

---

## 📋 **WHAT YOU CURRENTLY HAVE**

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->

<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>

<script src="https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js"></script>

<script>
(function(){
  if(!window.RenstoStripe){return;}
  window.RenstoStripe.initCheckoutButtons(
    '.pricing-button',
    'subscription',
    'subscriptions'
  );
})();
</script>
```

---

## ✅ **WHAT TO REPLACE IT WITH**

**Replace ENTIRE code block with this** (only change: added `?v=2` to checkout.js):

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->

<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>

<script src="https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js?v=2"></script>

<script>
(function(){
  if(!window.RenstoStripe){return;}
  window.RenstoStripe.initCheckoutButtons(
    '.pricing-button',
    'subscription',
    'subscriptions'
  );
})();
</script>
```

---

## 🎯 **WHAT CHANGED**

**ONLY this line changed**:
- **Before**: `<script src=".../checkout.js"></script>`
- **After**: `<script src=".../checkout.js?v=2"></script>`

**Everything else stays the same**:
- ✅ Stripe core script (unchanged)
- ✅ Initialization script (unchanged)
- ✅ Comments (unchanged)

---

## 📝 **STEP-BY-STEP**

1. In Webflow Designer, Subscriptions page
2. Page Settings → Custom Code → "Code before </body> tag"
3. **Select ALL** existing code (Cmd+A / Ctrl+A)
4. **Delete** it
5. **Paste** the new code (above) - it's identical except for `?v=2`
6. **Save** → **Publish**

---

## ✅ **RESULT**

✅ Checkout script loads fresh version (bypasses cache)  
✅ Initialization script still works  
✅ Buttons functional immediately

---

**Time**: 2 minutes  
**Risk**: Very low (only adding cache-busting parameter)

