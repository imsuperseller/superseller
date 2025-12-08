# Stripe Webhook Workflow Fixes - Complete Guide

**Date**: December 8, 2025  
**Status**: 🔧 **FIXES REQUIRED**

---

## 🔍 **ISSUES IDENTIFIED**

### **1. STRIPE-MARKETPLACE-001 (FOWZV3tTy5Pv84HP)**

**Error**: `WorkflowHasIssuesError: The workflow has issues and cannot be executed`

**Critical Errors**:
1. ❌ **Webhook Node**: Missing `onError: "continueRegularOutput"` in options
2. ❌ **Generate Download Link Node**: Missing required `URL` property

**Warnings** (Non-blocking):
- Outdated typeVersion: 4.2 → 4.3 (HTTP Request nodes)
- Missing error handling on HTTP Request nodes

### **2. STRIPE-READY-001 (APAOVLYBWKZF8Ch8)**

**Error**: `Cannot read properties of undefined (reading 'execute')`

**Root Cause**: Airtable v2 node missing required `fields` parameter for append operation

**Current Configuration** (INCOMPLETE):
```json
{
  "parameters": {
    "operation": "append",
    "base": "appQijHhqqP4z6wGe",
    "table": "Customers"
    // ❌ MISSING: "fields" parameter
  }
}
```

---

## 🔧 **FIXES REQUIRED**

### **Fix 1: STRIPE-MARKETPLACE-001 - Webhook Node**

**Location**: Node ID `af1cc795-90f3-4bf3-8a3c-84657f7140ec`

**Current**:
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "stripe-marketplace-template",
    "responseMode": "responseNode",
    "options": {}
  }
}
```

**Required**:
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "stripe-marketplace-template",
    "responseMode": "responseNode",
    "options": {
      "onError": "continueRegularOutput"
    }
  }
}
```

**Action**: Update webhook node options in n8n UI or via API

---

### **Fix 2: STRIPE-MARKETPLACE-001 - Generate Download Link Node**

**Location**: Node ID `e5d78085-8fbd-4fc1-8600-d850e3f112ae`

**Current** (INCOMPLETE):
```json
{
  "parameters": {
    "jsonBody": "={{ {...} }}"
  }
}
```

**Required** (Complete HTTP Request):
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.example.com/generate-download-link",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer [TOKEN]"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ {\n  \"templateId\": $('Parse Webhook Data').item.json.productId,\n  \"customerEmail\": $('Parse Webhook Data').item.json.customerEmail,\n  \"sessionId\": $('Parse Webhook Data').item.json.sessionId,\n  \"purchaseRecordId\": $('Create Marketplace Purchase in Boost.space').first().json.id\n} }}",
    "options": {
      "timeout": 30000
    }
  }
}
```

**Note**: Replace `https://api.example.com/generate-download-link` with actual download link generation service URL.

**Options**:
1. Use existing download link service (if available)
2. Create new API endpoint for download link generation
3. Use Boost.space API for download link generation
4. Generate download link directly in workflow (Code node)

---

### **Fix 3: STRIPE-READY-001 - Airtable Node**

**Location**: Node ID `airtable` (in STRIPE-READY-001 workflow)

**Current** (INCOMPLETE):
```json
{
  "parameters": {
    "operation": "append",
    "base": {
      "__rl": true,
      "value": "appQijHhqqP4z6wGe",
      "mode": "id"
    },
    "table": {
      "__rl": true,
      "value": "Customers",
      "mode": "list"
    }
    // ❌ MISSING: "fields" parameter
  }
}
```

**Required** (Complete):
```json
{
  "parameters": {
    "operation": "append",
    "base": {
      "__rl": true,
      "value": "appQijHhqqP4z6wGe",
      "mode": "id"
    },
    "table": {
      "__rl": true,
      "value": "Customers",
      "mode": "list"
    },
    "fields": {
      "mappingMode": "defineBelow",
      "value": {
        "Email": "={{ $json.body.customerEmail || $json.customerEmail }}",
        "Name": "={{ $json.body.customerName || $json.customerName || 'Customer' }}",
        "Purchase Type": "Ready Solutions",
        "Amount": "={{ $json.body.amount || $json.amount || 0 }}",
        "Date": "={{ $now.toISO() }}",
        "Stripe Session ID": "={{ $json.body.sessionId || $json.sessionId || '' }}"
      },
      "matchingColumns": ["Email"],
      "schema": []
    },
    "options": {}
  }
}
```

**Action**: Update Airtable node in n8n UI:
1. Open STRIPE-READY-001 workflow
2. Click "Create Customer Record" node
3. Add fields mapping:
   - Email: `={{ $json.body.customerEmail || $json.customerEmail }}`
   - Name: `={{ $json.body.customerName || $json.customerName || 'Customer' }}`
   - Purchase Type: `Ready Solutions`
   - Amount: `={{ $json.body.amount || $json.amount || 0 }}`
   - Date: `={{ $now.toISO() }}`
4. Save workflow

---

## 📋 **MANUAL FIX INSTRUCTIONS**

### **Option 1: Fix via n8n UI** (Recommended)

1. **STRIPE-MARKETPLACE-001**:
   - Go to: https://n8n.rensto.com/workflow/FOWZV3tTy5Pv84HP
   - Click "Stripe Webhook - Marketplace" node
   - In "Options", add: `onError: continueRegularOutput`
   - Click "Generate Download Link" node
   - Add method: `POST`
   - Add URL: [Your download link service URL]
   - Add headers: Authorization, Content-Type
   - Save workflow

2. **STRIPE-READY-001**:
   - Go to: https://n8n.rensto.com/workflow/APAOVLYBWKZF8Ch8
   - Click "Create Customer Record" node
   - In "Fields to Send", add:
     - Email: `={{ $json.body.customerEmail || $json.customerEmail }}`
     - Name: `={{ $json.body.customerName || $json.customerName || 'Customer' }}`
     - Purchase Type: `Ready Solutions`
     - Amount: `={{ $json.body.amount || $json.amount || 0 }}`
     - Date: `={{ $now.toISO() }}`
   - Save workflow

### **Option 2: Fix via API** (Advanced)

See workflow JSON files in `/workflows/` directory for complete configurations.

---

## ✅ **VERIFICATION AFTER FIXES**

### **1. Validate Workflows**

```bash
# Check STRIPE-MARKETPLACE-001 validation
curl -X GET "https://n8n.rensto.com/api/v1/workflows/FOWZV3tTy5Pv84HP" \
  -H "X-N8N-API-KEY: [API_KEY]" | jq '.data.nodes[] | select(.name == "Stripe Webhook - Marketplace")'

# Check STRIPE-READY-001 validation
curl -X GET "https://n8n.rensto.com/api/v1/workflows/APAOVLYBWKZF8Ch8" \
  -H "X-N8N-API-KEY: [API_KEY]" | jq '.data.nodes[] | select(.name == "Create Customer Record")'
```

### **2. Test Webhook Execution**

```bash
# Test STRIPE-MARKETPLACE-001
curl -X POST "https://n8n.rensto.com/webhook/stripe-marketplace-template" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment_completed",
    "sessionId": "cs_test_123",
    "customerEmail": "test@rensto.com",
    "amount": 197,
    "productId": "test-product-123",
    "flowType": "marketplace-template",
    "customerName": "Test Customer"
  }'

# Test STRIPE-READY-001
curl -X POST "https://n8n.rensto.com/webhook/stripe-ready-solutions" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment_completed",
    "sessionId": "cs_test_456",
    "customerEmail": "test@rensto.com",
    "amount": 2990,
    "flowType": "ready-solutions",
    "tier": "professional",
    "customerName": "Test Customer"
  }'
```

### **3. Check Execution Status**

- Go to: https://n8n.rensto.com/executions
- Filter by workflow ID
- Verify execution status is "success" (not "error")

---

## 📝 **NEXT STEPS**

1. ⚠️ **Fix STRIPE-MARKETPLACE-001 webhook node** - Add `onError` option
2. ⚠️ **Fix STRIPE-MARKETPLACE-001 download link node** - Add URL and method
3. ⚠️ **Fix STRIPE-READY-001 Airtable node** - Add fields mapping
4. ✅ **Validate workflows** - Check for remaining errors
5. ✅ **Test webhook execution** - Verify workflows execute successfully
6. ✅ **Re-test with real Stripe event** - End-to-end verification

---

**Status**: 🔧 **FIXES REQUIRED**  
**Priority**: **HIGH** - Workflows cannot execute until fixes applied
