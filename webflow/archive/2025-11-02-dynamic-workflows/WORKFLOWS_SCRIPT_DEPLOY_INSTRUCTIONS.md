# 🚀 Deploy workflows.js - Quick Instructions

**Script Location**: `/Users/shaifriedman/New Rensto/rensto/rensto-webflow-scripts/marketplace/workflows.js`  
**Target Repo**: `https://github.com/imsuperseller/rensto-webflow-scripts`  
**CDN URL**: `https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js`

---

## **Step 1: Push to GitHub** (2 min)

The file is ready at `rensto-webflow-scripts/marketplace/workflows.js`. Push to the separate repo:

```bash
# If repo not cloned locally, clone it first:
cd /Users/shaifriedman/New\ Rensto
git clone https://github.com/imsuperseller/rensto-webflow-scripts.git || cd rensto-webflow-scripts

# Copy the file if needed:
cp rensto/rensto-webflow-scripts/marketplace/workflows.js marketplace/workflows.js

# Commit and push:
git add marketplace/workflows.js
git commit -m "Add dynamic workflows loader v1.0.0"
git push origin main
```

**Vercel will auto-deploy in ~30 seconds**

---

## **Step 2: Verify Deployment**

```bash
curl -I "https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js"
# Should return: 200 OK
```

---

## **Step 3: Add to Webflow** (See integration guide)

Once script is live, add it to Marketplace page via Webflow Designer.

