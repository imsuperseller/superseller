# 🎯 Webflow Button Class Update Guide - Option 1

**Date**: October 26, 2025
**Status**: ✅ Ready for Implementation
**Estimated Time**: 15-20 minutes

---

## 📋 WHAT NEEDS TO BE CHANGED

Update button classes on 4 service pages to match what the Stripe scripts expect:

| Page | Current Class | New Class | Data Attribute |
|------|---------------|-----------|----------------|
| **Subscriptions** | `pricing-button` | `subscription-button` | `data-plan` |
| **Ready Solutions** | `pricing-button` | `ready-solutions-button` | `data-tier` |
| **Custom Solutions** | `pricing-button` | `custom-solutions-button` | `data-product` |
| **Marketplace** | `pricing-button` | `marketplace-button` | `data-product` |

---

## 🎯 IMPLEMENTATION STEPS

### **STEP 1: Update Subscriptions Page**

1. **Open Webflow Designer**:
   - Go to https://webflow.com/dashboard
   - Open Rensto project
   - Navigate to **Subscriptions** page

2. **Find the Pricing Buttons**:
   - Look for buttons with text "Start Free Trial"
   - They currently have `class="pricing-button"`

3. **Update Each Button**:
   - **Starter Plan Button**:
     - Change class from `pricing-button` to `subscription-button`
     - Change href from `/checkout?plan=starter` to `#`
     - Add `data-plan="starter"`
   - **Pro Plan Button**:
     - Change class from `pricing-button` to `subscription-button`
     - Change href from `/checkout?plan=pro` to `#`
     - Add `data-plan="pro"`
   - **Enterprise Plan Button**:
     - Change class from `pricing-button` to `subscription-button`
     - Change href from `/checkout?plan=enterprise` to `#`
     - Add `data-plan="enterprise"`

4. **Save and Preview**:
   - Click **Save** in Webflow Designer
   - Preview the page (press P)
   - Open browser console (F12)
   - Look for: `🎯 Rensto Subscription Checkout Initialized`

### **STEP 2: Update Ready Solutions Page**

1. **Navigate to Ready Solutions page**
2. **Find the Pricing Buttons**:
   - Look for buttons with text "Get Started" or similar
   - They currently have `class="pricing-button"`

3. **Update Each Button**:
   - **Starter Package Button**:
     - Change class from `pricing-button` to `ready-solutions-button`
     - Change href from `/checkout?plan=starter` to `#`
     - Add `data-tier="starter"`
   - **Professional Package Button**:
     - Change class from `pricing-button` to `ready-solutions-button`
     - Change href from `/checkout?plan=professional` to `#`
     - Add `data-tier="professional"`
   - **Enterprise Package Button**:
     - Change class from `pricing-button` to `ready-solutions-button`
     - Change href from `/checkout?plan=enterprise` to `#`
     - Add `data-tier="enterprise"`

4. **Save and Preview**:
   - Look for: `🎯 Rensto Ready Solutions Checkout Initialized`

### **STEP 3: Update Custom Solutions Page**

1. **Navigate to Custom Solutions page**
2. **Find the Pricing Buttons**:
   - Look for buttons with text "Book Now" or similar
   - They currently have `class="pricing-button"`

3. **Update Each Button**:
   - **Business Audit Button**:
     - Change class from `pricing-button` to `custom-solutions-button`
     - Change href from `/checkout?plan=audit` to `#`
     - Add `data-product="audit"`
   - **Automation Sprint Button**:
     - Change class from `pricing-button` to `custom-solutions-button`
     - Change href from `/checkout?plan=sprint` to `#`
     - Add `data-product="sprint"`
   - **Custom Project Buttons**:
     - Change class from `pricing-button` to `custom-solutions-button`
     - Change href from `/checkout?plan=...` to `#`
     - Add `data-product="simple"` (or "standard", "complex")

4. **Save and Preview**:
   - Look for: `🎯 Rensto Custom Solutions Checkout Initialized`

### **STEP 4: Update Marketplace Page**

1. **Navigate to Marketplace page**
2. **Find the Pricing Buttons**:
   - Look for template purchase buttons
   - They currently have `class="pricing-button"`

3. **Update Each Button**:
   - **Template Buttons**:
     - Change class from `pricing-button` to `marketplace-button`
     - Change href from `/checkout?plan=...` to `#`
     - Add `data-product="template-simple"` (or "template-advanced", "template-complete")
   - **Installation Buttons**:
     - Change class from `pricing-button` to `marketplace-button`
     - Change href from `/checkout?plan=...` to `#`
     - Add `data-product="install-template"` (or "install-system", "install-enterprise")

4. **Save and Preview**:
   - Look for: `🎯 Rensto Marketplace Checkout Initialized`

### **STEP 5: Publish to Production**

1. **Publish the site**:
   - Click **Publish** button (top right in Webflow Designer)
   - Select **Publish to www.rensto.com**
   - Wait for publishing to complete (~30 seconds)

2. **Test Payment Flows**:
   - Visit each page: https://www.rensto.com/marketplace, /subscriptions, /ready-solutions, /custom-solutions
   - Click pricing buttons
   - Verify redirect to Stripe checkout
   - Use test card: `4242 4242 4242 4242`

---

## 🧪 TESTING CHECKLIST

After updating all pages, test these payment flows:

### Subscriptions Page
- [ ] Starter Plan ($299/month) → Stripe checkout
- [ ] Pro Plan ($599/month) → Stripe checkout
- [ ] Enterprise Plan ($1,499/month) → Stripe checkout

### Ready Solutions Page
- [ ] Starter Package ($890) → Stripe checkout
- [ ] Professional Package ($2,990) → Stripe checkout
- [ ] Enterprise Package ($2,990 + $797) → Stripe checkout

### Custom Solutions Page
- [ ] Business Audit ($297) → Stripe checkout
- [ ] Automation Sprint ($1,997) → Stripe checkout
- [ ] Custom Projects ($3,500+) → Stripe checkout

### Marketplace Page
- [ ] Template Purchases ($29-$197) → Stripe checkout
- [ ] Installation Services ($797-$3,500+) → Stripe checkout

---

## 🎉 EXPECTED RESULTS

After successful implementation:

- ✅ All buttons will redirect to Stripe checkout instead of `/checkout?plan=...`
- ✅ All 19 payment flows will be operational
- ✅ Revenue potential: $10K-50K/month
- ✅ Complete payment integration from button click to n8n webhook

---

## 📞 TROUBLESHOOTING

If buttons don't work after updating:

1. **Check Browser Console**:
   - Open F12 → Console tab
   - Look for error messages
   - Should see initialization messages

2. **Verify Button Classes**:
   - Right-click button → Inspect Element
   - Check class attribute matches expected class
   - Check data attributes are present

3. **Test API Endpoint**:
   - Run: `curl -X POST https://api.rensto.com/api/stripe/checkout -H "Content-Type: application/json" -d '{"flowType": "subscription", "tier": "starter"}'`
   - Should return success with Stripe URL

4. **Check Script Loading**:
   - Verify scripts are loading from `https://rensto-webflow-scripts.vercel.app/`
   - Check Network tab in browser dev tools

---

**Ready to implement? Start with the Subscriptions page and work through each service page!**
