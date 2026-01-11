# WAHA Browser Access - Fixed

**Date**: November 12, 2025  
**Issue**: 401 Unauthorized when accessing via browser  
**Solution**: Use script or curl with API key header

---

## 🚨 **THE PROBLEM**

**Direct Browser Access**:
```
http://172.245.56.50:3000/api/sessions
```
**Result**: `{"message":"Unauthorized","statusCode":401}`

**Why**: Browsers don't send the `x-api-key` header automatically.

---

## ✅ **SOLUTION: Use the Script**

**Run this command on your Mac**:
```bash
/Users/shaifriedman/New\ Rensto/rensto/scripts/waha-get-qr.sh
```

**What it does**:
1. ✅ Checks existing sessions
2. ✅ Creates/starts session if needed
3. ✅ Gets QR code from WAHA API
4. ✅ Saves QR code as PNG image: `/tmp/waha-qr-code.png`
5. ✅ Opens QR code automatically (macOS)

**Then**:
1. Scan QR code with WhatsApp
2. Done! Your phone can be offline

---

## 🔧 **MANUAL METHOD (Alternative)**

**Step 1: Start Session**
```bash
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions/default/start
```

**Step 2: Get QR Code**
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/default/auth/qr \
  -o /tmp/waha-qr.png
```

**Step 3: Open QR Code**
```bash
open /tmp/waha-qr.png  # macOS
```

---

## 📱 **AFTER SCANNING QR CODE**

**Verify Connection**:
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions
```

**Expected Response**:
```json
[
  {
    "name": "default",
    "status": "ready",
    "engine": "NOWEB",
    "connected": true
  }
]
```

---

## ✅ **CONFIRMED WORKING**

- ✅ **API Key**: Correct (`4fc7e008d7d24fc995475029effc8fa8`)
- ✅ **API Endpoints**: Working (with header)
- ✅ **QR Code**: Generated successfully
- ✅ **Container**: Running (NOWEB engine)

**The API works perfectly** - you just need to include the `x-api-key` header!

---

## 💡 **QUICK ACCESS**

**Get QR Code** (One Command):
```bash
/Users/shaifriedman/New\ Rensto/rensto/scripts/waha-get-qr.sh
```

**Check Status**:
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions
```

---

**Next Step**: Run the script, scan QR code, done! 🚀

