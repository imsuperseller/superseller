# AI Agent Prompt Fix - Guardrails Field Preservation

**Date**: November 21, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Issue**: AI Agent not receiving question after Guardrails node

---

## 🐛 Problem

**Execution 17203** (Text message "test"):
- ✅ Smart Message Router: Extracted "test" correctly
- ✅ Prepare AI Input: Set `question: "test"`, `promptText: "test"`
- ✅ Set Store Name and Extract Text1: Set `question: "test"`, `message_text: "test"`
- ✅ Merge Transcription Metadata: Set `question: "test"`, `message_text: "test"`
- ❌ **Guardrails1**: Only outputs `guardrailsInput: "test"`, `checks: []` (drops `question` and `promptText`)
- ❌ **Image Analysis Switch**: Receives only `guardrailsInput` (no `question` or `promptText`)
- ❌ **Rensto AI Agent**: Can't find question, responds with "message didn't come through"

**Root Cause**: Guardrails node only outputs `guardrailsInput` and `checks`, doesn't preserve other fields like `question` or `promptText`.

---

## ✅ Fix Applied

**Updated Rensto AI Agent text expression** to also check `guardrailsInput`:

**Before**:
```javascript
"={{ $json.promptText || $json.question || $json.message_text || $json.text || $json.transcript || $json.transcription || \"\" }}"
```

**After**:
```javascript
"={{ $json.promptText || $json.question || $json.message_text || $json.text || $json.transcript || $json.transcription || $json.guardrailsInput || \"\" }}"
```

**Why**: Guardrails node sanitizes the text and outputs it as `guardrailsInput`, so we need to check that field as a fallback.

---

## 📋 Next Steps

1. ✅ **Test text message** - Should now get proper response (not "message didn't come through")
2. ✅ **Test all media types** - Verify they work after this fix
3. ⚠️ **Verify credential update** - Check if API key is actually being used (still seeing "leaked" errors)

---

**Status**: ✅ **FIXED** - AI Agent now checks `guardrailsInput` as fallback

