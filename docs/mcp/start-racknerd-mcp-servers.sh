#!/bin/bash

# 🚀 START ALL MCP SERVERS ON RACKNERD VPS
# This script starts all MCP servers on the Racknerd VPS

echo "🚀 Starting MCP Servers on Racknerd VPS..."

# SSH to Racknerd and start MCP servers
ssh root@172.245.56.50 << 'EOF'

echo "📡 Connected to Racknerd VPS"
echo "🔍 Checking current MCP server status..."

# Check if MCP servers are already running
if pgrep -f "mcp-server" > /dev/null; then
    echo "⚠️  MCP servers already running. Stopping existing processes..."
    pkill -f "mcp-server"
    sleep 2
fi

# Navigate to MCP servers directory
cd /root/rensto/infra/mcp-servers/

echo "📂 MCP Server directories:"
ls -la

# Start Make MCP Server
echo "🔧 Starting Make MCP Server..."
cd make-mcp-server/
if [ -f "package.json" ]; then
    npm install
    nohup node dist/index.js > /var/log/make-mcp-server.log 2>&1 &
    echo "✅ Make MCP Server started (PID: $!)"
else
    echo "❌ Make MCP Server not found"
fi

# Start Boost Space MCP Server
echo "🚀 Starting Boost Space MCP Server..."
cd ../boost-space-mcp-server/
if [ -f "package.json" ]; then
    npm install
    nohup node dist/index.js > /var/log/boost-space-mcp-server.log 2>&1 &
    echo "✅ Boost Space MCP Server started (PID: $!)"
else
    echo "❌ Boost Space MCP Server not found"
fi

# Start n8n MCP Server Extended
echo "🔗 Starting n8n MCP Server Extended..."
cd ../rensto-n8n-agents/mcpServers/
if [ -f "package.json" ]; then
    npm install
    nohup node n8n-unified-server.js > /var/log/n8n-unified-server.log 2>&1 &
    echo "✅ n8n MCP Server Extended started (PID: $!)"
else
    echo "❌ n8n MCP Server Extended not found"
fi

# Start MCP Proxy (if exists)
echo "🌐 Starting MCP Proxy..."
cd ../
if [ -f "mcp-proxy/package.json" ]; then
    cd mcp-proxy/
    npm install
    nohup node dist/index.js > /var/log/mcp-proxy.log 2>&1 &
    echo "✅ MCP Proxy started (PID: $!)"
else
    echo "❌ MCP Proxy not found"
fi

# Check running processes
echo "📊 Current MCP server processes:"
ps aux | grep -E "(mcp|node)" | grep -v grep

# Check ports
echo "🔌 Active ports:"
netstat -tlnp | grep -E ":(4000|3000|5000|8000)"

echo "✅ MCP servers startup complete!"

EOF

echo "🎯 MCP servers startup script completed!"
echo "📋 Check the logs on Racknerd for any issues:"
echo "   - Make MCP: /var/log/make-mcp-server.log"
echo "   - Boost Space MCP: /var/log/boost-space-mcp-server.log"
echo "   - n8n Unified: /var/log/n8n-unified-server.log"
echo "   - MCP Proxy: /var/log/mcp-proxy.log"
