# 🌐 DNS Migration Guide: Webflow → Vercel

**Date**: November 2, 2025  
**Migration**: `rensto.com` from Webflow to Vercel  
**DNS Provider**: Cloudflare (API token: `UH1jMzVfPgk2NxMkrmucvgIK5xv4Q_tTvtb3zvo1`)

---

## ✅ **GOOD NEWS: YOU ALREADY HAVE VERCEL**

### **Current Vercel Setup**

You're **already paying for Vercel** (or using free tier) because you have:
- ✅ `admin.rensto.com` → Vercel (working)
- ✅ `api.rensto.com` → Vercel (working)

**You won't need to pay MORE** - adding `rensto.com` to your existing Vercel account is free (just another domain).

---

## 💰 **VERCEL PRICING** (What You Need)

### **Current Situation**

| Plan | Cost | What You Get | Your Status |
|------|------|--------------|-------------|
| **Hobby (Free)** | $0/month | Unlimited projects, 100GB bandwidth | ✅ Likely this |
| **Pro** | $20/month | 1TB bandwidth, team features | ⚠️ Check your plan |
| **Enterprise** | Custom | Advanced features | ❌ Not needed |

### **For Full Migration**:

**If you're on Hobby (Free)**:
- ✅ **You can stay on Hobby** (unlimited projects)
- ✅ **Adding rensto.com is FREE** (just another domain)
- ⚠️ **Check bandwidth**: If you exceed 100GB/month, upgrade to Pro

**If you're on Pro ($20/month)**:
- ✅ **No change needed** - you can add unlimited domains
- ✅ **1TB bandwidth included** (plenty for your traffic)

**Conclusion**: **You likely won't need to pay more** - just add the domain to your existing Vercel project.

---

## 🔄 **DNS CHANGES NEEDED**

### **Current DNS** (Webflow)

```
rensto.com          → Webflow IP (198.202.211.1)
www.rensto.com      → cdn.webflow.com
admin.rensto.com    → Vercel (CNAME: cname.vercel-dns.com)
api.rensto.com      → Vercel (CNAME: cname.vercel-dns.com)
```

### **After Migration** (Vercel)

```
rensto.com          → Vercel (A record or CNAME)
www.rensto.com      → Vercel (CNAME: cname.vercel-dns.com)
admin.rensto.com    → Vercel (unchanged)
api.rensto.com      → Vercel (unchanged)
```

---

## 📋 **STEP-BY-STEP DNS MIGRATION**

### **Phase 1: Prepare Vercel** (Before DNS Change)

1. **Add Domain to Vercel Project**:
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add `rensto.com`
   - Add `www.rensto.com`
   - Vercel will show you the DNS records needed

2. **Get DNS Records from Vercel**:
   - Vercel will provide:
     - A record IP (for `rensto.com`)
     - CNAME target (for `www.rensto.com`)
   - **Note these down** - you'll need them for Cloudflare

3. **Pre-generate SSL Certificates**:
   - Vercel will ask for TXT records for domain verification
   - Add these to Cloudflare first (before changing A/CNAME)

### **Phase 2: Update Cloudflare DNS** (Using API)

#### **Option A: Manual (Via Cloudflare Dashboard)**

1. **Add TXT Records** (Domain Verification):
   - Log into Cloudflare Dashboard
   - Go to DNS settings for `rensto.com`
   - Add TXT records provided by Vercel
   - Wait for verification (usually 5-10 minutes)

2. **Update A Record** (Root Domain):
   - Find existing A record for `rensto.com` (points to Webflow)
   - Change to Vercel's A record IP
   - **OR** use CNAME to `cname.vercel-dns.com` (if Cloudflare supports CNAME on root)

3. **Update CNAME Record** (WWW):
   - Find existing CNAME for `www.rensto.com`
   - Change to `cname.vercel-dns.com`
   - Set proxy status: **DNS Only** (gray cloud icon)

#### **Option B: Automated (Using Cloudflare API)**

I can create a script to automate this using your API token:

```javascript
// Script to update DNS records
// Uses: Cloudflare API token
// Updates: rensto.com A record, www.rensto.com CNAME
```

**Would you like me to create this script?**

---

## ⚠️ **IMPORTANT CONSIDERATIONS**

### **DNS Propagation**

- **Time**: DNS changes take 5 minutes to 48 hours to propagate globally
- **Strategy**: Update DNS during low-traffic period (weekend/night)
- **Rollback**: Keep Webflow DNS records noted (in case you need to rollback)

### **SSL Certificates**

- **Automatic**: Vercel issues SSL certificates automatically
- **Timeline**: SSL usually ready within 10-15 minutes after DNS update
- **Verification**: Vercel needs TXT records in Cloudflare to verify domain ownership

### **Subdomain Strategy**

You have multiple subdomains:

- ✅ `admin.rensto.com` - Already on Vercel (no change)
- ✅ `api.rensto.com` - Already on Vercel (no change)
- ⚠️ `portal.rensto.com` - Planned (add to Vercel when ready)

**Only need to change**: `rensto.com` and `www.rensto.com`

---

## 🚨 **MIGRATION TIMELINE**

### **Recommended Approach**

**Week Before Cutover**:
1. Add `rensto.com` to Vercel project
2. Get DNS records from Vercel
3. Add TXT records to Cloudflare (domain verification)
4. Wait for SSL certificate generation

**Cutover Day** (Jan 13, 2026):
1. Update A record for `rensto.com` (Webflow → Vercel)
2. Update CNAME for `www.rensto.com` (Webflow → Vercel)
3. Monitor DNS propagation (use `dig rensto.com` or DNS checker)
4. Verify SSL certificates active
5. Test all pages load correctly

**Rollback Plan**:
- Keep old DNS records noted
- If issues, revert DNS immediately
- Should take < 5 minutes to rollback

---

## 📊 **COST BREAKDOWN**

### **Current Costs**

- Webflow CMS: ~$20/month
- Vercel: $0-20/month (depends on your plan)

### **After Migration**

- Webflow: **$0/month** (cancel if not using)
- Vercel: **$0-20/month** (same as current - no change)

**Savings**: Up to $20/month (if you cancel Webflow)

---

## 🎯 **RECOMMENDATION**

### **You Don't Need to Pay More for Vercel**

1. ✅ **Check your current Vercel plan**:
   - Go to: https://vercel.com/dashboard → Settings → Billing
   - See if you're on Hobby (Free) or Pro ($20/month)

2. ✅ **Add domain to existing project**:
   - Adding `rensto.com` to your existing Vercel account is FREE
   - No additional cost for domains

3. ✅ **Monitor bandwidth**:
   - If you exceed 100GB/month on Hobby, upgrade to Pro ($20/month)
   - But you're likely fine with current traffic

### **DNS Change is Required**

Yes, you need to update Cloudflare DNS, but:
- ✅ **I can automate it** (using your Cloudflare API token)
- ✅ **Takes 5 minutes** (manual) or automated
- ✅ **Rollback is easy** (keep old records)

---

## 🚀 **NEXT STEPS**

1. **Check your Vercel plan** (Hobby vs Pro)
2. **Decide**: Manual DNS change or automated script?
3. **Plan**: When to do DNS cutover (recommend: same day as site cutover)
4. **Test**: Staged rollout (10% → 50% → 100% traffic)

**Would you like me to**:
- Create an automated DNS migration script?
- Check your current Vercel plan status?
- Plan the exact DNS cutover timeline?

---

**Bottom Line**: You won't pay more for Vercel - just add the domain. DNS change is required but manageable.

