# n8n Community Edition Installation Guide
## Wonder.Care (Ortal Flanary) - RackNerd VPS

**Server Details:**
- Hostname: racknerd-0ab0933
- IPv4: 192.227.249.73
- OS: Ubuntu 24.04 64 Bit
- Memory: 4 GB
- Disk: 130 GB
- Bandwidth: 2.93 TB
- Node: DAL175KVM
- API Key: KPRVI-ZWX76-X7GEF
- API Hash: 1cfb36cef451d82978b46aba19891f22b2e81dc7

**Target n8n Version:** Latest Community Edition (v1.122.5+)

---

## Installation Method: Docker (Recommended)

We'll use Docker for easier management, updates, and backups.

### Prerequisites Checklist
- [x] Ubuntu 24.04 installed
- [ ] Root/sudo access
- [ ] Port 5678 open (n8n default)
- [ ] Port 80/443 open (for SSL/domain)
- [ ] Domain/subdomain configured (optional but recommended)

---

## Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git ufw

# Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 5678/tcp  # n8n
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Step 2: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose

# Verify installation
docker --version
docker-compose --version
```

**⚠️ IMPORTANT:** Log out and back in for group changes to take effect.

---

## Step 3: Create n8n Directory Structure

```bash
# Create working directory
mkdir -p /home/ubuntu/n8n
cd /home/ubuntu/n8n

# Create subdirectories
mkdir -p data backups logs
```

---

## Step 4: Create Docker Compose Configuration

Create `/home/ubuntu/n8n/docker-compose.yml` with the following content:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-wondercare
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=192.227.249.73
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://192.227.249.73:5678/
      - GENERIC_TIMEZONE=America/Los_Angeles
      - N8N_EDITOR_BASE_URL=http://192.227.249.73:5678/
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console,file
      - N8N_LOG_FILE_LOCATION=/home/node/.n8n/logs/
    volumes:
      - ./data:/home/node/.n8n
      - ./logs:/home/node/.n8n/logs
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
```

---

## Step 5: Start n8n

```bash
cd /home/ubuntu/n8n

# Start n8n
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f n8n
```

**Expected Output:**
```
n8n-wondercare | n8n ready on http://192.227.249.73:5678
n8n-wondercare | Editor is now accessible via: http://192.227.249.73:5678/
```

---

## Step 6: Initial Setup

1. **Access n8n:** Open browser to `http://192.227.249.73:5678`
2. **Create owner account:**
   - Email: ortal@wonder.care (or preferred email)
   - Password: (strong password - 12+ characters)
   - First Name: Ortal
   - Last Name: Flanary

3. **Configure settings:**
   - Go to Settings → User Settings
   - Set timezone: America/Los_Angeles (or preferred)
   - Enable 2FA (recommended)

---

## Step 7: Generate API Key

```bash
# Once logged into n8n UI:
# 1. Go to Settings → API
# 2. Click "Create API Key"
# 3. Name: "Rensto Management"
# 4. Copy and save the key securely
```

**Store API key in:** `/home/ubuntu/n8n/.env` (create if doesn't exist)

---

## Step 8: Setup Automatic Backups

Create `/home/ubuntu/n8n/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/n8n/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="n8n_backup_${TIMESTAMP}.tar.gz"

# Stop n8n
cd /home/ubuntu/n8n
docker-compose stop

# Create backup
tar -czf ${BACKUP_DIR}/${BACKUP_FILE} data/

# Start n8n
docker-compose start

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "n8n_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

```bash
# Make executable
chmod +x /home/ubuntu/n8n/backup.sh

# Add to crontab (daily at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/ubuntu/n8n/backup.sh") | crontab -
```

---

## Step 9: Setup SSL (Optional but Recommended)

### Option A: Using Cloudflare Tunnel (Recommended)
1. Install cloudflared
2. Create tunnel
3. Route domain to n8n

### Option B: Using Nginx + Let's Encrypt
1. Install Nginx
2. Configure reverse proxy
3. Install Certbot
4. Generate SSL certificate

**Domain Suggestion:** `n8n.wonder.care` or `automation.wonder.care`

---

## Step 10: Import Existing Make.com Workflows

Once n8n is running:

1. **Export from Make.com:**
   - Go to each scenario
   - Click "Export blueprint"
   - Save JSON files

2. **Convert to n8n format:**
   - We'll need to manually recreate (Make.com → n8n conversion requires mapping)
   - Use existing workflows in `/Customers/wonder.care/02-workflows/` as reference

3. **Import to n8n:**
   - Go to Workflows → Import from File
   - Select converted workflow JSON
   - Configure credentials
   - Test execution

---

## Maintenance Commands

```bash
# View logs
docker-compose logs -f n8n

# Restart n8n
docker-compose restart

# Stop n8n
docker-compose stop

# Start n8n
docker-compose start

# Update n8n to latest version
docker-compose pull
docker-compose up -d

# Check disk usage
df -h
du -sh /home/ubuntu/n8n/data

# Check container stats
docker stats n8n-wondercare
```

---

## Monitoring & Health Checks

```bash
# Check if n8n is running
curl -I http://192.227.249.73:5678/healthz

# Check container health
docker ps | grep n8n-wondercare

# Check resource usage
docker stats --no-stream n8n-wondercare
```

---

## Troubleshooting

### Issue: Cannot access n8n UI
```bash
# Check if container is running
docker ps -a | grep n8n

# Check logs for errors
docker-compose logs --tail=100 n8n

# Restart container
docker-compose restart
```

### Issue: Port already in use
```bash
# Find process using port 5678
sudo lsof -i :5678

# Kill process if needed
sudo kill -9 <PID>
```

### Issue: Out of disk space
```bash
# Check disk usage
df -h

# Clean old executions (in n8n UI: Settings → Executions)
# Or via command line:
docker exec n8n-wondercare n8n execute --prune

# Clean Docker
docker system prune -a
```

---

## Security Checklist

- [ ] Strong password for n8n admin account
- [ ] API key generated and stored securely
- [ ] Firewall configured (UFW)
- [ ] Regular backups enabled
- [ ] SSL certificate installed (if using domain)
- [ ] 2FA enabled for admin account
- [ ] Regular updates scheduled
- [ ] Webhook secrets configured for all webhook workflows

---

## Next Steps After Installation

1. ✅ n8n installed and accessible
2. ⏭️ Configure credentials (Google Sheets, Monday.com, etc.)
3. ⏭️ Import existing workflows from Make.com
4. ⏭️ Test all workflows
5. ⏭️ Configure monitoring/alerts
6. ⏭️ Setup MCP server for Rensto access (optional)

---

## Support Contacts

**Rensto (Shai Friedman)**
- For technical support with n8n setup
- For workflow migration assistance

**RackNerd Support**
- For VPS-related issues
- API Key: KPRVI-ZWX76-X7GEF

---

## Installation Status

- [ ] Docker installed
- [ ] n8n container running
- [ ] Initial account created
- [ ] API key generated
- [ ] Backups configured
- [ ] SSL configured (optional)
- [ ] Firewall configured
- [ ] First workflow imported
- [ ] Tested and verified

**Installed By:** _______________  
**Date:** _______________  
**n8n Version:** _______________  
**API Key Location:** _______________

