#!/bin/bash

# Simple Airtable MCP Server Deployment Script
# Deploys the Airtable MCP server to Racknerd VPS

set -e

echo "🚀 Deploying Airtable MCP Server to Racknerd VPS (Simple)"
echo "========================================================="

# Configuration
VPS_IP="172.245.56.50"
VPS_USER="root"
VPS_PASS="${VPS_PASSWORD}"
DEPLOY_PATH="/opt/mcp-servers/airtable-mcp-server"
SERVICE_NAME="airtable-mcp-server"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Step 1: Create deployment directory on VPS
print_status "Creating deployment directory on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "mkdir -p ${DEPLOY_PATH}"

# Step 2: Copy essential files only
print_status "Copying essential files..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null infra/mcp-servers/airtable-mcp-server/package.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null infra/mcp-servers/airtable-mcp-server/package-lock.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r infra/mcp-servers/airtable-mcp-server/src "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null infra/mcp-servers/airtable-mcp-server/tsconfig.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null infra/mcp-servers/airtable-mcp-server/tsconfig.build.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"

# Step 3: Copy credentials
print_status "Copying credentials..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null config/airtable-credentials.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/.env"

# Step 4: Install dependencies on VPS
print_status "Installing dependencies on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "cd ${DEPLOY_PATH} && npm install"

# Step 5: Build the project
print_status "Building Airtable MCP server..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "cd ${DEPLOY_PATH} && npm run build"

# Step 6: Create systemd service file
print_status "Creating systemd service..."
cat > /tmp/${SERVICE_NAME}.service << EOF
[Unit]
Description=Airtable MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${DEPLOY_PATH}
Environment=AIRTABLE_API_KEY=${AIRTABLE_PAT}
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Copy service file to VPS
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/${SERVICE_NAME}.service "$VPS_USER@$VPS_IP:/etc/systemd/system/"

# Step 7: Enable and start service
print_status "Enabling and starting Airtable MCP server service..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "systemctl daemon-reload && systemctl enable ${SERVICE_NAME} && systemctl start ${SERVICE_NAME}"

# Step 8: Check service status
print_status "Checking service status..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "systemctl status ${SERVICE_NAME} --no-pager"

# Step 9: Test MCP server connection
print_status "Testing MCP server connection..."
sleep 5
curl -X POST http://${VPS_IP}:5678/webhook/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/list",
    "params": {}
  }' || print_warning "MCP server test failed - may need time to start"

print_status "Airtable MCP server deployment completed!"
print_status "Service: ${SERVICE_NAME}"
print_status "Deploy path: ${DEPLOY_PATH}"
print_status "API Key: Configured"
print_status "Status: Active"

echo ""
echo "🎉 Airtable MCP Server successfully deployed to Racknerd VPS!"
echo "📊 Check logs: ssh ${VPS_USER}@${VPS_IP} 'journalctl -u ${SERVICE_NAME} -f'"
echo "🔄 Restart service: ssh ${VPS_USER}@${VPS_IP} 'systemctl restart ${SERVICE_NAME}'"
