# ✅ Add workflows.js Script Tag - Quick Fix

**Issue**: Script not loading because script tag is missing  
**Fix**: Add script tag to "Before </body>" section

---

## 📝 **ADD THIS LINE**

In **Webflow Designer → Marketplace Page → Settings → Custom Code → "Before </body> tag"**

**Add this line** after the `checkout.js` script:

```html
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
```

---

## 📋 **COMPLETE "Before </body>" SECTION**

Your "Before </body>" section should look like this:

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

## ⚠️ **IF workflows.js STILL 404**

If Vercel hasn't deployed yet, you can temporarily use the Webflow-hosted version:

```html
<script src="https://cdn.prod.website-files.com/66c7e551a317e0e9c9f906d8%2F689e5ba67671442434f3ca35%2F6907860f068ad8fc5a5c25fa%2Fmarketplace_dynamic_workflows-1.0.0.js"></script>
```

But check Vercel first - it should deploy automatically from GitHub.

---

## ✅ **AFTER ADDING**

1. **Save** the page settings
2. **Publish** the site
3. **Test** on https://rensto.com/marketplace
4. **Check console** for: `✅ Loaded X workflows dynamically`

---

**Current Status**: 
- ✅ Container div added
- ✅ Script registered
- ⏳ Script tag needs to be added to page

