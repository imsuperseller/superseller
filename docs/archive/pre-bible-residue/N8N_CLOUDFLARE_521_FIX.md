# Cloudflare 521 Error - Troubleshooting Guide

**Date**: January 2, 2025  
**Issue**: Cloudflare error 521 (Web server is down)  
**Status**: ⚠️ **IN PROGRESS**

---

## ✅ What's Working

- ✅ **Direct IP Access**: http://172.245.56.50:5678 - **WORKING**
- ✅ **Nginx Proxy**: http://172.245.56.50/ - **WORKING**
- ✅ **n8n Health**: Container running, health check passes
- ✅ **DNS**: n8n.rensto.com points to Cloudflare IPs (proxied)

---

## ❌ Current Issue

**Cloudflare Error 521**: "Web server is down"
- Cloudflare can't connect to origin server (172.245.56.50)
- This is a Cloudflare → Origin connection issue

---

## 🔍 Possible Causes

1. **RackNerd Firewall**: May be blocking Cloudflare IP ranges
2. **Cloudflare Propagation**: Takes 5-15 minutes to update routing
3. **Port Blocking**: RackNerd may block port 80 from external IPs
4. **Cloudflare IP Whitelist**: Server may need to allow Cloudflare IPs

---

## ✅ Solutions Applied

1. ✅ **Nginx Installed**: Reverse proxy on port 80
2. ✅ **Nginx Configured**: Proxying to n8n on port 5678
3. ✅ **Cloudflare Proxy Enabled**: `proxied: true` in DNS
4. ✅ **Direct Access Works**: Server is accessible via IP

---

## 🔧 Next Steps to Fix 521

### **Option 1: Wait for Cloudflare Propagation** (Recommended First)
- Cloudflare routing can take 5-15 minutes to update
- Wait 10-15 minutes and test again

### **Option 2: Check RackNerd Firewall**
- RackNerd control panel may have firewall settings
- Need to allow Cloudflare IP ranges (or disable firewall for testing)

### **Option 3: Disable Cloudflare Proxy Temporarily**
- Set `proxied: false` in DNS
- Access via HTTP: http://n8n.rensto.com (after DNS propagation)
- Less secure but will work immediately

### **Option 4: Use Cloudflare Tunnel** (Best Long-term)
- Install `cloudflared` on new VPS
- Create tunnel (like old setup)
- More reliable than proxy for non-standard ports

---

## 📊 Current Configuration

**DNS Record**:
- Type: A
- Name: n8n.rensto.com
- Content: 172.245.56.50
- Proxied: true ✅

**Server**:
- Nginx: Running on port 80 ✅
- n8n: Running on port 5678 ✅
- Firewall: Inactive ✅

---

## 🧪 Test Commands

```bash
# Test direct IP (should work)
curl http://172.245.56.50/healthz

# Test via nginx (should work)
curl http://172.245.56.50/healthz

# Test via Cloudflare (may show 521)
curl https://n8n.rensto.com/healthz

# Check DNS
nslookup n8n.rensto.com
```

---

## ⏳ Expected Resolution Time

- **Cloudflare Propagation**: 5-15 minutes
- **If firewall issue**: Need to configure RackNerd panel
- **If port blocking**: May need to contact RackNerd support

---

## 🎯 Workaround (Immediate Access)

**Use Direct IP**: http://172.245.56.50:5678
- ✅ Works immediately
- ✅ No DNS/proxy issues
- ⚠️ HTTP only (no HTTPS)

---

**Last Updated**: January 2, 2025  
**Status**: Waiting for Cloudflare propagation / Checking RackNerd firewall
