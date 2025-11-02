# ✅ Vercel Environment Variable Checklist

**Issue**: Still getting `cs_live_...` sessions after updating to test keys  
**Status**: ⚠️ **NEEDS VERIFICATION**

---

## 🔍 **VERIFY VERCEL ENVIRONMENT VARIABLES**

### **Step 1: Check Vercel Dashboard**

1. Go to: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/settings/environment-variables
2. Find: `STRIPE_SECRET_KEY`
3. **Verify**:
   - ✅ Value: `sk_test_51R4wsKDE8rt1dEs1nd80IlSfi2JWqSqregagcuBJycBWR2pQafjM74g7esHoJ5hCBpxm7L79oKL4TYLRwNAQNDB600AAIoVosN`
   - ✅ Applied to: **Production**, **Preview**, **Development** (check all three!)
   - ✅ Not the old live key (`sk_live_...`)

### **Step 2: Check Deployment Environment**

The deployment at: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/5EnkXoAcMptZTq1nt1uZbTaAQp4m

**Check**:
- Which environment is this? (Production, Preview, Development)
- Did you update env vars for that specific environment?

### **Step 3: Force Redeploy**

If env var is correct but still showing live mode:

**Option A: Via Vercel Dashboard**:
1. Go to: Deployments tab
2. Find latest deployment
3. Click **"..."** → **"Redeploy"**
4. Wait for deployment to complete

**Option B: Via CLI**:
```bash
cd apps/web/rensto-site
vercel --prod
```

### **Step 4: Verify After Redeploy**

Wait 2-3 minutes after redeploy, then create new checkout:
```bash
curl -X POST https://rensto-main-website.vercel.app/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"flowType":"marketplace-template","productId":"email-persona-system","tier":"simple"}'
```

**Check session ID**:
- ✅ Should start with `cs_test_...` (test mode)
- ❌ Still `cs_live_...` = Env var not applied correctly

---

## 🔧 **TROUBLESHOOTING**

### **If Still Live Mode After Redeploy**:

1. **Check Environment Variable Scope**:
   - Production deployments need Production env vars
   - Preview deployments need Preview env vars
   - Make sure you updated the correct environment!

2. **Check for Typos**:
   - Key name: `STRIPE_SECRET_KEY` (exact match)
   - Value: Starts with `sk_test_...` (not `sk_live_...`)

3. **Check Deployment Logs**:
   - Go to deployment page → "Runtime Logs"
   - Look for errors about Stripe initialization
   - Check if env var is being read

4. **Verify in Code**:
   - Code reads: `process.env.STRIPE_SECRET_KEY`
   - Make sure variable name matches exactly

---

## ✅ **SUCCESS INDICATORS**

When working correctly:
- ✅ Session ID: `cs_test_...`
- ✅ Test cards work: `4242 4242 4242 4242`
- ✅ No "page not found" errors

---

**Next**: Verify env var in Vercel dashboard, then redeploy if needed

