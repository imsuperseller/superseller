# n8n Workflow JSON Structure Analysis

**Date**: November 30, 2025  
**Purpose**: Document correct n8n workflow JSON structure to prevent "propertyValues[itemName] is not iterable" errors  
**Status**: Analysis Only - No Workflow Changes

---

## 🔍 Error: "propertyValues[itemName] is not iterable"

This error occurs when n8n tries to import a workflow JSON and encounters a parameter structure that expects an array but receives a non-iterable value (or vice versa).

---

## 📋 Core Workflow JSON Structure

### **Required Root-Level Fields**

```json
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {...},
  "staticData": {},
  "meta": {},
  "pinData": {},
  "active": false
}
```

**Critical**: These are the ONLY fields allowed at root level for importable workflows:
- ✅ `name` (string)
- ✅ `nodes` (array)
- ✅ `connections` (object)
- ✅ `settings` (object)
- ✅ `staticData` (object or null)
- ✅ `meta` (object or null)
- ✅ `pinData` (object)
- ✅ `active` (boolean)

**NOT allowed at root level** (causes import errors):
- ❌ `id` (workflow ID - auto-generated)
- ❌ `createdAt` (auto-generated)
- ❌ `updatedAt` (auto-generated)
- ❌ `versionId` (auto-generated)
- ❌ `versionCounter` (auto-generated)
- ❌ `triggerCount` (auto-generated)
- ❌ `tags` (array - should be in settings or meta)
- ❌ `description` (should be in settings)
- ❌ `isArchived` (auto-managed)

---

## 🎯 Node Structure

### **Required Node Fields**

```json
{
  "id": "unique-node-id",
  "name": "Node Name",
  "type": "n8n-nodes-base.nodeType",
  "typeVersion": 1,
  "position": [x, y],
  "parameters": {...},
  "disabled": false
}
```

**Required**:
- ✅ `id` (string, unique)
- ✅ `name` (string)
- ✅ `type` (string, full node type)
- ✅ `typeVersion` (number)
- ✅ `position` (array of 2 numbers: [x, y])
- ✅ `parameters` (object - node-specific)
- ✅ `disabled` (boolean)

**Optional**:
- `credentials` (object)
- `notes` (string)
- `continueOnFail` (boolean)
- `retryOnFail` (boolean)
- `maxTries` (number)
- `waitBetweenTries` (number)
- `onError` (string - "stopWorkflow" | "continueRegularOutput" | "continueErrorOutput")
- `webhookId` (string - for webhook nodes only)

---

## 🔧 IF Node Structure (Common Error Source)

### **Correct IF Node Structure**

```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "condition-id",
          "leftValue": "={{ $json.field }}",
          "rightValue": "value",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    },
    "options": {}
  }
}
```

**Critical Points**:
1. ✅ `conditions.conditions` must be an **array** (even with one condition)
2. ✅ `conditions.options` is an **object** (not array)
3. ✅ Each condition must have `id`, `leftValue`, `rightValue`, `operator`
4. ✅ `operator` must be an **object** with `type` and `operation`
5. ✅ `parameters.options` must be an **object** (can be empty `{}`)

**Common Mistakes**:
- ❌ `conditions.conditions` as object instead of array
- ❌ `conditions.options` as array instead of object
- ❌ Missing `id` in condition
- ❌ `operator` as string instead of object
- ❌ `leftValue: ""` in `options` (should be in condition, not options)

---

## 🌐 HTTP Request Node Structure

### **Correct HTTP Request Node Structure**

```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/endpoint",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "={{ 'Bearer ' + $env.API_KEY }}"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ { key: $json.value } }}",
    "options": {}
  }
}
```

**Critical Points**:
1. ✅ `headerParameters.parameters` must be an **array**
2. ✅ `bodyParameters.parameters` (if used) must be an **array**
3. ✅ `jsonBody` is a **string** (expression), not an object
4. ✅ `options` must be an **object** (can be empty `{}`)

**Common Mistakes**:
- ❌ `headerParameters` as array instead of `{ parameters: [...] }`
- ❌ `jsonBody` as object instead of string expression
- ❌ Missing `options: {}` object
- ❌ `queryParameters` in `options` (should be in URL or `queryParameters.parameters` array)

---

## 📅 Schedule Trigger Node Structure

### **Correct Schedule Trigger Structure**

```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "minute",
          "operation": "everyXMinutes",
          "value": 15
        }
      ]
    }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1
}
```

**Critical Points**:
1. ✅ `rule.interval` must be an **array** (even with one rule)
2. ✅ Each interval rule must have `field`, `operation`, `value`
3. ✅ `typeVersion: 1` (not 1.2 or 1.3 for basic schedule)

**Common Mistakes**:
- ❌ `rule.interval` as object instead of array
- ❌ `field: "minutes"` instead of `"minute"`
- ❌ `minutesInterval: 15` instead of `operation: "everyXMinutes", value: 15`

---

## 🔀 Merge Node Structure

### **Correct Merge Node Structure**

```json
{
  "parameters": {
    "mode": "combine",
    "combinationMode": "mergeByIndex"
  },
  "type": "n8n-nodes-base.merge",
  "typeVersion": 2.1
}
```

**Critical Points**:
1. ✅ `mode` must be valid: "combine" | "multiplex" | "append"
2. ✅ `combinationMode` required when `mode: "combine"`
3. ✅ Valid `combinationMode`: "mergeByIndex" | "mergeByKey" | "multiplex"

---

## 💻 Code Node Structure

### **Correct Code Node Structure**

```json
{
  "parameters": {
    "jsCode": "// Code here\nreturn items.map(item => ({ json: item.json }));"
  },
  "type": "n8n-nodes-base.code",
  "typeVersion": 2
}
```

**Critical Points**:
1. ✅ Code must **return an array** of items
2. ✅ Each item must have `{ json: {...} }` structure
3. ✅ Can also return `{ json: {...}, binary: {...} }` for binary data

**Common Mistakes**:
- ❌ Returning single object instead of array: `{ json: {...} }` ❌
- ✅ Must return: `[{ json: {...} }]` ✅
- ❌ Returning primitive values directly

---

## 🔗 Connections Structure

### **Correct Connections Structure**

```json
{
  "connections": {
    "Source Node Name": {
      "main": [
        [
          {
            "node": "Target Node Name",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Critical Points**:
1. ✅ Keys are **node names** (not IDs)
2. ✅ `main` is an **array of arrays**
3. ✅ Inner array contains connection objects
4. ✅ Each connection has `node` (name), `type` ("main"), `index` (number)

**Multiple Outputs**:
```json
{
  "connections": {
    "IF Node": {
      "main": [
        [
          {"node": "True Path", "type": "main", "index": 0},
          {"node": "False Path", "type": "main", "index": 1}
        ]
      ]
    }
  }
}
```

---

## ⚙️ Settings Structure

### **Correct Settings Structure**

```json
{
  "settings": {
    "executionOrder": "v1",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": true
  }
}
```

**Common Settings**:
- `executionOrder`: "v0" | "v1"
- `callerPolicy`: "workflowsFromSameOwner" | "anyone"
- `availableInMCP`: boolean
- `saveDataErrorExecution`: "all" | "none"
- `saveDataSuccessExecution`: "all" | "none"
- `saveManualExecutions`: boolean
- `saveExecutionProgress`: boolean
- `executionTimeout`: number
- `errorWorkflow`: string (workflow ID)

---

## 🚨 Common Causes of "propertyValues[itemName] is not iterable"

### **1. IF Node - conditions.conditions Not Array**

**Wrong**:
```json
{
  "parameters": {
    "conditions": {
      "conditions": {  // ❌ Object instead of array
        "id": "condition-1",
        "leftValue": "={{ $json.field }}",
        "rightValue": "value"
      }
    }
  }
}
```

**Correct**:
```json
{
  "parameters": {
    "conditions": {
      "conditions": [  // ✅ Array
        {
          "id": "condition-1",
          "leftValue": "={{ $json.field }}",
          "rightValue": "value",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ]
    }
  }
}
```

### **2. HTTP Request - headerParameters Not Properly Structured**

**Wrong**:
```json
{
  "parameters": {
    "headerParameters": [  // ❌ Array directly
      {"name": "Authorization", "value": "Bearer token"}
    ]
  }
}
```

**Correct**:
```json
{
  "parameters": {
    "headerParameters": {  // ✅ Object with parameters array
      "parameters": [
        {"name": "Authorization", "value": "Bearer token"}
      ]
    }
  }
}
```

### **3. Schedule Trigger - interval Not Array**

**Wrong**:
```json
{
  "parameters": {
    "rule": {
      "interval": {  // ❌ Object instead of array
        "field": "minute",
        "operation": "everyXMinutes",
        "value": 15
      }
    }
  }
}
```

**Correct**:
```json
{
  "parameters": {
    "rule": {
      "interval": [  // ✅ Array
        {
          "field": "minute",
          "operation": "everyXMinutes",
          "value": 15
        }
      ]
    }
  }
}
```

### **4. Code Node - Returning Wrong Structure**

**Wrong**:
```json
{
  "parameters": {
    "jsCode": "return { json: { value: 1 } };  // ❌ Single object"
  }
}
```

**Correct**:
```json
{
  "parameters": {
    "jsCode": "return [{ json: { value: 1 } }];  // ✅ Array of items"
  }
}
```

### **5. Missing Required Object Wrappers**

**Wrong**:
```json
{
  "parameters": {
    "options": []  // ❌ Array instead of object
  }
}
```

**Correct**:
```json
{
  "parameters": {
    "options": {}  // ✅ Object (can be empty)
  }
}
```

---

## ✅ Validation Checklist

Before importing a workflow JSON, verify:

1. ✅ Root level has ONLY: `name`, `nodes`, `connections`, `settings`, `staticData`, `meta`, `pinData`, `active`
2. ✅ All nodes have: `id`, `name`, `type`, `typeVersion`, `position`, `parameters`, `disabled`
3. ✅ IF nodes: `conditions.conditions` is array, `conditions.options` is object
4. ✅ HTTP Request nodes: `headerParameters.parameters` is array, `options` is object
5. ✅ Schedule Trigger: `rule.interval` is array
6. ✅ Code nodes: Return array of items
7. ✅ Connections: Keys are node names, structure is `{ "NodeName": { "main": [[{...}]] } }`
8. ✅ All `options` fields are objects `{}`, not arrays `[]`
9. ✅ All parameter arrays (like `headerParameters.parameters`) are properly wrapped in objects
10. ✅ No root-level fields like `id`, `createdAt`, `updatedAt`, `versionId`, `triggerCount`, `tags`

---

## 📚 Reference: Working Examples

### **Working IF Node** (from INT-SYNC-004):
```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "condition-id",
          "leftValue": "={{ $json.field }}",
          "rightValue": "value",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    },
    "options": {}
  }
}
```

### **Working HTTP Request** (from INT-SYNC-004):
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.example.com",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "field",
          "value": "={{ $json.value }}"
        }
      ]
    },
    "options": {}
  }
}
```

### **Working Schedule Trigger** (from INT-SYNC-007):
```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "minute",
          "operation": "everyXMinutes",
          "value": 15
        }
      ]
    }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1
}
```

---

## 🎯 Key Takeaways

1. **Arrays vs Objects**: Know which parameters expect arrays vs objects
   - `conditions.conditions` = array
   - `conditions.options` = object
   - `headerParameters.parameters` = array
   - `rule.interval` = array
   - `options` = object (always)

2. **Nested Structures**: Many parameters require nested objects wrapping arrays
   - `headerParameters: { parameters: [...] }`
   - `conditions: { options: {...}, conditions: [...] }`

3. **Code Node Returns**: Always return array of items, never single object

4. **Root Level**: Only include importable fields, exclude auto-generated fields

5. **Type Versions**: Use correct `typeVersion` for each node type

---

**Last Updated**: November 30, 2025  
**Status**: Analysis Complete - Structure Documented
