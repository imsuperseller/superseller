# 🔧 Subscriptions Checkout Fix - Step by Step

**Date**: October 30, 2025  
**Priority**: 🔴 CRITICAL - Revenue Blocker  
**Time**: 5 minutes  
**Page ID**: `68dfc41ffedc0a46e687c84b`

---

## 🎯 **PROBLEM**

- CDN cache serving old checkout script (843 bytes, missing plan extraction)
- Checkout buttons on subscriptions page not working
- **Impact**: Cannot process subscription payments (REVENUE BLOCKER)

---

## ✅ **SOLUTION**

Replace the script with cache-busting parameter `?v=2` to force browser to fetch latest version.

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Open Webflow Designer** (30 seconds)

1. Go to https://webflow.com/designer
2. Open your Rensto site: `66c7e551a317e0e9c9f906d8`
3. Wait for Designer to load

---

### **Step 2: Navigate to Subscriptions Page** (30 seconds)

1. In left sidebar, click **Pages** (or press `P`)
2. Find **Subscriptions** page in the list
3. Click to open it
4. **Verify**: You're on the subscriptions page (URL should show `/subscriptions`)

**Quick Find**: Look for page ID `68dfc41ffedc0a46e687c84b` in Pages panel

---

### **Step 3: Open Page Settings** (10 seconds)

1. Look at **top toolbar** (above the canvas)
2. Find and click the **gear icon** ⚙️ (Page Settings)
3. Page Settings panel opens on **right side**

---

### **Step 4: Find Custom Code Section** (20 seconds)

In the Page Settings panel (right side):

1. **Scroll down** to find "Custom Code" section
2. You'll see **three text areas**:
   - **Code in <head> tag**
   - **Code before </body> tag** ← **THIS ONE!**
   - **Code after </body> tag**

---

### **Step 5: Copy the Fixed Script** (10 seconds)

**Copy this EXACT code** (includes cache-busting `?v=2`):

```html
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js?v=2"></script>
```

**Or from file**: Open `webflow/deployment-snippets/subscriptions-scripts.txt` and copy everything (ignore comment lines)

---

### **Step 6: Paste into "Code before </body> tag"** (30 seconds)

1. **Click inside** the "Code before </body> tag" text area
2. **Select all** existing text (Cmd+A / Ctrl+A)
3. **Delete** it (or just paste to replace)
4. **Paste** the new code from Step 5

**Important**: The new script includes `?v=2` at the end - this bypasses CDN cache!

---

### **Step 7: Save** (10 seconds)

1. Scroll to bottom of Page Settings panel
2. Click **Save** button (blue button, bottom right)
3. Wait for save confirmation

---

### **Step 8: Publish Site** (30 seconds)

1. Click **Publish** button in top toolbar (or press `Cmd+Option+P` / `Ctrl+Alt+P`)
2. Select domains: **rensto.com** and **www.rensto.com**
3. Click **Publish to selected domains**
4. Wait for publish confirmation

---

## ✅ **VERIFICATION**

After publishing, test the checkout:

1. Visit: https://rensto.com/subscriptions
2. Click any subscription tier button
3. **Expected**: Stripe checkout should open immediately
4. **If working**: ✅ **FIXED!** Checkout buttons functional

**Test Card**: `4242 4242 4242 4242` (Stripe test mode)

---

## 🔍 **WHAT THIS FIXES**

### **Before** (Broken):
```html
<script src=".../checkout.js"></script>
```
- Browser uses cached old version (843 bytes)
- Missing plan extraction code
- Checkout buttons don't work

### **After** (Fixed):
```html
<script src=".../checkout.js?v=2"></script>
```
- Browser fetches new version (bypasses cache)
- Includes plan extraction code
- Checkout buttons work ✅

---

## 📊 **TECHNICAL DETAILS**

**Cache-Busting Parameter**: `?v=2`
- Forces browser to treat URL as new file
- CDN serves latest version
- No cache expiry wait required

**Page ID**: `68dfc41ffedc0a46e687c84b` (for reference)

**Script URLs**:
- Core: `https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js`
- Checkout: `https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js?v=2`

---

## 🎯 **RESULT**

✅ **Immediate**: Checkout buttons work as soon as page publishes  
✅ **Revenue**: Subscription payments can be processed  
✅ **Cache**: Issue resolved without waiting 24 hours

---

**Total Time**: ~5 minutes  
**Impact**: 🔴 Revenue blocker removed

---

*Created: October 30, 2025*

