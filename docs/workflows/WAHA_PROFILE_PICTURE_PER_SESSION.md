# 📷 WAHA Profile Picture Per Session Guide

**Date**: November 2025  
**Status**: ✅ **Per-Session Profile Pictures Supported**

---

## 🎯 **OVERVIEW**

**Yes, you can set a different profile picture for each WAHA session!**

Each WAHA session is independent and can have its own profile picture. This is useful when you have multiple WhatsApp accounts or different use cases per session.

---

## 📋 **CURRENT SESSIONS**

| Session | Status | Purpose | Profile Picture |
|---------|--------|---------|----------------|
| `default` | WORKING | Dima's Donna AI | ✅ Rensto logo |
| `rensto-support` | WORKING | Rensto Support Agent | ⚠️ Not set |

---

## 🔧 **HOW TO SET PROFILE PICTURE PER SESSION**

### **Method 1: Using the Script (Recommended)**

**Update `default` session:**
```bash
./scripts/waha-serve-image-and-update.sh "assets/images/rensto logo.png" default
```

**Update `rensto-support` session:**
```bash
./scripts/waha-serve-image-and-update.sh "assets/images/rensto logo.png" rensto-support
```

**Or just use default session (if no session specified):**
```bash
./scripts/waha-serve-image-and-update.sh "assets/images/rensto logo.png"
```

---

### **Method 2: Direct API Call**

**Update Profile Picture for Specific Session:**
```bash
curl -X PUT \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{"file":{"url":"http://173.254.201.134:8080/rensto-profile-picture.png"}}' \
  http://173.254.201.134:3000/api/{SESSION_NAME}/profile/picture
```

**Examples:**
- For `default` session: `.../api/default/profile/picture`
- For `rensto-support` session: `.../api/rensto-support/profile/picture`

---

## 📊 **API ENDPOINT STRUCTURE**

**Endpoint Pattern**: `PUT /api/{SESSION}/profile/picture`

The `{SESSION}` placeholder means:
- ✅ Each session has its own profile picture
- ✅ Changing one session's picture doesn't affect others
- ✅ You can use different images for different sessions

---

## 🎯 **USE CASES**

### **Different Branding Per Session**
- `default`: Customer-specific logo (e.g., Novok logo)
- `rensto-support`: Rensto logo
- `customer-support`: Customer's logo

### **Different Departments**
- `sales`: Sales team logo
- `support`: Support team logo
- `marketing`: Marketing team logo

### **Different Projects**
- `project-alpha`: Project Alpha branding
- `project-beta`: Project Beta branding

---

## ✅ **VERIFICATION**

**Check All Sessions:**
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://173.254.201.134:3000/api/sessions | python3 -m json.tool
```

**Check Specific Session:**
```bash
curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://173.254.201.134:3000/api/sessions/{SESSION_NAME} | python3 -m json.tool
```

---

## 🔍 **IMPORTANT NOTES**

1. **Session Must Be WORKING**: Profile picture can only be updated when session status is `WORKING`
2. **WhatsApp Sync**: Changes may take 10-30 seconds to appear in WhatsApp
3. **Image Requirements**: 
   - Square images (1:1 aspect ratio) recommended
   - Max 5MB file size
   - JPEG or PNG format
4. **Image URL**: Must be publicly accessible (HTTP/HTTPS)

---

## 📝 **EXAMPLES**

### **Set Rensto Logo for Both Sessions**

```bash
# Set for default session
./scripts/waha-serve-image-and-update.sh "assets/images/rensto logo.png" default

# Set for rensto-support session
./scripts/waha-serve-image-and-update.sh "assets/images/rensto logo.png" rensto-support
```

### **Set Different Logos Per Session**

```bash
# Default session: Rensto logo
./scripts/waha-serve-image-and-update.sh "assets/images/rensto logo.png" default

# Rensto-support session: Different logo
./scripts/waha-serve-image-and-update.sh "assets/images/other-logo.png" rensto-support
```

---

**Last Updated**: November 2025  
**Status**: ✅ **Per-Session Profile Pictures Fully Supported**

