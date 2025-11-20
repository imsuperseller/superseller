# ✅ Stripe Checkout Testing Checklist

**Date**: November 2, 2025  
**Status**: ⏸️ **AWAITING STRIPE ACCOUNT REVIEW COMPLETION**  
**Purpose**: Comprehensive testing checklist for when Stripe account review completes

---

## 🚨 **PREREQUISITE**

**Before Testing**: ⏸️ **Stripe Account Review Must Complete**
- Account ID: `acct_1R4wsKDE8rt1dEs1`
- Status: Under review (business profile submitted)
- Product Description: ✅ Added (requires LIVE mode to edit)

**When Review Completes**: Proceed with all tests below

---

## ✅ **PRE-TEST VERIFICATION**

### **1. Environment Variables** ✅ **VERIFIED**

**Vercel Production**:
- ✅ `STRIPE_SECRET_KEY` = `sk_test_...` (test key)
- ✅ `STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (test key)
- ✅ `STRIPE_WEBHOOK_SECRET` = `whsec_...` (webhook signing secret)
- ✅ `AIRTABLE_API_KEY` = `pat...` (Airtable token)

**Verification Command**:
```bash
# Check all env vars are set
vercel env ls api-rensto-site --environment production
```

---

### **2. API Endpoints** ✅ **DEPLOYED**

| Endpoint | URL | Status | Purpose |
|----------|-----|--------|---------|
| **Checkout** | `https://api.rensto.com/api/stripe/checkout` | ✅ Deployed | Create checkout sessions |
| **Webhook** | `https://api.rensto.com/api/stripe/webhook` | ✅ Deployed | Receive Stripe events |
| **Download Links** | `https://api.rensto.com/api/marketplace/downloads` | ✅ Deployed | Generate download tokens |
| **Installation Booking** | `https://api.rensto.com/api/installation/booking` | ✅ Deployed | TidyCal integration |

---

### **3. Stripe Webhook Configuration** ✅ **VERIFIED**

**Webhook ID**: `we_1SF5qCDE8rt1dEs1SbZCqETE`  
**Webhook URL**: `https://api.rensto.com/api/stripe/webhook`  
**Enabled Events**: ✅ `checkout.session.completed`, `payment_intent.succeeded`  
**Signing Secret**: `whsec_...` (stored in Vercel env vars)

**Verification**: ✅ Webhook verified (Nov 1, 2025)

---

### **4. n8n Workflows** ✅ **CONFIGURED**

| Workflow | Purpose | Status |
|----------|---------|--------|
| `STRIPE-MARKETPLACE-001` | Template purchase automation | ⚠️ Verify active |
| `STRIPE-INSTALL-001` | Installation purchase automation | ⚠️ Verify active |
| `DEV-FIN-006` | Revenue sync to Airtable | ⚠️ Verify active |

**Action**: Verify workflows are active and connected to webhook

---

## 🧪 **TESTING PHASES**

### **Phase 1: Basic Checkout Session Creation** ⏳ **READY**

**Test**: Verify checkout sessions can be created

**Steps**:
1. [ ] Open browser console on Marketplace page
2. [ ] Click any "Download - $XX" button
3. [ ] Verify console shows: "Creating checkout session..."
4. [ ] Verify redirect to Stripe checkout page (URL starts with `checkout.stripe.com`)
5. [ ] Verify checkout page loads (not blank, not error)

**Expected**: ✅ Checkout session created, redirect works

**If Fails**: Check browser console, Vercel logs, Stripe Dashboard events

---

### **Phase 2: Test Payment** ⏳ **READY**

**Test**: Complete a test payment with Stripe test card

**Stripe Test Card**: `4242 4242 4242 4242`  
**Expiry**: Any future date (e.g., `12/34`)  
**CVC**: Any 3 digits (e.g., `123`)  
**ZIP**: Any 5 digits (e.g., `12345`)

**Steps**:
1. [ ] On Stripe checkout page, enter test card details
2. [ ] Enter email address
3. [ ] Click "Pay"
4. [ ] Verify payment succeeds
5. [ ] Verify redirect to `https://www.rensto.com/?payment=success...`
6. [ ] Verify success message displays (if implemented)

**Expected**: ✅ Payment succeeds, redirects correctly

**If Fails**: Check Stripe Dashboard → Events, verify session status

---

### **Phase 3: Webhook Processing** ⏳ **READY**

**Test**: Verify webhook receives and processes payment event

**Steps**:
1. [ ] Complete test payment (Phase 2)
2. [ ] Wait 5-10 seconds for webhook processing
3. [ ] Check Stripe Dashboard → Webhooks → Latest delivery
4. [ ] Verify webhook delivery status: ✅ `200 OK`
5. [ ] Check Vercel logs: `/api/stripe/webhook`
6. [ ] Verify logs show: "Webhook processed successfully"

**Expected**: ✅ Webhook delivered successfully, processed by API

**If Fails**: Check webhook URL, signing secret, Vercel deployment

---

### **Phase 4: n8n Workflow Trigger** ⏳ **READY**

**Test**: Verify n8n workflow executes after webhook

**Steps**:
1. [ ] After test payment (Phase 2), wait 10 seconds
2. [ ] Open n8n: http://173.254.201.134:5678
3. [ ] Go to Executions tab
4. [ ] Verify `STRIPE-MARKETPLACE-001` or `STRIPE-INSTALL-001` executed
5. [ ] Click execution to view details
6. [ ] Verify workflow completed successfully (green checkmark)

**Expected**: ✅ n8n workflow triggered and completed

**If Fails**: Check n8n workflow webhook URL, verify workflow is active

---

### **Phase 5: Download Flow** ⏳ **READY**

**Test**: Verify download link is generated and sent

**Steps**:
1. [ ] Complete test payment for template download
2. [ ] Check email inbox (use test email from checkout)
3. [ ] Verify email received from Rensto
4. [ ] Verify email contains:
   - [ ] Download link
   - [ ] Setup instructions
   - [ ] n8n affiliate link (`https://tinyurl.com/ym3awuke`)
5. [ ] Click download link
6. [ ] Verify link works (redirects to GitHub or CDN)
7. [ ] Verify JSON file downloads correctly
8. [ ] Verify JSON can be imported into n8n

**Expected**: ✅ Email sent, download link works, file valid

**If Fails**: Check n8n workflow email node, verify SMTP credentials

---

### **Phase 6: Installation Flow** ⏳ **READY**

**Test**: Verify TidyCal booking link is generated and sent

**Steps**:
1. [ ] Complete test payment for installation service
2. [ ] Check email inbox
3. [ ] Verify email received from Rensto
4. [ ] Verify email contains:
   - [ ] TidyCal booking link (REQUIRED)
   - [ ] n8n affiliate link
   - [ ] What to prepare for installation call
5. [ ] Click TidyCal booking link
6. [ ] Verify booking page opens correctly
7. [ ] Verify booking form is accessible

**Expected**: ✅ Email sent, TidyCal link works, booking accessible

**If Fails**: Check `STRIPE-INSTALL-001` workflow, verify TidyCal integration

---

### **Phase 7: Airtable Record Creation** ⏳ **READY**

**Test**: Verify purchase records are created in Airtable

**Steps**:
1. [ ] After test payment (Phase 2), wait 10 seconds
2. [ ] Open Airtable: Operations & Automation base
3. [ ] Navigate to "Marketplace Purchases" table
4. [ ] Verify new record created
5. [ ] Verify record fields populated:
   - [ ] Customer Email
   - [ ] Product (linked to Marketplace Products)
   - [ ] Purchase Type (Download/Installation)
   - [ ] Amount Paid
   - [ ] Stripe Payment Intent ID
   - [ ] Status (e.g., "📥 Download Link Sent")
6. [ ] If installation: Verify TidyCal Booking Link field populated

**Expected**: ✅ Record created with all fields populated

**If Fails**: Check n8n workflow Airtable nodes, verify credentials

---

### **Phase 8: Error Handling** ⏳ **READY**

**Test**: Verify error handling for invalid inputs

**Test Cases**:
1. [ ] **Invalid product ID**: Use non-existent `template-id`
   - Expected: 400 error, user-friendly message
2. [ ] **Missing required fields**: Submit checkout without `flowType`
   - Expected: 400 error, validation message
3. [ ] **API failure**: Temporarily disable Airtable API key
   - Expected: 500 error, graceful failure
4. [ ] **Network timeout**: Simulate slow connection
   - Expected: Timeout error, retry option

**Expected**: ✅ All errors handled gracefully

---

### **Phase 9: Mobile Testing** ⏳ **READY**

**Test**: Verify checkout works on mobile devices

**Steps**:
1. [ ] Open Marketplace page on mobile device (iOS Safari, Android Chrome)
2. [ ] Verify page loads correctly
3. [ ] Click "Download - $XX" button
4. [ ] Verify Stripe checkout opens (mobile-optimized)
5. [ ] Complete test payment
6. [ ] Verify redirect to success page
7. [ ] Verify email received on mobile

**Expected**: ✅ Mobile experience smooth, no layout issues

---

### **Phase 10: All 5 Payment Flows** ⏳ **READY**

**Test**: Verify all 5 payment flow types work

**Flow 1: Marketplace Template** ✅ **READY**
- [ ] Click "Download - $29" button
- [ ] Complete payment
- [ ] Verify download email received

**Flow 2: Marketplace Install** ✅ **READY**
- [ ] Click "Book Install - $797" button
- [ ] Complete payment
- [ ] Verify TidyCal booking email received

**Flow 3: Ready Solutions Package** ✅ **READY**
- [ ] Go to `/ready-solutions`
- [ ] Click package purchase button
- [ ] Complete payment
- [ ] Verify confirmation email received

**Flow 4: Subscriptions Monthly** ✅ **READY**
- [ ] Go to `/subscriptions`
- [ ] Click subscription button
- [ ] Complete payment
- [ ] Verify subscription created in Stripe

**Flow 5: Custom Solutions Entry** ✅ **READY**
- [ ] Go to `/custom-solutions`
- [ ] Click entry-level product button
- [ ] Complete payment
- [ ] Verify confirmation email received

**Expected**: ✅ All 5 flows work end-to-end

---

## 📊 **SUCCESS CRITERIA**

**All tests pass when**:
- ✅ Checkout sessions create successfully
- ✅ Payments complete without errors
- ✅ Webhooks deliver and process correctly
- ✅ n8n workflows trigger automatically
- ✅ Download/booking emails sent
- ✅ Airtable records created
- ✅ Mobile experience works
- ✅ All 5 payment flows functional

---

## 🐛 **TROUBLESHOOTING GUIDE**

### **"Something went wrong" Error**

**Possible Causes**:
1. Stripe account still in review → Wait for approval
2. API keys mismatch (test vs live) → Verify Vercel env vars
3. Webhook URL incorrect → Check Stripe Dashboard
4. Domain verification issue → Check `www.rensto.com` vs `rensto.com`

**Debug Steps**:
1. Check browser console for errors
2. Check Vercel logs: `vercel logs api-rensto-site`
3. Check Stripe Dashboard → Events → Latest
4. Verify environment variables match test mode

---

### **Webhook Not Delivering**

**Possible Causes**:
1. Webhook URL incorrect → Verify in Stripe Dashboard
2. Signing secret mismatch → Verify Vercel env var
3. Network/firewall blocking → Check Vercel deployment
4. Webhook endpoint returns error → Check API logs

**Debug Steps**:
1. Stripe Dashboard → Webhooks → Latest delivery
2. Check delivery status and error message
3. Test webhook manually: `curl -X POST https://api.rensto.com/api/stripe/webhook`
4. Verify webhook secret in Vercel matches Stripe

---

### **n8n Workflow Not Triggering**

**Possible Causes**:
1. Workflow webhook URL incorrect → Check workflow settings
2. Workflow inactive → Verify workflow is active
3. Webhook payload format mismatch → Check workflow webhook node

**Debug Steps**:
1. Check n8n Executions tab for errors
2. Verify webhook URL in workflow matches API endpoint
3. Test webhook node manually with sample payload
4. Check n8n logs for connection errors

---

## 📝 **TEST RESULTS TEMPLATE**

After completing tests, document results:

```markdown
## Test Results - [DATE]

### Phase 1: Checkout Creation
- [ ] Status: ✅ PASS / ❌ FAIL
- Notes: [Any issues found]

### Phase 2: Test Payment
- [ ] Status: ✅ PASS / ❌ FAIL
- Notes: [Any issues found]

### Phase 3: Webhook Processing
- [ ] Status: ✅ PASS / ❌ FAIL
- Notes: [Any issues found]

[... continue for all phases ...]

### Overall Status
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Blockers: [List any blocking issues]
```

---

## 🎯 **READY TO TEST**

**When Stripe account review completes**:
1. ✅ All API endpoints deployed
2. ✅ Environment variables configured
3. ✅ Webhook verified
4. ✅ Test cards ready
5. ✅ n8n workflows configured (verify active)
6. ✅ Airtable tables ready
7. ✅ Email templates ready

**Estimated Testing Time**: 30-45 minutes for all phases

---

**Status**: ⏸️ **AWAITING STRIPE REVIEW → Ready to test when approved**

