#!/bin/bash

# Cloudflare Tunnel for QuickBooks OAuth Callback
# This creates a tunnel to expose the QuickBooks OAuth callback endpoint

echo "🚀 Setting up Cloudflare Tunnel for QuickBooks OAuth..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed. Installing..."
    
    # Install cloudflared based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install cloudflared
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    else
        echo "❌ Unsupported OS. Please install cloudflared manually."
        exit 1
    fi
fi

# Check if tunnel exists
TUNNEL_NAME="quickbooks-oauth-tunnel"
TUNNEL_ID=$(cloudflared tunnel list --output json | jq -r ".[] | select(.name == \"$TUNNEL_NAME\") | .id" 2>/dev/null)

if [ -z "$TUNNEL_ID" ]; then
    echo "🔧 Creating new tunnel: $TUNNEL_NAME"
    TUNNEL_OUTPUT=$(cloudflared tunnel create $TUNNEL_NAME)
    TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -o 'Created tunnel [a-f0-9-]*' | cut -d' ' -f3)
    echo "✅ Tunnel created with ID: $TUNNEL_ID"
else
    echo "✅ Using existing tunnel: $TUNNEL_NAME (ID: $TUNNEL_ID)"
fi

# Create tunnel configuration
TUNNEL_CONFIG="/tmp/quickbooks-oauth-tunnel-config.yml"
cat > $TUNNEL_CONFIG << EOF
tunnel: $TUNNEL_ID
credentials-file: ~/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: quickbooks-oauth.rensto.com
    service: http://localhost:3001
    path: /api/oauth/quickbooks-callback
  - service: http_status:404
EOF

echo "📝 Tunnel configuration created: $TUNNEL_CONFIG"

# Create DNS record
echo "🌐 Creating DNS record for quickbooks-oauth.rensto.com..."
cloudflared tunnel route dns $TUNNEL_ID quickbooks-oauth.rensto.com

# Start the tunnel
echo "🚀 Starting Cloudflare tunnel..."
echo "📋 QuickBooks OAuth Callback URL: https://quickbooks-oauth.rensto.com/api/oauth/quickbooks-callback"
echo "🔧 Use this URL as your QuickBooks redirect URI"
echo ""
echo "Press Ctrl+C to stop the tunnel"

# Run the tunnel
cloudflared tunnel --config $TUNNEL_CONFIG run $TUNNEL_ID
