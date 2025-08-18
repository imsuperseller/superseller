#!/bin/bash

echo "🚀 Starting MCP Servers"
echo "======================"

# Ensure we're in the correct directory
cd "$(dirname "$0")"

echo "📍 Working directory: $(pwd)"
echo ""

# Start Financial & Billing MCP Server
echo "💰 Starting Financial & Billing MCP Server..."
node mcp-servers/financial-billing-mcp/server.js &
FINANCIAL_PID=$!
echo "   PID: $FINANCIAL_PID"
echo ""

# Start Email & Communication MCP Server
echo "📧 Starting Email & Communication MCP Server..."
node mcp-servers/email-communication-mcp/server.js &
EMAIL_PID=$!
echo "   PID: $EMAIL_PID"
echo ""

# Start Analytics & Reporting MCP Server
echo "📊 Starting Analytics & Reporting MCP Server..."
node mcp-servers/analytics-reporting-mcp/server.js &
ANALYTICS_PID=$!
echo "   PID: $ANALYTICS_PID"
echo ""

# Start n8n MCP Server
echo "🤖 Starting n8n MCP Server..."
node mcp-servers/n8n-mcp-server/server.js &
N8N_PID=$!
echo "   PID: $N8N_PID"
echo ""

# Start AI Workflow Generator
echo "🎯 Starting AI Workflow Generator..."
node mcp-servers/ai-workflow-generator/server.js &
AI_PID=$!
echo "   PID: $AI_PID"
echo ""

echo "✅ All MCP Servers Started!"
echo "=========================="
echo "💰 Financial & Billing: PID $FINANCIAL_PID"
echo "📧 Email & Communication: PID $EMAIL_PID"
echo "📊 Analytics & Reporting: PID $ANALYTICS_PID"
echo "🤖 n8n MCP: PID $N8N_PID"
echo "🎯 AI Workflow Generator: PID $AI_PID"
echo ""
echo "To stop all servers: kill $FINANCIAL_PID $EMAIL_PID $ANALYTICS_PID $N8N_PID $AI_PID"
echo ""
echo "🎉 MCP servers are ready for AI workflow generation!"
