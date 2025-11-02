# 🔍 Webflow Custom Code API Endpoint Investigation

**Date**: October 31, 2025  
**Status**: Testing both API keys and endpoint variations

---

## ❌ **TEST RESULTS**

### **Both API Keys Tested**:
1. ✅ **Site API works** - Both keys can access `/v2/sites/{id}`
2. ❌ **Custom Code endpoint** - Both return 404:
   - `/v2/sites/{siteId}/custom_code` → 404 Route Not Found
   - Tried with both keys
   - Same 404 error

---

## 💡 **POSSIBILITIES**

### **Option 1: Different Base Path**
The endpoint might be:
- `/v2/custom_code` (site-level)
- `/data/custom_code` (Data API)
- `/sites/{id}/scripts` (alternative naming)

### **Option 2: Requires Data Client**
- Documentation mentions "Data Clients"
- Custom code might be part of Data API, not Sites API
- May need to create Data Client first

### **Option 3: Endpoint Not Yet Available**
- Feature might be in beta
- Might require whitelist/approval
- Documentation might be ahead of API

---

## 📋 **NEXT STEPS**

1. ✅ Test alternative endpoint paths
2. ⏳ Check Data Client requirements
3. ⏳ Review Designer Extensions docs
4. ✅ Fallback: Manual deployment + v1 publish (confirmed working)

---

**Current Status**: Both keys work for sites but not custom code. Investigating endpoint variations.

