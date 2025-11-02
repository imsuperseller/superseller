# ✅ Execution Plan: Cleanup & Fix Case Studies Page

**Date**: October 31, 2025  
**Goal**: All content in Code Embed elements (nav, content, footer), Page Settings cleaned

---

## 🎯 **TARGET STRUCTURE**

```
Case Studies Page in Designer:
├── Code Embed #1: Navigation (nav-embed-code-designer-visible.txt)
├── Code Embed #2: Page Content (case-studies-page-body-code.txt) 
└── Code Embed #3: Footer (footer-embed-code-designer-visible.txt)

Page Settings:
├── <head> tag: Schema JSON-LD ONLY ✅
└── Before </body> tag: EMPTY ✅ (all content moved to Code Embeds)
```

---

## 📋 **EXECUTION STEPS**

### **Step 1: Verify Current State**
- Check if nav is Component Instance or Code Embed
- Check if footer is Component Instance or Code Embed  
- Check if page content Code Embed exists
- Check Page Settings → Before </body> tag content

### **Step 2: Add/Update Nav Code Embed**
- If Component Instance → Delete it
- Add Code Embed element (top of page)
- Paste: `nav-embed-code-designer-visible.txt`
- Verify no warnings (HTML + CSS only)

### **Step 3: Verify/Update Page Content Code Embed**
- Check existing Code Embed (middle)
- Ensure it contains: `case-studies-page-body-code.txt` content
- Verify structure: `<style>` first, then HTML

### **Step 4: Add/Update Footer Code Embed**
- If Component Instance → Delete it
- Add Code Embed element (bottom of page)
- Paste: `footer-embed-code-designer-visible.txt`
- Verify no warnings (HTML + CSS only)

### **Step 5: Clean Page Settings**
- Page Settings → Custom Code → Before `</body>` tag
- **DELETE all content** (moved to Code Embeds)
- Keep: Page Settings → `<head>` tag → Schema JSON-LD (unchanged)

### **Step 6: Verify All 3 Code Embeds**
- Navigator shows: Nav Code Embed → Content Code Embed → Footer Code Embed
- All visible in Designer
- Save → Publish

---

## 📁 **FILES TO USE**

1. **Nav**: `webflow/deployment-snippets/nav-embed-code-designer-visible.txt`
   - Structure: `<style>` first, then HTML
   - No `<script>`, no `onclick`
   
2. **Page Content**: `webflow/deployment-snippets/case-studies-page-body-code.txt`
   - Already correct format
   - Structure: `<style>` first, then HTML
   
3. **Footer**: `webflow/deployment-snippets/footer-embed-code-designer-visible.txt`
   - Structure: `<style>` first, then HTML
   - No `<script>`

---

## ✅ **SUCCESS CRITERIA**

- [ ] 3 Code Embed elements visible in Designer Navigator
- [ ] Page Settings → Before `</body>` tag is EMPTY
- [ ] Page Settings → `<head>` tag contains Schema only
- [ ] All Code Embeds display correctly (no rendering issues)
- [ ] Nav and Footer visible in Designer (warnings acceptable if content displays)
- [ ] Published site works correctly

---

**Status**: Ready to execute manually in Webflow Designer

