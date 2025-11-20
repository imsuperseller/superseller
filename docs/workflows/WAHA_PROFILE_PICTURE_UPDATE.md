# 📷 WAHA Profile Picture Update Guide

**Date**: November 17, 2025  
**Status**: ✅ **Scripts Created & Ready**

---

## 🎯 **OVERVIEW**

This guide explains how to update the WhatsApp profile picture for your WAHA session.

**WAHA n8n Node Support**: ❌ **NOT SUPPORTED**  
The `@devlikeapro/n8n-nodes-waha.WAHA` node does **not** have profile picture operations. You must use the API directly.

---

## 🔧 **AVAILABLE METHODS**

### **Method 1: Bash Script** (Recommended)

**Script**: `scripts/waha-update-profile-picture.sh`

**Update Profile Picture**:
```bash
./scripts/waha-update-profile-picture.sh https://example.com/profile-picture.jpg
```

**Delete Profile Picture**:
```bash
./scripts/waha-update-profile-picture.sh --delete
```

**Features**:
- ✅ Validates URL format
- ✅ Shows HTTP status codes
- ✅ Pretty-prints JSON responses
- ✅ Error handling

---

### **Method 2: Node.js Script**

**Script**: `scripts/waha-update-profile-picture.js`

**Update Profile Picture**:
```bash
node scripts/waha-update-profile-picture.js https://example.com/profile-picture.jpg
```

**Delete Profile Picture**:
```bash
node scripts/waha-update-profile-picture.js --delete
```

**Features**:
- ✅ Same functionality as bash script
- ✅ Better for automation/integration
- ✅ Can be imported into other Node.js scripts

---

### **Method 3: Direct API Call**

**Update Profile Picture**:
```bash
curl -X PUT \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{"file":{"url":"https://example.com/profile-picture.jpg"}}' \
  http://173.254.201.134:3000/api/default/profile/picture
```

**Delete Profile Picture**:
```bash
curl -X DELETE \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://173.254.201.134:3000/api/default/profile/picture
```

---

## 📋 **API ENDPOINT DETAILS**

### **Update Profile Picture**

**Endpoint**: `PUT /api/{SESSION}/profile/picture`

**Headers**:
- `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
- `Content-Type`: `application/json`

**Body**:
```json
{
  "file": {
    "url": "https://example.com/path/to/image.jpg"
  }
}
```

**Response** (Success):
```json
{
  "success": true
}
```

---

### **Delete Profile Picture**

**Endpoint**: `DELETE /api/{SESSION}/profile/picture`

**Headers**:
- `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`

**Response** (Success):
```json
{
  "success": true
}
```

---

## 🎯 **USAGE IN N8N WORKFLOWS**

Since the WAHA n8n node doesn't support profile operations, use an **HTTP Request node**:

### **Node Configuration**

**Type**: `n8n-nodes-base.httpRequest`

**Method**: `PUT` (for update) or `DELETE` (for removal)

**URL**: `http://173.254.201.134:3000/api/default/profile/picture`

**Headers**:
- `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
- `Content-Type`: `application/json`

**Body** (for PUT only):
```json
{
  "file": {
    "url": "={{ $json.image_url }}"
  }
}
```

**Authentication**: None (API key in header)

---

## 📊 **IMAGE REQUIREMENTS**

**Supported Formats**:
- JPEG (.jpg, .jpeg)
- PNG (.png)

**Recommended Size**:
- **Dimensions**: 640x640 pixels (square)
- **File Size**: < 5MB
- **Format**: JPEG recommended for smaller file size

**Best Practices**:
- Use square images (1:1 aspect ratio)
- Compress images before uploading
- Use HTTPS URLs (required by WhatsApp)
- Ensure image is publicly accessible

---

## 🔍 **TROUBLESHOOTING**

### **Error: "Invalid URL format"**
- Ensure URL starts with `http://` or `https://`
- Check that the URL is publicly accessible
- Verify the image exists at the URL

### **Error: "HTTP 404"**
- Check that the session name is correct (`default`)
- Verify WAHA is running: `docker ps | grep waha`
- Check WAHA logs: `docker logs waha-noweb --tail 50`

### **Error: "HTTP 401"**
- Verify API key is correct: `4fc7e008d7d24fc995475029effc8fa8`
- Check that the `x-api-key` header is set correctly

### **Profile Picture Not Updating**
- Wait 10-30 seconds for WhatsApp to sync
- Check WhatsApp on your phone
- Verify the image URL is accessible from WAHA server
- Try deleting and re-adding the profile picture

---

## 📝 **EXAMPLES**

### **Example 1: Update with Rensto Logo**

```bash
./scripts/waha-update-profile-picture.sh https://rensto.com/logo.png
```

### **Example 2: Update from Local File (via URL)**

First, upload image to a public URL (e.g., GitHub, Imgur, or your server), then:

```bash
./scripts/waha-update-profile-picture.sh https://your-server.com/images/profile.jpg
```

### **Example 3: Remove Profile Picture**

```bash
./scripts/waha-update-profile-picture.sh --delete
```

---

## 🔗 **REFERENCES**

- **WAHA Documentation**: https://waha.devlike.pro/docs/how-to/profile/
- **WAHA API**: `http://173.254.201.134:3000/api`
- **WAHA Dashboard**: `http://173.254.201.134:3000/dashboard`
- **Session**: `default`
- **API Key**: `4fc7e008d7d24fc995475029effc8fa8`

---

## ✅ **VERIFICATION**

After updating the profile picture:

1. **Check Script Output**: Should show `"success": true`
2. **Wait 10-30 seconds**: WhatsApp needs time to sync
3. **Check WhatsApp**: Open WhatsApp and verify the profile picture updated
4. **Check Session Status**: Verify session is still `WORKING`

---

**Last Updated**: November 17, 2025  
**Status**: ✅ **Scripts Ready for Use**

