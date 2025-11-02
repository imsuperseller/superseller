# ✅ Case Studies Page - Structure Verification & Fix Plan

**Date**: October 31, 2025  
**Status**: Verification Complete - Ready for Execution  
**Goal**: Convert nav/footer to Code Embed elements and add page content as Code Embed

---

## 🔍 **CURRENT STATE VERIFICATION**

### **API Analysis Results**

**Case Studies Page** (`6905208b87881520f8fb1fa4`):
- **Nodes**: 2 Component Instances
  - Nav: `19798a5e-deac-69d3-575b-03a89d1fe4e0` (Component Instance)
  - Footer: `0b8b7475-7668-458c-e326-a5473489d697` (Component Instance)
- **Page Content**: NOT visible in Designer (likely in Page Settings → Custom Code)

**Comparison: Marketplace Page** (`68ddb0fb5b6408d0687890dd`):
- **Nodes**: 3 Component Instances
  - Nav: `19798a5e-deac-69d3-575b-03a89d1fe4e0` (Component Instance)
  - Custom Code: `db7935ff-807b-dab9-ea8f-ac274a1f6187` (Component Instance)
  - Footer: `0b8b7475-7668-458c-e326-a5473489d697` (Component Instance)

**Finding**: Case Studies is missing the page content element (middle Component Instance)

---

## 🎯 **TARGET STATE** (Per Handoff Document)

According to `AGENT_HANDOFF_DOCUMENT.md`, the goal is:

```
Case Studies Page in Designer:
├── Code Embed #1: Navigation (nav-embed-code.txt)
├── Code Embed #2: Page Content (case-studies-page-body-code.txt)
└── Code Embed #3: Footer (footer-embed-code.txt)
```

**All 3 elements should be Code Embed elements (not Component Instances) for Designer visibility**

---

## 📋 **WHAT NEEDS TO BE DONE**

### **Step 1: Verify Page Content Location**

**Action**: Check Page Settings → Custom Code → Before `</body>` tag
- **If content exists**: Move to Code Embed element
- **If empty**: Add Code Embed element with content

**File to Use**: `webflow/deployment-snippets/case-studies-page-body-code.txt`

---

### **Step 2: Add Page Content as Code Embed**

**Action**:
1. Open Case Studies page in Designer
2. Click between NAV and Footer
3. Add → Embed element (press `E` or drag from Add panel)
4. Double-click Embed element
5. Paste entire content from `case-studies-page-body-code.txt` (660 lines)
6. Save

**Result**: Page content now visible in Designer Navigator

---

### **Step 3: Convert Nav to Code Embed**

**Action**:
1. In Designer Navigator, click on `nav` Component Instance
2. Note its position/styling (if any)
3. Delete the Component Instance
4. Add Embed element in same position
5. Paste content from `webflow/deployment-snippets/nav-embed-code.txt` (191 lines)
6. Save

**Result**: Nav now visible as Code Embed in Designer

---

### **Step 4: Convert Footer to Code Embed**

**Action**:
1. In Designer Navigator, click on `footer` Component Instance
2. Delete the Component Instance
3. Add Embed element after page content
4. Paste content from `webflow/deployment-snippets/footer-embed-code.txt` (209 lines)
5. Save

**Result**: Footer now visible as Code Embed in Designer

---

### **Step 5: Clean Up Page Settings**

**Action**:
1. Page Settings → Custom Code → Before `</body>` tag
2. **Remove or empty** the content (since it's now in Designer Code Embed)
3. **Keep** Page Settings → Custom Code → Code in `<head>` tag (schema markup stays there)
4. Save

**Why**: Avoids duplicate rendering (content renders from Designer element, not Page Settings)

---

### **Step 6: Verify Final Structure**

**Expected Navigator View**:
```
Navigator (Case Studies Page):
├── Code Embed (Nav - nav-embed-code.txt)
├── Code Embed (Page Content - case-studies-page-body-code.txt)
└── Code Embed (Footer - footer-embed-code.txt)
```

**All 3 Code Embeds should be visible in Designer Navigator**

---

### **Step 7: Publish & Verify**

**Action**:
1. Click "Publish" button
2. Select all domains
3. Publish to production
4. Visit https://rensto.com/case-studies
5. Verify:
   - Nav displays correctly
   - Page content displays correctly
   - Footer displays correctly
   - No duplicate content
   - All styles applied correctly

---

## ✅ **VERIFICATION CHECKLIST**

After completion:

- [ ] All 3 Code Embed elements visible in Designer Navigator
- [ ] Nav Code Embed contains `nav-embed-code.txt` content
- [ ] Page Content Code Embed contains `case-studies-page-body-code.txt` content
- [ ] Footer Code Embed contains `footer-embed-code.txt` content
- [ ] Page Settings → Before `</body>` tag is empty (or contains only backup/notes)
- [ ] Page Settings → Code in `<head>` tag contains schema markup (unchanged)
- [ ] Page published and live
- [ ] Live site shows all elements correctly
- [ ] No duplicate content rendering
- [ ] All styles aligned with brand system

---

## 📁 **FILES REFERENCED**

1. **Navigation**: `webflow/deployment-snippets/nav-embed-code.txt` (191 lines)
2. **Page Content**: `webflow/deployment-snippets/case-studies-page-body-code.txt` (660 lines)
3. **Footer**: `webflow/deployment-snippets/footer-embed-code.txt` (209 lines)
4. **Schema Markup**: `webflow/deployment-snippets/case-studies-schema-head-code.txt` (stays in Page Settings)

---

## 🎨 **STYLING NOTES**

All Code Embed elements use:
- ✅ Rensto brand system CSS variables (--red, --orange, --blue, --cyan, etc.)
- ✅ `!important` flags to override Webflow defaults
- ✅ Responsive design (mobile-friendly)
- ✅ Consistent button heights (48px minimum)
- ✅ Proper flexbox alignment

**Global CSS** (already deployed): `rensto-brand-system-with-alignment-fixes.txt` in Site Settings → Custom Code → `<head>` tag

---

## ⚠️ **IMPORTANT NOTES**

1. **Component Instances vs Code Embeds**:
   - Component Instances: Global changes, less visible in Designer
   - Code Embeds: Page-specific, visible in Designer, easier to customize

2. **Why Convert to Code Embeds**:
   - Better visibility in Designer
   - Easier to customize per page
   - Matches handoff document requirements

3. **Avoid Duplicate Content**:
   - Remove content from Page Settings → Before `</body>` after moving to Code Embed
   - Keep schema in Page Settings → `<head>` (correct location)

4. **Designer Visibility**:
   - Code Embeds may show warning: "This `<script>` embed will only appear on published/exported site"
   - This is expected - test on live site, not Designer preview

---

## 🚀 **NEXT STEPS AFTER COMPLETION**

1. ✅ Verify other service pages structure
2. ✅ Standardize all service pages to use Code Embeds (if needed)
3. ✅ Continue visual audit on remaining 21 relevant pages
4. ✅ Device testing on priority pages

---

**Created**: October 31, 2025  
**Status**: Ready for Manual Execution in Webflow Designer  
**Estimated Time**: 15-20 minutes

