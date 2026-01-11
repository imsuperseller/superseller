# WAHA NOWEB - QR Code Setup Instructions

**Date**: November 12, 2025  
**Status**: ✅ **CONTAINER RUNNING** - Ready for QR scan

---

## 🎯 **CURRENT STATUS**

✅ **WAHA NOWEB Container**: Running  
✅ **Engine**: NOWEB (no browser needed)  
✅ **Port**: 3000  
✅ **API Key**: `4fc7e008d7d24fc995475029effc8fa8`  
✅ **Auto-Restart**: Enabled  

---

## 📱 **ONE-TIME SETUP (Scan QR Code)**

### **Step 1: Create Session & Get QR Code**

**Option A: Via Browser** (Easiest)
```
http://172.245.56.50:3000/api/sessions
```
- Enter API key: `4fc7e008d7d24fc995475029effc8fa8`
- Click "Create Session" or "Get QR"

**Option B: Via API**
```bash
curl -X POST "http://172.245.56.50:3000/api/sessions/create" \
     -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8"
```

**Option C: Via n8n Workflow**
- Use WAHA node: "Create Session"
- Base URL: `http://172.245.56.50:3000`
- API Key: `4fc7e008d7d24fc995475029effc8fa8`

---

### **Step 2: Scan QR Code with WhatsApp**

1. **Open WhatsApp** on your phone
2. **Go to**: Settings → Linked Devices → Link a Device
3. **Scan the QR code** shown on screen
4. **Wait for confirmation** (usually 5-10 seconds)

---

### **Step 3: Verify Connection**

```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://172.245.56.50:3000/api/sessions
```

**Expected Response** (after scanning):
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

## ✅ **AFTER SETUP**

**You're Done!** 

- ✅ Your phone can be offline (not needed)
- ✅ Your laptop can be offline (not needed)
- ✅ WAHA runs 24/7 on VPS independently
- ✅ n8n workflows will work automatically

---

## 🔧 **TROUBLESHOOTING**

**If QR Code Doesn't Appear**:
```bash
# Check container logs
docker logs waha-noweb --tail 50

# Restart container
cd /opt/waha
docker-compose restart
```

**If Connection Drops**:
- NOWEB engine auto-reconnects
- Check logs: `docker logs waha-noweb --tail 50`
- Verify session: `curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" http://172.245.56.50:3000/api/sessions`

**If Session Expires**:
- Just scan QR code again (one-time)
- Session persists in `/opt/waha/sessions`

---

## 📊 **VERIFICATION COMMANDS**

**Check Container Status**:
```bash
docker ps | grep waha-noweb
```

**Check Logs**:
```bash
docker logs waha-noweb --tail 30
```

**Check API Status**:
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://172.245.56.50:3000/api/server/status
```

**Check Sessions**:
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://172.245.56.50:3000/api/sessions
```

---

## 🎉 **BENEFITS**

**Before (WEBJS)**:
- ❌ Required browser/PC open
- ❌ "Browser disconnected" errors
- ❌ Unreliable

**After (NOWEB)**:
- ✅ Runs independently on VPS
- ✅ No browser/PC needed
- ✅ 24/7 operation
- ✅ Auto-reconnects if connection drops

---

**Next Step**: Scan QR code once, then you're done! 🚀

