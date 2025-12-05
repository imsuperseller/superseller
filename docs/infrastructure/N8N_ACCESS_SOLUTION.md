# n8n Access Solution - Cloudflare 521 Fix

**Date**: January 2, 2025  
**Issue**: Cloudflare error 521 (can't connect to origin)  
**Solution**: Disabled Cloudflare proxy temporarily

---

## ✅ Current Access Methods

### **1. Direct IP (HTTP)** - ✅ **WORKING NOW**
- **URL**: http://172.245.56.50:5678
- **Status**: ✅ Fully functional
- **Use this**: For immediate access

### **2. Domain (HTTP)** - ⏳ **PROPAGATING**
- **URL**: http://n8n.rensto.com
- **Status**: ⏳ DNS propagating (5-10 minutes)
- **Note**: HTTP only (no HTTPS until Cloudflare proxy works)

### **3. Domain (HTTPS)** - ❌ **BLOCKED**
- **URL**: https://n8n.rensto.com
- **Status**: ❌ Error 521 (RackNerd firewall blocking Cloudflare)
- **Fix Needed**: Configure RackNerd firewall to allow Cloudflare IPs

---

## 🔧 What Was Changed

**Cloudflare DNS**:
- **Proxy**: Disabled (`proxied: false`)
- **Type**: A record
- **Content**: 172.245.56.50
- **Result**: Direct connection (bypasses Cloudflare proxy)

**Why**: RackNerd firewall appears to be blocking Cloudflare's proxy IPs, causing 521 errors.

---

## 🎯 Recommended Access

**Use Direct IP**: http://172.245.56.50:5678
- ✅ Works immediately
- ✅ No DNS wait
- ✅ No firewall issues
- ⚠️ HTTP only (no HTTPS)

---

## 🔒 To Enable HTTPS Later

### **Option 1: Fix RackNerd Firewall** (Best)
1. Log into RackNerd control panel
2. Find firewall/security settings
3. Allow Cloudflare IP ranges:
   - https://www.cloudflare.com/ips/
4. Re-enable Cloudflare proxy (`proxied: true`)

### **Option 2: Use Let's Encrypt** (Alternative)
1. Install certbot on VPS
2. Get SSL certificate for n8n.rensto.com
3. Configure nginx with SSL
4. Keep Cloudflare proxy disabled

### **Option 3: Cloudflare Tunnel** (Most Reliable)
1. Install `cloudflared` on VPS
2. Create Cloudflare Tunnel
3. Update DNS to use tunnel CNAME
4. Works even with firewall restrictions

---

## 📊 Current Status

- ✅ **n8n**: Running and healthy
- ✅ **Direct IP**: Accessible
- ⏳ **Domain HTTP**: Propagating (5-10 min)
- ❌ **Domain HTTPS**: Blocked by firewall

---

## 🧪 Test Commands

```bash
# Direct IP (works now)
curl http://172.245.56.50:5678/healthz

# Domain HTTP (after DNS propagation)
curl http://n8n.rensto.com/healthz

# Domain HTTPS (will fail until firewall fixed)
curl https://n8n.rensto.com/healthz
```

---

**Last Updated**: January 2, 2025  
**Access URL**: http://172.245.56.50:5678  
**Domain**: http://n8n.rensto.com (after DNS propagation)
