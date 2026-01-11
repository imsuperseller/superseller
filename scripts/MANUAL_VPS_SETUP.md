# Manual VPS Setup Instructions

**Issue**: Terminal commands via Cursor are hanging/stuck.  
**Solution**: Run these commands manually in your local terminal.

---

## Step 1: Check VPS Health

Open your terminal and run:

```bash
# Test ping
ping -c 3 172.245.56.50

# Test SSH (should prompt for password: necmad-zYnfe4-fypwip)
ssh root@172.245.56.50 "echo 'SSH works'"

# Check Docker
ssh root@172.245.56.50 "docker ps"

# Check n8n container
ssh root@172.245.56.50 "docker exec n8n_rensto n8n --version"
```

---

## Step 2: Upload CSV File

```bash
# From your local machine
cd "/Users/shaifriedman/New Rensto/rensto"

# Upload CSV to VPS
scp scripts/boost-space/exports/products.csv root@172.245.56.50:/tmp/products.csv

# SSH into VPS
ssh root@172.245.56.50

# Copy CSV to n8n data directory
docker exec n8n_rensto mkdir -p /home/node/.n8n/data
docker cp /tmp/products.csv n8n_rensto:/home/node/.n8n/data/products.csv

# Verify file exists
docker exec n8n_rensto ls -la /home/node/.n8n/data/products.csv
```

---

## Step 3: Upload & Run Update Script

```bash
# From your local machine (still in rensto directory)
scp scripts/n8n-backup-and-update-1.119.1.sh root@172.245.56.50:/opt/n8n/

# SSH into VPS
ssh root@172.245.56.50

# Navigate to n8n directory
cd /opt/n8n

# Make script executable
chmod +x n8n-backup-and-update-1.119.1.sh

# Run update script (auto-confirms with --yes)
bash n8n-backup-and-update-1.119.1.sh --yes
```

**Expected output**:
- Backup created in `/root/n8n-backups/YYYY-MM-DD_HHMMSS/`
- n8n updated to 1.119.1
- Health check passed
- Version verified

---

## Step 4: Verify Update

```bash
# Check version
docker exec n8n_rensto n8n --version

# Check health
docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz && echo "✅ Healthy" || echo "❌ Not healthy"

# Check logs
docker logs n8n_rensto --tail 50
```

---

## Step 5: Import & Validate Workflow

1. **Access n8n UI**: http://172.245.56.50:5678

2. **Import workflow**:
   - Click "Import from File"
   - Select: `workflows/INT-SYNC-002-BOOST-SPACE-MARKETPLACE-IMPORT.json`
   - Click "Import"

3. **Validate workflow**:
   - Open the imported workflow
   - Click "Validate" button (should work now with n8n 1.119.1)
   - Check for any errors

4. **Test execution**:
   - Click "Execute Workflow"
   - Verify it reads CSV and imports products to Boost.space

---

## Troubleshooting

### If SSH hangs:
- Check your network connection
- Try: `ssh -v root@172.245.56.50` for verbose output
- Check if port 22 is blocked

### If Docker commands fail:
- Check if Docker is running: `ssh root@172.245.56.50 "systemctl status docker"`
- Check container name: `ssh root@172.245.56.50 "docker ps -a | grep n8n"`

### If update fails:
- Check backup location: `/root/n8n-backups/`
- Review logs: `docker logs n8n_rensto`
- Restore from backup if needed (see update script)

---

## Quick Reference

**VPS IP**: 172.245.56.50  
**VPS User**: root  
**VPS Password**: necmad-zYnfe4-fypwip  
**n8n URL**: http://172.245.56.50:5678  
**Container Name**: n8n_rensto  
**CSV Location**: `/home/node/.n8n/data/products.csv` (inside container)

---

**Note**: All commands should be run in your local terminal, not via Cursor's terminal tool.

