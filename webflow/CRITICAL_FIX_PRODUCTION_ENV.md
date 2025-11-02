# 🚨 CRITICAL: Production Environment Variable Fix

**Issue**: Production still using LIVE Stripe key  
**Status**: ⚠️ **REQUIRES MANUAL UPDATE IN VERCEL DASHBOARD**

---

## ❌ **PROBLEM**

- ✅ Preview environment: Test key set
- ✅ Development environment: Test key set  
- ❌ **Production environment**: Still has LIVE key (`sk_live_...`)

**Result**: All production deployments create LIVE checkout sessions, test cards don't work.

---

## ✅ **IMMEDIATE FIX - VERCEL DASHBOARD**

### **Step 1: Go to Environment Variables**

1. Go to: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/settings/environment-variables
2. Find: `STRIPE_SECRET_KEY` in the list
3. **Look at each row** - you may have multiple entries

### **Step 2: Update Production Value**

**For the Production row**:
1. Click on the `STRIPE_SECRET_KEY` row that shows **"Production"**
2. Click **"Edit"** or the pencil icon
3. **Delete the current value** (which is likely the live key)
4. **Paste test key**:
   ```
   sk_test_51R4wsKDE8rt1dEs1nd80IlSfi2JWqSqregagcuBJycBWR2pQafjM74g7esHoJ5hCBpxm7L79oKL4TYLRwNAQNDB600AAIoVosN
   ```
5. **Save**

### **Step 3: Verify All Environments**

Make sure `STRIPE_SECRET_KEY` shows **test key** for:
- ✅ Production
- ✅ Preview
- ✅ Development

**Test key should start with**: `sk_test_...`  
**NOT**: `sk_live_...` ❌

### **Step 4: Force Redeploy**

After updating:
1. Go to: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/deployments
2. Find latest deployment
3. Click **"..."** → **"Redeploy"**
4. Make sure **"Use existing Build Cache"** is **OFF**
5. Click **"Redeploy"**
6. Wait 2-3 minutes for completion

---

## 🧪 **VERIFY AFTER UPDATE**

After redeploy completes, test:
```bash
curl -X POST https://rensto-main-website.vercel.app/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"flowType":"marketplace-template","productId":"email-persona-system","tier":"simple"}'
```

**Check session ID**:
- ✅ Should be `cs_test_...` (test mode)
- ❌ If still `cs_live_...` = Env var not updated correctly

---

## 🔍 **IF STILL NOT WORKING**

**Check for duplicate entries**:
- You might have multiple `STRIPE_SECRET_KEY` entries
- Delete all of them
- Add fresh one with test key for all environments

**Or check build logs**:
- Deployment might be failing
- Check: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/5EnkXoAcMptZTq1nt1uZbTaAQp4m
- Look for errors in build logs

---

**Priority**: **CRITICAL** - Marketplace checkout blocked until Production uses test keys

