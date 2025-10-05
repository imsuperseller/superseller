# 🧹 **RENSTO WEBSITE CLEANUP PLAN**

**Date**: January 21, 2025  
**Status**: 🎯 **READY FOR EXECUTION**  
**Priority**: **CRITICAL** - Eliminate conflicts and centralize website files

---

## 🚨 **CRITICAL ISSUES IDENTIFIED**

### **1. MULTIPLE WEBSITE DIRECTORIES (CONFLICTING)**
- ✅ **`webflow-ready/`** - **KEEP** (Latest, most complete)
- ❌ **`rensto-landing/`** - **REMOVE** (Outdated structure)
- ❌ **`assets/root-cleanup/`** - **ARCHIVE** (Old files)
- ❌ **Root level HTML files** - **REMOVE** (Scattered)

### **2. DUPLICATE PAGES IDENTIFIED**

#### **Home Pages (4 duplicates)**
- ✅ **`webflow-ready/home.html`** - **KEEP** (Current Universal Micro-SaaS)
- ❌ **`rensto-landing/home-updated.html`** - **REMOVE** (Old business model)
- ❌ **`assets/root-cleanup/rensto-optimized-landing-page.html`** - **ARCHIVE**
- ❌ **`assets/root-cleanup/complete-saas-landing-page.html`** - **ARCHIVE**

#### **Pricing Pages (3 duplicates)**
- ✅ **`webflow-ready/pricing.html`** - **KEEP** (Current)
- ❌ **`rensto-landing/pricing.html`** - **REMOVE** (Outdated)
- ❌ **`pricing-page.html`** (root) - **REMOVE** (Outdated)

#### **Lead Generator Pages (4 duplicates)**
- ✅ **`webflow-ready/lead-generator.html`** - **KEEP** (Current)
- ❌ **`rensto-landing/lead-generator.html`** - **REMOVE**
- ❌ **`rensto-landing/lead-generator-proper.html`** - **REMOVE**
- ❌ **`rensto-landing/typeform-lead-generator.html`** - **REMOVE**

### **3. BRAND GUIDELINE CONFLICTS**
- ✅ **Current**: `#fe3d51`, `#bf5700`, `#1eaef7`, `#5ffbfd` on `#110d28`
- ❌ **Old**: `#f97316`, `#3b82f6` (Different values)

---

## 🎯 **CLEANUP ACTIONS**

### **PHASE 1: ARCHIVE OLD FILES**
1. Move `rensto-landing/` → `archives/outdated-website/`
2. Move `assets/root-cleanup/` → `archives/outdated-website/`
3. Move root HTML files → `archives/outdated-website/`

### **PHASE 2: CENTRALIZE CURRENT FILES**
1. Keep `webflow-ready/` as **SINGLE SOURCE OF TRUTH**
2. Update documentation to reference only `webflow-ready/`
3. Remove all references to old directories

### **PHASE 3: VERIFY CONSISTENCY**
1. Ensure all components use current brand colors
2. Verify all Typeform integrations use correct form ID
3. Check all links point to current pages

---

## 📁 **FINAL STRUCTURE**

```
rensto/
├── webflow-ready/           # 🎯 SINGLE SOURCE OF TRUTH
│   ├── home.html           # ✅ Current homepage
│   ├── pricing.html        # ✅ Current pricing
│   ├── lead-generator.html # ✅ Current lead form
│   └── components/         # ✅ All components
├── archives/
│   └── outdated-website/  # 📦 Archived old files
└── docs/
    └── website/           # 📚 Documentation only
```

---

## ✅ **SUCCESS CRITERIA**

- [ ] Only `webflow-ready/` contains website files
- [ ] All old directories moved to archives
- [ ] No duplicate pages exist
- [ ] All brand guidelines consistent
- [ ] Documentation updated
- [ ] No broken links or references

---

**Ready to execute cleanup!** 🚀
