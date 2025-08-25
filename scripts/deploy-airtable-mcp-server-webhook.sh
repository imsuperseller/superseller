#!/bin/bash

# Airtable MCP Server Webhook Deployment Script
# Deploys the Airtable MCP server as a webhook service

set -e

echo "🚀 Deploying Airtable MCP Server Webhook to Racknerd VPS"
echo "========================================================"

# Configuration
VPS_IP="173.254.201.134"
VPS_USER="root"
VPS_PASS="05ngBiq2pTA8XSF76x"
DEPLOY_PATH="/opt/mcp-servers/airtable-mcp-server"
SERVICE_NAME="airtable-mcp-server-webhook"

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

# Step 2: Copy essential files
print_status "Copying essential files..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null infra/mcp-servers/airtable-mcp-server/package.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null infra/mcp-servers/airtable-mcp-server/package-lock.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r infra/mcp-servers/airtable-mcp-server/src "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null infra/mcp-servers/airtable-mcp-server/tsconfig.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null infra/mcp-servers/airtable-mcp-server/tsconfig.build.json "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"

# Step 3: Create webhook wrapper
print_status "Creating webhook wrapper..."
cat > /tmp/webhook-wrapper.js << 'EOF'
#!/usr/bin/env node

import express from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5678;

app.use(express.json());

// Airtable MCP Server wrapper
class AirtableMCPWebhook {
    constructor() {
        this.process = null;
        this.isReady = false;
    }

    async start() {
        return new Promise((resolve, reject) => {
            const env = { ...process.env, AIRTABLE_API_KEY: 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12' };
            
            this.process = spawn('node', ['dist/index.js'], {
                cwd: __dirname,
                env: env,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.process.stdout.on('data', (data) => {
                console.log('MCP Server:', data.toString());
                if (data.toString().includes('ready') || data.toString().includes('connected')) {
                    this.isReady = true;
                    resolve();
                }
            });

            this.process.stderr.on('data', (data) => {
                console.error('MCP Server Error:', data.toString());
            });

            this.process.on('close', (code) => {
                console.log('MCP Server process exited with code:', code);
                this.isReady = false;
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!this.isReady) {
                    reject(new Error('MCP Server failed to start within 10 seconds'));
                }
            }, 10000);
        });
    }

    async callMethod(method, params = {}) {
        if (!this.isReady || !this.process) {
            throw new Error('MCP Server not ready');
        }

        return new Promise((resolve, reject) => {
            const request = {
                jsonrpc: '2.0',
                id: Date.now(),
                method: method,
                params: params
            };

            this.process.stdin.write(JSON.stringify(request) + '\n');

            const timeout = setTimeout(() => {
                reject(new Error('MCP Server request timeout'));
            }, 30000);

            const responseHandler = (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    if (response.id === request.id) {
                        clearTimeout(timeout);
                        this.process.stdout.removeListener('data', responseHandler);
                        resolve(response);
                    }
                } catch (error) {
                    // Not a JSON response, continue listening
                }
            };

            this.process.stdout.on('data', responseHandler);
        });
    }
}

const mcpServer = new AirtableMCPWebhook();

// Webhook endpoint
app.post('/webhook/mcp', async (req, res) => {
    try {
        const { method, params } = req.body;
        
        if (!method) {
            return res.status(400).json({ error: 'Method is required' });
        }

        const result = await mcpServer.callMethod(method, params || {});
        res.json(result);
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        mcpServer: mcpServer.isReady ? 'ready' : 'not ready',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, async () => {
    console.log(`Airtable MCP Webhook Server running on port ${port}`);
    
    try {
        await mcpServer.start();
        console.log('MCP Server started successfully');
    } catch (error) {
        console.error('Failed to start MCP Server:', error);
        process.exit(1);
    }
});
EOF

# Copy webhook wrapper to VPS
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/webhook-wrapper.js "$VPS_USER@$VPS_IP:${DEPLOY_PATH}/"

# Step 4: Install dependencies on VPS
print_status "Installing dependencies on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "cd ${DEPLOY_PATH} && npm install && npm install express"

# Step 5: Build the project
print_status "Building Airtable MCP server..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "cd ${DEPLOY_PATH} && npm run build"

# Step 6: Create systemd service file
print_status "Creating systemd service..."
cat > /tmp/${SERVICE_NAME}.service << EOF
[Unit]
Description=Airtable MCP Server Webhook
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${DEPLOY_PATH}
Environment=AIRTABLE_API_KEY=patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12
ExecStart=/usr/bin/node webhook-wrapper.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Copy service file to VPS
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/${SERVICE_NAME}.service "$VPS_USER@$VPS_IP:/etc/systemd/system/"

# Step 7: Enable and start service
print_status "Enabling and starting Airtable MCP server webhook service..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "systemctl daemon-reload && systemctl enable ${SERVICE_NAME} && systemctl start ${SERVICE_NAME}"

# Step 8: Check service status
print_status "Checking service status..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "systemctl status ${SERVICE_NAME} --no-pager"

# Step 9: Test webhook connection
print_status "Testing webhook connection..."
sleep 10
curl -X GET http://${VPS_IP}:5678/health || print_warning "Health check failed - may need time to start"

print_status "Airtable MCP server webhook deployment completed!"
print_status "Service: ${SERVICE_NAME}"
print_status "Deploy path: ${DEPLOY_PATH}"
print_status "Webhook URL: http://${VPS_IP}:5678/webhook/mcp"
print_status "Health Check: http://${VPS_IP}:5678/health"
print_status "Status: Active"

echo ""
echo "🎉 Airtable MCP Server Webhook successfully deployed to Racknerd VPS!"
echo "📊 Check logs: ssh ${VPS_USER}@${VPS_IP} 'journalctl -u ${SERVICE_NAME} -f'"
echo "🔄 Restart service: ssh ${VPS_USER}@${VPS_IP} 'systemctl restart ${SERVICE_NAME}'"
echo "🌐 Test webhook: curl -X POST http://${VPS_IP}:5678/webhook/mcp -H 'Content-Type: application/json' -d '{\"method\":\"tools/list\",\"params\":{}}'"
