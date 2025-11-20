# 🚀 Dynamic Workflows - Webflow Integration Guide

**Date**: November 2, 2025  
**Status**: ✅ API Ready, ⏳ Webflow Integration Pending  
**Purpose**: Add dynamic workflow loading to Marketplace page

---

## ✅ **PREREQUISITES COMPLETE**

1. ✅ API Endpoint Live: `https://api.rensto.com/api/marketplace/workflows`
2. ✅ Returns 8 workflows with full data
3. ✅ Frontend script ready: `rensto-webflow-scripts/marketplace/workflows.js`
4. ⚠️ Script deployment: Needs to be pushed to `rensto-webflow-scripts` repo

---

## 📋 **INTEGRATION STEPS**

### **Step 1: Deploy workflows.js Script**

The script needs to be in the `rensto-webflow-scripts` repository and deployed to Vercel:

```bash
# Check if repo exists
cd rensto-webflow-scripts
git status

# If not initialized:
git init
git remote add origin https://github.com/imsuperseller/rensto-webflow-scripts.git

# Add and commit
git add marketplace/workflows.js
git commit -m "Add dynamic workflows loader v1.0.0"
git push origin main
```

**CDN URL** (after deployment):
```
https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js
```

---

### **Step 2: Add Container to Marketplace Page**

**Webflow Designer** (Manual - Required):

1. Open Webflow Designer
2. Go to **Pages** → Click **Marketplace** page
3. Find the section where workflow cards should appear
4. Add a **Div Block** element
5. Set class: `workflows-container`
6. Or set ID: `workflows-container` (alternative selector)

**Location Options**:
- After "Browse Templates by Category" section
- Replace existing static workflow cards (if any)
- In a new section dedicated to dynamic workflows

---

### **Step 3: Add Script Tags**

**Webflow Page Settings** (Custom Code):

1. In Webflow Designer → **Marketplace** page
2. Click **Settings** icon (gear) → **Custom Code**
3. Scroll to **"Before </body> tag"** section
4. Add these scripts **IN ORDER**:

```html
<!-- Stripe Core (if not already added) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>

<!-- Marketplace Checkout (if not already added) -->
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>

<!-- Dynamic Workflows Loader (NEW) -->
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
```

**Important**: Scripts must load in this order:
1. `stripe-core.js` (base functionality)
2. `checkout.js` (checkout handlers)
3. `workflows.js` (dynamic loading - depends on RenstoStripe)

---

### **Step 4: Verify Integration**

After adding scripts, test:

1. **Preview** the Marketplace page
2. Open **Browser Console** (F12)
3. Look for:
   - ✅ `✅ Loaded X workflows dynamically` (success)
   - ⚠️ `⚠️ Workflows container not found` (container missing)
   - ❌ `❌ Error loading workflows` (API issue)

4. **Visual Check**:
   - Workflow cards should appear automatically
   - Each card shows: Name, Category, Pricing, Features
   - Download and Install buttons are clickable

---

## 🎨 **STYLING (Optional)**

If workflow cards need styling, add CSS to **"Custom Code → Code in <head> tag"**:

```css
<style>
.workflows-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 40px 0;
}

.workflow-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.workflow-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
</style>
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] workflows.js deployed to `rensto-webflow-scripts` Vercel project
- [ ] Container div added with class `workflows-container` or ID `workflows-container`
- [ ] Script tags added in correct order (stripe-core → checkout → workflows)
- [ ] Scripts load from CDN: `https://rensto-webflow-scripts.vercel.app/...`
- [ ] Browser console shows success message
- [ ] Workflow cards render on page
- [ ] Stripe checkout buttons work (test with test card)
- [ ] n8n affiliate links appear in cards

---

## 🔧 **TROUBLESHOOTING**

### **Container Not Found**
**Error**: `⚠️ Workflows container not found`
**Fix**: Verify container has class `workflows-container` or ID `workflows-container`

### **API Error**
**Error**: `❌ Error loading workflows`
**Fix**: 
- Check API endpoint: `curl "https://api.rensto.com/api/marketplace/workflows?limit=1"`
- Verify Airtable API key in Vercel

### **Script Not Loading**
**Error**: Script 404 or not executing
**Fix**:
- Verify script deployed: `curl https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js`
- Check script order (stripe-core must load first)
- Check browser console for JavaScript errors

### **Stripe Buttons Not Working**
**Error**: Buttons don't open checkout
**Fix**:
- Verify `stripe-core.js` loaded before `workflows.js`
- Check that `window.RenstoStripe` exists in console
- Verify checkout.js is loaded

---

## 📊 **EXPECTED RESULT**

After integration:
- ✅ Marketplace page loads workflows automatically from Airtable
- ✅ No manual HTML editing needed when adding workflows
- ✅ Workflows appear instantly when added to Airtable
- ✅ Consistent formatting and pricing calculation
- ✅ Stripe checkout integrated
- ✅ n8n affiliate links included

**Time Saved**: ~15-20 minutes per workflow (no HTML editing needed)

---

## 🎯 **NEXT STEPS AFTER INTEGRATION**

1. ✅ Test with real Stripe checkout (when account review completes)
2. ✅ Monitor API performance
3. ✅ Add more workflows to Airtable (they'll appear automatically)
4. ✅ Consider adding category filtering UI
5. ✅ Add search functionality (future enhancement)

---

**Status**: Ready for integration. Follow steps above to complete.

