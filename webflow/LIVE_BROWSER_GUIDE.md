# 🎯 Live Browser Guide - You're Already in Webflow!

**You're on**: Webflow Designer page
**Goal**: Update CMS template in 5 minutes
**Result**: All 16 niche pages updated automatically

---

## 📋 Step-by-Step (Follow Along)

### **Step 1: Find the Collections Panel** (30 seconds)

Look at your **left sidebar** in Webflow Designer.

**You should see icons like**:
- Add (plus icon)
- Pages
- **CMS** ← Click this one (database icon)
- Assets
- Settings

**Click the CMS icon** (looks like a database or grid)

---

### **Step 2: Find Niche Solutions Collection** (30 seconds)

In the CMS panel that opens, you'll see a list of collections.

**Look for something like**:
- "Niche Solutions"
- "Industries"
- "Solutions"
- Or similar

**Click on that collection name**

---

### **Step 3: Open the Collection Template** (30 seconds)

After clicking the collection, you'll see:
- Collection items (HVAC, Realtor, etc.)
- **"Collection Template Page"** or **"Template Settings"** button

**Click "Collection Template Page"** or **"Edit Template"**

This opens the template that ALL niche pages use.

---

### **Step 4: Open Page Settings** (10 seconds)

At the **top toolbar**, find and click the **gear icon** ⚙️

This opens the Page Settings panel on the right side.

---

### **Step 5: Find Custom Code Section** (20 seconds)

In the Page Settings panel (right side):

1. **Scroll down**
2. Look for **"Custom Code"** section (usually near bottom)
3. You'll see three fields:
   - Head Code
   - **Before </body> tag** ← This one!
   - After </body> tag

---

### **Step 6: Paste the Code** (30 seconds)

**Click inside the "Before </body> tag" field**

**Paste this code**:

```html
<!-- External Scripts from GitHub CDN (v2.0 - Oct 7, 2025) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js"></script>
```

**Then click "Save" button** at bottom of Page Settings panel

---

### **Step 7: Publish** (2 minutes)

1. **Click "Publish" button** (top right, blue button)
2. **Select all domains** (check rensto.com and www.rensto.com)
3. **Click "Publish to selected domains"**
4. **Wait for publish to complete** (1-2 minutes)

---

## ✅ Verification (2 minutes)

### **Test It Worked**:

1. Open new tab: **https://www.rensto.com/hvac**
2. Press **F12** (or Cmd+Option+I)
3. Click **"Console"** tab
4. **Reload page** (Cmd+R or Ctrl+R)
5. Look for: `🎯 [Rensto Stripe] Rensto Stripe Core loaded`

**If you see that message** ✅ **IT WORKED!**

All 16 niche pages are now updated! 🎉

---

## 🆘 If You Get Stuck

### **Can't find CMS panel?**
- Look for database icon in left sidebar
- Or click "Pages" and look for "Collections" folder

### **Can't find Collection Template?**
- In CMS panel, click the collection name first
- Then look for "Template" button or link
- Or right-click collection and select "Edit Template"

### **Code not saving?**
- Make sure you clicked "Save" in Page Settings
- Try closing and reopening Page Settings
- Copy code again and paste fresh

### **Publish not working?**
- Check if there are unsaved changes
- Make sure you selected at least one domain
- Wait for publish to fully complete

---

## 🎯 What You Just Did

✅ Updated 1 CMS template
✅ Automatically updated ALL 16 niche pages:
- HVAC, Realtor, Roofer, Amazon Seller, Bookkeeping, Busy Mom, Dentist, E-commerce, Fence Contractor, Insurance, Lawyer, Locksmith, Photographer, Product Supplier, Synagogue, Torah Teacher

✅ Added GitHub external scripts
✅ Enabled Stripe checkout on all niche pages

---

## 📊 Impact

**Pages Updated**: 16 niche pages
**Time Spent**: ~5 minutes
**Future Updates**: Edit GitHub repo → Auto-deploys to all pages
**Payment Collection**: Ready to accept payments on niche pages

---

## 🎉 Next Steps

After this works:

1. **Test 2-3 more pages** (realtor, dentist) to confirm
2. **Update 4 service pages** (marketplace, subscriptions, etc.) - see SERVICE_PAGES_SCRIPTS.md
3. **Fix URL redirect** (fence-contractors typo) - see URL_AUDIT_AND_FIXES.md

But for now - **16 pages are done!** 🚀

---

**Created**: October 7, 2025
**For**: Live browser session (already on Webflow Designer)
**Time**: 5 minutes start to finish
**Result**: All 16 niche pages updated automatically
