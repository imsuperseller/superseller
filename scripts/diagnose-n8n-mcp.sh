#!/bin/bash
# n8n MCP Diagnostic Script
# Run this to test if n8n-mcp works in your environment

echo "=========================================="
echo "n8n MCP Diagnostic Script"
echo "=========================================="
echo ""

# Set environment variables
export N8N_API_URL="https://n8n.rensto.com"
export N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ"
export MCP_MODE="stdio"
export LOG_LEVEL="debug"

echo "1. Checking Node.js version..."
node --version || { echo "❌ Node.js not found"; exit 1; }
echo "✅ Node.js OK"
echo ""

echo "2. Checking npm/npx..."
npx --version || { echo "❌ npx not found"; exit 1; }
echo "✅ npx OK"
echo ""

echo "3. Testing n8n API connectivity..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://n8n.rensto.com/healthz" 2>/dev/null)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ n8n API reachable (HTTP $HEALTH_CHECK)"
else
    echo "❌ n8n API unreachable (HTTP $HEALTH_CHECK)"
fi
echo ""

echo "4. Testing n8n API authentication..."
AUTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "https://n8n.rensto.com/api/v1/workflows?limit=1" 2>/dev/null)
if [ "$AUTH_CHECK" = "200" ]; then
    echo "✅ n8n API auth OK (HTTP $AUTH_CHECK)"
else
    echo "❌ n8n API auth failed (HTTP $AUTH_CHECK)"
fi
echo ""

echo "5. Installing n8n-mcp package (this may take a moment)..."
npx -y n8n-mcp --version 2>&1 || echo "Note: n8n-mcp may not support --version flag"
echo ""

echo "6. Testing n8n-mcp initialization (5 second timeout)..."
echo '{"jsonrpc": "2.0", "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}}}, "id": 1}' | \
    timeout 5 npx -y n8n-mcp 2>&1 | head -20
echo ""

echo "=========================================="
echo "Diagnostic complete!"
echo ""
echo "If step 6 shows a JSON response with 'result', the MCP works."
echo "If it hangs or shows errors, there's a compatibility issue."
echo "=========================================="
