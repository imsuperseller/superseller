#!/bin/bash

# Enhanced Facebook Marketplace Bot Deployment Script
# Deploy to 172.245.56.50 with GoLogin profiles and anti-detection features

echo "🚀 Deploying Enhanced Facebook Marketplace Bot to Server..."
echo "Server: 172.245.56.50"
echo "Features: Session Recovery, Anti-Detection, Cloud Fallback"
echo ""

# Server configuration
SERVER="172.245.56.50"
SERVER_USER="root"
SERVER_PATH="/opt/fb-marketplace-bot"
SERVER_PASSWORD="${VPS_PASSWORD:?Set VPS_PASSWORD env var before running}"

# Check if sshpass is available for password authentication
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass not found. You may need to enter the password manually."
    SSH_CMD="ssh"
    SCP_CMD="scp"
else
    echo "✅ Using sshpass for authentication"
    SSH_CMD="sshpass -p '$SERVER_PASSWORD' ssh"
    SCP_CMD="sshpass -p '$SERVER_PASSWORD' scp"
fi

echo ""
echo "📦 Preparing deployment package..."

# Create deployment directory
DEPLOY_DIR="./deploy-package"
mkdir -p "$DEPLOY_DIR"

# Copy essential files (note: facebook-bot-enhanced.js already in deploy-package)
cp config/bot-config.json "$DEPLOY_DIR/"
cp webhook-server.js "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp setup-test-data.js "$DEPLOY_DIR/"

# Create deployment configuration for server
cat > "$DEPLOY_DIR/server-deploy.js" << 'EOF'
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployBot() {
    console.log('🔧 Setting up Enhanced Facebook Bot on server...');
    
    try {
        // Install dependencies
        console.log('📦 Installing dependencies...');
        const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
        await new Promise((resolve, reject) => {
            npmInstall.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`npm install failed with code ${code}`));
            });
        });
        
        // Setup PM2 configuration
        const pm2Config = {
            apps: [
                {
                    name: 'webhook-server',
                    script: './webhook-server.js',
                    instances: 1,
                    autorestart: true,
                    watch: false,
                    max_memory_restart: '1G',
                    env: {
                        NODE_ENV: 'production'
                    }
                },
                {
                    name: 'facebook-bot-enhanced',
                    script: './facebook-bot-enhanced.js',
                    instances: 1,
                    autorestart: true,
                    watch: false,
                    max_memory_restart: '2G',
                    restart_delay: 10000,
                    max_restarts: 10,
                    min_uptime: '10s',
                    env: {
                        NODE_ENV: 'production'
                    }
                }
            ]
        };
        
        fs.writeFileSync('ecosystem.config.js', `module.exports = ${JSON.stringify(pm2Config, null, 2)}`);
        console.log('✅ PM2 configuration created');
        
        // Setup systemd service for auto-start
        const systemdService = `[Unit]
Description=Enhanced Facebook Marketplace Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/fb-marketplace-bot
ExecStart=/usr/local/bin/pm2 start ecosystem.config.js --no-daemon
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;
        
        fs.writeFileSync('fb-marketplace-bot.service', systemdService);
        console.log('✅ Systemd service configuration created');
        
        console.log('🎉 Server deployment setup complete!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Run: sudo cp fb-marketplace-bot.service /etc/systemd/system/');
        console.log('2. Run: sudo systemctl daemon-reload');
        console.log('3. Run: sudo systemctl enable fb-marketplace-bot');
        console.log('4. Run: node setup-test-data.js');
        console.log('5. Run: pm2 start ecosystem.config.js');
        console.log('6. Check logs: pm2 logs');
        
    } catch (error) {
        console.error('❌ Deployment setup failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    deployBot();
}
EOF

# Create server installation script
cat > "$DEPLOY_DIR/install-on-server.sh" << 'EOF'
#!/bin/bash

echo "🔧 Installing Enhanced Facebook Marketplace Bot..."
cd /opt/fb-marketplace-bot

# Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database with test data
echo "🗄️  Setting up test data..."
node setup-test-data.js

# Setup PM2 and systemd
echo "⚙️  Setting up services..."
node server-deploy.js

# Copy systemd service
sudo cp fb-marketplace-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable fb-marketplace-bot

echo "✅ Installation complete!"
echo ""
echo "🚀 To start the bot:"
echo "  pm2 start ecosystem.config.js"
echo ""
echo "📊 To monitor:"
echo "  pm2 logs"
echo "  pm2 status"
echo ""
echo "🔄 To restart:"
echo "  pm2 restart all"
EOF

chmod +x "$DEPLOY_DIR/install-on-server.sh"

# Create quick test script
cat > "$DEPLOY_DIR/test-server.sh" << 'EOF'
#!/bin/bash

echo "🧪 Testing Enhanced Facebook Bot on Server..."
echo ""

# Test webhook endpoints
echo "📋 Testing webhook endpoints:"
echo "UAD Jobs:"
curl -s "http://localhost:8082/webhook/v1-uad-jobs" | head -c 100
echo "..."
echo ""

echo "Miss Party Jobs:"
curl -s "http://localhost:8082/webhook/v1-miss-party-jobs" | head -c 100
echo "..."
echo ""

# Test PM2 status
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "📋 Recent logs:"
pm2 logs --lines 5

echo ""
echo "✅ Server test complete!"
EOF

chmod +x "$DEPLOY_DIR/test-server.sh"

echo "✅ Deployment package created in: $DEPLOY_DIR/"
echo ""
echo "📋 Package contents:"
ls -la "$DEPLOY_DIR/"
echo ""

# Create manual deployment instructions
cat > "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# Enhanced Facebook Marketplace Bot - Deployment Instructions

## Server: 172.245.56.50
**Password**: Use $VPS_PASSWORD env var
**GoLogin Token**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
**Profiles**: 
- UAD: 694b5e53fcacf3fe4b4ff79c
- Miss Party: 6949a854f4994b150d430f37

## Deployment Steps

### 1. Upload Files to Server
```bash
scp -r deploy-package/* root@172.245.56.50:/opt/fb-marketplace-bot/
```

### 2. SSH to Server and Install
```bash
ssh root@172.245.56.50
cd /opt/fb-marketplace-bot
chmod +x install-on-server.sh
./install-on-server.sh
```

### 3. Start the Enhanced Bot
```bash
pm2 start ecosystem.config.js
pm2 save
```

### 4. Monitor and Test
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Test endpoints
./test-server.sh

# Check specific bot logs
pm2 logs facebook-bot-enhanced
pm2 logs webhook-server
```

## Enhanced Features

✅ **Session Recovery**: Automatically recovers from login issues
✅ **Anti-Detection**: Advanced browser fingerprinting protection  
✅ **Proxy Rotation**: Handles 402 proxy errors with retry logic
✅ **Cloud Fallback**: Falls back to cloud browser when GoLogin fails
✅ **Smart Form Filling**: Enhanced form detection and filling
✅ **Media Upload**: Supports both images and videos
✅ **WhatsApp Notifications**: Real-time success/failure alerts
✅ **Database Integration**: PostgreSQL job queue with status tracking

## Troubleshooting

### GoLogin Issues
- Check proxy health in logs
- Profiles should load automatically
- Session recovery will attempt login with credentials

### Database Issues
- Ensure PostgreSQL is running: `systemctl status postgresql`
- Test connection: `psql -U admin -d app_db -h localhost`
- Verify test data: `node setup-test-data.js`

### Bot Not Posting
1. Check PM2 logs: `pm2 logs facebook-bot-enhanced`
2. Verify webhook server: `curl localhost:8082/webhook/v1-uad-jobs`
3. Test GoLogin profiles manually
4. Check WhatsApp notifications

## Success Criteria
- ✅ Bot retrieves jobs from PostgreSQL
- ✅ GoLogin profiles launch successfully  
- ✅ Facebook marketplace loads and logs in
- ✅ Media files upload (images + videos)
- ✅ Listings post successfully
- ✅ WhatsApp notifications sent
- ✅ Database status updated

## Video Files
- UAD: http://172.245.56.50/video.mp4
- Miss Party: http://172.245.56.50/michal_video.mp4

## Expected Results
Working Facebook marketplace links with posted listings!
EOF

echo "📖 Deployment instructions created: $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "🎯 CRITICAL NEXT STEPS:"
echo "1. Upload package to server: scp -r deploy-package/* root@172.245.56.50:/opt/fb-marketplace-bot/"
echo "2. SSH to server and run: ./install-on-server.sh"  
echo "3. Start bot: pm2 start ecosystem.config.js"
echo "4. Monitor: pm2 logs"
echo ""
echo "🏆 GOAL: Working Facebook marketplace links with actual posted listings!"
echo ""