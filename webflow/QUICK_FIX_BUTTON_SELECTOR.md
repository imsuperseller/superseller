# 🎯 Quick Fix: Button Selector Issue

**Problem**: "Unable to process checkout" error  
**Root Cause**: Script can't find buttons or buttons missing data attributes

---

## 🔍 **IMMEDIATE DIAGNOSIS** (1 minute)

**Open Browser Console** (F12) and run:

```javascript
// Check if buttons exist with subscription-button selector
console.log('Buttons (.subscription-button):', document.querySelectorAll('.subscription-button').length);

// Check if buttons exist with pricing-button selector  
console.log('Buttons (.pricing-button):', document.querySelectorAll('.pricing-button').length);

// Check first button's attributes
const btn = document.querySelector('.subscription-button') || document.querySelector('.pricing-button');
if (btn) {
  console.log('Button found:', btn);
  console.log('data-tier:', btn.getAttribute('data-tier'));
  console.log('data-subscription-type:', btn.getAttribute('data-subscription-type'));
  console.log('data-flow-type:', btn.getAttribute('data-flow-type'));
} else {
  console.log('❌ No buttons found with either selector');
}
```

---

## ✅ **FIX OPTIONS**

### **If Buttons Use `.pricing-button`**:

Update Webflow Custom Code initialization from:
```javascript
window.RenstoStripe.initCheckoutButtons(
  '.pricing-button',  // ← Keep this if buttons use this class
  'subscription',
  'subscriptions'
);
```

**BUT** also ensure buttons have required data attributes:
- `data-flow-type="subscription"`
- `data-tier="starter"` (or "professional", "enterprise")
- `data-subscription-type="lead-gen"`

---

### **If Buttons Use `.subscription-button`**:

Keep the initialization as-is (script already looks for `.subscription-button`)

**BUT** ensure buttons have data attributes (same as above)

---

## 🔧 **MOST LIKELY ISSUE**

**Buttons missing data attributes**. The script needs:
- `data-tier` (starter/professional/enterprise)
- `data-subscription-type` (lead-gen)

**Fix**: Add these attributes to your subscription buttons in Webflow Designer

---

## 📋 **STEP-BY-STEP FIX**

1. **Run console check above** → See which selector exists
2. **Inspect a button** → Check if it has `data-tier` and `data-subscription-type`
3. **If missing**: Add attributes in Webflow Designer
4. **Verify**: Console should show buttons and attributes

---

**Next**: Run the console check and share results!

