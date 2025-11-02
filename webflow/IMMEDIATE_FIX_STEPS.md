# 🚨 Immediate Fix: Stripe Test Mode Not Working

**Issue**: Vercel still using LIVE keys after update  
**Action Required**: Verify and force redeploy

---

## 🔍 **STEP 1: VERIFY ENV VAR IN VERCEL**

Go to: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/settings/environment-variables

**Check**:
1. Find `STRIPE_SECRET_KEY`
2. **Current value should be**: 
   ```
   sk_test_51R4wsKDE8rt1dEs1nd80IlSfi2JWqSqregagcuBJycBWR2pQafjM74g7esHoJ5hCBpxm7L79oKL4TYLRwNAQNDB600AAIoVosN
   ```
3. **NOT**: `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` ❌

4. **Applied to**: Make sure ALL three are checked:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

---

## 🔄 **STEP 2: FORCE REDEPLOY**

If env var is correct but still not working:

### **Option A: Via Vercel Dashboard** (Easiest)
1. Go to: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/deployments
2. Find latest deployment
3. Click **"..."** (three dots) → **"Redeploy"**
4. Select: **"Use existing Build Cache"** = OFF
5. Click **"Redeploy"**
6. Wait for completion (~1-2 minutes)

### **Option B: Via CLI**
```bash
cd apps/web/rensto-site
vercel --prod --force
```

---

## ✅ **STEP 3: VERIFY AFTER REDEPLOY**

Wait 2 minutes, then test:
```bash
curl -X POST https://rensto-main-website.vercel.app/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"flowType":"marketplace-template","productId":"email-persona-system","tier":"simple"}'
```

**Check session ID**:
- ✅ `cs_test_...` = SUCCESS! Test mode working
- ❌ `cs_live_...` = Still wrong, check env var again

---

## 🎯 **IF STILL NOT WORKING**

**Possible issues**:
1. **Wrong project**: Make sure you're updating `rensto-main-website` project
2. **Cache**: Vercel edge cache might need clearing
3. **Multiple env vars**: Check if there are duplicate `STRIPE_SECRET_KEY` entries (delete old ones)

**Debug**:
- Check Vercel deployment logs
- Look for "Using Stripe key: sk_..." in logs
- Verify code is reading `process.env.STRIPE_SECRET_KEY`

---

**Priority**: HIGH - Marketplace checkout blocked until test mode works

