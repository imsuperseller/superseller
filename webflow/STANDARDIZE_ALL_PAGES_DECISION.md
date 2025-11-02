# 🤔 Standardize All Pages - Decision Needed

**Date**: October 31, 2025  
**Question**: Should ALL pages use Custom Code Elements in Designer?

---

## 📊 **CURRENT STATE**

### **Pages with Custom Code Elements** (Designer):
- ✅ Marketplace (3 components: NAV, Custom Code, Footer)

### **Pages WITHOUT Custom Code Elements** (Backend only):
- ⚠️ Subscriptions (2 components: NAV, Footer)
- ⚠️ Case Studies (2 components: NAV, Footer)
- ⚠️ Ready Solutions (likely same)
- ⚠️ Custom Solutions (likely same)

---

## 🎯 **OPTIONS**

### **Option A: Add Custom Code Elements to All Pages** ✅ Recommended

**Pros**:
- ✅ Consistent architecture
- ✅ Content visible in Designer
- ✅ Easier to manage/edit
- ✅ Matches Marketplace (the template)

**Cons**:
- ⚠️ More Designer work (add elements to 4+ pages)

**Action**:
1. Add Embed elements to: Subscriptions, Ready Solutions, Custom Solutions, Case Studies
2. Move content from Page Settings → Designer elements
3. Keep schema in Page Settings `<head>` (correct location)

---

### **Option B: Remove Custom Code Elements, Use Backend Only**

**Pros**:
- ✅ Cleaner architecture (all code in Page Settings)
- ✅ Less visual clutter in Designer
- ✅ Centralized code management

**Cons**:
- ⚠️ Content not visible in Designer
- ⚠️ Different from Marketplace (inconsistent)
- ⚠️ Harder to visualize page structure

**Action**:
1. Remove Custom Code Element from Marketplace
2. Move content to Page Settings → Before `</body>`
3. Standardize all pages to backend approach

---

### **Option C: Hybrid (Keep Current)**

**Pros**:
- ✅ No work needed

**Cons**:
- ❌ Inconsistent architecture
- ❌ Confusing (some pages have elements, some don't)

---

## ✅ **RECOMMENDATION**

**Option A** - Add Custom Code Elements to all service pages for consistency.

**Why**:
- Marketplace is the template/reference page
- Visibility in Designer is valuable
- Easier to see what's on each page

---

**Created**: October 31, 2025  
**Decision Needed**: Choose Option A, B, or C

