# Google Gemini Credentials Issue Analysis

**Date**: November 21, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Issue**: "Analyze video" node failing with "Forbidden - perhaps check your credentials?"

---

## 🐛 Problem

**Execution 17051 & 17050** (Video Message):
- ✅ WAHA Trigger: Success
- ✅ Smart Message Router: Success (detected video with caption "Can u see")
- ✅ Message Type Router: Success (routed to video path)
- ✅ Guardrails: Video Size: Success
- ✅ Download a video: Success (downloaded 3.4MB video)
- ❌ **Analyze video**: **ERROR** - "Forbidden - perhaps check your credentials?"

**Credential Details**:
- **Type**: Google Gemini(PaLM) Api
- **ID**: `6UgFlgar0aCiXKdm`
- **Name**: "Google Gemini(PaLM) Api superseller"
- **Used By**: 
  - Analyze video
  - Analyze audio
  - Analyze document
  - Download a video

---

## 🔍 Possible Causes

1. **Invalid API Key**: Credential may have expired or been revoked
2. **Insufficient Permissions**: API key may not have video analysis permissions
3. **Rate Limiting**: API quota may be exceeded
4. **Model Access**: `models/gemini-2.5-pro` may require different permissions
5. **Credential Format**: Credential may be incorrectly configured in n8n

---

## ✅ Next Steps

1. **Verify Credential**: Check if credential `6UgFlgar0aCiXKdm` is valid in n8n
2. **Test API Key**: Test Google Gemini API key directly
3. **Check Permissions**: Verify API key has video analysis permissions
4. **Update Credential**: If invalid, update with new API key
5. **Test After Fix**: Test video analysis after credential update

---

**Status**: ⚠️ **NEEDS INVESTIGATION** - Credentials need verification

