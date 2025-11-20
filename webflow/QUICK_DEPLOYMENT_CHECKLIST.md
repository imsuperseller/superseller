# ✅ Quick Deployment Checklist - Option A

**Time Required**: ~15 minutes  
**Strategy**: Page Settings Only

---

## 📋 **CHECKLIST**

### **✅ Step 1: JavaScript Files** (5 min)
- [ ] Copy `homepage-interactions.js` to `rensto-webflow-scripts/homepage/interactions.js`
- [ ] Copy `marketplace-interactions.js` to `rensto-webflow-scripts/marketplace/interactions.js`
- [ ] Commit and push to GitHub
- [ ] Wait 30 seconds for Vercel deploy
- [ ] Verify URLs:
  - [ ] `https://rensto-webflow-scripts.vercel.app/homepage/interactions.js` ✅
  - [ ] `https://rensto-webflow-scripts.vercel.app/marketplace/interactions.js` ✅

### **✅ Step 2: Remove Designer Embeds** (2 min)
- [ ] Homepage: Delete any Embed element between Nav/Footer
- [ ] Marketplace: Delete any Embed element between Nav/Footer

### **✅ Step 3: Deploy Homepage** (3 min)
- [ ] Open Webflow Designer → Homepage
- [ ] Page Settings → Custom Code → "Code before </body> tag"
- [ ] Paste `WEBFLOW_EMBED_HOMEPAGE_OPTIMIZED.html` (entire file)
- [ ] Save & Publish

### **✅ Step 4: Deploy Marketplace** (3 min)
- [ ] Open Webflow Designer → Marketplace
- [ ] Page Settings → Custom Code → "Code before </body> tag"
- [ ] Paste `WEBFLOW_EMBED_MARKETPLACE_CVJ_OPTIMIZED.html` (entire file)
- [ ] Save & Publish

### **✅ Step 5: Verify** (2 min)
- [ ] Visit `rensto.com` → Check console (no errors)
- [ ] Visit `rensto.com/marketplace` → Check console (no errors)
- [ ] Test FAQ toggles (both pages)
- [ ] Test forms/buttons (both pages)

---

**Total Time**: ~15 minutes  
**Status**: 🎯 Ready to start

