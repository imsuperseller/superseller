# 🛠️ Service Pages Script Deployment

**Date**: October 7, 2025
**Purpose**: Update 4 static service pages with correct checkout scripts
**After**: CMS template deployment

---

## 📋 Pages to Update

Unlike the niche pages (which use a CMS template), these 4 service pages are **static** and need **individual updates**:

1. **Marketplace** (`/marketplace`)
2. **Subscriptions** (`/subscriptions`)
3. **Ready Solutions** (`/ready-solutions`)
4. **Custom Solutions** (`/custom-solutions`)

---

## 🎯 Scripts for Each Page

### **1. Marketplace** (`/marketplace`)

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>
```

**Handles**: Template purchases, full-service installs

---

### **2. Subscriptions** (`/subscriptions`)

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js"></script>
```

**Handles**: Monthly subscriptions ($299-$1,499/month)

---

### **3. Ready Solutions** (`/ready-solutions`)

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js"></script>
```

**Handles**: Industry packages ($890-$2,990)

---

### **4. Custom Solutions** (`/custom-solutions`)

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/custom-solutions/checkout.js"></script>
```

**Handles**: Custom project quotes, audits, sprints

---

## 📝 Step-by-Step for Each Page

### **For EACH of the 4 pages above:**

1. **Open Webflow Designer**

2. **Navigate to the page**:
   - Click "Pages" (left sidebar)
   - Find and click the page name

3. **Open Page Settings**:
   - Click the gear icon (top toolbar)

4. **Go to Custom Code section**:
   - Scroll down to "Custom Code"

5. **Paste the code**:
   - Find "Before </body> tag" field
   - Copy the correct code from above
   - Paste into the field

6. **Save**:
   - Click "Save" button at bottom

7. **Move to next page** (repeat for all 4)

8. **Publish once at the end**:
   - Click "Publish" (top right)
   - Select all domains
   - Publish

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Marketplace | 3 min |
| Subscriptions | 3 min |
| Ready Solutions | 3 min |
| Custom Solutions | 3 min |
| Publish all | 2 min |
| **TOTAL** | **14 minutes** |

---

## ✅ Verification Checklist

After deploying all 4 pages:

### **Test Marketplace**:
- [ ] Open https://www.rensto.com/marketplace
- [ ] Check browser console for: `🎯 [Rensto Stripe] Marketplace Checkout`
- [ ] Click a pricing button
- [ ] Should redirect to Stripe checkout

### **Test Subscriptions**:
- [ ] Open https://www.rensto.com/subscriptions
- [ ] Check browser console for: `🎯 [Rensto Stripe] Subscriptions Checkout`
- [ ] Click a subscription button
- [ ] Should redirect to Stripe checkout

### **Test Ready Solutions**:
- [ ] Open https://www.rensto.com/ready-solutions
- [ ] Check browser console for: `🎯 [Rensto Stripe] Ready Solutions Checkout`
- [ ] Click a package button
- [ ] Should redirect to Stripe checkout

### **Test Custom Solutions**:
- [ ] Open https://www.rensto.com/custom-solutions
- [ ] Check browser console for: `🎯 [Rensto Stripe] Custom Solutions Checkout`
- [ ] Click audit or sprint button
- [ ] Should redirect to Stripe checkout

---

## 🎯 What Each Script Does

### **shared/stripe-core.js** (All pages use this)
- Loads Stripe library
- Handles checkout session creation
- Manages error handling
- Provides core checkout functionality

### **marketplace/checkout.js**
- Initializes marketplace-specific buttons
- Handles template purchases
- Handles full-service installs

### **subscriptions/checkout.js**
- Initializes subscription buttons
- Handles recurring payments
- Manages subscription tiers

### **ready-solutions/checkout.js**
- Initializes package buttons
- Handles starter/professional/enterprise tiers
- Used by niche pages too!

### **custom-solutions/checkout.js**
- Initializes custom project buttons
- Handles audit purchases
- Handles sprint purchases

---

## 🔄 After Deployment

Once all 4 service pages are updated:

**✅ You'll have:**
- 16 niche pages with scripts (via CMS template)
- 4 service pages with scripts (individual updates)
- **Total: 20 pages with working Stripe checkouts**

**🎉 Revenue Collection Status:**
- All 5 payment flow types working
- All pricing buttons functional
- Ready to accept payments

---

## 💡 Future Updates

**If you need to update JavaScript:**
1. Edit files in GitHub repo: `rensto-webflow-scripts`
2. Commit and push
3. Vercel auto-deploys in 30 seconds
4. All 20 pages update automatically
5. **No Webflow changes needed!**

**That's the power of external scripts!** 🚀

---

**Created**: October 7, 2025
**Purpose**: Service pages script deployment guide
**Pages**: 4 static service pages
**Time**: ~15 minutes total
