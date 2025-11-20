# ⚠️ OUTDATED: Webflow Deployment Master Guide

**Date**: October 7, 2025 (PRE-MIGRATION)  
**Status**: ⚠️ **OUTDATED** - Site migrated to Vercel Nov 2, 2025  
**Current Status**: rensto.com is on Vercel (Next.js), not Webflow

**⚠️ NOTE**: This document references Webflow deployment. The site is now on Vercel. This guide is for historical reference only.

---

## 🔍 Critical Discovery

**All 16 niche pages use a CMS Collection Template!**

This means:
- Update **1 template** = Update all 16 pages automatically
- Much faster deployment (12 min vs 50 min)
- Easier maintenance forever

---

## 📋 Complete Deployment Checklist

### **Phase 1: CMS Template** (12 minutes) ✅ HIGHEST PRIORITY

**Task**: Update the niche solution CMS template
**Impact**: All 16 niche pages updated automatically
**Guide**: Read `CMS_TEMPLATE_DEPLOYMENT.md`

- [ ] Find CMS template in Webflow (look for `/niche-solution` or "Collection Template")
- [ ] Open Page Settings → Custom Code
- [ ] Paste scripts in "Before </body> tag"
- [ ] Save and Publish
- [ ] Test 3 niche pages (HVAC, Realtor, Dentist)

**Code to paste**:
```html
<!-- External Scripts from GitHub CDN (v2.0) -->
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js"></script>
```

---

### **Phase 2: Service Pages** (14 minutes)

**Task**: Update 4 static service pages individually
**Impact**: Payment collection working on all service types
**Guide**: Read `SERVICE_PAGES_SCRIPTS.md`

#### **Page 1: Marketplace** (3 min)
- [ ] Open `/marketplace` page in Webflow
- [ ] Page Settings → Custom Code → Before </body> tag
- [ ] Paste:
```html
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js"></script>
```

#### **Page 2: Subscriptions** (3 min)
- [ ] Open `/subscriptions` page
- [ ] Page Settings → Custom Code → Before </body> tag
- [ ] Paste:
```html
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js"></script>
```

#### **Page 3: Ready Solutions** (3 min)
- [ ] Open `/ready-solutions` page
- [ ] Page Settings → Custom Code → Before </body> tag
- [ ] Paste:
```html
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js"></script>
```

#### **Page 4: Custom Solutions** (3 min)
- [ ] Open `/custom-solutions` page
- [ ] Page Settings → Custom Code → Before </body> tag
- [ ] Paste:
```html
<script src="https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js"></script>
<script src="https://rensto-webflow-scripts.vercel.app/custom-solutions/checkout.js"></script>
```

#### **Publish All** (2 min)
- [ ] Click Publish button (top right)
- [ ] Select all domains
- [ ] Publish to production

---

### **Phase 3: URL Fixes** (5 minutes)

**Task**: Fix fence-contractors typo and set up redirect
**Impact**: No more 404 errors
**Guide**: Read `URL_AUDIT_AND_FIXES.md`

- [ ] Open Webflow Dashboard → Project Settings
- [ ] Go to Hosting → 301 Redirects
- [ ] Add redirect:
  - Old path: `/frence-contractors`
  - New path: `/fence-contractor`
  - Type: 301 Permanent
- [ ] Save and Publish
- [ ] Test redirect

---

### **Phase 4: Verification** (10 minutes)

**Task**: Verify scripts are working on live site
**Impact**: Confirm payment collection is operational

#### **Test Niche Pages** (5 min)
- [ ] Open https://www.rensto.com/hvac
- [ ] F12 → Console → Look for: `🎯 [Rensto Stripe] Rensto Stripe Core loaded`
- [ ] Click pricing button → Should redirect to Stripe
- [ ] Test 2 more pages (realtor, dentist)

#### **Test Service Pages** (5 min)
- [ ] Open https://www.rensto.com/marketplace
- [ ] F12 → Console → Look for Marketplace script load message
- [ ] Click pricing button → Should redirect to Stripe
- [ ] Test 3 more service pages

---

## 📊 Deployment Impact

### **Pages Updated**:
- ✅ **16 niche pages** (via CMS template)
- ✅ **4 service pages** (individually)
- ✅ **Total: 20 pages with Stripe checkout**

### **Payment Flows Enabled**:
1. ✅ Marketplace templates ($29-$197)
2. ✅ Marketplace full-service ($797-$3,500)
3. ✅ Subscriptions ($299-$1,499/month)
4. ✅ Ready Solutions ($890-$2,990)
5. ✅ Custom Solutions ($297-$8,000)

### **Revenue Collection**:
- **One-time potential**: $29-$8,000 per transaction
- **Recurring potential**: $299-$1,499/month per customer
- **Annual potential per sub**: $3,588-$17,988/year

---

## ⏱️ Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | CMS Template | 12 min |
| **Phase 2** | Service Pages (4) | 14 min |
| **Phase 3** | URL Fixes | 5 min |
| **Phase 4** | Verification | 10 min |
| **TOTAL** | **All Phases** | **41 minutes** |

**vs Original Estimate**: 50 minutes for individual pages
**Time Saved**: 18% faster (thanks to CMS template!)

---

## 📚 Documentation Files

All guides created for this deployment:

1. **CMS_TEMPLATE_DEPLOYMENT.md** - How to update the CMS template (Phase 1)
2. **SERVICE_PAGES_SCRIPTS.md** - Service pages deployment (Phase 2)
3. **URL_AUDIT_AND_FIXES.md** - URL fixes and redirects (Phase 3)
4. **DEPLOYMENT_MASTER_GUIDE.md** - This file (overview)
5. **MANUAL_DEPLOYMENT_GUIDE.md** - Backup manual method
6. **CODE_TO_COPY.txt** - Just the code to copy-paste

---

## 🎯 Quick Start (If You're in a Hurry)

### **Fastest Path** (15 minutes):

1. **Update CMS template** (Phase 1 only)
   - Finds template page
   - Paste code
   - Publish
   - **Result**: All 16 niche pages working

2. **Test one page**
   - Open rensto.com/hvac
   - Check console logs
   - Click button

3. **Come back later for service pages**
   - Phases 2-4 can wait
   - Niche pages are the bulk of traffic

---

## 🚨 Common Issues & Solutions

### **Issue: Can't find CMS template**
**Solution**:
- Search Webflow for "niche" or "collection"
- Check CMS panel (database icon)
- Look for "Template" in page name
- Try opening `/niche-solution` directly

### **Issue: Scripts not appearing after publish**
**Solution**:
- Wait 3-5 minutes for CDN
- Clear browser cache (Cmd+Shift+R)
- Try incognito mode
- Check if code saved in Page Settings

### **Issue: Stripe buttons not working**
**Solution**:
- Check console for script load messages
- Verify correct script for each page type
- Test in incognito (extensions can block)
- Check if Stripe payment links are valid

---

## ✅ Success Criteria

After completing all phases, you should have:

✅ All 16 niche pages with working Stripe checkout
✅ All 4 service pages with working Stripe checkout
✅ No 404 errors (fence-contractors redirect working)
✅ Console logs showing script initialization
✅ Payment buttons redirecting to Stripe
✅ All 5 payment flow types operational

---

## 🎉 What Happens After Deployment

### **Immediate Benefits**:
- ✅ Can accept payments on 20 pages
- ✅ All 5 revenue streams active
- ✅ Professional checkout experience
- ✅ Easier to maintain (external scripts)

### **Future Updates**:
When you need to change JavaScript:
1. Edit files in GitHub: `rensto-webflow-scripts`
2. Commit and push
3. Vercel auto-deploys (30 seconds)
4. All 20 pages update automatically
5. **No Webflow changes needed!**

That's the power of the new system! 🚀

---

## 📞 Need Help?

If you get stuck:

1. **Re-read the specific guide** for the phase you're on
2. **Check common issues** section above
3. **Test in incognito mode** (rules out browser issues)
4. **Wait 5 minutes** after publishing (CDN delay)
5. **Clear cache** and try again

---

## 🎊 Ready to Deploy!

**Start with Phase 1** (CMS Template) - it's the most important and will get 16 pages working immediately!

Follow the guides step-by-step, and you'll have everything deployed in under an hour.

Good luck! 🚀

---

**Created**: October 7, 2025
**Purpose**: Master deployment guide and checklist
**Total Time**: ~41 minutes for all 4 phases
**Impact**: 20 pages with Stripe checkout, all 5 revenue streams active
