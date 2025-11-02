# 💳 Stripe Integration Test - Quick Instructions

**Status**: Ready to test  
**Last Updated**: November 2, 2025

---

## 🎯 **QUICK TEST STEPS**

### **1. Complete Payment**

**Checkout URL** (already created):
```
https://checkout.stripe.com/c/pay/cs_live_a12jizUHvEtBIkJtzkKdA1m7bDBftNFEVuwb9ZPubQykgK1P6iggNLFuEg
```

**Test Card Details**:
- **Card**: `4242 4242 4242 4242`
- **Expiry**: `12/34`
- **CVC**: `123`
- **ZIP**: `12345`

### **2. Verify Webhook Delivery** (30 seconds after payment)

**Stripe Dashboard**:
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Look for: `checkout.session.completed` event
3. Check: Status = ✅ Succeeded (200)

**Or check Vercel logs**:
```bash
cd apps/web/rensto-site
vercel logs --follow
```

### **3. Check n8n Execution** (1 minute after payment)

1. Go to: http://173.254.201.134:5678/executions
2. Find: STRIPE-MARKETPLACE-001 workflow
3. Verify: Latest execution shows all green nodes ✅

### **4. Verify Airtable Record** (1 minute after payment)

1. Open: Operations & Automation base
2. Table: Marketplace Purchases
3. Find: Record with email `test-1762051338385@rensto.com`
4. Verify:
   - ✅ Download Link populated
   - ✅ Status = "📥 Download Link Sent"
   - ✅ Access Granted = true

### **5. Test Download Link**

1. Copy Download Link from Airtable
2. Open in browser
3. Verify: Redirects to GitHub and downloads JSON file

---

## 🔄 **CREATE NEW TEST SESSION**

If you need a fresh test:

```bash
cd apps/web/rensto-site
node scripts/test-stripe-integration.js
```

---

## ✅ **SUCCESS CHECKLIST**

- [ ] Payment completed with test card
- [ ] Webhook delivered to Vercel (check Stripe Dashboard)
- [ ] n8n workflow executed (check n8n executions)
- [ ] Airtable record created (check Marketplace Purchases table)
- [ ] Download link works (opens GitHub raw file)

---

**If all checkboxes ✅ = Integration working perfectly!**

