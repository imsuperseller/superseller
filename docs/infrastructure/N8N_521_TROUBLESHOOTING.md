# n8n 521 Error - Troubleshooting Guide

**Date**: January 2, 2025  
**Issue**: Error 521 when accessing n8n.rensto.com  
**Status**: ⚠️ DNS/Proxy Configuration Issue

---

## ✅ What's Working

- ✅ **Direct IP**: http://172.245.56.50:5678 - **WORKS**
- ✅ **Server**: n8n running, nginx running, all healthy
- ✅ **HTTP from my location**: http://n8n.rensto.com - **WORKS**

---

## 🔍 Why You Might See 521

### **1. Using HTTPS Instead of HTTP**
- ❌ **Wrong**: https://n8n.rensto.com (will show 521)
- ✅ **Correct**: http://n8n.rensto.com (should work)

### **2. Browser Auto-Redirect to HTTPS**
- Some browsers force HTTPS
- Solution: Type `http://` explicitly

### **3. DNS Cache**
- Your computer/browser may have cached old DNS
- Solution: Clear DNS cache

### **4. Regional DNS Propagation**
- DNS changes take 5-30 minutes to propagate globally
- Your location may not have updated yet

---

## 🛠️ Solutions

### **Solution 1: Use Direct IP** (Immediate)
**URL**: http://172.245.56.50:5678
- ✅ Works immediately
- ✅ No DNS issues
- ✅ No proxy issues

### **Solution 2: Clear DNS Cache**

**Windows**:
```cmd
ipconfig /flushdns
```

**Mac**:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux**:
```bash
sudo systemd-resolve --flush-caches
# or
sudo resolvectl flush-caches
```

**Browser**:
- Chrome: Clear browsing data → Cached images and files
- Firefox: Clear cache
- Safari: Empty caches

### **Solution 3: Force HTTP (Not HTTPS)**

Make sure you're using:
- ✅ `http://n8n.rensto.com` (HTTP)
- ❌ NOT `https://n8n.rensto.com` (HTTPS)

### **Solution 4: Wait for DNS Propagation**

DNS changes can take 5-30 minutes. If you just made the change:
- Wait 10-15 minutes
- Try again
- Or use direct IP in the meantime

---

## 🧪 Test Commands

```bash
# Test direct IP (should always work)
curl http://172.245.56.50:5678/healthz

# Test domain HTTP (may need DNS propagation)
curl http://n8n.rensto.com/healthz

# Check DNS resolution
nslookup n8n.rensto.com
# Should show: 172.245.56.50 (after propagation)
```

---

## 📊 Current Configuration

**DNS Record**:
- Type: A
- Name: n8n.rensto.com
- Content: 172.245.56.50
- Proxied: false ✅

**Server**:
- nginx: Running on port 80 ✅
- n8n: Running on port 5678 ✅
- Health: All checks passing ✅

---

## 🎯 Recommended Action

**Use Direct IP for Now**: http://172.245.56.50:5678
- ✅ Guaranteed to work
- ✅ No DNS/proxy issues
- ✅ Immediate access

Then try domain after clearing DNS cache:
- http://n8n.rensto.com

---

**Last Updated**: January 2, 2025  
**Working URL**: http://172.245.56.50:5678
