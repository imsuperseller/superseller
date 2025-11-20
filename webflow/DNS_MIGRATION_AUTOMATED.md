# 🤖 Automated DNS Migration Guide

**Date**: November 2, 2025  
**Status**: ✅ Script Created and Ready

---

## ✅ **AUTOMATION READY**

I've created an automated Cloudflare DNS migration script that will:

1. ✅ **Backup current DNS** (saves to `data/dns/cloudflare-backup.json`)
2. ✅ **Update root domain** (`rensto.com` A record: Webflow → Vercel)
3. ✅ **Update www subdomain** (`www.rensto.com` CNAME: Webflow → Vercel)
4. ✅ **Provide rollback** (restore from backup if needed)

---

## 📁 **FILES CREATED**

1. **`scripts/dns/migrate-rensto-to-vercel.js`** - Main migration script
2. **`scripts/dns/README.md`** - Complete usage guide
3. **`data/dns/`** - Directory for backup files

---

## 🚀 **QUICK START**

### **Step 1: Get Vercel DNS Values**

Before running, you need DNS values from Vercel:

1. Add `rensto.com` to Vercel project (Settings → Domains)
2. Vercel will show you:
   - A record IP (e.g., `76.76.21.21`)
   - CNAME target (usually `cname.vercel-dns.com`)

### **Step 2: Update Script**

Edit `scripts/dns/migrate-rensto-to-vercel.js`:

```javascript
const VERCEL_DNS = {
  rootDomain: {
    content: 'YOUR_VERCEL_A_RECORD_IP', // ← Update this
  },
  // ...
};
```

### **Step 3: Test (Dry Run)**

```bash
cd /Users/shaifriedman/New\ Rensto/rensto
node scripts/dns/migrate-rensto-to-vercel.js --dry-run
```

**Shows what would change** (no actual changes)

### **Step 4: Execute**

```bash
node scripts/dns/migrate-rensto-to-vercel.js --execute
```

**Makes actual DNS changes** (5 second warning to cancel)

### **Step 5: Rollback (If Needed)**

```bash
node scripts/dns/migrate-rensto-to-vercel.js --rollback
```

**Restores Webflow DNS** from backup

---

## 🔒 **SECURITY**

- ✅ Uses your Cloudflare API token (already configured)
- ✅ Creates backup before changes
- ✅ Dry-run mode for testing
- ✅ Rollback capability

---

## 📊 **FEATURES**

- **Automatic backup** - Saves current DNS before changes
- **Dry-run mode** - Test without making changes
- **Rollback support** - Restore from backup instantly
- **Detailed logging** - See exactly what's happening
- **Error handling** - Clear error messages if something fails

---

**Ready to use when you're ready for DNS cutover (Jan 2026)**

