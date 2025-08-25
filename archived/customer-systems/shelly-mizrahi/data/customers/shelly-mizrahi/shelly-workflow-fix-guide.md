# 🔧 SHELLY'S N8N WORKFLOW FIX GUIDE

## 🎯 **WORKFLOW STATUS**
- **Workflow ID**: `cvcjOW0zOZVIvO2X`
- **n8n Instance**: `https://shellyins.app.n8n.cloud`
- **Status**: ✅ Deployed but needs manual configuration
- **Issue**: Email node missing SMTP credentials

## ❌ **CURRENT ISSUES**
1. **Email Node Error**: Red border and red 'x' icon on "Email to Shelly" node
2. **Missing SMTP Credentials**: Email node needs SMTP configuration
3. **Node Connections**: May need verification

## 🔧 **MANUAL FIX STEPS**

### **Step 1: Access Your n8n Instance**
1. Go to: https://shellyins.app.n8n.cloud
2. Login with your credentials
3. Navigate to the workflow: "Shelly's Family Profile Document Upload & Email System"

### **Step 2: Fix Email Node Credentials**
1. **Click on the "Email to Shelly" node** (the one with red border)
2. **In the node configuration panel on the right:**
   - Click on "Credentials" dropdown
   - Select "Create New Credential"
   - Choose "SMTP" type

### **Step 3: Configure SMTP Credentials**
**Credential Name**: `Shelly SMTP`
**Configuration**:
- **Host**: `smtp.gmail.com`
- **Port**: `587`
- **Security**: `STARTTLS`
- **Username**: `shellypensia@gmail.com`
- **Password**: `[Your Gmail App Password]`

### **Step 4: Get Gmail App Password**
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Create an "App Password" for "Mail"
4. Use this 16-character password in the SMTP configuration

### **Step 5: Verify Node Connections**
1. **Check each connection line** between nodes:
   - Webhook Trigger → Upload Family Profile ✅
   - Upload Family Profile → Upload Member Profiles ✅
   - Upload Member Profiles → Email to Shelly ✅
   - Email to Shelly → Response to Make.com ✅

2. **If any connections are missing:**
   - Click and drag from the output dot of one node to the input dot of the next node
   - The connection line should turn solid when properly connected

### **Step 6: Test the Workflow**
1. **Click "Execute workflow"** button at the bottom
2. **Check the execution logs** for any errors
3. **Verify email is sent** to shellypensia@gmail.com

## 📋 **WORKFLOW COMPONENTS**

### **Node 1: Webhook Trigger**
- **Path**: `shelly-document-upload`
- **Method**: POST
- **Status**: ✅ Working

### **Node 2: Upload Family Profile**
- **URL**: `https://api.surense.com/documents`
- **Method**: POST
- **Status**: ⚠️ Needs Surense API credentials

### **Node 3: Upload Member Profiles**
- **URL**: `https://api.surense.com/documents/batch`
- **Method**: POST
- **Status**: ⚠️ Needs Surense API credentials

### **Node 4: Email to Shelly** ⚠️ **NEEDS FIX**
- **Recipient**: shellypensia@gmail.com
- **Subject**: "Family Insurance Profile Ready - Ready for Contact"
- **Status**: ❌ Missing SMTP credentials

### **Node 5: Response to Make.com**
- **Response Code**: 200
- **Status**: ✅ Working

## 🔗 **INTEGRATION POINTS**

### **Webhook URL for Make.com**
```
https://shellyins.app.n8n.cloud/webhook/shelly-document-upload
```

### **Expected Input Data**
```json
{
  "main_client_id": "CLIENT123",
  "main_client_name": "Client Name",
  "family_member_count": 3,
  "total_profiles": 4,
  "family_profile": "Family profile content",
  "member_profiles": [
    {"name": "Member 1", "profile": "Profile 1"},
    {"name": "Member 2", "profile": "Profile 2"}
  ]
}
```

## 🎯 **NEXT STEPS AFTER FIX**

1. **Test Email Functionality**
   - Execute workflow manually
   - Verify email is received
   - Check email content and formatting

2. **Configure Surense Integration**
   - Add Surense API credentials to HTTP nodes
   - Test document upload functionality

3. **Connect to Make.com**
   - Import Make.com scenarios
   - Update webhook URL in Make.com
   - Test end-to-end workflow

4. **Production Testing**
   - Test with real family data
   - Verify all integrations work
   - Monitor for any errors

## 📞 **SUPPORT**

If you encounter issues:
1. Check the execution logs in n8n
2. Verify all credentials are properly configured
3. Test each node individually
4. Contact support if needed

---

**Workflow URL**: https://shellyins.app.n8n.cloud/workflow/cvcjOW0zOZVIvO2X
**Created**: 2025-08-22
**Status**: Ready for manual configuration
