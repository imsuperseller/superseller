# Execute n8n Backup & Update to 1.119.1

## Step 1: Upload Script to VPS

**Option A: Using SCP (from your local machine)**
```bash
scp /Users/shaifriedman/New\ Rensto/rensto/scripts/n8n-backup-and-update-1.119.1.sh root@172.245.56.50:/opt/n8n/
# Password: necmad-zYnfe4-fypwip
```

**Option B: Copy-paste script content**
```bash
ssh root@172.245.56.50
# Password: necmad-zYnfe4-fypwip
cd /opt/n8n
nano n8n-backup-and-update-1.119.1.sh
# Paste script content, save (Ctrl+X, Y, Enter)
chmod +x n8n-backup-and-update-1.119.1.sh
```

## Step 2: Run the Script

```bash
ssh root@172.245.56.50
# Password: necmad-zYnfe4-fypwip
cd /opt/n8n
bash n8n-backup-and-update-1.119.1.sh --yes
```

The script will:
1. ✅ Backup everything (workflows, credentials, community nodes, data volume)
2. ✅ Update n8n to 1.119.1
3. ✅ Verify the update

## Expected Output

You should see:
- Backup progress for each component
- Update progress
- Version verification
- Final success message

## After Update

1. Check n8n is running: http://172.245.56.50:5678
2. Test validation tools work (they should now!)
3. Test the workflow: http://172.245.56.50:5678/workflow/CPyj0qf6tofQQyDT

