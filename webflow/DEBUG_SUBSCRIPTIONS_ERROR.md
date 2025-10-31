# 🔍 Debug: Subscriptions Checkout Error

**Error**: "Unable to process checkout. Please try again or contact support."  
**Status**: Script initializing, but API call failing

---

## ✅ **WHAT'S WORKING**

- ✅ Script loading: `checkout.js?v=2` loaded
- ✅ Initialization: "🎯 Subscriptions Checkout: Initializing..."
- ✅ Ready: "✅ Subscriptions Checkout: Ready"
- ✅ API endpoint: `https://api.rensto.com/api/stripe/checkout` **WORKS** (tested successfully)

---

## 🔍 **ROOT CAUSE**

The script is calling:
```javascript
window.RenstoStripe.initCheckoutButtons(
  '.subscription-button',
  'subscription',
  'subscriptions'
);
```

**BUT** the Webflow initialization script is looking for:
```javascript
window.RenstoStripe.initCheckoutButtons(
  '.pricing-button',  // ← DIFFERENT SELECTOR!
  'subscription',
  'subscriptions'
);
```

---

## 🎯 **PROBLEM**

**Selector Mismatch**:
- Script looks for: `.subscription-button`
- Webflow HTML has: `.pricing-button`

**Result**: Buttons not being initialized, no click handlers attached

---

## ✅ **SOLUTION**

### **Option 1: Update Webflow Script** (Recommended)

Change the selector in Webflow to match the script:

**In Webflow Custom Code** → Change from:
```javascript
window.RenstoStripe.initCheckoutButtons(
  '.pricing-button',  // ← OLD
  'subscription',
  'subscriptions'
);
```

**To**:
```javascript
window.RenstoStripe.initCheckoutButtons(
  '.subscription-button',  // ← NEW (matches script)
  'subscription',
  'subscriptions'
);
```

---

### **Option 2: Update Script** (Alternative)

Change the script selector to match Webflow HTML (would require updating the checkout.js file on GitHub/CDN)

---

## 📋 **VERIFICATION STEPS**

1. **Check Button Selector** (30 seconds):
   - Open browser console (F12)
   - Run: `document.querySelectorAll('.subscription-button')`
   - If returns 0 buttons → Selector mismatch confirmed
   - Run: `document.querySelectorAll('.pricing-button')`
   - If returns buttons → Webflow uses `.pricing-button`

2. **Check Data Attributes** (30 seconds):
   - Inspect a subscription button (right-click → Inspect)
   - Verify it has: `data-tier`, `data-subscription-type`
   - If missing → Buttons need data attributes added

3. **Test API Call** (30 seconds):
   - Click button
   - Check console for error
   - Check Network tab for API request
   - Look at response

---

## 🚀 **IMMEDIATE FIX**

**Quick Fix** (2 minutes):

1. Open Webflow Designer
2. Subscriptions page → Page Settings → Custom Code
3. Find the initialization script:
   ```javascript
   window.RenstoStripe.initCheckoutButtons(
     '.pricing-button',  // ← CHANGE THIS
     'subscription',
     'subscriptions'
   );
   ```
4. Change `.pricing-button` to `.subscription-button`
5. Save & Publish

**OR** if buttons use `.pricing-button` class, keep that and the script will need updating (but that's in the CDN file).

---

## 🔍 **NEXT CHECK**

**In Browser Console**:
```javascript
// Check what selector exists
document.querySelectorAll('.subscription-button')  // Script expects this
document.querySelectorAll('.pricing-button')        // Webflow might use this

// Check button attributes
document.querySelector('.subscription-button')?.getAttribute('data-tier')
document.querySelector('.subscription-button')?.getAttribute('data-subscription-type')
```

---

**Status**: Likely selector mismatch between script and Webflow HTML

---

*Created: October 30, 2025*

