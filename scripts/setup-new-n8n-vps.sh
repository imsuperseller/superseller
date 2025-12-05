#!/bin/bash
# 🚀 Setup New n8n VPS (172.245.56.50)
# Run this script on the NEW VPS to prepare it for n8n migration

set -e

echo "🚀 SETTING UP NEW N8N VPS"
echo "=========================="
echo "IP: 172.245.56.50"
echo "Date: $(date)"
echo ""

# Update system
echo "📦 Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install Docker
echo ""
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo ""
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose-plugin
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Create n8n directory
echo ""
echo "📁 Creating n8n directory structure..."
mkdir -p /opt/n8n/data/n8n
mkdir -p /root/n8n-backups
chmod 755 /opt/n8n
chmod 755 /root/n8n-backups
echo "✅ Directories created"

# Check disk space
echo ""
echo "💾 Disk Space:"
df -h / | tail -1

# Check Docker
echo ""
echo "🐳 Docker Status:"
docker --version
docker-compose --version

# Check firewall
echo ""
echo "🔥 Firewall Status:"
if command -v ufw &> /dev/null; then
    ufw status || echo "UFW not configured"
else
    echo "UFW not installed"
fi

echo ""
echo "✅ VPS SETUP COMPLETE!"
echo "======================"
echo "Next steps:"
echo "1. Transfer backup from old VPS: /root/n8n-backups/2025-12-05_195047/"
echo "2. Create docker-compose.yml in /opt/n8n/"
echo "3. Restore data volume from backup"
echo "4. Start n8n container"
