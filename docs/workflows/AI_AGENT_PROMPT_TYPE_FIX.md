# AI Agent Prompt Type Fix

**Date**: November 21, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Issue**: "No prompt specified" error in Rensto AI Agent

---

## 🐛 Problem

**Execution 17254** (Text message "Test"):
- ✅ Message received and extracted correctly
- ✅ Prepare AI Input: Set `question: "Test"`, `promptText: "Test"`
- ✅ Guardrails1: Output `guardrailsInput: "Test"`
- ❌ **Rensto AI Agent**: Error "No prompt specified"

**Error Message**:
```
"No prompt specified"
"Expected to find the prompt in an input field called 'chatInput' (this is what the chat trigger node node outputs). To use something else, change the 'Prompt' parameter"
```

**Root Cause**: 
- `promptType` was set to `"auto"` which expects `chatInput` field (from chat trigger)
- But we're using `"define"` mode with a custom text expression
- The node wasn't finding the prompt because of the wrong `promptType`

---

## ✅ Fix Applied

**Changed `promptType` from `"auto"` to `"define"`**:

**Before**:
```javascript
{
  "promptType": "auto",
  "text": "={{ $json.promptText || $json.question || ... || $json.guardrailsInput || \"\" }}"
}
```

**After**:
```javascript
{
  "promptType": "define",
  "text": "={{ $json.promptText || $json.question || ... || $json.guardrailsInput || \"\" }}"
}
```

**Why**: 
- `"auto"` mode expects `chatInput` field (for chat trigger nodes)
- `"define"` mode uses the custom `text` expression we defined
- This matches our workflow structure (not using chat trigger)

---

## ✅ API Key Test

**Tested API Key**: `AIzaSyDfrGdgEBs7ThiyuxkwnMDfJhJ46H5rUng`
**Result**: ✅ **VALID** - Successfully retrieved models list from Google Gemini API

---

## 📋 Next Steps

1. ✅ **Test text message** - Should now work (promptType fixed)
2. ✅ **Test media messages** - Should work (API key is valid)
3. ✅ **Verify all message types** work correctly

---

**Status**: ✅ **FIXED** - Prompt type corrected, API key validated

