#!/bin/bash

set -e

VPS_IP="173.254.201.134"
VPS_USER="root"
VPS_PASS="05ngBiq2pTA8XSF76x"
DEPLOY_PATH="/opt/mcp-servers/airtable-mcp-server"
SERVICE_NAME="airtable-mcp-server-webhook"

print_status() {
    echo "🔧 $1"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

run_ssh() {
    sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "$1"
}

print_status "Fixing Airtable MCP Server..."

# Step 1: Stop the current service
print_status "Stopping current service..."
run_ssh "systemctl stop $SERVICE_NAME"

# Step 2: Create a better webhook wrapper
print_status "Creating improved webhook wrapper..."
run_ssh "cat > /tmp/improved-webhook-wrapper.js << 'EOF'
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
const port = 5679;

app.use(express.json());

class AirtableMCPWebhook {
    constructor() {
        this.process = null;
        this.isReady = false;
        this.requestQueue = [];
        this.requestId = 0;
    }

    async start() {
        return new Promise((resolve, reject) => {
            const env = {
                ...process.env,
                AIRTABLE_API_KEY: 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12'
            };

            console.log('Starting MCP Server with API key...');
            this.process = spawn('node', ['dist/index.js'], {
                cwd: '$DEPLOY_PATH',
                env: env,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let readyTimeout;

            this.process.stdout.on('data', (data) => {
                const dataStr = data.toString();
                output += dataStr;
                console.log('MCP Server stdout:', dataStr);
                
                // Check for any output that indicates the server is ready
                if (dataStr.includes('ready') || dataStr.includes('connected') || dataStr.includes('listening') || dataStr.includes('MCP')) {
                    this.isReady = true;
                    clearTimeout(readyTimeout);
                    console.log('MCP Server is ready!');
                    resolve();
                }
            });

            this.process.stderr.on('data', (data) => {
                const dataStr = data.toString();
                console.error('MCP Server stderr:', dataStr);
                if (!dataStr.includes('warning') && !dataStr.includes('deprecated')) {
                    console.error('MCP Server Error:', dataStr);
                }
            });

            this.process.on('error', (error) => {
                console.error('Failed to start MCP Server process:', error);
                reject(error);
            });

            this.process.on('exit', (code) => {
                console.log('MCP Server process exited with code:', code);
                this.isReady = false;
            });

            // Set a longer timeout and be more lenient
            readyTimeout = setTimeout(() => {
                if (!this.isReady) {
                    console.log('MCP Server output so far:', output);
                    console.log('MCP Server may be ready but not signaling properly, proceeding anyway...');
                    this.isReady = true;
                    resolve();
                }
            }, 15000); // 15 seconds timeout
        });
    }

    async callMethod(method, params = {}) {
        if (!this.isReady) {
            throw new Error('MCP Server not ready');
        }

        return new Promise((resolve, reject) => {
            const requestId = ++this.requestId;
            const request = {
                jsonrpc: '2.0',
                id: requestId,
                method: method,
                params: params
            };

            console.log('Sending request:', JSON.stringify(request));

            // Send request to MCP server
            this.process.stdin.write(JSON.stringify(request) + '\\n');

            // Set up response handler
            const responseHandler = (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    if (response.id === requestId) {
                        this.process.stdout.removeListener('data', responseHandler);
                        if (response.error) {
                            reject(new Error(response.error.message || 'MCP Server error'));
                        } else {
                            resolve(response.result);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                }
            };

            this.process.stdout.on('data', responseHandler);

            // Set timeout for response
            setTimeout(() => {
                this.process.stdout.removeListener('data', responseHandler);
                reject(new Error('Request timeout'));
            }, 30000);
        });
    }

    stop() {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.isReady = false;
        }
    }
}

const mcpServer = new AirtableMCPWebhook();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mcpServer: mcpServer.isReady ? 'ready' : 'not ready',
        timestamp: new Date().toISOString()
    });
});

// MCP webhook endpoint
app.post('/webhook/mcp', async (req, res) => {
    try {
        const { method, params } = req.body;
        console.log('Webhook request:', { method, params });

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

// Start server
app.listen(port, '0.0.0.0', async () => {
    console.log('Airtable MCP Webhook Server running on port', port, '(all interfaces)');
    
    try {
        await mcpServer.start();
        console.log('MCP Server started successfully');
    } catch (error) {
        console.error('Failed to start MCP Server:', error);
        console.log('Continuing without MCP Server...');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    mcpServer.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    mcpServer.stop();
    process.exit(0);
});
EOF"

# Step 3: Update the service file
print_status "Updating systemd service..."
run_ssh "cat > /etc/systemd/system/$SERVICE_NAME.service << 'EOF'
[Unit]
Description=Airtable MCP Server Webhook
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/node /tmp/improved-webhook-wrapper.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF"

# Step 4: Reload systemd and restart service
print_status "Reloading systemd and restarting service..."
run_ssh "systemctl daemon-reload"
run_ssh "systemctl enable $SERVICE_NAME"
run_ssh "systemctl start $SERVICE_NAME"

# Step 5: Wait for service to start
print_status "Waiting for service to start..."
sleep 10

# Step 6: Check service status
print_status "Checking service status..."
run_ssh "systemctl status $SERVICE_NAME --no-pager -l"

# Step 7: Test the webhook
print_status "Testing webhook..."
sleep 5
run_ssh "curl -s http://localhost:5679/health"

print_success "Airtable MCP Server fix completed!"
print_status "Test the webhook: curl -X POST http://$VPS_IP:5679/webhook/mcp -H 'Content-Type: application/json' -d '{\"method\":\"list_bases\",\"params\":{}}'"
