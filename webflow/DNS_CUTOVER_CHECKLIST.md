# ✅ DNS Cutover Checklist

**Date**: TBD (Jan 13, 2026 planned)  
**Domain**: `rensto.com`  
**From**: Webflow  
**To**: Vercel

---

## 📋 **PRE-CUTOVER PREPARATION** (Week Before)

- [ ] **Vercel Setup**
  - [ ] Add `rensto.com` to Vercel project
  - [ ] Add `www.rensto.com` to Vercel project
  - [ ] Get DNS records from Vercel dashboard
  - [ ] Note down A record IP (for root domain)
  - [ ] Note down CNAME target (for www)

- [ ] **Cloudflare Preparation**
  - [ ] Log into Cloudflare Dashboard
  - [ ] Note current DNS records (for rollback)
  - [ ] Add TXT records from Vercel (domain verification)
  - [ ] Wait for domain verification (5-10 minutes)
  - [ ] Verify SSL certificates generated in Vercel

- [ ] **Backup & Documentation**
  - [ ] Screenshot current Cloudflare DNS settings
  - [ ] Document old A record IP (Webflow)
  - [ ] Document old CNAME target (Webflow)
  - [ ] Test rollback plan (know how to revert)

---

## 🚀 **CUTOVER DAY** (Jan 13, 2026)

### **Step 1: Final Checks** (Before DNS Change)

- [ ] Verify all pages migrated to Vercel
- [ ] Test Vercel deployment (via `.vercel.app` URL)
- [ ] Verify Stripe checkout works on Vercel
- [ ] Check SSL certificates ready in Vercel
- [ ] Confirm low-traffic period (if possible)

### **Step 2: DNS Update** (5 minutes)

- [ ] **Update A Record** (Root Domain):
  - [ ] Cloudflare Dashboard → DNS → Edit `rensto.com` A record
  - [ ] Change IP from Webflow IP → Vercel A record IP
  - [ ] OR: Change to CNAME `cname.vercel-dns.com` (if supported)
  - [ ] Set proxy status: **DNS Only** (gray cloud)

- [ ] **Update CNAME Record** (WWW):
  - [ ] Cloudflare Dashboard → DNS → Edit `www.rensto.com` CNAME
  - [ ] Change from `cdn.webflow.com` → `cname.vercel-dns.com`
  - [ ] Set proxy status: **DNS Only** (gray cloud)

### **Step 3: Verification** (15-30 minutes)

- [ ] **DNS Propagation Check**:
  - [ ] Use `dig rensto.com` (check A record)
  - [ ] Use `dig www.rensto.com` (check CNAME)
  - [ ] Use https://dnschecker.org (global propagation)
  - [ ] Wait for propagation (5-30 minutes globally)

- [ ] **SSL Certificate Check**:
  - [ ] Verify SSL active in Vercel dashboard
  - [ ] Test https://rensto.com (should load)
  - [ ] Test https://www.rensto.com (should load)
  - [ ] Check SSL certificate validity (browser)

- [ ] **Page Load Tests**:
  - [ ] Homepage loads correctly
  - [ ] Marketplace page loads
  - [ ] All service pages load
  - [ ] Stripe checkout works
  - [ ] Forms submit correctly
  - [ ] Mobile responsive

### **Step 4: Monitoring** (First Hour)

- [ ] **Error Monitoring**:
  - [ ] Check Vercel logs (no 500 errors)
  - [ ] Check Sentry (no critical errors)
  - [ ] Check browser console (no JS errors)

- [ ] **Performance Monitoring**:
  - [ ] Page load times <2 seconds
  - [ ] API response times <200ms
  - [ ] Stripe webhook deliveries successful

- [ ] **Analytics Monitoring**:
  - [ ] Google Analytics tracking works
  - [ ] Conversion tracking works
  - [ ] No drop in traffic (monitor first hour)

---

## 🔄 **ROLLBACK PLAN** (If Needed)

### **Trigger Rollback If**:
- ❌ Critical errors (500s, site down)
- ❌ Stripe checkout broken
- ❌ >10% error rate
- ❌ User complaints (support tickets)

### **Rollback Steps** (5 minutes)

1. **Cloudflare Dashboard**:
   - [ ] Edit `rensto.com` A record
   - [ ] Change back to Webflow IP (from backup notes)
   - [ ] Edit `www.rensto.com` CNAME
   - [ ] Change back to `cdn.webflow.com`
   - [ ] Save changes

2. **Verification**:
   - [ ] Wait 5 minutes (DNS propagation)
   - [ ] Test rensto.com loads (Webflow)
   - [ ] Verify all pages working

3. **Post-Rollback**:
   - [ ] Document what went wrong
   - [ ] Fix issues in Vercel deployment
   - [ ] Schedule retry (after fixes)

---

## ✅ **POST-CUTOVER** (First 24 Hours)

- [ ] **Monitor Continuously**:
  - [ ] Error rates (<0.1%)
  - [ ] Page load times (<2s)
  - [ ] Stripe conversion rate (no drop)
  - [ ] SEO rankings (no drops)

- [ ] **Fix Any Issues**:
  - [ ] Address minor bugs
  - [ ] Optimize performance
  - [ ] Fix broken links
  - [ ] Update redirects if needed

- [ ] **Analytics**:
  - [ ] Compare traffic (before vs after)
  - [ ] Compare conversion rates
  - [ ] Document any changes

---

## 📊 **SUCCESS CRITERIA**

### **DNS Cutover Successful If**:
- ✅ `rensto.com` resolves to Vercel IP
- ✅ `www.rensto.com` resolves to Vercel CNAME
- ✅ SSL certificates active
- ✅ All pages load correctly
- ✅ Zero critical errors
- ✅ Stripe checkout works
- ✅ DNS propagation complete (global)

---

**Update this checklist as cutover approaches. Review daily during cutover week.**

