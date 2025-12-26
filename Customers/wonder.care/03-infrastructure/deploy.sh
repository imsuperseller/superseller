#!/bin/bash
###############################################################################
# Deploy n8n to Wonder.Care Server - Run this from YOUR local machine
# This script will copy files and provide instructions
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER="192.227.249.73"
SERVER_USER="ubuntu"
LOCAL_DIR="/Users/shaifriedman/New Rensto/rensto/Customers/wonder.care/03-infrastructure"

echo -e "${BLUE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║         n8n Deployment Script - Wonder.Care (Ortal)             ║
║                  Server: 192.227.249.73                         ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo "This script will copy installation files to the server."
echo "You'll need SSH access to ${SERVER_USER}@${SERVER}"
echo ""
read -p "Do you have SSH access to the server? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}No problem! Here are the manual steps:${NC}"
    echo ""
    echo "OPTION A: Copy files manually"
    echo "──────────────────────────────────────────────────────────"
    echo "1. Copy these files to the server:"
    echo "   - install-n8n.sh"
    echo "   - verify-n8n.sh"
    echo "   - commands.sh"
    echo ""
    echo "2. On the server, run:"
    echo "   chmod +x install-n8n.sh"
    echo "   ./install-n8n.sh"
    echo ""
    echo "OPTION B: Use this exact command (requires SSH password):"
    echo "──────────────────────────────────────────────────────────"
    echo "scp ${LOCAL_DIR}/install-n8n.sh ${SERVER_USER}@${SERVER}:/tmp/"
    echo "ssh ${SERVER_USER}@${SERVER} 'chmod +x /tmp/install-n8n.sh && /tmp/install-n8n.sh'"
    echo ""
    echo "OPTION C: Send files to Ortal"
    echo "──────────────────────────────────────────────────────────"
    echo "Email her these 3 files from:"
    echo "${LOCAL_DIR}/"
    echo "  - install-n8n.sh"
    echo "  - verify-n8n.sh"
    echo "  - QUICK_START.md"
    echo ""
    echo "She can upload them to her server and run install-n8n.sh"
    echo ""
    exit 0
fi

echo ""
echo -e "${GREEN}Great! Let's deploy...${NC}"
echo ""

# Copy installation script
echo "📤 Copying install-n8n.sh to server..."
if scp "${LOCAL_DIR}/install-n8n.sh" ${SERVER_USER}@${SERVER}:/tmp/; then
    echo -e "${GREEN}✓ install-n8n.sh copied${NC}"
else
    echo -e "${YELLOW}✗ Failed to copy install-n8n.sh${NC}"
    exit 1
fi

# Copy verification script
echo "📤 Copying verify-n8n.sh to server..."
if scp "${LOCAL_DIR}/verify-n8n.sh" ${SERVER_USER}@${SERVER}:/tmp/; then
    echo -e "${GREEN}✓ verify-n8n.sh copied${NC}"
else
    echo -e "${YELLOW}✗ Failed to copy verify-n8n.sh${NC}"
    exit 1
fi

# Copy commands reference
echo "📤 Copying commands.sh to server..."
if scp "${LOCAL_DIR}/commands.sh" ${SERVER_USER}@${SERVER}:/tmp/; then
    echo -e "${GREEN}✓ commands.sh copied${NC}"
else
    echo -e "${YELLOW}✗ Failed to copy commands.sh${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All files copied successfully!${NC}"
echo ""
echo "Next steps:"
echo "──────────────────────────────────────────────────────────"
echo "1. SSH to the server:"
echo "   ssh ${SERVER_USER}@${SERVER}"
echo ""
echo "2. Run the installation:"
echo "   chmod +x /tmp/install-n8n.sh"
echo "   /tmp/install-n8n.sh"
echo ""
echo "3. After installation, verify:"
echo "   chmod +x /tmp/verify-n8n.sh"
echo "   /tmp/verify-n8n.sh"
echo ""
echo "4. Access n8n at:"
echo "   http://${SERVER}:5678"
echo ""
echo -e "${BLUE}Would you like to SSH to the server now and run the installation? (y/n)${NC}"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Connecting to server..."
    echo "Run these commands:"
    echo "  chmod +x /tmp/install-n8n.sh"
    echo "  /tmp/install-n8n.sh"
    echo ""
    ssh ${SERVER_USER}@${SERVER}
else
    echo ""
    echo -e "${GREEN}Files are ready on the server at /tmp/${NC}"
    echo "SSH in whenever you're ready and run the installer."
    echo ""
fi

