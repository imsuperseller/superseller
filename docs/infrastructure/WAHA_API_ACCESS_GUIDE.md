# WAHA API Access Guide - Browser vs API Key

**Date**: November 12, 2025  
**Issue**: 401 Unauthorized when accessing via browser  
**Solution**: Use API key header or dashboard

---

## 🚨 **THE PROBLEM**

**Browser Access** (Direct URL):
```
http://173.254.201.134:3000/api/sessions
```
**Result**: `{"message":"Unauthorized","statusCode":401}`

**Why**: Browsers don't send custom headers like `x-api-key` automatically.

---

## ✅ **SOLUTIONS**

### **Option 1: Use curl (Recommended for Setup)**

**Get QR Code**:
```bash
curl -X POST "http://173.254.201.134:3000/api/sessions/create" \
     -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8"
```

**Check Sessions**:
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://173.254.201.134:3000/api/sessions
```

**Get QR Code Image URL**:
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://173.254.201.134:3000/api/sessions/default/qr
```

---

### **Option 2: Use Browser Extension**

**Install Header Modifier Extension**:
- Chrome: "ModHeader" or "Requestly"
- Firefox: "Modify Headers"

**Configure**:
- Header Name: `x-api-key`
- Header Value: `4fc7e008d7d24fc995475029effc8fa8`
- Enable for: `173.254.201.134:3000`

**Then Access**:
```
http://173.254.201.134:3000/api/sessions
```

---

### **Option 3: Use Dashboard (If Available)**

**Try Dashboard URL**:
```
http://173.254.201.134:3000/dashboard
```

**Login**:
- Username: `admin`
- Password: `admin123`

**Then navigate to Sessions** from the dashboard.

---

### **Option 4: Use n8n Workflow**

**Create Simple Workflow**:
1. **Manual Trigger**
2. **HTTP Request Node**:
   - Method: `POST`
   - URL: `http://173.254.201.134:3000/api/sessions/create`
   - Headers:
     - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
3. **Code Node** (to extract QR):
   ```javascript
   const qrUrl = $json.qr;
   return { json: { qrUrl: qrUrl } };
   ```
4. **Open URL Node**: Opens QR code in browser

---

## 🔍 **VERIFY API IS WORKING**

**Test with curl** (should work):
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://173.254.201.134:3000/api/server/status
```

**Expected Response**:
```json
{
  "startTimestamp": 1763101365305,
  "uptime": 96601,
  "worker": {"id": ""}
}
```

---

## 📱 **GET QR CODE FOR WHATSAPP**

**Method 1: Via curl (Get QR Image URL)**
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://173.254.201.134:3000/api/sessions/default/qr
```

**Method 2: Create Session First**
```bash
# Create session
curl -X POST "http://173.254.201.134:3000/api/sessions/create" \
     -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8"

# Get QR code
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://173.254.201.134:3000/api/sessions/default/qr
```

**Then open the QR image URL in browser** (no auth needed for image).

---

## 🎯 **QUICK SETUP SCRIPT**

**Run this on your Mac**:
```bash
#!/bin/bash
API_KEY="4fc7e008d7d24fc995475029effc8fa8"
VPS_IP="173.254.201.134"

# Create session
echo "Creating session..."
SESSION_RESPONSE=$(curl -s -X POST "http://${VPS_IP}:3000/api/sessions/create" \
     -H "x-api-key: ${API_KEY}")

echo "Session created: $SESSION_RESPONSE"

# Get QR code URL
echo "Getting QR code..."
QR_URL=$(curl -s -H "x-api-key: ${API_KEY}" \
     "http://${VPS_IP}:3000/api/sessions/default/qr")

echo "QR Code URL: $QR_URL"
echo ""
echo "Open this URL in your browser to scan QR code:"
echo "$QR_URL"
```

---

## ✅ **CONFIRMED WORKING**

**API Key**: ✅ Correct (`4fc7e008d7d24fc995475029effc8fa8`)  
**API Endpoints**: ✅ Working (with header)  
**Container**: ✅ Running  
**Engine**: ✅ NOWEB  

**The API works perfectly** - you just need to include the `x-api-key` header!

---

## 💡 **RECOMMENDATION**

**For Initial Setup**: Use curl commands (Option 1)  
**For Ongoing Use**: Use n8n workflows (Option 4)  
**For Quick Checks**: Use browser extension (Option 2)

---

**Next Step**: Run the curl command to get the QR code URL, then scan it with WhatsApp!

