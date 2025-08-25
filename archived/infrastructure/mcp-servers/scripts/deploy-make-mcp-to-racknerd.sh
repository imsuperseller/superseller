#!/bin/bash

# 🚀 DEPLOY MAKE.COM MCP SERVER TO RACKNERD
# 
# This script deploys the Make.com MCP server to Racknerd VPS

set -e

echo "🚀 DEPLOYING MAKE.COM MCP SERVER TO RACKNERD"
echo "============================================"
echo ""

# Configuration
RACKNERD_HOST="173.254.201.134"
RACKNERD_USER="root"
MCP_PATH="/root/rensto/infra/mcp-servers"
MAKE_MCP_PATH="/root/rensto/infra/mcp-servers/make-mcp-server"

echo "🌐 Racknerd Host: $RACKNERD_HOST"
echo "👤 User: $RACKNERD_USER"
echo "📁 MCP Path: $MAKE_MCP_PATH"
echo ""

# Step 1: Create directory structure
echo "📋 Step 1: Creating directory structure..."
ssh $RACKNERD_USER@$RACKNERD_HOST "mkdir -p $MAKE_MCP_PATH"

# Step 2: Copy server files
echo "📋 Step 2: Copying server files..."
scp infra/mcp-servers/make-mcp-server/server.js $RACKNERD_USER@$RACKNERD_HOST:$MAKE_MCP_PATH/
scp infra/mcp-servers/make-mcp-server/package.json $RACKNERD_USER@$RACKNERD_HOST:$MAKE_MCP_PATH/
scp infra/mcp-servers/make-mcp-server/test.js $RACKNERD_USER@$RACKNERD_HOST:$MAKE_MCP_PATH/

# Step 3: Install dependencies
echo "📋 Step 3: Installing dependencies..."
ssh $RACKNERD_USER@$RACKNERD_HOST "cd $MAKE_MCP_PATH && npm install"

# Step 4: Test MCP server
echo "📋 Step 4: Testing MCP server..."
ssh $RACKNERD_USER@$RACKNERD_HOST "cd $MAKE_MCP_PATH && node test.js"

# Step 5: Update MCP configuration
echo "📋 Step 5: Updating MCP configuration..."
ssh $RACKNERD_USER@$RACKNERD_HOST "cd /root/rensto && cp mcp-config.json mcp-config.json.backup"

# Step 6: Restart MCP ecosystem
echo "📋 Step 6: Restarting MCP ecosystem..."
ssh $RACKNERD_USER@$RACKNERD_HOST "cd /root/rensto && pm2 restart mcp-ecosystem || pm2 start infra/mcp-servers/enhanced-mcp-ecosystem.js --name mcp-ecosystem"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "✅ Make.com MCP server deployed to Racknerd!"
echo "🔗 Available at: $MAKE_MCP_PATH"
echo "🚀 Ready for use with MCP clients!"
echo ""
echo "📋 VERIFICATION:"
echo "   1. Check server logs: pm2 logs mcp-ecosystem"
echo "   2. Test connection: node $MAKE_MCP_PATH/test.js"
echo "   3. Verify in MCP config: cat /root/rensto/mcp-config.json"
echo ""
