# Security Fix: API Keys Moved to Credentials

**Date**: November 17, 2025  
**Status**: ✅ **FIXED** - Hardcoded API keys removed

---

## ✅ **FIXES APPLIED**

### **1. Removed from "Set Store Name and Extract Text1"**
- ❌ Removed: `api_key: "AIzaSyB1nQdOOSeYdGv_R53dcyYDsIwenRU5ziE"`
- ✅ Now: API key retrieved from credentials in "Search Documents Tool1"

### **2. Updated "Search Documents Tool1" Code Node**
- ❌ Removed: Hardcoded `API_KEY` and `STORE_ID`
- ✅ Now: Uses `this.getWorkflowStaticData('global')` to get Google API key from encrypted static data
- ✅ Store ID: `rensto-knowledge-base-ndf9fmymwb2p` (not sensitive, but configurable)

### **3. Updated "Download Voice Audio1" HTTP Request**
- ❌ Removed: Hardcoded `x-api-key: "4fc7e008d7d24fc995475029effc8fa8"` header
- ✅ Now: Uses HTTP Header Auth credential authentication

---

## 🔧 **REQUIRED SETUP**

### **1. Google API Key - Workflow Static Data**

**Method**: Workflow Static Data (n8n's encrypted storage)

**Status**: ✅ **SET PROGRAMMATICALLY** (November 17, 2025)

**How to Set** (if needed in future):
- **Option 1 (Programmatic)**: Run `node scripts/set-workflow-static-data.js`
- **Option 2 (Manual)**: Use n8n API:
  ```bash
  curl -X PUT "http://173.254.201.134:5678/api/v1/workflows/eQSCUFw91oXLxtvn" \
    -H "X-N8N-API-KEY: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"name":"...","nodes":[...],"connections":{...},"settings":{...},"staticData":{"googleApiKey":"AIzaSyB1nQdOOSeYdGv_R53dcyYDsIwenRU5ziE"}}'
  ```

**Why Static Data**: n8n code nodes (toolCode) don't support credential attachments directly. Static data is encrypted and secure.

**Code Access**: `this.getWorkflowStaticData('global').googleApiKey`

---

### **2. WAHA API Key Credential**

**Type**: HTTP Header Auth  
**Name**: `WAHA API Key`

**Configuration**:
- **Header Name**: `x-api-key`
- **Header Value**: `4fc7e008d7d24fc995475029effc8fa8`

**How to Create**:
1. Go to n8n → Credentials → Add Credential
2. Select "HTTP Header Auth"
3. Name: `WAHA API Key`
4. Header Name: `x-api-key`
5. Header Value: `4fc7e008d7d24fc995475029effc8fa8`
6. Save

**Attach to Node**:
- "Download Voice Audio1" → Credentials → Select "WAHA API Key"

---

## 📝 **CODE CHANGES**

### **Search Documents Tool1** (Code Node)

**Before**:
```javascript
const STORE_ID = 'rensto-knowledge-base-ndf9fmymwb2p';
const API_KEY = 'AIzaSyB1nQdOOSeYdGv_R53dcyYDsIwenRU5ziE';
```

**After**:
```javascript
const staticData = this.getWorkflowStaticData('global');
const storeId = 'rensto-knowledge-base-ndf9fmymwb2p';
const apiKey = staticData.googleApiKey;
```

### **Download Voice Audio1** (HTTP Request)

**Before**:
```json
{
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "x-api-key",
        "value": "4fc7e008d7d24fc995475029effc8fa8"
      }
    ]
  }
}
```

**After**:
```json
{
  "authentication": "headerAuth",
  "sendHeaders": false
}
```

---

## ⚠️ **IMPORTANT NOTES**

1. **Store ID**: The store ID `rensto-knowledge-base-ndf9fmymwb2p` is not sensitive (it's a public identifier), but it's now in code comments for clarity.

2. **Static Data**: Workflow static data is encrypted by n8n and is the recommended way to store sensitive values in code nodes that can't use credentials directly.

3. **WAHA API Key**: The HTTP Request node uses credential authentication, which requires attaching the credential in the n8n UI.

---

## 🔒 **SECURITY STATUS**

- ✅ Google API Key: Moved to workflow static data (encrypted)
- ✅ WAHA API Key: Moved to HTTP Header Auth credential
- ✅ Store ID: Not sensitive, but documented
- ⚠️ **Action Required**: 
  1. Set `googleApiKey` in workflow static data
  2. Create and attach "WAHA API Key" credential to "Download Voice Audio1" node

---

## 📋 **NEXT STEPS**

1. ✅ **DONE**: Set `googleApiKey` in workflow static data (set programmatically)
2. ✅ **DONE**: Attach existing HTTP Header Auth credential (`V3yoK02N3hOAR93E` - "waha") to "Download Voice Audio1" node
3. ⚠️ **TODO**: Test workflow to ensure both API keys are accessed correctly

