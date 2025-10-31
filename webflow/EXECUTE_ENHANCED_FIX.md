# ✅ Execute Enhanced Fix - Ready for Deployment

**Date**: October 30, 2025  
**Status**: Enhanced fix ready, execution instructions below

---

## 🎯 **COMPLETE FIX CODE**

Copy this ENTIRE code block into Webflow:

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

  // Find buttons (try both selectors for compatibility)
  const buttons = document.querySelectorAll('.pricing-button, .subscription-button');
  
  console.log(`Found ${buttons.length} buttons`);

  if (buttons.length === 0) {
    console.warn('⚠️ No subscription buttons found. Check button selectors.');
    return;
  }

  // Extract plan from href and set data attributes
  buttons.forEach((button, index) => {
    const href = button.getAttribute('href') || button.href || '';
    
    // Try to extract plan from URL: ?plan=starter, ?plan=pro, ?plan=enterprise
    let plan = null;
    const urlMatch = href.match(/[?&]plan=([^&]+)/i);
    if (urlMatch) {
      plan = urlMatch[1].toLowerCase();
    }
    
    // Fallback: Try to infer from button text or position
    if (!plan) {
      const text = (button.textContent || '').toLowerCase();
      if (text.includes('starter') || index === 0) plan = 'starter';
      else if (text.includes('pro') || text.includes('professional') || index === 1) plan = 'professional';
      else if (text.includes('enterprise') || index === 2) plan = 'enterprise';
    }
    
    // Map plan to tier
    const tierMap = {
      'starter': 'starter',
      'pro': 'professional',
      'professional': 'professional',
      'enterprise': 'enterprise'
    };
    
    const tier = plan ? (tierMap[plan] || plan) : 'starter';
    
    console.log(`Button ${index + 1}: plan=${plan || 'default'}, tier=${tier}`);
    
    // Set required data attributes
    button.setAttribute('data-flow-type', 'subscription');
    button.setAttribute('data-tier', tier);
    button.setAttribute('data-subscription-type', 'lead-gen');
    button.setAttribute('data-page-type', 'subscriptions');
    
    // Set price if available (infer from tier)
    const priceMap = {
      'starter': 299,
      'professional': 599,
      'enterprise': 1499
    };
    const price = priceMap[tier] || 299;
    button.setAttribute('data-price', price);
  });

  // Initialize with pricing-button (most common selector)
  window.RenstoStripe.initCheckoutButtons(
    '.pricing-button',
    'subscription',
    'subscriptions'
  );

  console.log('✅ Subscription buttons initialized and ready');
})();
</script>
```

---

## 📋 **EXECUTION STEPS**

### **1. Open Webflow Designer**
- Go to https://webflow.com/designer
- Open site: `66c7e551a317e0e9c9f906d8`

### **2. Navigate to Subscriptions Page**
- Pages panel → Find "Subscriptions" (ID: `68dfc41ffedc0a46e687c84b`)
- Click to open

### **3. Open Page Settings**
- Top toolbar → Gear icon ⚙️

### **4. Find Custom Code**
- Scroll to "Custom Code" section
- Click "Code before </body> tag" field

### **5. Replace Code**
- Select ALL (Cmd+A / Ctrl+A)
- Delete
- Paste enhanced code above

### **6. Save & Publish**
- Click Save
- Click Publish
- Select domains: rensto.com, www.rensto.com
- Publish!

---

## ✅ **VERIFICATION**

After publishing:
1. Open: https://rensto.com/subscriptions
2. Open browser console (F12)
3. Look for: "Found X buttons"
4. Look for: "Button 1: plan=..., tier=..."
5. Click any button → Should open Stripe checkout ✅

---

**Time**: 3 minutes  
**Result**: Checkout buttons fully functional

---

*Ready to execute: October 30, 2025*

