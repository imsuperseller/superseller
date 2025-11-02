# 🔍 Designer Structure Clarification

**Date**: October 31, 2025  
**Question**: Should Case Studies have Custom Code Element in Designer?

---

## 📊 **PAGE STRUCTURE ANALYSIS**

### **Marketplace Page** (`68ddb0fb5b6408d0687890dd`)
- **Nodes**: 3 component instances
- **Components**: 
  1. `19798a5e-deac-69d3-575b-03a89d1fe4e0` (likely NAV)
  2. `db7935ff-807b-dab9-ea8f-ac274a1f6187` (likely Custom Code Element)
  3. `0b8b7475-7668-458c-e326-a5473489d697` (likely Footer)

### **Subscriptions Page** (`68dfc41ffedc0a46e687c84b`)
- **Nodes**: 2 component instances
- **Components**:
  1. `19798a5e-deac-69d3-575b-03a89d1fe4e0` (NAV)
  2. `0b8b7475-7668-458c-e326-a5473489d697` (Footer)

### **Case Studies Page** (`6905208b87881520f8fb1fa4`)
- **Nodes**: 2 component instances
- **Components**:
  1. `19798a5e-deac-69d3-575b-03a89d1fe4e0` (NAV)
  2. `0b8b7475-7668-458c-e326-a5473489d697` (Footer)

---

## 🤔 **QUESTION**

**User says**: Other pages have Custom Code Elements between nav and footer  
**But API shows**: Subscriptions also has only 2 components (like Case Studies)

**Clarification Needed**:
1. Are you seeing Custom Code Elements visually in Designer?
2. Or are they using Page Settings → Before `</body>` tag?
3. Should ALL pages have Custom Code Elements, or is backend approach OK?

---

## ✅ **RECOMMENDED ACTION**

**Add Custom Code Element to Case Studies** to match Marketplace structure:

1. Open Case Studies page in Designer
2. Click between NAV and Footer
3. Add → Embed element
4. Paste content from `case-studies-page-body-code.txt`
5. Remove from Page Settings → Before `</body>` (to avoid duplication)

---

**Created**: October 31, 2025  
**Status**: Waiting for confirmation on which approach to use

