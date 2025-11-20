# 🚀 Dynamic Workflows API - Deployment Guide

**Date**: November 2, 2025  
**Status**: ✅ **API ENDPOINT CREATED, READY FOR DEPLOYMENT**  
**Purpose**: Enable dynamic workflow card loading from Airtable (no more manual HTML editing!)

---

## ✅ **WHAT WAS BUILT**

### **1. API Endpoint** ✅ **CREATED**

**File**: `apps/web/rensto-site/src/app/api/marketplace/workflows/route.ts`  
**Endpoint**: `GET https://api.rensto.com/api/marketplace/workflows`  
**Purpose**: Fetches workflows from Airtable and returns JSON for dynamic rendering

**Features**:
- ✅ Reads from Airtable "Marketplace Products" table
- ✅ Supports filtering by category and status
- ✅ Calculates pricing tiers automatically
- ✅ Formats data for workflow card rendering
- ✅ Error handling and fallbacks

**Query Parameters**:
- `category` (optional): Filter by category (e.g., `Email Automation`)
- `status` (optional): Filter by status (default: `✅ Active`)
- `limit` (optional): Max records (default: 100)

**Example Request**:
```bash
curl "https://api.rensto.com/api/marketplace/workflows?category=Email%20Automation&status=%E2%9C%85%20Active"
```

**Example Response**:
```json
{
  "success": true,
  "count": 8,
  "workflows": [
    {
      "id": "rec...",
      "workflowId": "email-persona-system",
      "name": "AI-Powered Email Persona System",
      "category": "Email Automation",
      "description": "6 AI personas...",
      "downloadPrice": 197,
      "installPrice": 788,
      "downloadTier": "complete",
      "installTier": "template",
      "complexity": "Advanced",
      "setupTime": "2-4 hours",
      "features": ["Feature 1", "Feature 2", ...],
      "n8nAffiliateLink": "https://tinyurl.com/ym3awuke",
      "workflowJsonUrl": "...",
      "status": "✅ Active"
    },
    ...
  ]
}
```

---

### **2. Frontend JavaScript** ✅ **CREATED**

**File**: `rensto-webflow-scripts/marketplace/workflows.js`  
**CDN URL**: `https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js`  
**Purpose**: Fetches workflows from API and renders workflow cards dynamically

**Features**:
- ✅ Fetches workflows from API endpoint
- ✅ Renders workflow cards with HTML
- ✅ Includes n8n affiliate links
- ✅ Initializes Stripe checkout buttons
- ✅ Falls back gracefully if API fails
- ✅ XSS protection (HTML escaping)

**Usage**:
```html
<!-- Load after stripe-core.js and checkout.js -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
```

**Container Detection**:
Looks for one of these selectors:
- `.workflows-container`
- `#workflows-container`
- `.featured-templates`

**Smart Loading**:
- Only loads if container exists AND no static cards found
- If static cards exist, respects them (hybrid mode)
- If no container, skips loading (no errors)

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Deploy API Endpoint** ⏱️ 2 min

**Action**: Deploy `api-rensto-site` to Vercel

```bash
cd apps/web/rensto-site
vercel --prod
```

**Verification**:
```bash
# Test endpoint (after deployment)
curl "https://api.rensto.com/api/marketplace/workflows" | jq '.success'
```

**Expected**: `true`

---

### **Step 2: Deploy Frontend Script** ⏱️ 1 min

**Action**: Push workflows.js to `rensto-webflow-scripts` repo

```bash
cd /Users/shaifriedman/New\ Rensto/rensto-webflow-scripts
git add marketplace/workflows.js
git commit -m "Add dynamic workflows loader v1.0.0"
git push origin main
```

**Auto-Deploy**: ✅ Vercel will auto-deploy in ~30 seconds

**Verification**:
```bash
# Check script is accessible
curl -I "https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"
```

**Expected**: `200 OK`

---

### **Step 3: Update Marketplace Page in Webflow** ⏱️ 5 min

**Option A: Replace Static Cards with Dynamic Container** (Recommended)

1. Open Webflow Designer → Marketplace page
2. Find "Featured Templates" section (where workflow cards are)
3. **Remove** all static workflow cards (keep section container)
4. **Add** empty `<div>` with class `workflows-container`:
   ```html
   <div class="workflows-container"></div>
   ```
5. **Add** script tag before `</body>`:
   ```html
   <script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
   <script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>
   <script src="https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"></script>
   ```

**Option B: Keep Static Cards, Add Dynamic Below** (Hybrid)

1. Keep existing static workflow cards
2. Add new section below with `<div class="workflows-container"></div>`
3. Add script tags (workflows.js will only load if container is empty)

---

### **Step 4: Test Dynamic Loading** ⏱️ 2 min

**Steps**:
1. [ ] Open Marketplace page in browser
2. [ ] Open browser console (F12)
3. [ ] Verify console shows: `✅ Loaded X workflows dynamically`
4. [ ] Verify workflow cards appear in container
5. [ ] Verify cards have correct pricing, features, buttons
6. [ ] Click a download button → Verify Stripe checkout opens

**Expected**: ✅ Workflows load automatically from Airtable

---

## 📊 **HOW IT WORKS**

### **Data Flow**:
```
Airtable (Marketplace Products)
    ↓
API Endpoint (/api/marketplace/workflows)
    ↓
Frontend JavaScript (workflows.js)
    ↓
Workflow Cards Rendered in DOM
    ↓
Stripe Checkout Buttons Initialized
```

### **Before** (Manual):
1. Add workflow to product catalog ✅
2. Run populate script → Airtable ✅
3. **Manually edit HTML** ❌ (15 min per workflow)

### **After** (Dynamic):
1. Add workflow to product catalog ✅
2. Run populate script → Airtable ✅
3. **Workflows appear automatically** ✅ (0 min!)

---

## 🎯 **BENEFITS**

**Time Savings**:
- ❌ **Before**: 15-20 min per workflow (manual HTML)
- ✅ **After**: 0 min per workflow (automatic!)

**Instant Updates**:
- ✅ Add workflow to Airtable → Appears on Marketplace immediately
- ✅ Update pricing in Airtable → Updates on Marketplace immediately
- ✅ Change status → Filters automatically

**Consistency**:
- ✅ All workflow cards use same template
- ✅ Pricing tiers calculated automatically
- ✅ n8n affiliate links included automatically

---

## 🧪 **TESTING CHECKLIST**

### **API Endpoint Tests**:
- [ ] `GET /api/marketplace/workflows` returns workflows
- [ ] `GET /api/marketplace/workflows?category=Email` filters correctly
- [ ] `GET /api/marketplace/workflows?status=✅ Active` filters correctly
- [ ] Error handling works (missing AIRTABLE_API_KEY)
- [ ] Empty results handled gracefully

### **Frontend Tests**:
- [ ] Workflows load on page load
- [ ] Workflow cards render correctly
- [ ] Pricing displays correctly
- [ ] Buttons initialize and work
- [ ] Affiliate links included
- [ ] Mobile responsive
- [ ] Fallback if API fails

### **Integration Tests**:
- [ ] New workflow in Airtable → Appears on Marketplace
- [ ] Workflow removed from Airtable → Disappears from Marketplace
- [ ] Pricing updated in Airtable → Updates on Marketplace

---

## 🔧 **MAINTENANCE**

### **Adding New Workflows** (Now Simplified):

**Old Process** (20 min):
1. Add to product catalog (5 min)
2. Run populate script (2 min)
3. Manually add HTML card (15 min)

**New Process** (7 min):
1. Add to product catalog (5 min)
2. Run populate script (2 min)
3. ✅ **Workflows appear automatically!**

### **Updating Existing Workflows**:
- Edit in Airtable → Changes appear immediately
- No code changes needed
- No deployment needed

---

## 📝 **NEXT STEPS**

1. ✅ **COMPLETE**: API endpoint created
2. ✅ **COMPLETE**: Frontend script created
3. ⏳ **PENDING**: Deploy API endpoint to Vercel
4. ⏳ **PENDING**: Push workflows.js to GitHub
5. ⏳ **PENDING**: Update Marketplace page in Webflow
6. ⏳ **PENDING**: Test dynamic loading

---

## 🎉 **SUCCESS CRITERIA**

**System is working when**:
- ✅ API endpoint accessible and returns workflows
- ✅ Frontend script loads and renders cards
- ✅ New workflows in Airtable appear automatically
- ✅ Stripe checkout buttons work
- ✅ Mobile responsive
- ✅ No console errors

---

**Status**: ✅ **READY FOR DEPLOYMENT**

**Files Created**:
- ✅ `apps/web/rensto-site/src/app/api/marketplace/workflows/route.ts` (136 lines)
- ✅ `rensto-webflow-scripts/marketplace/workflows.js` (210 lines)

**Estimated Deployment Time**: 10 minutes

