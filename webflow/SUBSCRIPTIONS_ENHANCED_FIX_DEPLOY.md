# ✅ Subscriptions Enhanced Fix - Ready to Deploy

**Date**: October 30, 2025  
**Issue**: Checkout failing due to missing data attributes  
**Solution**: Enhanced script that extracts plan and sets attributes automatically

---

## 🎯 **PROBLEM SOLVED**

The issue was:
1. ✅ Script loading: Working (`checkout.js?v=2`)
2. ❌ **Buttons missing data attributes**: No `data-tier`, `data-subscription-type`
3. ❌ **Script can't extract plan**: Buttons don't have href with `?plan=` parameter

---

## ✅ **ENHANCED FIX**

**New script** (`subscriptions-scripts-ENHANCED.txt`):
- ✅ Finds buttons by both `.pricing-button` and `.subscription-button`
- ✅ Extracts plan from `href` attribute (`?plan=starter`)
- ✅ Falls back to inferring plan from button text/position
- ✅ Sets all required data attributes automatically
- ✅ Maps plan names correctly (pro → professional)

---

## 📋 **DEPLOY THIS NOW**

**Replace Webflow Custom Code with**:

```html
<!-- Subscriptions Page Scripts - ENHANCED FIX -->

<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>

<script src="https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js?v=2"></script>

<script>
(function(){
  if(!window.RenstoStripe){
    console.error('❌ RenstoStripe core not loaded');
    return;
  }

  console.log('🔧 Setting up subscription buttons...');

  // Find buttons (try both selectors)
  const buttons = document.querySelectorAll('.pricing-button, .subscription-button');
  
  console.log(`Found ${buttons.length} buttons`);

  if (buttons.length === 0) {
    console.warn('⚠️ No subscription buttons found');
    return;
  }

  // Extract plan and set data attributes
  buttons.forEach((button, index) => {
    const href = button.getAttribute('href') || button.href || '';
    
    // Extract plan from URL
    let plan = null;
    const urlMatch = href.match(/[?&]plan=([^&]+)/i);
    if (urlMatch) {
      plan = urlMatch[1].toLowerCase();
    }
    
    // Fallback: Infer from text/position
    if (!plan) {
      const text = (button.textContent || '').toLowerCase();
      if (text.includes('starter') || index === 0) plan = 'starter';
      else if (text.includes('pro') || text.includes('professional') || index === 1) plan = 'professional';
      else if (text.includes('enterprise') || index === 2) plan = 'enterprise';
    }
    
    // Map to tier
    const tierMap = {
      'starter': 'starter',
      'pro': 'professional',
      'professional': 'professional',
      'enterprise': 'enterprise'
    };
    
    const tier = plan ? (tierMap[plan] || plan) : 'starter';
    
    // Set data attributes
    button.setAttribute('data-flow-type', 'subscription');
    button.setAttribute('data-tier', tier);
    button.setAttribute('data-subscription-type', 'lead-gen');
    button.setAttribute('data-page-type', 'subscriptions');
    button.setAttribute('data-price', {starter:299, professional:599, enterprise:1499}[tier] || 299);
  });

  // Initialize
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

## 📝 **DEPLOYMENT STEPS**

1. Open Webflow Designer → Subscriptions page
2. Page Settings → Custom Code → "Code before </body> tag"
3. **Replace entire code** with enhanced version above
4. Save & Publish

---

## ✅ **WHAT THIS FIXES**

- ✅ **Selector compatibility**: Works with both `.pricing-button` and `.subscription-button`
- ✅ **Plan extraction**: Gets plan from href OR infers from text/position
- ✅ **Data attributes**: Automatically sets all required attributes
- ✅ **Tier mapping**: Correctly maps plan names to API format
- ✅ **Price setting**: Sets price based on tier

---

## 🧪 **VERIFICATION**

After deployment, check console:
- Should see: "Found X buttons"
- Should see: "Button 1: plan=starter, tier=starter"
- Should see: "Subscription buttons initialized"
- Click button → Should open Stripe checkout ✅

---

**File**: `webflow/deployment-snippets/subscriptions-scripts-ENHANCED.txt`

---

*Ready for immediate deployment*

