# 🔍 Subscriptions Checkout Error Debug

**Date**: October 30, 2025  
**Error**: "Unable to process checkout. Please try again or contact support."  
**Status**: Script initializing but API call failing

---

## ✅ **WHAT'S WORKING**

- ✅ Script loading: `checkout.js?v=2` loaded successfully
- ✅ Initialization: "🎯 Subscriptions Checkout: Initializing..."
- ✅ Ready: "✅ Subscriptions Checkout: Ready"

---

## ❌ **WHAT'S FAILING**

- ❌ API call to checkout endpoint
- ❌ Error message: "Unable to process checkout. Please try again or contact support."

---

## 🔍 **DEBUGGING STEPS**

### **Step 1: Check Browser Console** (1 minute)

1. Open browser console (F12)
2. Go to **Console** tab
3. Click a subscription button
4. Look for error messages (usually red)

**What to look for**:
- API call logs (before error)
- Network request details
- Error stack trace

---

### **Step 2: Check Network Tab** (1 minute)

1. Open browser console (F12)
2. Go to **Network** tab
3. Click a subscription button
4. Find the API request (usually `/api/stripe/checkout`)
5. Click on it to see:
   - **Request URL**: Should be `https://api.rensto.com/api/stripe/checkout`
   - **Request Payload**: Check `flowType`, `tier`, `subscriptionType`
   - **Response**: Error message from API

---

### **Step 3: Verify API Endpoint** (30 seconds)

**Expected API Endpoint**: `https://api.rensto.com/api/stripe/checkout`

**Check if accessible**:
```bash
curl -X POST https://api.rensto.com/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"flowType":"subscription","tier":"starter","subscriptionType":"lead-gen"}'
```

**Expected Response**:
- ✅ Success: `{"success":true,"url":"https://checkout.stripe.com/..."}`
- ❌ Error: `{"error":"..."}`

---

## 📋 **COMMON ISSUES**

### **Issue 1: Wrong API URL**

**Problem**: Script calling wrong endpoint  
**Check**: Console should show API_URL being used

**Expected**: `https://api.rensto.com/api/stripe/checkout`

---

### **Issue 2: Missing Required Fields**

**Problem**: API expects `flowType`, `tier`, `subscriptionType`

**Check Request Payload**:
```json
{
  "flowType": "subscription",
  "tier": "starter",
  "subscriptionType": "lead-gen"
}
```

**If missing**: Script not extracting data correctly from buttons

---

### **Issue 3: API Endpoint Not Available**

**Problem**: `api.rensto.com` not accessible or not deployed

**Check**:
- Is `api.rensto.com` DNS pointing to Vercel?
- Is the API route deployed?
- Check Vercel dashboard for deployment status

---

### **Issue 4: CORS Error**

**Problem**: Cross-origin request blocked

**Check Console**: Should see CORS error message

**Fix**: API needs CORS headers configured

---

## 🎯 **IMMEDIATE CHECK**

**Do This Now** (2 minutes):

1. **Open Console** (F12)
2. **Click subscription button**
3. **Copy error message** from console
4. **Share the error** so we can identify the issue

**Or Check Network Tab**:
1. **Network tab** → Click button
2. **Find `/api/stripe/checkout` request**
3. **Check Response tab** → See actual API error

---

## 📊 **NEXT STEPS**

Once we see the actual error:
- ✅ Can fix API endpoint
- ✅ Can fix request payload
- ✅ Can fix CORS/access issues
- ✅ Can verify API deployment

---

**Action Required**: Check browser console for actual error details

---

*Created: October 30, 2025*

