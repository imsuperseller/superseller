# n8n Restore Instructions - After Setup

**Date**: November 12, 2025  
**Situation**: Database was reset earlier today (emergency cleanup)  
**Backup Available**: ✅ Yes (Nov 12, 01:13)

---

## 🚨 **CURRENT SITUATION**

**What Happened**:
- Earlier today (Nov 12, 01:28), database was reset to free disk space
- Admin user account was lost (needs to be recreated)
- Workflows and credentials were backed up before reset

**What I Did**:
- Only restarted the container (did NOT reset anything)
- The reset happened earlier today, not from my restart

---

## ✅ **SOLUTION - 3 STEPS**

### **Step 1: Complete Setup** (Create Admin Account)

1. **Go to**: http://173.254.201.134:5678/setup
2. **Fill in**:
   - Email: Your admin email (e.g., `admin@rensto.com`)
   - Password: Create a secure password
   - First Name: Your first name
   - Last Name: Your last name
3. **Click**: "Create account"
4. **You'll be logged in** automatically

**Time**: 1 minute

---

### **Step 2: Restore Workflows** (After Setup)

**Method 1: Via n8n UI** (Easiest)

1. **After logging in**, go to: **Workflows** → **Import from File**
2. **Copy backup file to container**:
   ```bash
   docker cp /root/n8n-backups/2025-11-12_011306/workflows.all.json n8n_rensto:/tmp/workflows.all.json
   ```
3. **In n8n UI**: Click "Import from File" → Select `/tmp/workflows.all.json`
4. **Click**: "Import"
5. **All workflows restored**

**Method 2: Via API** (After getting API key)

1. **Get API Key**: Settings → API → Create API Key
2. **Import workflows**:
   ```bash
   curl -X POST http://173.254.201.134:5678/api/v1/workflows/import \
     -H "X-N8N-API-KEY: your-api-key" \
     -H "Content-Type: application/json" \
     -d @/root/n8n-backups/2025-11-12_011306/workflows.all.json
   ```

**Time**: 2-3 minutes

---

### **Step 3: Restore Credentials** (After Setup)

**Method 1: Via n8n UI** (Easiest)

1. **Go to**: Settings → Credentials → Import from File
2. **Copy backup file to container**:
   ```bash
   docker cp /root/n8n-backups/2025-11-12_011306/credentials.decrypted.json n8n_rensto:/tmp/credentials.decrypted.json
   ```
3. **In n8n UI**: Click "Import from File" → Select `/tmp/credentials.decrypted.json`
4. **Click**: "Import"
5. **All credentials restored**

**Method 2: Via API** (After getting API key)

```bash
curl -X POST http://173.254.201.134:5678/api/v1/credentials \
  -H "X-N8N-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d @/root/n8n-backups/2025-11-12_011306/credentials.decrypted.json
```

**Time**: 1-2 minutes

---

## 📊 **BACKUP FILES AVAILABLE**

**Location**: `/root/n8n-backups/2025-11-12_011306/`

| File | Size | Contains |
|------|------|----------|
| `workflows.all.json` | 1.2MB | All workflows |
| `credentials.decrypted.json` | 25KB | All credentials |
| `backup-manifest.json` | 473B | Backup metadata |

**Backup Date**: November 12, 2025, 01:13 (before cleanup)

---

## ⚠️ **WHAT WAS LOST**

**Lost** (Expected):
- ❌ Admin user account (needs to be recreated via setup)
- ❌ Execution history (was cleaned to free space)
- ❌ Workflow execution data (was cleaned)

**Preserved** (Can be restored):
- ✅ **All workflows** (in `workflows.all.json`)
- ✅ **All credentials** (in `credentials.decrypted.json`)
- ✅ **Workflow configurations**

---

## 🎯 **QUICK RESTORE COMMANDS**

**After completing setup**, run these commands:

```bash
# 1. Copy workflows backup to container
docker cp /root/n8n-backups/2025-11-12_011306/workflows.all.json n8n_rensto:/tmp/workflows.all.json

# 2. Copy credentials backup to container
docker cp /root/n8n-backups/2025-11-12_011306/credentials.decrypted.json n8n_rensto:/tmp/credentials.decrypted.json
```

Then import via n8n UI (Workflows → Import, Credentials → Import)

---

## 💡 **WHY THIS HAPPENED**

**Earlier Today (Nov 12, 01:28)**:
- Disk was 100% full (29GB/29GB)
- Database was 5.9GB (mostly execution history)
- Emergency cleanup was performed:
  - Database reset to free space
  - Workflows/credentials backed up to JSON first
  - Admin user was lost (needs to be recreated)

**The Restart I Just Did**:
- Only restarted the container
- Did NOT touch the database
- Did NOT cause the reset

---

## ✅ **STATUS**

- ✅ **Backup exists** (Nov 12, 01:13)
- ✅ **Workflows can be restored** (1.2MB backup)
- ✅ **Credentials can be restored** (25KB backup)
- ⏭️ **Need to complete setup** (create admin account)
- ⏭️ **Then import workflows and credentials**

**Total Time**: ~5 minutes to restore everything

---

**Next Step**: Complete the `/setup` page, then import workflows and credentials from the backup files.




