# n8n Installation for Wonder.Care - Complete DIY Guide

## 🚨 IMPORTANT: SSH Access Required First

The credentials you provided (vmuser275199 / mcEJVMG637) appear to be for the **RackNerd Control Panel**, not SSH access to the server itself.

---

## 📋 Step 1: Get SSH Access to Your Server

### Option A: Enable Password Authentication (Easiest)

1. **Log into RackNerd Client Area:**
   - Go to: https://my.racknerd.com/
   - Username: vmuser275199
   - Password: mcEJVMG637

2. **Access the Console:**
   - Click on your VPS (racknerd-0ab0933)
   - Click "Console" or "VNC"
   - This gives you direct access to the server

3. **Set Root Password (in console):**
   ```bash
   sudo passwd root
   # Enter new password twice
   ```

4. **Enable SSH Password Authentication:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
   
   Find and change these lines:
   ```
   PasswordAuthentication yes
   PermitRootLogin yes
   ```
   
   Save (Ctrl+X, Y, Enter)

5. **Restart SSH:**
   ```bash
   sudo systemctl restart sshd
   ```

6. **Now you can SSH:**
   ```bash
   ssh root@192.227.249.73
   # Enter the password you just created
   ```

### Option B: Use SSH Keys (More Secure)

1. **Generate SSH key on your computer:**
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/wondercare_rsa
   ```

2. **Copy public key:**
   ```bash
   cat ~/.ssh/wondercare_rsa.pub
   # Copy the output
   ```

3. **Add to server (via RackNerd Console):**
   ```bash
   mkdir -p ~/.ssh
   echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

4. **SSH with key:**
   ```bash
   ssh -i ~/.ssh/wondercare_rsa root@192.227.249.73
   ```

---

## 🚀 Step 2: Install n8n (Once SSH Access Works)

### Quick Installation (Copy-Paste Entire Script)

Once you can SSH to the server, run this complete script:

```bash
#!/bin/bash
echo "======================================================================"
echo "Installing n8n Community Edition"
echo "======================================================================"

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo apt install -y docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

# Configure firewall
echo "🔥 Configuring firewall..."
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 5678/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

# Create directories
echo "📁 Creating directories..."
mkdir -p $HOME/n8n/{data,backups,logs}
cd $HOME/n8n

# Create docker-compose.yml
echo "📝 Creating Docker configuration..."
cat > docker-compose.yml << 'EOF'
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
    volumes:
      - ./data:/home/node/.n8n
      - ./logs:/home/node/.n8n/logs
    networks:
      - n8n-network
networks:
  n8n-network:
    driver: bridge
EOF

# Start n8n
echo "🚀 Starting n8n..."
docker-compose up -d

# Wait
echo "⏳ Waiting for n8n to start..."
sleep 15

# Show status
echo ""
echo "======================================================================"
echo "✅ Installation Complete!"
echo "======================================================================"
echo ""
echo "🌐 Access n8n at: http://192.227.249.73:5678"
echo ""
echo "📊 Check status:"
echo "  docker ps | grep n8n"
echo ""
echo "📝 View logs:"
echo "  cd $HOME/n8n && docker-compose logs -f n8n"
echo ""
docker-compose ps
echo ""
echo "======================================================================"
```

---

## ✅ Step 3: Verify Installation

```bash
# Check if running
docker ps | grep n8n

# View logs
cd $HOME/n8n
docker-compose logs -f n8n

# Test access
curl -I http://localhost:5678
```

**Expected:** Should see n8n container running and HTTP 200/302 response

---

## 🌐 Step 4: Access n8n

1. **Open browser:** http://192.227.249.73:5678

2. **Create account:**
   - Email: ortal@wonder.care
   - Password: [create strong password - save it securely!]
   - First Name: Ortal
   - Last Name: Flanary

3. **Generate API key:**
   - Go to Settings → API
   - Click "Create API Key"
   - Name: "Management"
   - **SAVE THIS KEY SECURELY**

---

## 🔄 Common Commands

```bash
# View logs
cd $HOME/n8n && docker-compose logs -f n8n

# Restart n8n
cd $HOME/n8n && docker-compose restart

# Stop n8n
cd $HOME/n8n && docker-compose stop

# Start n8n
cd $HOME/n8n && docker-compose start

# Update n8n
cd $HOME/n8n
docker-compose pull
docker-compose up -d

# Check status
docker ps | grep n8n

# Check disk space
df -h

# Check resource usage
docker stats n8n-wondercare
```

---

## 🛟 Troubleshooting

### Cannot SSH to server
- **Problem:** Password authentication disabled or wrong credentials
- **Solution:** Use RackNerd Console (VNC) to enable password auth (see Step 1)

### n8n won't start
```bash
# Check logs
cd $HOME/n8n
docker-compose logs --tail=100 n8n

# Restart
docker-compose restart

# Full restart
docker-compose down
docker-compose up -d
```

### Port already in use
```bash
# Find what's using port 5678
sudo lsof -i :5678

# Kill it if needed
sudo kill -9 <PID>
```

### Out of disk space
```bash
# Check space
df -h

# Clean Docker
docker system prune -a

# Clean old executions (in n8n UI: Settings → Executions → Clear)
```

---

## 📞 Need Help?

**Option 1: RackNerd Console**
- Access via: https://my.racknerd.com/
- Use VNC console to access server directly
- No SSH needed

**Option 2: Contact Support**
- Rensto (Shai): For n8n installation help
- RackNerd Support: For server/SSH access issues
  - API Key: KPRVI-ZWX76-X7GEF

---

## 🎯 What You'll Get

- ✅ Latest n8n Community Edition
- ✅ Docker-based (easy updates)
- ✅ Automatic execution pruning (keeps disk clean)
- ✅ Full access to create workflows
- ✅ Webhook support
- ✅ All integrations available

---

## ⏱️ Installation Time

**5-10 minutes** once SSH access is working

---

## 🔐 Important Notes

1. **Save your n8n password** - no recovery without it
2. **Save your API key** - needed for integrations
3. **Backup regularly** - use docker-compose to stop, tar the data/ folder
4. **Keep updated** - run `docker-compose pull && docker-compose up -d` monthly

---

**Created for:** Ortal Flanary (Wonder.Care)  
**Server IP:** 192.227.249.73  
**Date:** December 12, 2025

