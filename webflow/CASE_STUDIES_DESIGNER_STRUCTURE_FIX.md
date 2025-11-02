# 🔧 Case Studies Page - Designer Structure Fix

**Date**: October 31, 2025  
**Issue**: Page missing custom code element between nav and footer  
**Status**: Needs clarification and fix

---

## 🔍 **THE PROBLEM**

### **Other Service Pages Structure** (Subscriptions, Marketplace, etc.):
```
Webflow Designer View:
├── NAV Component (global, Webflow)
├── Custom Code Element (visible in Designer) ← Contains page content
│   └── Embedded HTML/CSS for page content
└── Footer Component (global, Webflow)
```

### **Case Studies Page Structure** (Current):
```
Webflow Designer View:
├── NAV Component (global, Webflow)
├── [EMPTY - Nothing here] ← MISSING!
└── Footer Component (global, Webflow)

But content exists via: Page Settings → Custom Code → Before </body> tag
```

---

## 🎯 **TWO POSSIBLE SOLUTIONS**

### **Option A: Add Custom Code Element in Designer** (Recommended for Consistency)

**What to Do**:
1. In Webflow Designer → Case Studies page
2. Between NAV and Footer, add **"Embed"** or **"Custom Code"** element
3. Paste the content from `case-studies-page-body-code.txt` into this element
4. Remove code from Page Settings → Custom Code → Before `</body>` tag (or keep as backup)

**Pros**:
- ✅ Consistent with other pages
- ✅ Visible in Designer (easier to manage)
- ✅ Matches existing architecture

**Cons**:
- ⚠️ Requires manual Designer work

---

### **Option B: Keep Backend Code, Document Difference**

**What to Do**:
- Keep current setup (Page Settings → Before `</body>` tag)
- Document that Case Studies uses different approach
- Other pages should be migrated to backend approach for consistency

**Pros**:
- ✅ Already working
- ✅ Cleaner (all code in one place)

**Cons**:
- ⚠️ Inconsistent with other pages
- ⚠️ Not visible in Designer

---

## 🤔 **CLARIFICATION NEEDED**

**Question**: How are OTHER service pages structured?

**Option 1**: Other pages use **Custom Code Elements** in Designer (visible components)  
→ **Solution**: Add Custom Code Element to Case Studies page

**Option 2**: Other pages ALSO use **Page Settings → Before </body>** (backend only)  
→ **Solution**: Keep current approach, verify other pages match

**Option 3**: Mixed approach (some use elements, some use backend)  
→ **Solution**: Standardize on one approach

---

## 🚀 **RECOMMENDED ACTION**

**For Consistency**: Add Custom Code Element in Designer

**Steps**:
1. Open Case Studies page in Webflow Designer
2. Click between NAV and Footer
3. Add → Embed / Custom Code element
4. Paste content from `case-studies-page-body-code.txt`
5. Style the element (full width, no padding)
6. Keep schema markup in Page Settings → `<head>` tag (as it should be)

---

## 📋 **ARCHITECTURE DECISION**

**Need User Input**: 
- Are other pages using Custom Code Elements in Designer?
- OR are they all using Page Settings → Before `</body>` tag?
- Should we standardize on one approach across all pages?

---

**Created**: October 31, 2025  
**Status**: ⏳ Waiting for clarification on other pages' structure

