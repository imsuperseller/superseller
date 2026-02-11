# 🌐 DNS Migration Scripts

**Purpose**: Automate Cloudflare DNS changes for rensto.com migration

---

## 📋 **SETUP**

### **1. Get Vercel DNS Values**

Before running the migration script, you need to get DNS values from Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add `rensto.com` and `www.rensto.com` to your project
3. Vercel will show you:
   - **A record IP** (for root domain)
   - **CNAME target** (for www - usually `cname.vercel-dns.com`)

### **2. Update Script Configuration**

Edit `scripts/dns/migrate-rensto-to-vercel.js`:

```javascript
const VERCEL_DNS = {
  rootDomain: {
    content: '76.76.21.21', // ← UPDATE THIS with Vercel's A record IP
    // ... rest stays the same
  },
  wwwDomain: {
    content: 'cname.vercel-dns.com', // ← Usually this (verify in Vercel)
    // ... rest stays the same
  }
};
```

### **3. Set Environment Variable (Optional)**

```bash
export CLOUDFLARE_API_TOKEN="UH1jMzVfPgk2NxMkrmucvgIK5xv4Q_tTvtb3zvo1"
```

Or the script will use the token from the code (hardcoded).

---

## 🚀 **USAGE**

### **Step 1: Dry Run** (Test without making changes)

```bash
cd /Users/shaifriedman/New\ Rensto/rensto
node scripts/dns/migrate-rensto-to-vercel.js --dry-run
```

**What it does**:
- ✅ Fetches current DNS records
- ✅ Creates backup file
- ✅ Shows what would be changed
- ❌ Makes NO actual changes

**Output**: Shows what records would be updated (Webflow → Vercel)

### **Step 2: Execute** (Make actual changes)

```bash
node scripts/dns/migrate-rensto-to-vercel.js --execute
```

**What it does**:
- ⚠️ **5 second warning** (press Ctrl+C to cancel)
- ✅ Creates backup
- ✅ Updates DNS records to point to Vercel
- ✅ Saves backup for rollback

**Output**: Confirms changes made, next steps

### **Step 3: Rollback** (If needed)

```bash
node scripts/dns/migrate-rensto-to-vercel.js --rollback
```

**What it does**:
- ✅ Loads backup file
- ✅ Restores DNS records to Webflow
- ✅ Points rensto.com back to Webflow

**When to use**: If Vercel deployment has issues, rollback immediately

---

## 📊 **WHAT THE SCRIPT DOES**

### **Changes Made**:

1. **Root Domain (`rensto.com`)**:
   - Updates A record: Webflow IP → Vercel IP
   - Sets proxy status: DNS Only (gray cloud)

2. **WWW Subdomain (`www.rensto.com`)**:
   - Updates CNAME: `cdn.webflow.com` → `cname.vercel-dns.com`
   - Sets proxy status: DNS Only (gray cloud)

### **Backup Created**:

- Location: `data/dns/cloudflare-backup.json`
- Contains: All DNS records before migration
- Used for: Rollback if needed

---

## ⚠️ **IMPORTANT NOTES**

### **Before Running**:

1. ✅ **Update Vercel DNS values** in the script
2. ✅ **Add domain to Vercel** first (get DNS values)
3. ✅ **Run dry-run first** to verify
4. ✅ **Schedule during low-traffic** period
5. ✅ **Have rollback plan ready**

### **After Running**:

1. ⏱️ **Wait 5-30 minutes** for DNS propagation
2. ✅ **Check DNS propagation**: https://dnschecker.org
3. ✅ **Verify SSL certificates** in Vercel
4. ✅ **Test rensto.com** loads correctly
5. ✅ **Monitor for errors** first hour

### **Rollback Triggers**:

Rollback immediately if:
- ❌ Site down (500 errors)
- ❌ Stripe checkout broken
- ❌ Critical functionality broken
- ❌ >10% error rate

---

## 🔍 **VERIFICATION COMMANDS**

### **Check DNS Propagation**:

```bash
# Check root domain
dig rensto.com +short

# Check www subdomain
dig www.rensto.com +short

# Check from multiple locations
# Use: https://dnschecker.org
```

### **Check SSL Certificates**:

```bash
# Check SSL
openssl s_client -connect rensto.com:443 -servername rensto.com

# Or use: https://www.ssllabs.com/ssltest/
```

---

## 📋 **CHECKLIST**

Before migration:
- [ ] Domain added to Vercel project
- [ ] Vercel DNS values obtained
- [ ] Script updated with Vercel DNS values
- [ ] Dry-run executed successfully
- [ ] Backup file created
- [ ] Low-traffic period scheduled

During migration:
- [ ] Execute script (`--execute`)
- [ ] Verify backup created
- [ ] Confirm changes in Cloudflare dashboard

After migration:
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Check DNS propagation globally
- [ ] Verify SSL certificates active
- [ ] Test all pages load
- [ ] Test Stripe checkout
- [ ] Monitor for errors

---

## 🐛 **TROUBLESHOOTING**

### **Error: "Domain not found in Cloudflare"**

- Check domain is in your Cloudflare account
- Verify API token has correct permissions

### **Error: "Failed to update DNS record"**

- Check API token permissions (needs DNS edit access)
- Verify record ID is correct
- Check Cloudflare dashboard for errors

### **DNS not propagating**

- Wait longer (can take up to 48 hours globally)
- Check TTL values (lower = faster propagation)
- Verify records in Cloudflare dashboard

---

**Last Updated**: November 2, 2025

