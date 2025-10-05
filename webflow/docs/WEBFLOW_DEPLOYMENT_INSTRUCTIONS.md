# 🚀 WEBFLOW DEPLOYMENT INSTRUCTIONS - Stripe Integration

**Date**: October 5, 2025
**Status**: ✅ Ready for Deployment
**Estimated Time**: 15-20 minutes

---

## 📋 WHAT'S READY

Two Webflow pages with complete Stripe checkout integration:

1. **Marketplace Page** (`WEBFLOW_EMBED_MARKETPLACE_CVJ.html`)
   - 6 pricing buttons integrated
   - DIY Templates: $29, $97, $197
   - Full-Service Install: $797, $1,997, $3,500+

2. **Subscriptions Page** (`WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html`)
   - 3 subscription tiers integrated
   - Starter: $299/month
   - Professional: $599/month
   - Enterprise: $1,499/month

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before you deploy, verify these are complete:

- [x] ✅ **customerEmail bug fixed** (API route updated and pushed to Vercel)
- [x] ✅ **Stripe API keys configured** (in Vercel environment variables)
- [x] ✅ **n8n workflows active** (6 STRIPE workflows ready to receive webhooks)
- [x] ✅ **Webflow pages exist** (Marketplace and Subscriptions pages created)
- [ ] ⚠️ **Test Stripe checkout with test card** (do this AFTER deployment)

---

## 🎯 DEPLOYMENT STEPS

### **STEP 1: Deploy Marketplace Page**

1. **Open the Marketplace HTML file**:
   - File: `/Users/shaifriedman/New Rensto/rensto/WEBFLOW_EMBED_MARKETPLACE_CVJ.html`
   - Open in text editor
   - **Copy the ENTIRE file contents** (including the version header)

2. **Open Webflow Designer**:
   - Go to https://webflow.com/dashboard
   - Open your Rensto project
   - Navigate to the **Marketplace** page

3. **Add Custom Code**:
   - Click the page settings icon (⚙️) in the left sidebar
   - Go to **Page Settings** → **Custom Code** tab
   - Scroll to **Before </body> tag** section
   - **Paste the entire Marketplace HTML** into this section
   - Click **Save**

4. **Verify the Integration**:
   - In Webflow Designer, preview the page (press P or click preview)
   - Open browser console (F12)
   - Look for: `🎯 Rensto Marketplace Checkout Initialized`
   - If you see this message, integration is active ✅

---

### **STEP 2: Deploy Subscriptions Page**

1. **Open the Subscriptions HTML file**:
   - File: `/Users/shaifriedman/New Rensto/rensto/WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html`
   - Open in text editor
   - **Copy the ENTIRE file contents** (including the version header)

2. **Open Webflow Designer**:
   - Still in Rensto project
   - Navigate to the **Subscriptions** page

3. **Add Custom Code**:
   - Click page settings (⚙️)
   - Go to **Page Settings** → **Custom Code** tab
   - Scroll to **Before </body> tag** section
   - **Paste the entire Subscriptions HTML** into this section
   - Click **Save**

4. **Verify the Integration**:
   - Preview the page (press P)
   - Open browser console (F12)
   - Look for: `🎯 Rensto Subscription Checkout Initialized`
   - If you see this message, integration is active ✅

---

### **STEP 3: Publish to Production**

1. **Publish the site**:
   - Click **Publish** button (top right in Webflow Designer)
   - Select **Publish to rensto.com** (or your production domain)
   - Wait for publishing to complete (~30 seconds)

2. **Verify DNS is working**:
   - Visit https://rensto.com/marketplace
   - Visit https://rensto.com/subscriptions
   - Both pages should load without errors

---

## 🧪 TESTING INSTRUCTIONS

### **Test 1: Marketplace Template Purchase**

1. Go to https://rensto.com/marketplace
2. Open browser console (F12)
3. Click **"Buy Template - $29"** button
4. Verify:
   - ✅ Console shows: `💳 Creating checkout session`
   - ✅ Console shows: `✅ Checkout session created, redirecting to Stripe...`
   - ✅ Redirects to Stripe Checkout page
5. On Stripe Checkout:
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/30)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
6. Complete checkout
7. Verify:
   - ✅ Redirected to success page
   - ✅ Check n8n workflow executions (should see new execution)
   - ✅ Check Airtable revenue tracking (should see new record)

### **Test 2: Subscriptions Monthly**

1. Go to https://rensto.com/subscriptions
2. Open browser console (F12)
3. Click **"Start Free Trial"** button (any tier)
4. Verify:
   - ✅ Console shows: `💳 Creating subscription checkout session`
   - ✅ Redirects to Stripe Checkout
5. Complete checkout with test card
6. Verify:
   - ✅ Subscription created in Stripe
   - ✅ n8n workflow triggered
   - ✅ Airtable record created

---

## 🐛 TROUBLESHOOTING

### **Problem: Button doesn't redirect to Stripe**

**Check 1**: Open browser console (F12), click button
- If you see `❌ Configuration error`: Data attributes are missing on button
- **Solution**: Verify you pasted the CORRECT file (v2.0 with data attributes)

**Check 2**: Console shows `❌ Checkout error: Failed to fetch`
- **Cause**: API route not accessible
- **Solution**: Verify `api.rensto.com` is pointing to Vercel and SSL is working

**Check 3**: Console shows `❌ Checkout error: Missing required field: flowType`
- **Cause**: Old API route (before customerEmail fix)
- **Solution**: Verify latest code is deployed to Vercel (commit `92557a5`)

---

### **Problem: Stripe Checkout opens but shows error**

**Check 1**: Error says "Invalid customer email"
- **Cause**: Old API route still validating customerEmail
- **Solution**: Verify API route fix is deployed (customerEmail should be optional)

**Check 2**: Price is wrong in Stripe Checkout
- **Cause**: Data attribute mismatch
- **Solution**: Check data-template-price or data-price matches button display price

---

### **Problem: Payment succeeds but n8n workflow doesn't trigger**

**Check 1**: Verify Stripe webhook is configured
- Go to Stripe Dashboard → Webhooks
- Verify webhook URL: `https://api.rensto.com/api/stripe/webhook`
- Verify events: `checkout.session.completed`, `payment_intent.succeeded`

**Check 2**: Check webhook logs
- In Stripe Dashboard → Webhooks → Click your webhook
- Check recent attempts for errors

**Check 3**: Check n8n workflows
- Go to http://173.254.201.134:5678
- Check "Executions" tab
- Verify STRIPE workflows received the webhook

---

## 📊 EXPECTED RESULTS

### **After Successful Deployment**:

✅ **Marketplace Page**:
- 6 buttons become clickable Stripe checkout triggers
- DIY: $29, $97, $197 templates
- Install: $797, $1,997, $3,500+ services

✅ **Subscriptions Page**:
- 3 buttons become clickable Stripe checkout triggers
- Monthly: $299, $599, $1,499 subscriptions

✅ **Revenue Collection**:
- Stripe collects payments
- Webhooks trigger n8n workflows
- Airtable records created automatically
- Customers receive fulfillment (templates, subscriptions activated)

---

## 📈 REVENUE IMPACT

**Potential Monthly Revenue** (when live):
- Marketplace: $2K-10K/month (based on 20-50 purchases)
- Subscriptions: $3K-10K/month (based on 10-20 subscribers)
- **Total**: $5K-20K/month potential

**Next Steps After Deployment**:
1. Monitor first 24-48 hours for any issues
2. Test all pricing tiers at least once
3. Verify n8n workflows fulfill orders correctly
4. Check Airtable revenue tracking accuracy
5. Deploy Ready Solutions ($890-$2,990) next
6. Deploy Custom Solutions ($3,500-$8,000) after that

---

## 🎉 SUCCESS CRITERIA

You'll know deployment is successful when:

1. ✅ Both pages published without errors
2. ✅ Console shows initialization messages
3. ✅ Test purchases complete successfully
4. ✅ Stripe dashboard shows test transactions
5. ✅ n8n workflows execute
6. ✅ Airtable records appear
7. ✅ No 404 errors or broken links
8. ✅ Mobile responsive (test on phone)

---

## 🚨 CRITICAL REMINDERS

1. **Test with Stripe test mode first** before going live
2. **Switch to live mode** only after all tests pass
3. **Monitor closely** for first 24 hours after going live
4. **Keep old code** as backup (already done - files versioned)
5. **Update CLAUDE.md** after successful deployment (mark as "✅ DEPLOYED")

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console (F12) for error messages
2. Check Stripe webhook logs in Stripe Dashboard
3. Check n8n execution logs at http://173.254.201.134:5678
4. Review API route code at `/apps/web/rensto-site/src/app/api/stripe/checkout/route.ts`
5. Verify environment variables in Vercel

---

**You're ready to deploy! 🚀**

Once deployed, you'll be able to collect revenue from Marketplace and Subscriptions immediately.
