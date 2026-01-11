# n8n Migration Instructions - Old VPS to New VPS

**Date**: January 2, 2025  
**Old VPS**: 172.245.56.50 (29GB, 100% full)  
**New VPS**: 172.245.56.50 (100GB, 6GB RAM, 5 vCPU)

---

## 🚀 Quick Start

### **Option 1: Automated Migration (Recommended)**

If you have SSH access to both VPS:

```bash
# From your local machine
cd /Users/shaifriedman/New\ Rensto/rensto

# Run migration script
bash scripts/migrate-n8n-to-new-vps.sh
```

### **Option 2: Manual Migration**

Follow the steps below.

---

## 📋 Manual Migration Steps

### **Step 1: Setup New VPS**

SSH into the new VPS and run:

```bash
# Upload setup script
scp scripts/setup-new-n8n-vps.sh root@172.245.56.50:/root/

# SSH into new VPS
ssh root@172.245.56.50

# Run setup script
bash /root/setup-new-n8n-vps.sh
```

This will:
- ✅ Update system packages
- ✅ Install Docker and Docker Compose
- ✅ Create n8n directory structure
- ✅ Check disk space and Docker status

### **Step 2: Transfer Backup**

From your local machine or old VPS:

```bash
# Transfer backup (881M compressed)
scp root@172.245.56.50:/root/n8n-backups/2025-12-05_195047/2025-12-05_195047-compressed.tgz \
    root@172.245.56.50:/root/n8n-backups/
```

### **Step 3: Create docker-compose.yml on New VPS**

SSH into new VPS:

```bash
ssh root@172.245.56.50

# Create directory
mkdir -p /opt/n8n

# Create docker-compose.yml
cat > /opt/n8n/docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:1.122.5
    container_name: n8n_rensto
    restart: unless-stopped
    ports:
      - '5678:5678'
    environment:
      - RESTRICT_FILE_ACCESS_TO=/tmp/n8n-data
      - BLOCK_FILE_ACCESS_TO_N8N_FILES=false
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD:-changeme}
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://172.245.56.50:5678
      - N8N_EDITOR_BASE_URL=http://172.245.56.50:5678
      - DB_TYPE=sqlite
      - DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite
      - EXECUTIONS_DATA_SAVE_ON_ERROR=all
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
      - EXECUTIONS_DATA_MAX_AGE=168
    volumes:
      - n8n_n8n_data:/home/node/.n8n
    networks:
      - n8n-network

volumes:
  n8n_n8n_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/n8n/data/n8n

networks:
  n8n-network:
    driver: bridge
EOF
```

### **Step 4: Restore Data Volume**

On new VPS:

```bash
# Create data directory
mkdir -p /opt/n8n/data/n8n

# Extract backup
cd /root/n8n-backups
tar xzf 2025-12-05_195047-compressed.tgz -C /tmp/n8n-restore

# Restore data volume
cd /opt/n8n/data/n8n
tar xzf /tmp/n8n-restore/n8n-data-backup.tgz

# Fix permissions
chown -R 1000:1000 /opt/n8n/data/n8n

# Cleanup
rm -rf /tmp/n8n-restore
```

### **Step 5: Start n8n**

On new VPS:

```bash
cd /opt/n8n
docker-compose up -d n8n

# Wait for startup
sleep 10

# Check version
docker exec n8n_rensto n8n --version

# Check health
docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz && echo "✅ Healthy"
```

### **Step 6: Verify**

1. **Access n8n**: http://172.245.56.50:5678
2. **Login**: Use your existing credentials (preserved in backup)
3. **Verify workflows**: Check that all workflows are present
4. **Verify credentials**: Check that all credentials are working
5. **Test workflow**: Execute a simple workflow to ensure everything works

---

## 🔧 Update DNS/Configuration

If you're using `n8n.rensto.com`:

1. **Update Cloudflare DNS**:
   - Change A record for `n8n.rensto.com` from `172.245.56.50` to `172.245.56.50`
   - Wait for DNS propagation (5-10 minutes)

2. **Update Webhook URLs** (if needed):
   - Some workflows may reference the old IP
   - Update them to use `http://172.245.56.50:5678` or `https://n8n.rensto.com`

---

## ✅ Verification Checklist

- [ ] New VPS setup complete (Docker installed)
- [ ] Backup transferred to new VPS
- [ ] docker-compose.yml created
- [ ] Data volume restored
- [ ] n8n container running
- [ ] Version confirmed: 1.122.5
- [ ] Health check passed
- [ ] Can access UI: http://172.245.56.50:5678
- [ ] Can login (credentials preserved)
- [ ] All workflows present
- [ ] All credentials working
- [ ] Test workflow executes successfully
- [ ] DNS updated (if using domain)
- [ ] Webhook URLs updated (if needed)

---

## 🚨 Troubleshooting

### **Issue: Can't SSH to new VPS**

**Solution**: 
- Check RackNerd control panel for root password
- Or set up SSH key access via RackNerd panel

### **Issue: Backup transfer fails**

**Solution**:
- Check disk space on new VPS: `df -h /`
- Try transferring from old VPS directly: `scp` from old to new

### **Issue: n8n won't start**

**Solution**:
- Check logs: `docker logs n8n_rensto`
- Check permissions: `ls -la /opt/n8n/data/n8n`
- Fix permissions: `chown -R 1000:1000 /opt/n8n/data/n8n`

### **Issue: Can't login**

**Solution**:
- Credentials are in the database backup
- If login fails, check docker-compose.yml environment variables
- Default user/pass may need to be set

---

## 📊 New VPS Specs

- **IP**: 172.245.56.50
- **Disk**: 100 GB (vs 29GB old)
- **RAM**: 6 GB (vs 2GB old)
- **CPU**: 5 vCPU (vs 2 vCPU old)
- **OS**: Ubuntu 24.04

---

**Last Updated**: January 2, 2025  
**Migration Script**: `scripts/migrate-n8n-to-new-vps.sh`  
**Setup Script**: `scripts/setup-new-n8n-vps.sh`
