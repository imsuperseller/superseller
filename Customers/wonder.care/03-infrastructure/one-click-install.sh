#!/bin/bash
###############################################################################
# ONE-CLICK n8n INSTALLER FOR WONDER.CARE
# Run this script directly on your RackNerd server (via Console)
###############################################################################

# Exit on any error
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${BLUE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║          n8n ONE-CLICK INSTALLER - Wonder.Care                   ║
║                  Server: 192.227.249.73                         ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}This will install n8n Community Edition with Docker.${NC}"
echo -e "${YELLOW}Installation time: 5-10 minutes${NC}"
echo ""
read -p "Press ENTER to start installation..."

# Step 1: Update system
echo -e "\n${BLUE}[1/8]${NC} Updating system packages..."
apt update -qq && apt upgrade -y -qq

# Step 2: Install dependencies
echo -e "${BLUE}[2/8]${NC} Installing dependencies..."
apt install -y -qq curl wget git ufw >/dev/null 2>&1

# Step 3: Install Docker
echo -e "${BLUE}[3/8]${NC} Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh >/dev/null 2>&1
fi

# Step 4: Install Docker Compose
echo -e "${BLUE}[4/8]${NC} Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt install -y -qq docker-compose >/dev/null 2>&1
fi

# Step 5: Configure firewall
echo -e "${BLUE}[5/8]${NC} Configuring firewall..."
ufw allow 22/tcp >/dev/null 2>&1
ufw allow 5678/tcp >/dev/null 2>&1
ufw allow 80/tcp >/dev/null 2>&1
ufw allow 443/tcp >/dev/null 2>&1
echo "y" | ufw enable >/dev/null 2>&1

# Step 6: Create directory structure
echo -e "${BLUE}[6/8]${NC} Creating n8n directories..."
mkdir -p /root/n8n/{data,backups,logs}
cd /root/n8n

# Step 7: Create Docker Compose file
echo -e "${BLUE}[7/8]${NC} Creating Docker configuration..."
cat > docker-compose.yml << 'DOCKERCOMPOSE'
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
DOCKERCOMPOSE

# Step 8: Start n8n
echo -e "${BLUE}[8/8]${NC} Starting n8n..."
docker-compose up -d >/dev/null 2>&1

# Wait for n8n to start
echo -e "${YELLOW}Waiting for n8n to start...${NC}"
sleep 15

# Show status
docker-compose ps

# Final message
clear
echo -e "${GREEN}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║                  ✅ INSTALLATION COMPLETE!                       ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${GREEN}✅ n8n is now running!${NC}"
echo ""
echo "🌐 Access n8n at: ${BLUE}http://192.227.249.73:5678${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Open browser to http://192.227.249.73:5678"
echo "  2. Create account (use: ortal@wonder.care)"
echo "  3. Start creating workflows!"
echo ""
echo "🔧 Useful commands:"
echo "  View logs:     cd /root/n8n && docker-compose logs -f n8n"
echo "  Restart n8n:   cd /root/n8n && docker-compose restart"
echo "  Stop n8n:      cd /root/n8n && docker-compose stop"
echo "  Update n8n:    cd /root/n8n && docker-compose pull && docker-compose up -d"
echo ""
echo -e "${GREEN}Installation completed successfully!${NC}"
echo ""

