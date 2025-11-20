# ✅ Dynamic Workflows - Complete Integration Guide

**Date**: November 2, 2025  
**Status**: ✅ API Live, ⏳ Webflow Integration Needed  
**Marketplace Page ID**: `68ddb0fb5b6408d0687890dd`

---

## ✅ **STATUS**

- ✅ API Endpoint: `https://api.rensto.com/api/marketplace/workflows` (8 workflows available)
- ✅ Frontend Script: `rensto-webflow-scripts/marketplace/workflows.js` (ready)
- ⚠️ Script Deployment: Needs to be pushed to GitHub
- ⏳ Webflow Integration: Manual steps needed

---

## 🚀 **STEP 1: Deploy workflows.js Script**

The script file exists but needs to be deployed to Vercel:

### **Option A: If `rensto-webflow-scripts` is a separate repo:**

```bash
cd rensto-webflow-scripts
git add marketplace/workflows.js
git commit -m "Add dynamic workflows loader v1.0.0"
git push origin main
```

### **Option B: If it's not a repo yet:**

The file is at: `/Users/shaifriedman/New Rensto/rensto/rensto-webflow-scripts/marketplace/workflows.js`

**CDN URL** (after deployment):
```
https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js
```

**Verify deployment**:
```bash
curl -I "https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"
# Should return: 200 OK
```

---

## 🎨 **STEP 2: Add Container to Marketplace Page**

**Webflow Designer** (Manual Steps):

1. **Open Webflow Designer**
   - Go to https://webflow.com/designer
   - Open site: Rensto (ID: `66c7e551a317e0e9c9f906d8`)

2. **Navigate to Marketplace Page**
   - Pages panel → Click **"Marketplace - Automation Templates"**
   - Page ID: `68ddb0fb5b6408d0687890dd`

3. **Add Container Div**
   - Find where workflow cards should appear (usually after "Browse Templates by Category" section)
   - Add a **Div Block** element
   - In the **Element Settings** → **Custom Attributes**:
     - Add: `class` = `workflows-container`
   - OR set **Element ID** (in Settings): `workflows-container`

**Alternative**: If you want to keep existing static cards and add dynamic below:
- Add a new section at the bottom
- Add Div Block with class `workflows-container`

---

## 📜 **STEP 3: Add Script Tags**

**Webflow Page Settings** (Custom Code):

1. **Open Page Settings**
   - In Marketplace page → Click **Settings** icon (gear) at top right
   - Or: Pages panel → Marketplace → **Settings**

2. **Navigate to Custom Code**
   - Click **Custom Code** tab
   - Scroll to **"Before </body> tag"** section

3. **Add Script Tags** (IN THIS ORDER):

```html
<!-- Stripe Core (required - if not already added) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>

<!-- Marketplace Checkout (required - if not already added) -->
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>

<!-- Dynamic Workflows Loader (NEW - this one) -->
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
```

**Important**:
- Scripts MUST load in this order (workflows.js depends on stripe-core.js)
- If stripe-core.js and checkout.js are already added, just add workflows.js
- Make sure there are no duplicate script tags

4. **Click Save**

---

## ✅ **STEP 4: Test Integration**

After adding scripts:

1. **Preview Page**
   - Click **Preview** button in Webflow Designer
   - Or publish and visit: https://rensto.com/marketplace

2. **Open Browser Console** (F12)
   - Look for success message: `✅ Loaded X workflows dynamically`
   - If error: Check console for details

3. **Visual Check**
   - Workflow cards should appear in the `workflows-container` div
   - Each card should show:
     - Workflow name
     - Category badge
     - Description
     - Pricing (Download + Install options)
     - Features list
     - Download/Install buttons
     - n8n affiliate link notice

4. **Test Buttons**
   - Click a "Download" button → Should open Stripe checkout
   - Click an "Install" button → Should open Stripe checkout

---

## 🔧 **TROUBLESHOOTING**

### **Container Not Found**
**Console Error**: `⚠️ Workflows container not found`

**Fix**:
- Verify container has class `workflows-container` or ID `workflows-container`
- Check element settings in Webflow Designer
- Make sure container is visible (not hidden with CSS)

### **Script Not Loading**
**Console Error**: `Failed to load resource` or `404`

**Fix**:
1. Verify script deployed:
   ```bash
   curl -I "https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"
   ```
2. Check script URL is correct (no typos)
3. Wait 1-2 minutes after deployment (CDN cache)

### **API Error**
**Console Error**: `❌ Error loading workflows`

**Fix**:
1. Test API directly:
   ```bash
   curl "https://api.rensto.com/api/marketplace/workflows?limit=1"
   ```
2. Should return JSON with `"success": true`
3. If error, check Airtable API key in Vercel

### **Stripe Buttons Not Working**
**Issue**: Buttons don't open checkout

**Fix**:
1. Verify `stripe-core.js` loads BEFORE `workflows.js`
2. Check console for `window.RenstoStripe` exists
3. Verify `checkout.js` is also loaded
4. Check script order in Custom Code

---

## 📊 **EXPECTED RESULT**

After integration:

- ✅ **Workflows load automatically** from Airtable on page load
- ✅ **No manual HTML editing** needed when adding workflows
- ✅ **New workflows appear instantly** when added to Airtable
- ✅ **Pricing calculates automatically** based on Airtable data
- ✅ **Stripe checkout works** with dynamic buttons
- ✅ **n8n affiliate links** included automatically

**Time Saved**: ~15-20 minutes per workflow (no more HTML editing!)

---

## 🎯 **VERIFICATION CHECKLIST**

- [ ] workflows.js deployed and accessible via CDN
- [ ] Container div added with class `workflows-container`
- [ ] Script tags added in correct order
- [ ] Browser console shows success message
- [ ] Workflow cards render correctly
- [ ] Pricing displays correctly
- [ ] Stripe checkout buttons work
- [ ] Mobile responsive (test on phone)
- [ ] n8n affiliate links appear

---

## 🚀 **AFTER INTEGRATION**

**Next Steps**:
1. ✅ Test with Stripe checkout (when account review completes)
2. ✅ Add more workflows to Airtable (they'll appear automatically)
3. ✅ Monitor API performance
4. ✅ Consider adding category filtering UI (future enhancement)

**Benefits**:
- **Instant Updates**: Add workflow to Airtable → Appears on Marketplace immediately
- **Consistency**: All cards use same template
- **Maintainability**: Single source of truth (Airtable)

---

**Marketplace Page ID**: `68ddb0fb5b6408d0687890dd`  
**Site ID**: `66c7e551a317e0e9c9f906d8`

**Status**: Ready for integration. Follow steps above to complete.

