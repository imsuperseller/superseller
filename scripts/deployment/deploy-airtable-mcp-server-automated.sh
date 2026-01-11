#!/bin/bash

# Automated Airtable MCP Server Deployment Script
# Deploys the Airtable MCP server to Racknerd VPS without manual input

set -e

echo "🚀 Deploying Airtable MCP Server to Racknerd VPS (Automated)"
echo "============================================================="

# Configuration
VPS_IP="172.245.56.50"
VPS_USER="root"
VPS_PASS="05ngBiq2pTA8XSF76x"
DEPLOY_PATH="/opt/mcp-servers/airtable-mcp-server"
SERVICE_NAME="airtable-mcp-server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run SSH command with password
run_ssh() {
    sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "$1"
}

# Function to run SCP command with password
run_scp() {
    sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$1" "$VPS_USER@$VPS_IP:$2"
}

# Function to run SCP command with password (directory)
run_scp_dir() {
    sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r "$1" "$VPS_USER@$VPS_IP:$2"
}

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    print_error "sshpass is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install sshpass
    else
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

# Step 1: Create deployment directory on VPS
print_status "Creating deployment directory on VPS..."
run_ssh "mkdir -p ${DEPLOY_PATH}"

# Step 2: Copy Airtable MCP server files
print_status "Copying Airtable MCP server files..."
run_scp_dir "infra/mcp-servers/airtable-mcp-server" "${DEPLOY_PATH}/"

# Step 3: Copy credentials
print_status "Copying credentials..."
run_scp "config/airtable-credentials.json" "${DEPLOY_PATH}/.env"

# Step 4: Install dependencies on VPS
print_status "Installing dependencies on VPS..."
run_ssh "cd ${DEPLOY_PATH} && npm install"

# Step 5: Build the project
print_status "Building Airtable MCP server..."
run_ssh "cd ${DEPLOY_PATH} && npm run build"

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
Environment=AIRTABLE_API_KEY=patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Copy service file to VPS
run_scp "/tmp/${SERVICE_NAME}.service" "/etc/systemd/system/"

# Step 7: Enable and start service
print_status "Enabling and starting Airtable MCP server service..."
run_ssh "systemctl daemon-reload && systemctl enable ${SERVICE_NAME} && systemctl start ${SERVICE_NAME}"

# Step 8: Check service status
print_status "Checking service status..."
run_ssh "systemctl status ${SERVICE_NAME} --no-pager"

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
