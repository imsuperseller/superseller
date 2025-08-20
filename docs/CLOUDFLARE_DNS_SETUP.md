# 🌐 **CLOUDFLARE DNS SETUP FOR RENSTO.COM**

## 🎯 **CURRENT STATUS**

**Domain**: `rensto.com`  
**DNS Provider**: Cloudflare (not GoDaddy)  
**Status**: ✅ **DNS managed by Cloudflare**  
**Action**: Add customer subdomain records in Cloudflare

---

## 📋 **EXACT DNS RECORDS TO ADD IN CLOUDFLARE**

### **Step 1: Access Cloudflare Dashboard**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Login with your account
3. Select the `rensto.com` domain
4. Go to **DNS** → **Records**

### **Step 2: Add Customer Subdomain Records**

#### **1. Ben Ginati Customer Portal**
```
Type: CNAME
Name: ben-ginati
Target: rensto-business-system.vercel.app
Proxy status: ☁️ Proxied (Orange cloud ON)
TTL: Auto
```

#### **2. Shelly Mizrahi Customer Portal**
```
Type: CNAME
Name: shelly-mizrahi
Target: rensto-business-system.vercel.app
Proxy status: ☁️ Proxied (Orange cloud ON)
TTL: Auto
```

#### **3. WWW Subdomain (if not already exists)**
```
Type: CNAME
Name: www
Target: rensto-business-system.vercel.app
Proxy status: ☁️ Proxied (Orange cloud ON)
TTL: Auto
```

### **Step 3: Verify Existing Records**

You should already have these records (from the documentation):
- ✅ `n8n.rensto.com` → `tunnel-id.cfargotunnel.com` (Cloudflare Tunnel)
- ✅ `api.rensto.com` → `tunnel-id.cfargotunnel.com` (Cloudflare Tunnel)

---

## 🎯 **WHAT THIS WILL ENABLE**

After adding these DNS records, you'll have:

| Subdomain | URL | Purpose | Status |
|-----------|-----|---------|--------|
| **Main Domain** | `https://rensto.com` | Main website | ✅ Ready |
| **WWW** | `https://www.rensto.com` | Main website | ✅ Ready |
| **Tax4Us Portal** | `https://tax4us.rensto.com` | Customer portal | ⏳ Add DNS |
| **Shelly's Portal** | `https://shelly-mizrahi.rensto.com` | Customer portal | ⏳ Add DNS |
| **n8n Interface** | `https://n8n.rensto.com` | n8n admin | ✅ Already working |
| **API** | `https://api.rensto.com` | API endpoints | ✅ Already working |

---

## 🔧 **CLOUDFLARE SETTINGS TO VERIFY**

### **SSL/TLS Settings**
1. Go to **SSL/TLS** → **Overview**
2. Ensure **Encryption mode** is set to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### **Security Settings**
1. Go to **Security** → **Settings**
2. Set **Security Level** to **Medium**
3. Enable **Browser Integrity Check**
4. Enable **Challenge Passage** (if needed)

---

## ⏱️ **TIMELINE**

- **DNS Changes**: 2-3 minutes in Cloudflare
- **Propagation**: 1-5 minutes worldwide
- **SSL Certificates**: Automatic via Cloudflare
- **Testing**: Immediate after propagation

---

## 🧪 **TESTING AFTER DNS CHANGES**

### **Test DNS Resolution**
```bash
# Test from your computer
nslookup tax4us.rensto.com
nslookup shelly-mizrahi.rensto.com

# Test from external service
dig tax4us.rensto.com
dig shelly-mizrahi.rensto.com
```

### **Test Website Access**
```bash
# Test customer portals
curl -I https://tax4us.rensto.com
curl -I https://shelly-mizrahi.rensto.com

# Test main website
curl -I https://rensto.com
curl -I https://www.rensto.com
```

---

## 🎉 **SUMMARY**

**You only need to add 3 CNAME records in Cloudflare:**

1. **ben-ginati** → `rensto-business-system.vercel.app`
2. **shelly-mizrahi** → `rensto-business-system.vercel.app`  
3. **www** → `rensto-business-system.vercel.app`

**That's it!** No GoDaddy changes needed since Cloudflare is managing the DNS.

**Ready to add these records in Cloudflare?** 🚀
