# 🔧 Subscriptions Checkout - Complete Fix

**Date**: October 30, 2025  
**Issue**: Script initializing but checkout failing  
**Root Cause**: Missing data attributes on buttons

---

## ✅ **PROBLEM IDENTIFIED**

The checkout script (`checkout.js?v=2`) is:
1. ✅ Loading successfully
2. ✅ Initializing: Looking for `.subscription-button` selector
3. ❌ **Buttons likely use `.pricing-button`** (selector mismatch)
4. ❌ **Buttons missing data attributes** (`data-tier`, `data-subscription-type`)

**Result**: Script can't find buttons or buttons have no data → API call fails

---

## 🎯 **TWO-PART FIX**

### **Part 1: Update Webflow Initialization Script**

The initialization in Webflow needs to:
1. Find buttons (try both selectors)
2. Extract plan from button `href` attribute
3. Set required data attributes
4. Then initialize

---

### **Part 2: Ensure Buttons Have href with plan Parameter**

Buttons need `href` like: `/checkout?plan=starter` or similar

---

## 📋 **COMPLETE FIX CODE**

**Replace Webflow Custom Code with this**:

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->

<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>

<script src="https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js?v=2"></script>

<script>
(function(){
  if(!window.RenstoStripe){return;}

  console.log('🔧 Setting up subscription buttons...');

  // Find buttons (try both selectors)
  const buttons = document.querySelectorAll('.pricing-button, .subscription-button');
  
  console.log(`Found ${buttons.length} buttons`);

  // Extract plan from href and set data attributes
  buttons.forEach(button => {
    const href = button.getAttribute('href') || button.href || '';
    
    // Try to extract plan from URL: ?plan=starter, ?plan=pro, ?plan=enterprise
    const urlMatch = href.match(/[?&]plan=([^&]+)/i);
    const plan = urlMatch ? urlMatch[1].toLowerCase() : null;
    
    // Map plan to tier
    const tierMap = {
      'starter': 'starter',
      'pro': 'professional',
      'professional': 'professional',
      'enterprise': 'enterprise'
    };
    
    const tier = plan ? (tierMap[plan] || plan) : 'starter';
    
    if (plan) {
      console.log(`Setting attributes for button: plan=${plan}, tier=${tier}`);
      
      // Set required data attributes
      button.setAttribute('data-flow-type', 'subscription');
      button.setAttribute('data-tier', tier);
      button.setAttribute('data-subscription-type', 'lead-gen');
      button.setAttribute('data-page-type', 'subscriptions');
    } else {
      console.warn('⚠️ Button missing plan in href:', href);
    }
  });

  // Initialize with pricing-button (most common selector)
  window.RenstoStripe.initCheckoutButtons(
    '.pricing-button',
    'subscription',
    'subscriptions'
  );

  console.log('✅ Subscription buttons initialized');
})();
</script>
```

---

## 🔍 **WHAT THIS DOES**

1. **Finds buttons**: Tries both `.pricing-button` and `.subscription-button`
2. **Extracts plan**: Parses `href` for `?plan=starter` parameter
3. **Maps to tier**: Converts plan names (pro → professional)
4. **Sets attributes**: Adds `data-tier`, `data-subscription-type`, etc.
5. **Initializes**: Calls `initCheckoutButtons` which reads those attributes

---

## 📝 **DEPLOYMENT**

1. Open Webflow Designer → Subscriptions page
2. Page Settings → Custom Code → "Code before </body> tag"
3. **Replace entire code** with fix above
4. Save & Publish

---

## ✅ **VERIFICATION**

After deployment, check browser console:
- Should see: "Found X buttons"
- Should see: "Setting attributes for button: plan=..."
- Should see: "Subscription buttons initialized"
- Click button → Should redirect to Stripe checkout

---

**Status**: Complete fix ready for deployment

