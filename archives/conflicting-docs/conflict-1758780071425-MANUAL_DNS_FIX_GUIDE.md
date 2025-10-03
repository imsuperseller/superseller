# 🔧 MANUAL DNS FIX - CLOUDFLARE ERROR 1000

## 🚨 **URGENT: www.rensto.com Error 1000 Fix**

**Issue**: `www.rensto.com` is pointing to Cloudflare IPs (`172.67.215.215`, `104.21.43.15`) causing Error 1000.

**Solution**: Update DNS records to point to Vercel instead.

---

## 🎯 **IMMEDIATE FIX STEPS**

### **Step 1: Access Cloudflare Dashboard**
1. **Go to**: [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Login** with your Cloudflare account
3. **Select**: `rensto.com` domain
4. **Navigate**: DNS → Records

### **Step 2: Fix www.rensto.com Record**
**Current (WRONG):**
```
www.rensto.com    A    172.67.215.215
www.rensto.com    A    104.21.43.15
```

**Change to (CORRECT):**
```
www.rensto.com    CNAME    cname.vercel-dns.com
```

**Action:**
1. **Find** the `www.rensto.com` A records
2. **Delete** both A records (172.67.215.215 and 104.21.43.15)
3. **Add** new CNAME record:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: cname.vercel-dns.com
   - **TTL**: Auto
   - **Proxy status**: Proxied (orange cloud)

### **Step 3: Verify Main Domain**
**Current (CORRECT):**
```
rensto.com    A    18.211.166.153
rensto.com    A    34.202.203.47
rensto.com    A    54.243.86.28
```

**Keep as is** - these are correct Vercel IPs.

### **Step 4: Add Other Subdomains (Optional)**
If you want to add other subdomains:

```
admin.rensto.com    CNAME    cname.vercel-dns.com
app.rensto.com      CNAME    cname.vercel-dns.com
```

---

## 🔍 **VERIFICATION STEPS**

### **Step 1: Wait for Propagation**
- **Wait**: 5-10 minutes for DNS changes to propagate
- **Check**: [whatsmydns.net](https://www.whatsmydns.net) for global propagation

### **Step 2: Test the Fix**
```bash
# Check DNS resolution
dig www.rensto.com

# Should show Vercel IPs, NOT Cloudflare IPs
```

### **Step 3: Test in Browser**
1. **Go to**: [www.rensto.com](https://www.rensto.com)
2. **Expected**: Should load without Error 1000
3. **Expected**: Should show your Vercel-deployed site

---

## 📋 **COMPLETE DNS CONFIGURATION**

### **Final DNS Records Should Be:**
```
rensto.com              A        18.211.166.153
rensto.com              A        34.202.203.47
rensto.com              A        54.243.86.28
www.rensto.com          CNAME    cname.vercel-dns.com
admin.rensto.com        CNAME    cname.vercel-dns.com
app.rensto.com          CNAME    cname.vercel-dns.com
```

### **Email Records (Keep Existing):**
```
rensto.com              MX       rensto-com.mail.protection.outlook.com
rensto.com              TXT      v=spf1 include:_spf.protection.outlook.com -all
```

---

## 🚨 **TROUBLESHOOTING**

### **If Still Getting Error 1000:**
1. **Check**: DNS propagation at [whatsmydns.net](https://www.whatsmydns.net)
2. **Wait**: Up to 24 hours for full global propagation
3. **Clear**: Browser cache and try incognito mode
4. **Check**: Cloudflare proxy status (should be orange cloud)

### **If Site Doesn't Load:**
1. **Verify**: Vercel deployment is active
2. **Check**: Custom domain is configured in Vercel
3. **Verify**: SSL certificate is issued

### **If Email Stops Working:**
1. **Check**: MX records are still pointing to Microsoft 365
2. **Verify**: SPF record is correct
3. **Test**: Send test email

---

## 📞 **SUPPORT**

If you need help:
1. **Cloudflare Support**: [support.cloudflare.com](https://support.cloudflare.com)
2. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
3. **DNS Checker**: [dnschecker.org](https://dnschecker.org)

---

## ✅ **SUCCESS CRITERIA**

- [ ] www.rensto.com loads without Error 1000
- [ ] rensto.com loads correctly
- [ ] admin.rensto.com loads correctly (if configured)
- [ ] Email still works
- [ ] SSL certificates are valid
- [ ] DNS propagation is complete globally

---

**🎉 Once completed, www.rensto.com should work perfectly!**
