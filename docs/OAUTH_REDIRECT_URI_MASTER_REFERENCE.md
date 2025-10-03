# 🔗 **OAUTH REDIRECT URI MASTER REFERENCE**

## ⚠️ **CRITICAL: SINGLE SOURCE OF TRUTH**

**This is the ONLY authorized reference for OAuth redirect URIs in the Rensto system.**

---

## 🎯 **AUTHORIZED REDIRECT URIs**

### **⚠️ CRITICAL: PERMANENT URLs ONLY**

**These URLs are PERMANENT and will NEVER change. Use these EXACT URLs in all OAuth configurations.**

### **Primary Production URLs (PERMANENT):**
```
https://rensto.com/oauth/callback
https://admin.rensto.com/api/oauth/quickbooks-callback
https://admin.rensto.com/api/oauth/webflow-callback
https://admin.rensto.com/api/oauth/stripe-callback
https://admin.rensto.com/api/oauth/typeform-callback
```

### **🚨 NEVER USE TEMPORARY URLs:**
- ❌ Cloudflare tunnel URLs (expire after time)
- ❌ TryCloudflare URLs (temporary)
- ❌ IP addresses (can change)
- ❌ Localhost URLs (development only)

---

## 🚨 **DEPRECATED/INVALID URLs (DO NOT USE)**

### **❌ Cloudflare Tunnel URLs (DEPRECATED):**
```
https://mr-lost-suited-athens.trycloudflare.com/rest/oauth2-credential/callback
https://red-blocking-gl-answered.trycloudflare.com/rest/oauth2-credential/callback
https://n8n-oauth2.rensto.com/rest/oauth2-credential/callback
```

### **❌ Old n8n URLs (DEPRECATED):**
```
http://173.254.201.134:5678/rest/oauth2-credential/callback
```

---

## 📋 **SERVICE-SPECIFIC CONFIGURATIONS**

### **QuickBooks OAuth2:**
- **Redirect URI**: `https://rensto.com/oauth/callback` ⚠️ **UPDATE IN QUICKBOOKS DEVELOPER CONSOLE**
- **Admin Dashboard**: `https://admin.rensto.com/api/oauth/quickbooks-callback`
- **Client ID**: `ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f`
- **Scope**: `com.intuit.quickbooks.accounting`
- **Where to Update**: https://developer.intuit.com/ → My Apps → Your App → OAuth2 Settings

### **Webflow OAuth2:**
- **Redirect URI**: `https://rensto.com/oauth/callback` ⚠️ **UPDATE IN WEBFLOW DEVELOPER CONSOLE**
- **Admin Dashboard**: `https://admin.rensto.com/api/oauth/webflow-callback`
- **Scopes**: `sites:read`, `sites:write`, `collections:read`, `collections:write`
- **Where to Update**: https://developers.webflow.com/ → Your App → OAuth Settings

### **Stripe OAuth2:**
- **Redirect URI**: `https://rensto.com/oauth/callback` ⚠️ **UPDATE IN STRIPE DASHBOARD**
- **Admin Dashboard**: `https://admin.rensto.com/api/oauth/stripe-callback`
- **Where to Update**: https://dashboard.stripe.com/settings/applications → Your App → OAuth Settings

### **Typeform OAuth2:**
- **Redirect URI**: `https://rensto.com/oauth/callback` ⚠️ **UPDATE IN TYPEFORM DEVELOPER CONSOLE**
- **Admin Dashboard**: `https://admin.rensto.com/api/oauth/typeform-callback`
- **Where to Update**: https://developer.typeform.com/ → Your App → OAuth Settings

---

## 🔧 **IMPLEMENTATION RULES**

### **1. Always Use Production URLs:**
- ✅ `https://rensto.com/oauth/callback` (Primary)
- ✅ `https://admin.rensto.com/api/oauth/[service]-callback` (Admin)

### **2. Never Use:**
- ❌ Cloudflare tunnel URLs
- ❌ IP addresses
- ❌ HTTP (only HTTPS)
- ❌ Localhost in production

### **3. Service Registration:**
When registering OAuth apps with external services:
1. **Primary**: Use `https://rensto.com/oauth/callback`
2. **Admin**: Use `https://admin.rensto.com/api/oauth/[service]-callback`
3. **Update**: All existing services to use these URLs

---

## 📝 **UPDATE CHECKLIST**

### **Services to Update:**
- [ ] QuickBooks Developer Console
- [ ] Webflow Developer Console  
- [ ] Stripe Dashboard
- [ ] Typeform Developer Console
- [ ] Any other OAuth integrations

### **Files to Update:**
- [ ] `docs/QUICKBOOKS_OAUTH2_SETUP.md`
- [ ] `docs/WEBFLOW_OAUTH2_SETUP.md`
- [ ] `docs/quickbooks-manual-authentication-guide.md`
- [ ] All OAuth configuration files
- [ ] Environment variables

---

## 🎯 **NEXT STEPS**

1. **Update all OAuth apps** to use the authorized URLs
2. **Remove deprecated URLs** from all documentation
3. **Test all OAuth flows** with new URLs
4. **Update environment variables** in all systems
5. **Verify admin dashboard** OAuth callbacks work

---

## 📞 **SUPPORT**

If you need to add a new OAuth service:
1. **Use the authorized URLs** above
2. **Update this document** with the new service
3. **Test thoroughly** before production use
4. **Never create new redirect URIs** without updating this reference

**Remember**: This is the SINGLE SOURCE OF TRUTH for OAuth redirect URIs.
