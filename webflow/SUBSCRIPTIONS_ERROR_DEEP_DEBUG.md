# 🔍 Deep Debug: Subscriptions Checkout Error

**Error**: "Unable to process checkout. Please try again or contact support."  
**Status**: Buttons found, data attributes set, but checkout failing

---

## 🔍 **ROOT CAUSE INVESTIGATION**

### **What We Know**:
- ✅ Scripts loading
- ✅ 3 buttons found
- ✅ Data attributes set (tier, price, plan)
- ✅ API endpoint works (tested with curl)
- ❌ Button click → Error popup appears

### **Error Message Location**:
The error "Unable to process checkout" comes from `stripe-core.js` in the `handleCheckout` function's catch block.

---

## 🎯 **LIKELY CAUSES**

### **1. Missing Required Data Attributes**
The `handleCheckout` function in `stripe-core.js` expects:
- `data-flow-type`
- `data-tier` 
- `data-subscription-type`
- `data-price`

**Check**: Inspect button in browser → Verify all attributes present

### **2. API Request Failing**
The `handleCheckout` function makes a fetch request to `/api/stripe/checkout`. If this fails, it shows the error.

**Check Network Tab**:
1. Click button
2. Network tab → Find `/api/stripe/checkout` request
3. Check:
   - **Status code**: Should be 200
   - **Request payload**: Should have all required fields
   - **Response**: Should have `success: true, url: "..."`

### **3. Wrong API URL**
The script might be calling wrong endpoint.

**Check**: Console should show API URL being called

### **4. CORS or Network Error**
Fetch request might be blocked.

**Check**: Network tab → Look for CORS errors or failed requests

---

## 🧪 **DEBUG STEPS**

### **Step 1: Check Button Data Attributes** (30 sec)

In browser console:
```javascript
// Check first button
const btn = document.querySelector('.pricing-button');
console.log({
  flowType: btn.getAttribute('data-flow-type'),
  tier: btn.getAttribute('data-tier'),
  subscriptionType: btn.getAttribute('data-subscription-type'),
  price: btn.getAttribute('data-price'),
  pageType: btn.getAttribute('data-page-type')
});
```

**Expected**: All should have values (not null)

---

### **Step 2: Check Network Request** (1 min)

1. Open Network tab (F12)
2. Click subscription button
3. Find request to `api.rensto.com/api/stripe/checkout`
4. Click on request → Check:
   - **Status**: Should be 200
   - **Request Payload**: Should have:
     ```json
     {
       "flowType": "subscription",
       "tier": "starter" (or professional/enterprise),
       "subscriptionType": "lead-gen",
       "pageType": "subscriptions"
     }
     ```
   - **Response**: Should have `{"success": true, "url": "..."}`

**If request fails**: Check error message in response

---

### **Step 3: Check Console for Errors** (30 sec)

1. Open Console tab (F12)
2. Click button
3. Look for red error messages
4. Share error details

---

### **Step 4: Test API Directly** (30 sec)

In browser console:
```javascript
fetch('https://api.rensto.com/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    flowType: 'subscription',
    tier: 'professional',
    subscriptionType: 'lead-gen',
    pageType: 'subscriptions'
  })
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

**Expected**: Should return `{success: true, url: "..."}`

---

## 🔧 **QUICK FIXES TO TRY**

### **Fix 1: Ensure Data Attributes Are Set** 

The initialization script should set all attributes. Verify in console that attributes exist BEFORE clicking.

### **Fix 2: Check API URL Configuration**

The script might be using wrong base URL. Check if it's calling:
- ✅ `https://api.rensto.com/api/stripe/checkout`
- ❌ `http://localhost:3000/api/stripe/checkout` (wrong)
- ❌ `/api/stripe/checkout` (relative - might fail)

### **Fix 3: Add Manual Error Handling**

Add this to test:
```javascript
// Test button click manually
document.querySelector('.pricing-button').addEventListener('click', async function(e) {
  e.preventDefault();
  const btn = this;
  
  console.log('Button clicked!', {
    flowType: btn.getAttribute('data-flow-type'),
    tier: btn.getAttribute('data-tier'),
    subscriptionType: btn.getAttribute('data-subscription-type'),
    price: btn.getAttribute('data-price')
  });
  
  // Test API call
  try {
    const response = await fetch('https://api.rensto.com/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flowType: btn.getAttribute('data-flow-type'),
        tier: btn.getAttribute('data-tier'),
        subscriptionType: btn.getAttribute('data-subscription-type'),
        pageType: btn.getAttribute('data-page-type')
      })
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.success && data.url) {
      window.location.href = data.url;
    } else {
      alert('Error: ' + (data.error || 'Unknown error'));
    }
  } catch(err) {
    console.error('Fetch error:', err);
    alert('Network error: ' + err.message);
  }
});
```

---

## 📋 **SHARE THESE DETAILS**

1. **Network tab** → Request to `/api/stripe/checkout`:
   - Status code
   - Request payload
   - Response body

2. **Console errors** (if any)

3. **Button data attributes** (run the console check above)

---

*This will help pinpoint the exact failure point*

