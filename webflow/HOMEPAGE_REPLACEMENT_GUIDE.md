# ⚠️ OUTDATED: Homepage Replacement - Simple Guide

**Date**: November 2, 2025 (MIGRATION DAY)  
**Status**: ⚠️ **OUTDATED** - Site migrated to Vercel Nov 2, 2025  
**Current Status**: rensto.com is on Vercel (Next.js), not Webflow

**⚠️ NOTE**: This document references Webflow homepage replacement. The site is now on Vercel. This guide is for historical reference only.

---

## 🎯 **RECOMMENDATION: REPLACE (Don't Integrate)**

**Why**:
- `WEBFLOW_EMBED_HOMEPAGE.html` is the **complete, production-ready file**
- Current code is a simplified version (missing sections)
- The full file is designed as a **complete replacement**
- No integration needed - file is standalone and complete

---

## ✅ **WHAT THE FULL FILE INCLUDES**

### **Complete Content** (9 CVJ Sections):
1. ✅ Hero Section (headline, stats, CTAs)
2. ✅ Problem → Mechanism → Outcome Strip
3. ✅ Segmentation (4 service type cards)
4. ✅ Credibility Bar (stats, client logos)
5. ✅ Lead Magnet (email form → n8n webhook)
6. ✅ Offer Overview (4 service cards)
7. ✅ Results & Proof (testimonials, case studies)
8. ✅ Content Sampler (resources)
9. ✅ Risk Reversal + FAQ (8 questions)

### **Included Scripts**:
- ✅ GSAP animations (loaded from CDN)
- ✅ ScrollTrigger animations
- ✅ FAQ toggle functionality
- ✅ Lead magnet form handler (n8n webhook)
- ✅ Smooth scroll for anchor links

### **NOT Included** (By Design):
- ❌ Stripe checkout scripts (homepage doesn't need them - it's routing, not payment)
- ❌ Service-specific checkout.js (homepage is routing hub)

---

## 🚀 **SIMPLE REPLACEMENT STEPS**

### **Step 1: Open Webflow Designer**
- Go to: https://rensto.design.webflow.com
- Navigate to **Home** page

### **Step 2: Replace Custom Code**
1. **Page Settings** (gear icon) → **Custom Code**
2. **Find**: "Code before </body> tag" field
3. **Delete**: ALL existing code (the simplified version)
4. **Copy**: Entire `WEBFLOW_EMBED_HOMEPAGE.html` file (1,530 lines)
5. **Paste**: Replace the entire field with the full file
6. **Save**

### **Step 3: Publish**
1. Click **Publish** button
2. Select domains: `rensto.com` + `www.rensto.com`
3. Confirm publish

---

## ✅ **WHAT YOU'LL GET**

**After Replacement**:
- ✅ Complete homepage with all 9 sections
- ✅ CVJ-optimized content flow
- ✅ GSAP animations working
- ✅ Lead magnet form functional
- ✅ All links working
- ✅ Responsive design
- ✅ No missing content

---

## ❓ **WHY NOT INTEGRATE?**

**Current Code**:
- Has Stripe scripts (not needed on homepage)
- Simplified structure (missing sections)
- Appears to be a temporary version

**Full File**:
- Complete, production-ready
- Designed as replacement
- Includes everything needed
- No dependencies on external checkout scripts (homepage doesn't sell directly)

**Conclusion**: **Replace completely** - the full file supersedes the simplified version.

---

## 📋 **VERIFICATION**

After publishing, visit https://www.rensto.com:

- ✅ Hero section with "AI-Powered Automation" headline
- ✅ 4 service type cards (Marketplace, Subscriptions, Ready Solutions, Custom)
- ✅ Lead magnet form
- ✅ Testimonials section
- ✅ FAQ section with 8 questions
- ✅ All animations working
- ✅ Console shows: "🎯 Rensto Homepage Initialized"

---

**Status**: ✅ **READY TO REPLACE**

**File**: `webflow/pages/WEBFLOW_EMBED_HOMEPAGE.html` (1,530 lines)

