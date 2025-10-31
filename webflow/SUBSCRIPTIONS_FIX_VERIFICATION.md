# ✅ Subscriptions Fix Verification

**Date**: October 30, 2025  
**Action**: Verify subscriptions checkout fix is live

---

## 🔍 **VERIFICATION STEPS**

### **1. Check Live Page Script Loading**

**Test**: Verify `checkout.js?v=2` is loading on live site

```bash
curl -s "https://rensto.com/subscriptions" | grep "checkout.js"
```

**Expected**: Script URL includes `?v=2` parameter

---

### **2. Check Script Size**

**Test**: Verify script is new version (not cached 843 bytes)

```bash
curl -s "https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js?v=2" | wc -c
```

**Expected**: ~2,000+ bytes (not 843 bytes)

---

### **3. Check Script Content**

**Test**: Verify script has plan extraction code

```bash
curl -s "https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js?v=2" | grep -i "plan\|extract\|tier"
```

**Expected**: Contains plan extraction logic

---

### **4. Test Checkout Button**

**Manual Test**:
1. Visit: https://rensto.com/subscriptions
2. Open browser console (F12)
3. Click any subscription tier button
4. **Expected**: Stripe checkout opens (not error)

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Script URL includes `?v=2` on live page
- [ ] Script size > 2000 bytes (not cached 843 bytes)
- [ ] Script contains plan extraction code
- [ ] `RenstoStripe` object available
- [ ] `initCheckoutButtons` called
- [ ] Checkout buttons functional (manual test)

---

## 📊 **RESULTS**

*Run verification commands above to fill in results*

---

*Created: October 30, 2025*

