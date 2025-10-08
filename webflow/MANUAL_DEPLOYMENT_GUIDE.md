# 📋 Manual Webflow Deployment Guide

**If the deployment helper isn't working, use this manual guide**

---

## 🎯 The Code You Need to Copy

Copy this code (it's the same for all 16 niche pages):

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 6, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js"></script>
```

---

## 🔧 How to Access Webflow

### **Option 1: Direct Login**
1. Open a new browser tab
2. Go to: **https://webflow.com/**
3. Click **"Log in"** (top right)
4. Enter your Webflow credentials

### **Option 2: Try Different Browser**
If the page is blank:
- Try Chrome (if you're using Safari)
- Try Safari (if you're using Chrome)
- Try Firefox as alternative
- Disable browser extensions temporarily

### **Option 3: Check Login Status**
1. Go to **https://webflow.com/**
2. If you see "Log in" button → You're not logged in
3. If you see your account/workspace → You're logged in

---

## 📝 Step-by-Step Deployment (Once in Webflow)

### **After you're logged into Webflow:**

1. **Find your workspace/dashboard**
   - You should see a list of your sites
   - Look for **"Rensto"** site

2. **Open the Rensto site**
   - Click on the Rensto site card
   - Click **"Open Designer"** (blue button)

3. **For EACH of the 16 pages:**

   **Pages to update:**
   - Amazon Seller
   - Bookkeeping
   - Busy Mom
   - Dentist
   - E-commerce
   - Fence Contractor
   - HVAC
   - Insurance
   - Lawyer
   - Locksmith
   - Photographer
   - Product Supplier
   - Realtor
   - Roofer
   - Synagogue
   - Torah Teacher

   **Steps for each page:**

   a. Click **"Pages"** icon (left sidebar)

   b. Find and click the page name (e.g., "Amazon Seller")

   c. Click the **gear icon** (Page Settings) at top

   d. Scroll down to **"Custom Code"** section

   e. Find the **"Before </body> tag"** field

   f. **Paste the code** (from top of this document):
   ```html
   <!-- External Scripts from GitHub CDN (v2.0 - Oct 6, 2025) -->
   <script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
   <script src="https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js"></script>
   ```

   g. Click **"Save"** (bottom of settings panel)

   h. Close settings panel

   i. Click **"Publish"** button (top right corner, blue button)

   j. Click **"Publish to selected domains"**

4. **Repeat for all 16 pages**

---

## ✅ Checklist (Print or Keep Open)

Track your progress:

- [ ] 1. Amazon Seller
- [ ] 2. Bookkeeping
- [ ] 3. Busy Mom
- [ ] 4. Dentist
- [ ] 5. E-commerce
- [ ] 6. Fence Contractor
- [ ] 7. HVAC
- [ ] 8. Insurance
- [ ] 9. Lawyer
- [ ] 10. Locksmith
- [ ] 11. Photographer
- [ ] 12. Product Supplier
- [ ] 13. Realtor
- [ ] 14. Roofer
- [ ] 15. Synagogue
- [ ] 16. Torah Teacher

---

## 🧪 How to Verify It Worked

After deploying a few pages:

1. **Open a deployed page** on your live site (e.g., rensto.com/hvac)
2. **Open browser console** (F12 or Cmd+Option+I on Mac)
3. **Look for these messages**:
   ```
   🎯 [Rensto Stripe] Rensto Stripe Core loaded
   ✅ Ready Solutions Checkout: Ready (X buttons initialized)
   ```

If you see those messages, it worked! ✅

---

## 🆘 Troubleshooting

### **Webflow page is blank:**
- **Clear browser cache**: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
- **Try incognito/private mode**: Cmd+Shift+N (Mac) or Ctrl+Shift+N (Windows)
- **Disable browser extensions**: Especially ad blockers
- **Try different browser**: Chrome, Safari, Firefox
- **Check internet connection**: Make sure you're online

### **Can't find Rensto site:**
- Make sure you're logged into the correct Webflow account
- Check if site is in a specific workspace/team
- Search for "Rensto" in the dashboard search bar

### **Can't find a page:**
- Pages might be in folders - expand all folders in Pages panel
- Use search in Pages panel (top)
- Check page name spelling (use exact names from checklist above)

### **Code not saving:**
- Make sure you're in the correct field ("Before </body> tag")
- Don't close settings before clicking "Save"
- Check if you have edit permissions for the site

---

## ⏱️ Time Estimate

- **Per page**: 2-3 minutes
- **All 16 pages**: 30-50 minutes

**Pro tip**: Copy the code once, then go through all pages quickly pasting and publishing.

---

## 💡 Alternative: Batch Method

If you're comfortable with Webflow:

1. Open Webflow Designer
2. Keep Pages panel open (left sidebar)
3. Copy the code to clipboard
4. For each page:
   - Click page name
   - Click gear icon
   - Scroll to Custom Code
   - Paste
   - Save
   - Next page (no need to publish each time)
5. After all 16 pages updated, publish once at the end

This can reduce time to 20-25 minutes total.

---

## 📞 Need Help?

If you're still having issues:
1. Check if you can access webflow.com at all
2. Try logging in from webflow.com homepage
3. Contact Webflow support if login issues persist
4. Come back to this guide once logged in

---

**Created**: October 6, 2025
**Purpose**: Manual deployment when automation doesn't work
**Pages**: 16 niche pages
**Code**: 2 simple script tags
