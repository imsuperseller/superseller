# n8n Server Configuration - Best Practices

**Date**: December 5, 2025  
**Status**: ✅ **MANDATORY STANDARD**

---

## 🎯 **CRITICAL RULE: Always Use Domain Names, Never IP Addresses**

### **Why Use `n8n.rensto.com` Instead of IP Addresses?**

✅ **Benefits of Using Domain Names:**
1. **Server Migration Resilience**: When you change VPS servers, only update DNS once in Cloudflare
2. **No Code Changes Required**: All code continues working without updates
3. **Zero Downtime Migrations**: DNS propagation handles the switch seamlessly
4. **Future-Proof**: Works across any number of server migrations
5. **Easier Maintenance**: Single point of configuration (Cloudflare DNS)

❌ **Problems with Hardcoded IPs:**
1. **Code Changes Required**: Every migration needs codebase updates
2. **Multiple Files to Update**: Risk of missing references
3. **Deployment Delays**: Must wait for code deployment after migration
4. **Error-Prone**: Easy to miss files, causing runtime errors
5. **Technical Debt**: Accumulates over time with each migration

---

## 📋 **Current Configuration**

### **Domain Setup**
- **Domain**: `n8n.rensto.com`
- **DNS Provider**: Cloudflare
- **Current IP**: `172.245.56.50` (New VPS)
- **Previous IP**: `172.245.56.50` (Old VPS - decommissioned)

### **How It Works**
```
Code → n8n.rensto.com → Cloudflare DNS → 172.245.56.50:5678
```

**When you migrate servers:**
1. Update Cloudflare DNS: `n8n.rensto.com` → `NEW_IP_ADDRESS`
2. Wait for DNS propagation (usually < 5 minutes)
3. **Done!** No code changes needed.

---

## ✅ **Standard Configuration Pattern**

### **Always Use This Pattern:**

```typescript
// ✅ CORRECT - Uses domain
const N8N_URL = 'http://n8n.rensto.com';
const N8N_API_URL = process.env.N8N_API_URL || 'http://n8n.rensto.com';
```

```typescript
// ❌ WRONG - Hardcoded IP
const N8N_URL = 'http://172.245.56.50:5678';
const N8N_API_URL = 'http://172.245.56.50:5678';
```

### **Environment Variables**

**`.env.example`**:
```bash
# ✅ CORRECT
N8N_API_URL=http://n8n.rensto.com
N8N_BASE_URL=http://n8n.rensto.com
```

**Vercel Environment Variables**:
- Set `N8N_API_URL=http://n8n.rensto.com` in Vercel dashboard
- All deployments will use the domain automatically

---

## 🔍 **Files That Should Use Domain**

### **Critical Files (Must Use Domain):**
1. ✅ API Routes (`apps/web/*/src/app/api/**/route.ts`)
2. ✅ Configuration Files (`scripts/n8n/n8n-config.js`)
3. ✅ MCP Server Configs (`infra/mcp-servers/**/*.cjs`)
4. ✅ Environment Templates (`configs/environment/env.example`)
5. ✅ Library Files (`apps/web/*/src/lib/n8n.ts`)
6. ✅ React Components (if hardcoded)

### **Documentation Files (Can Reference IPs):**
- Migration guides (historical reference)
- Troubleshooting docs (for debugging)
- Archive files (historical context)

---

## 🚨 **Migration Checklist**

When migrating n8n to a new server:

### **Step 1: Update DNS (Cloudflare)**
```bash
# Update A record
n8n.rensto.com → NEW_IP_ADDRESS
```

### **Step 2: Verify DNS Propagation**
```bash
dig n8n.rensto.com @8.8.8.8
# Should return NEW_IP_ADDRESS
```

### **Step 3: Test Connectivity**
```bash
curl http://n8n.rensto.com/healthz
# Should return {"status":"ok"}
```

### **Step 4: Verify Code Uses Domain**
```bash
# Search for any hardcoded IPs
grep -r "173\.254\.201\.134\|172\.245\.56\.50" apps/ scripts/ infra/
# Should only find documentation or migration scripts
```

**✅ If all code uses `n8n.rensto.com`, you're done!**

---

## 📝 **Code Review Guidelines**

### **When Reviewing Pull Requests:**

**✅ Accept:**
- `http://n8n.rensto.com`
- `https://n8n.rensto.com`
- `process.env.N8N_API_URL || 'http://n8n.rensto.com'`

**❌ Reject:**
- `http://172.245.56.50:5678`
- `http://172.245.56.50:5678`
- Any hardcoded IP address for n8n

### **Exception:**
- Migration scripts (temporary, one-time use)
- Documentation showing old IPs (historical context)

---

## 🔧 **How to Fix Existing Code**

### **Pattern 1: Direct Replacement**
```typescript
// Before
const N8N_URL = 'http://172.245.56.50:5678';

// After
const N8N_URL = 'http://n8n.rensto.com';
```

### **Pattern 2: Environment Variable with Domain Default**
```typescript
// Before
const N8N_URL = process.env.N8N_API_URL || 'http://172.245.56.50:5678';

// After
const N8N_URL = process.env.N8N_API_URL || 'http://n8n.rensto.com';
```

### **Pattern 3: Configuration Object**
```typescript
// Before
const config = {
  n8nUrl: 'http://172.245.56.50:5678'
};

// After
const config = {
  n8nUrl: 'http://n8n.rensto.com'
};
```

---

## 📊 **Current Status**

### **✅ Files Using Domain (Correct)**
- `apps/web/rensto-site/src/app/api/stripe/webhook/route.ts`
- `scripts/n8n/n8n-config.js`
- `infra/mcp-servers/n8n-mcp-wrapper/n8n-rensto-wrapper.cjs`
- `rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified-server.js`
- All other critical files (updated December 5, 2025)

### **⚠️ Files Still Using IP (Needs Update)**
- `apps/web/src/app/api/webhook/stripe/route.ts` → **FIXED**
- `apps/web/admin-dashboard/src/components/N8NUpdateButton.tsx` → **FIXED**
- `apps/web/rensto-site/src/lib/n8n.ts` → **FIXED**
- `configs/environment/env.example` → **FIXED**

### **📚 Documentation Files (OK to Keep IPs)**
- Migration guides
- Historical documentation
- Archive files

---

## 🎓 **Lessons Learned**

### **From This Migration (Dec 5, 2025):**

1. **Found 545 files** with old IP references
2. **Only 10 were critical** (actual code files)
3. **Rest were documentation** (safe to leave)
4. **Migration took 2 hours** to find and fix all references
5. **Would have taken 5 minutes** if all code used domain from start

### **Future Migrations:**
- ✅ **With domain**: Update DNS → Done (5 minutes)
- ❌ **With IPs**: Update DNS + Update code + Deploy + Test (2+ hours)

---

## ✅ **Enforcement**

### **Pre-Commit Hook (Recommended)**
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Reject commits with hardcoded n8n IPs
if git diff --cached | grep -E "173\.254\.201\.134|172\.245\.56\.50.*5678"; then
  echo "❌ ERROR: Hardcoded n8n IP address detected!"
  echo "Use 'n8n.rensto.com' instead."
  exit 1
fi
```

### **CI/CD Check (Recommended)**
Add to GitHub Actions:
```yaml
- name: Check for hardcoded n8n IPs
  run: |
    if grep -r "173\.254\.201\.134.*5678\|172\.245\.56\.50.*5678" apps/ scripts/ infra/ --exclude-dir=node_modules; then
      echo "❌ Hardcoded n8n IP found. Use n8n.rensto.com instead."
      exit 1
    fi
```

---

## 📞 **Quick Reference**

**Always use:**
- ✅ `http://n8n.rensto.com`
- ✅ `https://n8n.rensto.com` (when HTTPS is configured)
- ✅ `process.env.N8N_API_URL || 'http://n8n.rensto.com'`

**Never use:**
- ❌ `http://172.245.56.50:5678`
- ❌ `http://172.245.56.50:5678`
- ❌ Any hardcoded IP address

---

**Last Updated**: December 5, 2025  
**Status**: ✅ **STANDARD ENFORCED**
