# WAHA Media Capabilities - Full Feature List

**Date**: November 12, 2025  
**Version**: WAHA 2025.10.4 (CORE tier)  
**Engine**: NOWEB  
**Status**: ✅ **FULL MEDIA SUPPORT**

---

## ✅ **MEDIA SUPPORT CONFIRMED**

**Your WAHA installation supports**:
- ✅ **Text Messages**
- ✅ **Images**
- ✅ **Videos**
- ✅ **Files/Documents**
- ✅ **Voice Messages**
- ✅ **Location Sharing**
- ✅ **Contact Cards**
- ✅ **Interactive Messages** (Buttons, Lists, Polls)
- ✅ **Status Updates** (Text, Image, Video, Voice)

---

## 📋 **AVAILABLE MEDIA ENDPOINTS**

### **Core Media Sending**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sendText` | POST | Send text messages |
| `/api/sendImage` | POST | Send images |
| `/api/sendVideo` | POST | Send videos |
| `/api/sendFile` | POST | Send files/documents |
| `/api/sendVoice` | POST | Send voice messages/audio |
| `/api/sendLocation` | POST | Send location |
| `/api/sendContactVcard` | POST | Send contact card |

### **Interactive Messages**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sendButtons` | POST | Send interactive buttons |
| `/api/sendList` | POST | Send list messages |
| `/api/sendPoll` | POST | Send polls |
| `/api/sendPollVote` | POST | Vote on polls |
| `/api/send/link-custom-preview` | POST | Send links with custom preview |
| `/api/sendLinkPreview` | POST | Send links with auto-preview |

### **Status Updates**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/:session/status/text` | POST | Update status with text |
| `/api/:session/status/image` | POST | Update status with image |
| `/api/:session/status/video` | POST | Update status with video |
| `/api/:session/status/voice` | POST | Update status with voice |

### **Media Conversion**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/:session/media/convert/video` | POST | Convert video format |
| `/api/:session/media/convert/voice` | POST | Convert voice format |

---

## 💾 **MEDIA STORAGE CONFIGURATION**

**Current Setup**:
- **Storage Type**: `LOCAL` (stored on VPS)
- **Location**: `/app/.media` (inside container)
- **Lifetime**: Indefinite (files kept)

**Storage Options Available**:
1. **LOCAL** (Current) - Files stored on VPS
2. **S3** - Amazon S3 or compatible storage
3. **POSTGRESQL** - Database storage

---

## 📊 **FULL FEATURE LIST**

### **Sending Capabilities**:
- ✅ Text messages
- ✅ Images (JPG, PNG, GIF, WebP)
- ✅ Videos (MP4, AVI, MOV, etc.)
- ✅ Files/Documents (PDF, DOC, XLS, ZIP, etc.)
- ✅ Voice messages (Audio files)
- ✅ Location (GPS coordinates)
- ✅ Contact cards (vCard format)
- ✅ Interactive buttons
- ✅ List messages
- ✅ Polls
- ✅ Link previews

### **Receiving Capabilities**:
- ✅ Receive all message types
- ✅ Download media files
- ✅ Get message metadata
- ✅ Read receipts
- ✅ Typing indicators

### **Chat Management**:
- ✅ Get chat list
- ✅ Get chat messages
- ✅ Archive/unarchive chats
- ✅ Delete messages
- ✅ Pin/unpin messages
- ✅ Mark as read/unread

### **Group Management**:
- ✅ Create/join/leave groups
- ✅ Add/remove participants
- ✅ Promote/demote admins
- ✅ Update group settings
- ✅ Get group info

### **Profile Management**:
- ✅ Update profile name
- ✅ Update profile picture
- ✅ Update status text
- ✅ Get profile info

### **Contacts Management**:
- ✅ Get contacts list
- ✅ Block/unblock contacts
- ✅ Get contact profile pictures
- ✅ Check if contact exists

---

## 🔧 **USAGE EXAMPLES**

### **Send Image**

```bash
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: multipart/form-data" \
  -F "chatId=12144362102@c.us" \
  -F "image=@/path/to/image.jpg" \
  -F "caption=Check out this image!" \
  http://173.254.201.134:3000/api/sendImage
```

### **Send Video**

```bash
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: multipart/form-data" \
  -F "chatId=12144362102@c.us" \
  -F "video=@/path/to/video.mp4" \
  -F "caption=Check out this video!" \
  http://173.254.201.134:3000/api/sendVideo
```

### **Send File**

```bash
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: multipart/form-data" \
  -F "chatId=12144362102@c.us" \
  -F "file=@/path/to/document.pdf" \
  -F "filename=document.pdf" \
  http://173.254.201.134:3000/api/sendFile
```

### **Send Voice Message**

```bash
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: multipart/form-data" \
  -F "chatId=12144362102@c.us" \
  -F "audio=@/path/to/voice.ogg" \
  http://173.254.201.134:3000/api/sendVoice
```

### **Send Location**

```bash
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "12144362102@c.us",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "name": "New York City"
  }' \
  http://173.254.201.134:3000/api/sendLocation
```

---

## 🎯 **N8N INTEGRATION**

**WAHA Node in n8n supports**:
- ✅ All media types
- ✅ Interactive messages
- ✅ File uploads
- ✅ Media downloads

**Configuration**:
- **Base URL**: `http://173.254.201.134:3000`
- **API Key**: `4fc7e008d7d24fc995475029effc8fa8`
- **Session**: `default`

**Workflows Can**:
- Send images, videos, files
- Receive and process media
- Download media from messages
- Convert media formats

---

## 📊 **MEDIA STORAGE LOCATION**

**On VPS**:
- **Container Path**: `/app/.media`
- **Host Path**: `/opt/waha/data/.media` (if mapped)
- **Current**: Stored inside container

**To Access Media Files**:
```bash
ssh root@173.254.201.134
docker exec waha-noweb ls -lh /app/.media
```

---

## ✅ **CONCLUSION**

**Your WAHA installation has FULL media support**:
- ✅ Text ✅ Images ✅ Videos ✅ Files ✅ Voice
- ✅ Location ✅ Contacts ✅ Interactive messages
- ✅ Status updates ✅ Media conversion

**Version**: WAHA 2025.10.4 (CORE tier)  
**Engine**: NOWEB  
**Storage**: LOCAL  
**Status**: ✅ **Fully operational for all media types**

---

**You can send/receive any type of WhatsApp message!** 🚀

