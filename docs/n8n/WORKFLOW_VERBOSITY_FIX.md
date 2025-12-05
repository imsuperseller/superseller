# Fix: Verbosity Setting for gpt-4o-mini

**Error**: `Unsupported value: 'low' is not supported with the 'gpt-4o-mini' model. Supported values are: 'medium'.`

**Root Cause**: `gpt-4o-mini` only supports `'medium'` verbosity, not `'low'`.

---

## 🔴 CRITICAL FIX NEEDED

### **Node**: "OpenAI Chat Model"

**Location**: Advanced Options → Response Format → Verbosity

**Current (WRONG)**:
```
Response Format: Text
  Type: Text
  Verbosity: Low  ❌
```

**Fixed (CORRECT)**:
```
Response Format: Text
  Type: Text
  Verbosity: Medium  ✅
```

---

## 📋 Step-by-Step Fix Instructions

1. **Open the workflow** in n8n: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`

2. **Click on the "OpenAI Chat Model" node**

3. **Click "Options" or expand "Advanced Options"**

4. **Find "Response Format" section**

5. **Under "Text Options", find "Verbosity"**

6. **Change from `Low` to `Medium`**

7. **Save the workflow**

---

## 🎯 Visual Guide

**What to look for**:

```
OpenAI Chat Model Node
┌─────────────────────────────────────────┐
│ Options / Advanced Options              │
│                                          │
│ Response Format:                        │
│   Type: [Text ▼]                        │
│   Text Options:                         │
│     Verbosity: [Low ▼]  ❌ WRONG        │
│                                          │
│ Change to:                              │
│     Verbosity: [Medium ▼]  ✅ CORRECT   │
└─────────────────────────────────────────┘
```

---

## 📝 Model-Specific Verbosity Support

| Model | Supported Verbosity Levels |
|-------|---------------------------|
| `gpt-4o-mini` | ✅ `medium` only |
| `gpt-4o` | ✅ `low`, `medium`, `high` |
| `gpt-4.1-mini` | ✅ `low`, `medium`, `high` |
| `o1` / `o3` | ✅ `low`, `medium`, `high` |

**Note**: If you want `low` verbosity, you would need to switch to `gpt-4o` or another model that supports it. However, `medium` verbosity with `gpt-4o-mini` is still concise enough for automated sync operations.

---

## ✅ After Fix

The workflow should work correctly with `medium` verbosity. The responses will be slightly more detailed than `low`, but still concise and suitable for automated operations.

---

**Last Updated**: November 30, 2025
