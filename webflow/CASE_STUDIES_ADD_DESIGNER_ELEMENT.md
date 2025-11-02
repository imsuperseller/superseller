# ✅ Case Studies - Add Custom Code Element in Designer

**Date**: October 31, 2025  
**Purpose**: Match other service pages structure  
**Status**: Ready to Execute

---

## 🎯 **THE FIX**

Add a **Custom Code/Embed Element** in Webflow Designer between NAV and Footer (matching Marketplace page structure).

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Open Case Studies Page in Designer**

1. Go to: https://rensto.design.webflow.com
2. Open **"Case Studies"** page
3. You should see: NAV Component → [EMPTY] → Footer Component

---

### **Step 2: Add Embed/Custom Code Element**

**Method A: Using Add Panel** (Recommended)
1. **Click on empty space** between NAV and Footer
2. **Left sidebar** → **Add panel** (or press `+`)
3. **Search "Embed"** or **"Custom Code"**
4. **Drag** the element onto canvas between NAV and Footer
5. **OR**: Double-click empty space → Type "Embed" → Press Enter

**Method B: Using Keyboard Shortcut**
1. Click empty space between NAV and Footer
2. Press **`E`** (shortcut for Embed element)
3. Element appears on canvas

---

### **Step 3: Configure the Embed Element**

1. **Double-click the Embed element** (or click → Settings panel opens)
2. **In the Embed Code field**, paste content from:
   - File: `webflow/deployment-snippets/case-studies-page-body-code.txt`
   - Copy **entire file** (660 lines)
   - Paste into Embed element's code field
3. **Close/Save** the Embed element settings

---

### **Step 4: Style the Element** (Optional)

1. **Select the Embed element** in Designer
2. **Style panel** (right side):
   - **Width**: 100% (or full width)
   - **Display**: Block
   - **Padding**: 0 (content handles its own spacing)
   - **Margin**: 0 (unless you need spacing from nav/footer)

---

### **Step 5: Clean Up Page Settings** (Important)

**Remove duplicate content**:
1. **Page Settings** (gear icon) → **Custom Code** tab
2. **Before `</body>` tag** section
3. **Delete** or **empty** the content (since it's now in Designer element)
4. **Keep** `<head>` code (schema markup) - that stays in Page Settings
5. **Save**

**Why**: Avoids rendering content twice (once from Designer element, once from Page Settings)

---

### **Step 6: Publish**

1. Click **"Publish"** button
2. Select all domains
3. **"Publish to production"**

---

## ✅ **FINAL STRUCTURE** (After Fix)

```
Case Studies Page in Designer:
├── NAV Component (global Webflow component)
├── Embed Element ← NEW - Contains case studies content
│   └── case-studies-page-body-code.txt (visible in Designer)
└── Footer Component (global Webflow component)

Page Settings:
├── Code in <head> tag: case-studies-schema-head-code.txt ✅
└── Before </body> tag: EMPTY ✅ (moved to Designer element)
```

---

## 📊 **COMPARISON**

| Page | NAV | Custom Element | Footer | Matches? |
|------|-----|----------------|--------|----------|
| **Marketplace** | ✅ | ✅ Custom Code | ✅ | ✅ Yes |
| **Subscriptions** | ✅ | ❌ None | ✅ | ⚠️ Also needs fix? |
| **Case Studies** (after fix) | ✅ | ✅ Embed | ✅ | ✅ Matches |

**Note**: Subscriptions might also need this fix if it's missing the Custom Code Element.

---

## 🎯 **BENEFITS**

After adding Embed element:
- ✅ Content visible in Designer (easier to see/edit)
- ✅ Matches Marketplace structure
- ✅ No duplicate rendering (removed from Page Settings)
- ✅ Consistent across service pages

---

**Created**: October 31, 2025  
**Action**: Add Embed element in Designer → Move content from Page Settings → Publish

