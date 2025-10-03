# 🔗 **QUICKBOOKS OAUTH2 SETUP FOR RENSTO N8N**

## ✅ **STATUS: READY FOR CONFIGURATION**

The n8n OAuth2 callback URL is now publicly accessible and ready for QuickBooks integration.

## 🌐 **PUBLIC OAUTH2 CALLBACK URL**

### **Primary URL:**
```
https://mr-lost-suited-athens.trycloudflare.com/rest/oauth2-credential/callback
```

### **Backup URL (if needed):**
```
https://n8n-oauth2.rensto.com/rest/oauth2-credential/callback
```

## 🔧 **QUICKBOOKS DEVELOPER CONSOLE SETUP**

### **Step 1: Access QuickBooks Developer Console**
1. Go to: https://developer.intuit.com/
2. Sign in with your QuickBooks account
3. Navigate to **My Apps** → **Create New App**

### **Step 2: Configure OAuth2 Settings**
1. **App Name:** `Rensto n8n Integration`
2. **App Type:** Choose **OAuth 2.0** or **OAuth 2.0 + OpenID Connect**
3. **Environment:** Select **Production** or **Sandbox** as needed

### **Step 3: Set OAuth2 Redirect URIs**
Add the following redirect URI to your QuickBooks app:
```
https://mr-lost-suited-athens.trycloudflare.com/rest/oauth2-credential/callback
```

### **Step 4: Configure Scopes**
Select the following scopes based on your needs:
- `com.intuit.quickbooks.accounting` - For accounting data
- `com.intuit.quickbooks.payment` - For payment processing
- `com.intuit.quickbooks.payroll` - For payroll (if needed)
- `com.intuit.quickbooks.employee` - For employee data (if needed)

### **Step 5: Get Credentials**
After creating the app, you'll receive:
- **Client ID** (Consumer Key)
- **Client Secret** (Consumer Secret)
- **Realm ID** (Company ID)

## 🔐 **N8N CREDENTIALS CONFIGURATION**

### **Step 1: Access n8n Credentials**
1. Go to: https://173.254.201.134:5678
2. Navigate to **Settings** → **Credentials**
3. Click **Add Credential**

### **Step 2: Configure QuickBooks OAuth2**
1. **Credential Type:** Select **QuickBooks OAuth2 API**
2. **Credential Name:** `Rensto QuickBooks`
3. **Client ID:** Enter your QuickBooks Client ID
4. **Client Secret:** Enter your QuickBooks Client Secret
5. **Environment:** Select **Production** or **Sandbox**
6. **Realm ID:** Enter your QuickBooks Realm ID

### **Step 3: Authorize Connection**
1. Click **Save**
2. Click **Authorize**
3. You'll be redirected to QuickBooks for authentication
4. After successful authentication, you'll be redirected back to n8n

## 🔄 **WORKFLOW INTEGRATION**

### **Available QuickBooks Nodes:**
1. **QuickBooks Trigger** - Listen for QuickBooks events
2. **QuickBooks** - Perform QuickBooks operations
3. **QuickBooks OAuth2 API** - Direct API calls

### **Common Use Cases:**
1. **Invoice Automation** - Create invoices from external data
2. **Payment Processing** - Handle payments and sync with QuickBooks
3. **Customer Sync** - Sync customer data between systems
4. **Financial Reporting** - Generate reports from QuickBooks data

## 🛠️ **TROUBLESHOOTING**

### **OAuth2 Callback Issues:**
- **Error:** "Insufficient parameters for OAuth2 callback"
  - **Solution:** Ensure the redirect URI is exactly: `https://mr-lost-suited-athens.trycloudflare.com/rest/oauth2-credential/callback`

### **Tunnel Issues:**
- **If tunnel URL changes:** Check the service logs:
  ```bash
  sshpass -p "05ngBiq2pTA8XSF76x" ssh root@173.254.201.134 "journalctl -u cloudflared-n8n-oauth2.service -f"
  ```

### **Service Management:**
```bash
# Check service status
sshpass -p "05ngBiq2pTA8XSF76x" ssh root@173.254.201.134 "systemctl status cloudflared-n8n-oauth2.service"

# Restart service
sshpass -p "05ngBiq2pTA8XSF76x" ssh root@173.254.201.134 "systemctl restart cloudflared-n8n-oauth2.service"

# View logs
sshpass -p "05ngBiq2pTA8XSF76x" ssh root@173.254.201.134 "journalctl -u cloudflared-n8n-oauth2.service -n 50"
```

## 📊 **MONITORING**

### **Tunnel Status:**
- **Service:** `cloudflared-n8n-oauth2.service`
- **Status:** Active and running
- **URL:** https://mr-lost-suited-athens.trycloudflare.com
- **Backend:** http://localhost:5678 (n8n)

### **Health Check:**
```bash
curl -I "https://mr-lost-suited-athens.trycloudflare.com/rest/oauth2-credential/callback"
```

## 🔗 **RESOURCES**

- **n8n Instance:** https://173.254.201.134:5678
- **QuickBooks Developer Console:** https://developer.intuit.com/
- **QuickBooks API Documentation:** https://developer.intuit.com/app/developer/qbo/docs/api/
- **n8n QuickBooks Nodes:** https://docs.n8n.io/integrations/builtin/clients/quickbooks/

## ✅ **NEXT STEPS**

1. **Configure QuickBooks App** with the provided OAuth2 callback URL
2. **Set up n8n Credentials** with your QuickBooks app credentials
3. **Test the Connection** by creating a simple QuickBooks workflow
4. **Build Integration Workflows** based on your business needs

---

**The OAuth2 callback URL is ready and the tunnel is active. You can now proceed with QuickBooks integration!** 🚀
