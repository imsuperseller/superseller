# Google Gemini API Key Leaked - Fix Required

**Date**: November 21, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Issue**: API key flagged as leaked by Google

---

## 🚨 **CRITICAL ISSUE**

**Error Message**:
```
"Your API key was reported as leaked. Please use another API key."
Status: PERMISSION_DENIED (403)
```

**Root Cause**: 
- Google has flagged the API key as leaked/compromised
- The key has been disabled for security reasons
- Connection test in n8n may pass, but actual API calls fail

**Credential Details**:
- **ID**: `6UgFlgar0aCiXKdm`
- **Name**: "Google Gemini(PaLM) Api superseller"
- **Used By**: 
  - Analyze video
  - Analyze audio
  - Analyze document
  - Download a video

---

## ✅ **FIX REQUIRED**

### **Step 1: Generate New API Key**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the new API key

### **Step 2: Update Credential in n8n**
1. Go to n8n: http://173.254.201.134:5678
2. Navigate to: **Credentials** → **Google Gemini(PaLM) Api superseller**
3. Click **Edit**
4. Paste the new API key
5. Click **Test Connection** (should pass)
6. Click **Save**

### **Step 3: Test Workflow**
1. Send a test video message
2. Verify "Analyze video" node succeeds
3. Test other media types (audio, document, image)

---

## ⚠️ **SECURITY NOTES**

1. **Why was the key leaked?**
   - API key may have been committed to a public repository
   - API key may have been shared in logs or error messages
   - API key may have been exposed in screenshots or documentation

2. **Prevention**:
   - Never commit API keys to version control
   - Use environment variables or secure credential storage
   - Rotate keys regularly
   - Monitor API usage for suspicious activity

3. **Impact**:
   - All nodes using this credential will fail
   - Video/audio/document analysis will not work
   - Workflow will error on media processing

---

## 📋 **NEXT STEPS**

1. ✅ **Generate new API key** in Google AI Studio
2. ✅ **Update credential** in n8n with new key
3. ✅ **Test connection** in n8n
4. ✅ **Test workflow** with video/audio/document messages
5. ✅ **Verify all media types** work correctly

---

**Status**: ⚠️ **BLOCKING** - Workflow cannot process media until credential is updated

