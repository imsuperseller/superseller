# How to Edit Stripe Business Profile (Product Description)

**Issue**: "Only live keys can access this method" error  
**Reason**: Business profile can only be edited in LIVE mode (shared between test/live)

---

## ✅ **SOLUTION: Switch to LIVE Mode**

### **Step 1: Switch to LIVE Mode**

1. Go to: https://dashboard.stripe.com/test/settings/business
2. **Toggle the mode switch** (top-right corner)
   - Change from: **"Test mode"** (orange)
   - Change to: **"Live mode"** (gray)
3. Wait for the page to reload

### **Step 2: Edit Business Profile**

1. Once in **LIVE mode**, go to: Settings → Business
2. Click **"Edit business details"**
3. Find the **"Product description"** field
4. Paste this description:

```
Rensto provides AI-powered automation solutions and workflow templates to businesses, helping them automate repetitive tasks and save 10-50 hours per week. We charge customers immediately at checkout when they purchase pre-built templates ($29-$197), ready solutions packages ($890-$2,990), or monthly subscription services ($299-$1,499).
```

5. **Save** the form

### **Step 3: Switch Back to TEST Mode**

1. Toggle the mode switch back to **"Test mode"** (top-right)
2. The business profile changes apply to both test and live modes

---

## 📋 **WHY THIS HAPPENS**

**Business Profile is Shared**:
- Business profile settings (company name, product description, etc.) are shared between TEST and LIVE modes
- Stripe only allows editing in LIVE mode view
- Changes apply to both test and live checkout

**This is Normal**: Stripe's design - business info is account-level, not mode-specific.

---

## ✅ **AFTER EDITING**

1. ✅ Business profile will be complete
2. ✅ Product description will be set
3. ✅ Test checkout should work (if this was the missing piece)
4. ✅ Live checkout will also have the description

---

**Note**: You can safely switch to LIVE mode to edit - just don't use live API keys in code. We're only editing settings, not processing payments.

