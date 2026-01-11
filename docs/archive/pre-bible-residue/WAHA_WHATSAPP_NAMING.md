# WAHA WhatsApp Device Naming Guide

**Date**: November 12, 2025  
**Purpose**: What to name the WhatsApp linked device after scanning QR code

---

## 🎯 **RECOMMENDED NAME**

**Primary Recommendation**:
```
Rensto Automation (VPS)
```

**Alternative Options**:
- `Rensto Server - WAHA`
- `Rensto Business Automation`
- `Rensto VPS - WAHA NOWEB`
- `Rensto Automation Server`

---

## 💡 **WHY THIS NAME?**

**Benefits**:
- ✅ **Clear Purpose**: Indicates it's for automation/business use
- ✅ **Location Identified**: Shows it's on VPS/server (not your personal device)
- ✅ **Easy to Identify**: You'll recognize it in WhatsApp settings
- ✅ **Professional**: Appropriate for business use

---

## 📱 **HOW TO NAME IT**

**After Scanning QR Code**:

1. **WhatsApp will ask**: "Name this device" or "Device name"
2. **Enter**: `Rensto Automation (VPS)`
3. **Click**: "Continue" or "Link Device"

**Note**: Some WhatsApp versions may not prompt for a name immediately. You can rename it later in:
- **Settings** → **Linked Devices** → Tap on the device → **Rename**

---

## 🔍 **VERIFY IT'S LINKED**

**Check in WhatsApp**:
1. Open WhatsApp on your phone
2. Go to **Settings** → **Linked Devices**
3. You should see: `Rensto Automation (VPS)` (or your chosen name)
4. Status should show: **Connected** or **Active**

**Check via API**:
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions
```

Should show:
```json
[
  {
    "name": "default",
    "status": "ready",
    "engine": "NOWEB",
    "connected": true,
    "me": {
      "id": "...",
      "name": "Your Name"
    }
  }
]
```

---

## ⚠️ **IMPORTANT NOTES**

**Device Name vs Session Name**:
- **Device Name** (in WhatsApp): What you see in WhatsApp settings (e.g., "Rensto Automation (VPS)")
- **Session Name** (in WAHA): Technical identifier (e.g., "default")

**Both are different**:
- Device name is for your reference in WhatsApp
- Session name is used in API calls (`/api/default/...`)

---

## 🎉 **AFTER NAMING**

**You're Done!** 

- ✅ Device is linked and named
- ✅ WAHA is running 24/7 on VPS
- ✅ Your phone can be offline
- ✅ Your laptop can be offline
- ✅ n8n workflows can send/receive WhatsApp messages

---

**Recommended Name**: `Rensto Automation (VPS)` 🚀

