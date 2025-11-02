# ✅ Stripe Restricted Key - Exact Permissions Needed

**For**: Rensto Marketplace Checkout Testing  
**Mode**: TEST MODE

---

## 📋 **SELECT THESE PERMISSIONS**

### **Core** Section:
```
✅ Checkout Sessions - Write
✅ Payment Intents - Read  
✅ Customers - Read + Write
✅ Charges - Read
```

### **All webhook** Section:
```
✅ Webhook Endpoints - Read + Write
```

### **Events** Section (if shown separately):
```
✅ Events - Read
```

---

## ❌ **DON'T SELECT** (Not Needed):

- ❌ Balance (we don't transfer balances)
- ❌ Payouts (not processing payouts)
- ❌ Subscriptions (marketplace is one-time payments, not subscriptions)
- ❌ Invoices (handled by Stripe automatically)
- ❌ Connect (not using Stripe Connect)
- ❌ Terminal (not using Stripe Terminal)
- ❌ Everything else (only what's listed above)

---

## 🎯 **MINIMAL PERMISSIONS = MAXIMUM SECURITY**

By only selecting what we need:
- ✅ Less risk if key is compromised
- ✅ Easier to audit what the key can do
- ✅ Better for testing/development

---

**After creating key**: Copy both the secret key (`sk_test_...`) and webhook secret (`whsec_...`)

