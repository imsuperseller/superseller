# ✅ Case Studies Page - Final Fix Execution Guide

**Date**: October 31, 2025  
**Status**: EXECUTE NOW  
**Goal**: 3 Code Embed elements visible in Designer, Page Settings cleaned

---

## 📊 **CURRENT STATE** (From API)

**Case Studies Page Structure**:
- Nav: Component Instance `19798a5e-deac-69d3-575b-03a89d1fe4e0`
- Footer: Component Instance `0b8b7475-7668-458c-e326-a5473489d697`
- Page Content: Likely in Page Settings → Before `</body>` tag (not visible in Designer)

---

## 🎯 **TARGET STATE**

```
Case Studies Page Designer Navigator:
├── Code Embed (Nav) ← nav-embed-code-designer-visible.txt
├── Code Embed (Page Content) ← case-studies-page-body-code.txt
└── Code Embed (Footer) ← footer-embed-code-designer-visible.txt

Page Settings:
├── <head> tag: Schema JSON-LD ONLY
└── Before </body> tag: EMPTY (content moved to Code Embeds)
```

---

## 🔧 **EXECUTION STEPS** (Manual in Webflow Designer)

### **STEP 1: Open Case Studies Page**
1. Go to: https://rensto.design.webflow.com
2. Pages → Case Studies
3. Check Navigator panel (left side)

---

### **STEP 2: Delete Nav Component Instance**
1. In Navigator, find `nav` (Component Instance)
2. Click to select it
3. Press `Delete` or right-click → Delete
4. **Result**: Nav removed, ready for Code Embed

---

### **STEP 3: Add Nav Code Embed Element**
1. Click at top of page (where nav was)
2. Press `E` (shortcut for Embed) OR Add panel → Embed
3. Double-click the new Embed element
4. **Open file**: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/nav-embed-code-designer-visible.txt`
   - Or navigate: `webflow/deployment-snippets/nav-embed-code-designer-visible.txt`
5. **Copy ENTIRE file** (152 lines)
6. **Paste** into Embed element code field
7. Close/save Embed settings
8. **Result**: Nav Code Embed visible in Designer

---

### **STEP 4: Check Page Content Code Embed**
1. In Navigator, check for existing "Code Embed" element (middle)
2. If EXISTS:
   - Double-click it
   - Verify it contains content from: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/case-studies-page-body-code.txt`
   - If wrong content → Replace with correct content
3. If MISSING:
   - Click between Nav and Footer
   - Add → Embed element
   - **Open file**: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/case-studies-page-body-code.txt`
   - Copy ENTIRE file (660 lines) and paste

---

### **STEP 5: Delete Footer Component Instance**
1. In Navigator, find `footer` (Component Instance)
2. Click to select it
3. Press `Delete` or right-click → Delete
4. **Result**: Footer removed, ready for Code Embed

---

### **STEP 6: Add Footer Code Embed Element**
1. Click at bottom of page (after page content Code Embed)
2. Press `E` OR Add panel → Embed
3. Double-click the new Embed element
4. **Open file**: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/footer-embed-code-designer-visible.txt`
   - Or navigate: `webflow/deployment-snippets/footer-embed-code-designer-visible.txt`
5. **Copy ENTIRE file** (170 lines)
6. **Paste** into Embed element code field
7. Close/save Embed settings
8. **Result**: Footer Code Embed visible in Designer

---

### **STEP 7: Clean Page Settings**
1. Click gear icon (Page Settings) → Custom Code tab
2. **Before `</body>` tag** section:
   - Select ALL content
   - **DELETE it** (backspace/delete)
   - Leave EMPTY
3. **Code in `<head>` tag** section:
   - **KEEP** the Schema JSON-LD code (do NOT delete)
   - Should contain content from: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/case-studies-schema-head-code.txt`
4. Save Page Settings

---

### **STEP 8: Verify Structure**
**Navigator should show** (in order):
```
Body
├── Code Embed (Nav)
├── Code Embed (Page Content)  
└── Code Embed (Footer)
```

**All 3 Code Embeds visible in Designer**

---

### **STEP 9: Save & Publish**
1. Click "Save" (top right)
2. Click "Publish" → Select all domains
3. "Publish to production"
4. **Result**: Changes live on site

---

## 📁 **FILES REFERENCED** (Click to open)

1. **Nav Code Embed**:
   - Full path: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/nav-embed-code-designer-visible.txt`
   - Relative: `webflow/deployment-snippets/nav-embed-code-designer-visible.txt`
   - Lines: 152
   - Format: `<style>` first, HTML second, NO scripts

2. **Page Content Code Embed**:
   - Full path: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/case-studies-page-body-code.txt`
   - Relative: `webflow/deployment-snippets/case-studies-page-body-code.txt`
   - Lines: 660
   - Format: `<style>` first, HTML second, NO scripts

3. **Footer Code Embed**:
   - Full path: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/footer-embed-code-designer-visible.txt`
   - Relative: `webflow/deployment-snippets/footer-embed-code-designer-visible.txt`
   - Lines: 170
   - Format: `<style>` first, HTML second, NO scripts

4. **Schema (Keep in Page Settings)**:
   - Full path: `/Users/shaifriedman/New Rensto/rensto/webflow/deployment-snippets/case-studies-schema-head-code.txt`
   - Relative: `webflow/deployment-snippets/case-studies-schema-head-code.txt`
   - Location: Page Settings → `<head>` tag (DO NOT DELETE)

---

## ⚠️ **ABOUT WARNINGS**

If Code Embed elements show warning: **"This `<script>` embed will only appear on published/exported site"**

**This is EXPECTED** - Webflow Designer flags Code Embed elements that contain JavaScript patterns.

**Action**: **IGNORE the warning** if:
- ✅ Content displays correctly in Designer preview
- ✅ Structure is correct (3 Code Embeds visible)
- ✅ Code matches working page body format

**Functionality**: Code will work correctly on published site even with warning.

---

## ✅ **FINAL VERIFICATION**

After completion:
- [ ] 3 Code Embed elements in Navigator
- [ ] Nav Code Embed displays navigation
- [ ] Page Content Code Embed displays page content
- [ ] Footer Code Embed displays footer
- [ ] Page Settings → Before `</body>` is EMPTY
- [ ] Page Settings → `<head>` contains Schema only
- [ ] Page published successfully
- [ ] Live site works correctly

---

**Status**: Ready for manual execution  
**Estimated Time**: 10-15 minutes  
**Files**: All ready, correct format, no scripts

