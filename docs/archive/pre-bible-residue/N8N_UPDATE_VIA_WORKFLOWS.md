# n8n Update via Workflows - No Terminal Required ✅

**Solution**: Use n8n workflows to handle all VPS operations without terminal commands.

---

## ✅ Workflows Created

1. **INT-VPS-001: Upload CSV to VPS** - Uploads products.csv to VPS and copies to n8n container
2. **INT-VPS-002: Update n8n to 1.119.1** - Uploads and executes update script
3. **INT-VPS-003: Validate Workflow** - Imports and validates workflow after update

---

## 🚀 Execution Steps (All via n8n UI)

### Step 1: Upload CSV File

1. **Access n8n UI**: http://172.245.56.50:5678
2. **Import workflow**: `workflows/INT-VPS-001-UPLOAD-CSV.json`
3. **Execute workflow**: Click "Execute Workflow"
4. **Verify**: Check output shows CSV file copied successfully

**How it works**:
- Reads CSV from local file system
- Converts to base64
- Uploads to VPS via SSH (base64 decode)
- Copies to n8n container

### Step 2: Update n8n

1. **Import workflow**: `workflows/INT-VPS-002-UPDATE-N8N.json`
2. **Execute workflow**: Click "Execute Workflow"
3. **Wait**: Update takes 2-5 minutes
4. **Verify**: Check output shows version 1.119.1

**How it works**:
- Reads update script from local file system
- Converts to base64
- Uploads to VPS via SSH (base64 decode)
- Makes script executable
- Executes update script
- Verifies version

### Step 3: Validate Workflow

1. **Import workflow**: `workflows/INT-VPS-003-VALIDATE-WORKFLOW.json`
2. **Execute workflow**: Click "Execute Workflow"
3. **Check validation**: Should show no errors (validation tools now work!)

**How it works**:
- Reads workflow JSON file
- Imports to n8n via API
- Validates workflow via API
- Returns validation results

### Step 4: Test Import Workflow

1. **Import workflow**: `workflows/INT-SYNC-002-BOOST-SPACE-MARKETPLACE-IMPORT.json`
2. **Validate**: Use n8n's validation feature (should work now!)
3. **Execute**: Test import to Boost.space

---

## 📋 Workflow Details

### INT-VPS-001: Upload CSV
- **Read CSV File**: Reads from local file system
- **Convert to Base64**: Converts binary to base64 string
- **Upload CSV to VPS**: SSH command with base64 decode
- **Copy CSV to Container**: Docker cp command
- **Verifies**: File exists in container

### INT-VPS-002: Update n8n
- **Read Update Script**: Reads bash script from local file system
- **Convert to Base64**: Converts binary to base64 string
- **Upload Script to VPS**: SSH command with base64 decode + chmod
- **Execute Update Script**: Runs update script with --yes flag
- **Verify Version**: Checks n8n version is 1.119.1

### INT-VPS-003: Validate Workflow
- **Read Workflow File**: Reads workflow JSON from local file system
- **Import Workflow to n8n**: POST to n8n API
- **Validate Workflow**: POST to n8n validation API
- **Returns**: Validation results

---

## ⚠️ Important Notes

- **SSH Credentials**: Stored in workflow nodes (password: necmad-zYnfe4-fypwip)
- **API Key**: n8n API key stored in workflow nodes
- **File Paths**: Uses absolute paths from your local machine (`/Users/shaifriedman/New Rensto/rensto/`)
- **Execution**: All workflows can be executed from n8n UI - **NO TERMINAL REQUIRED**
- **Base64 Transfer**: Files are converted to base64 for SSH transfer (handles binary data)

---

## 🔍 Troubleshooting

### If SSH node fails:
- Check VPS is accessible: http://172.245.56.50:5678
- Verify SSH credentials are correct in workflow nodes
- Check n8n container is running: `docker ps` (via workflow)

### If base64 decode fails:
- Check file size (very large files may exceed SSH command length)
- Verify base64 conversion in Code node output
- Check SSH command syntax

### If update fails:
- Check backup was created: `/root/n8n-backups/` (via SSH workflow)
- Review workflow execution logs in n8n UI
- Check n8n container logs: `docker logs n8n_rensto` (via SSH workflow)

### If validation fails:
- Ensure n8n is updated to 1.119.1 (check via INT-VPS-002)
- Check workflow JSON is valid (syntax check)
- Verify API key is correct in workflow node

---

## ✅ Benefits

1. **No Terminal Required**: Everything runs via n8n UI
2. **Automated**: All steps in single workflows
3. **Repeatable**: Can re-run workflows anytime
4. **Auditable**: Full execution logs in n8n
5. **Safe**: Includes verification steps

---

## 📝 Next Steps After Update

1. ✅ Validate INT-SYNC-002 workflow (should work now!)
2. ✅ Test import (products.csv → Boost.space)
3. ✅ Create import workflows for:
   - Affiliate Links (affiliates.csv)
   - Purchases (purchases.csv - when available)
4. ✅ Update API routes to use Boost.space
5. ✅ Test marketplace page functionality

---

**Status**: ✅ All workflows ready for execution via n8n UI - **NO TERMINAL REQUIRED!**

**Files Created**:
- `workflows/INT-VPS-001-UPLOAD-CSV.json`
- `workflows/INT-VPS-002-UPDATE-N8N.json`
- `workflows/INT-VPS-003-VALIDATE-WORKFLOW.json`
- `docs/infrastructure/N8N_UPDATE_VIA_WORKFLOWS.md`
