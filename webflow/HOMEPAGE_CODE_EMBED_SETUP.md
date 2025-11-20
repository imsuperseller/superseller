# ⚠️ OUTDATED: Homepage Code Embed Setup Guide

**Date**: October 31, 2025 (PRE-MIGRATION)  
**Status**: ⚠️ **OUTDATED** - Site migrated to Vercel Nov 2, 2025  
**Current Status**: rensto.com is on Vercel (Next.js), not Webflow

**⚠️ NOTE**: This document references Webflow Designer Code Embed. The site is now on Vercel. This guide is for historical reference only.

---

## 📊 **CURRENT STATE**

**Homepage Structure** (from API):
- Nav: Component Instance `19798a5e-deac-69d3-575b-03a89d1fe4e0`
- Footer: Component Instance `0b8b7475-7668-458c-e326-a5473489d697`
- Page Content: In Page Settings → Before `</body>` tag (not visible in Designer)

---

## 🎯 **TARGET STATE**

```
Homepage Designer Navigator:
├── Nav Component Instance
├── Code Embed (Page Content) ← NEW: homepage-body-code-designer-visible.txt
└── Footer Component Instance

Page Settings:
├── <head> tag: Schema JSON-LD ✅
└── Before </body> tag: Scripts ONLY (GSAP, Stripe) ✅
```

---

## 📁 **FILES**

1. **Homepage Content (Code Embed)**:
   - `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/homepage-body-code-designer-visible.txt`
   - Format: Matches case-studies-page-body-code.txt exactly
   - Contains: HTML + CSS only (NO scripts)
   - Lines: 598

2. **Homepage Scripts (Page Settings)**:
   - Keep existing scripts in Page Settings → Before `</body>` tag
   - Includes: Stripe checkout scripts, GSAP animations

---

## 🔧 **EXECUTION STEPS**

### **STEP 1: Add Code Embed Element**
1. Webflow Designer → **Homepage** (slug: `/`)
2. Click between Nav and Footer (empty space)
3. Press `E` OR Add panel → **Embed** element
4. Double-click the new Embed element
5. **Open file**: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/homepage-body-code-designer-visible.txt`
6. **Copy ENTIRE file** (598 lines)
7. **Paste** into Embed element code field
8. Save Embed element

---

### **STEP 2: Update Page Settings Scripts**
1. Page Settings (gear icon) → Custom Code tab
2. **Before `</body>` tag** section:
   - **Keep ONLY the script tags**:
     - Stripe checkout scripts (lines 6-7 from original)
     - GSAP scripts (lines 586-692 from original)
   - **Remove** the HTML/CSS content (now in Code Embed)
3. **Code in `<head>` tag** section:
   - **Keep** Schema JSON-LD (do NOT delete)
4. Save Page Settings

---

### **STEP 3: Verify Structure**
**Navigator should show**:
```
Body
├── Nav Component Instance
├── Code Embed (Page Content)
└── Footer Component Instance
```

**All content visible in Designer**

---

### **STEP 4: Save & Publish**
1. Click **Save** (top right)
2. Click **Publish** → Select all domains
3. **"Publish to production"**
4. **Result**: Homepage content visible in Designer, scripts still work

---

## ⚠️ **IMPORTANT NOTES**

### **Scripts Separation**
- **Code Embed**: HTML + CSS only (visible in Designer)
- **Page Settings**: Scripts only (GSAP animations, Stripe checkout)
- **Why**: Code Embed flags scripts, Page Settings allows them

### **Functionality**
- ✅ Content displays in Designer (HTML + CSS)
- ✅ Scripts work on published site (GSAP animations, Stripe checkout)
- ✅ Lead form handler needs to be added to Page Settings scripts if needed

---

## ✅ **VERIFICATION**

After setup:
- [ ] Code Embed visible in Designer Navigator
- [ ] Homepage content displays correctly in Designer
- [ ] Page Settings → Before `</body>` contains scripts only
- [ ] Page Settings → `<head>` contains Schema only
- [ ] Published site works (content + scripts)
- [ ] GSAP animations work
- [ ] Stripe checkout buttons work

---

**Status**: File ready, format matches Case Studies exactly  
**File**: `homepage-body-code-designer-visible.txt` (598 lines, HTML + CSS only)

