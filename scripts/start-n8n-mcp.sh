#!/bin/bash

echo "🚀 Starting n8n MCP Server for Shelly's Integration..."

# Set environment variables
export N8N_URL="http://localhost:5678"
export N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE"

# Start n8n MCP server
cd /Users/shaifriedman/Rensto/infra/mcp-servers/n8n-mcp-server
node server-enhanced.js &

echo "✅ n8n MCP Server started successfully!"
echo "🔧 Available tools:"
echo "  - create-credential"
echo "  - list-workflows"
echo "  - activate-workflow"
echo "  - trigger-webhook-workflow"
echo "  - health-check"
