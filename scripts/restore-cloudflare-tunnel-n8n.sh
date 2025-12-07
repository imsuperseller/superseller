#!/bin/bash

# 🔒 RESTORE CLOUDFLARE TUNNEL FOR n8n.rensto.com
# This restores the HTTPS setup that worked before migration

set -e

echo "🔒 Restoring Cloudflare Tunnel for n8n.rensto.com"
echo "================================================"

# Configuration
TUNNEL_NAME="n8n-tunnel"
DOMAIN="n8n.rensto.com"
SERVICE_PORT="5678"
CLOUDFLARED_DIR="/root/.cloudflared"
CONFIG_FILE="$CLOUDFLARED_DIR/config.yml"

# Step 1: Install cloudflared
echo ""
echo "1️⃣  Installing cloudflared..."
if ! command -v cloudflared &> /dev/null; then
    echo "   Downloading cloudflared..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -O /tmp/cloudflared.deb
    dpkg -i /tmp/cloudflared.deb || apt-get install -f -y
    rm /tmp/cloudflared.deb
    echo "   ✅ cloudflared installed"
else
    echo "   ✅ cloudflared already installed"
fi

# Step 2: Authenticate (if not already)
echo ""
echo "2️⃣  Authenticating with Cloudflare..."
if [ ! -f "$CLOUDFLARED_DIR/cert.pem" ]; then
    echo "   ⚠️  You need to authenticate manually:"
    echo "   Run: cloudflared tunnel login"
    echo "   This will open a browser to authorize"
    echo ""
    read -p "   Press Enter after you've run 'cloudflared tunnel login'..."
else
    echo "   ✅ Already authenticated"
fi

# Step 3: Check if tunnel exists
echo ""
echo "3️⃣  Checking for existing tunnel..."
TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep -i "$TUNNEL_NAME" | head -1 | awk '{print $1}' || echo "")

if [ -z "$TUNNEL_ID" ]; then
    echo "   Creating new tunnel: $TUNNEL_NAME"
    TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1)
    TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
    
    if [ -z "$TUNNEL_ID" ]; then
        echo "   ❌ Failed to create tunnel. Output:"
        echo "$TUNNEL_OUTPUT"
        exit 1
    fi
    
    echo "   ✅ Tunnel created: $TUNNEL_ID"
else
    echo "   ✅ Using existing tunnel: $TUNNEL_ID"
fi

# Step 4: Create config directory
echo ""
echo "4️⃣  Creating configuration..."
mkdir -p "$CLOUDFLARED_DIR"

# Step 5: Create config file
cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CLOUDFLARED_DIR/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:$SERVICE_PORT
  - service: http_status:404
EOF

echo "   ✅ Config file created: $CONFIG_FILE"

# Step 6: Create DNS route
echo ""
echo "5️⃣  Creating DNS route..."
cloudflared tunnel route dns "$TUNNEL_ID" "$DOMAIN" 2>&1 || {
    echo "   ⚠️  DNS route creation may have failed (tunnel might already be routed)"
    echo "   This is OK if the tunnel was already configured"
}

# Step 7: Install as systemd service
echo ""
echo "6️⃣  Installing as systemd service..."
cloudflared service install 2>&1 || {
    echo "   ⚠️  Service install may have failed (might already be installed)"
}

# Step 8: Start service
echo ""
echo "7️⃣  Starting Cloudflare Tunnel service..."
systemctl restart cloudflared || {
    echo "   ⚠️  Service restart failed, trying to start..."
    systemctl start cloudflared || {
        echo "   ⚠️  Could not start service. You may need to run manually:"
        echo "   cloudflared tunnel --config $CONFIG_FILE run $TUNNEL_ID"
    }
}

systemctl enable cloudflared 2>/dev/null || true

# Step 9: Check service status
echo ""
echo "8️⃣  Checking service status..."
sleep 2
if systemctl is-active --quiet cloudflared; then
    echo "   ✅ Cloudflare Tunnel service is running"
else
    echo "   ⚠️  Service is not running. Check logs:"
    echo "   journalctl -u cloudflared -n 50"
fi

# Step 10: Verify DNS
echo ""
echo "9️⃣  Verifying DNS configuration..."
echo "   Waiting 10 seconds for DNS propagation..."
sleep 10

DNS_CHECK=$(dig +short "$DOMAIN" @8.8.8.8 | head -1)
if [[ "$DNS_CHECK" == *"cfargotunnel"* ]] || [[ "$DNS_CHECK" == *"tunnel"* ]]; then
    echo "   ✅ DNS points to Cloudflare Tunnel"
else
    echo "   ⚠️  DNS may not be updated yet. Current: $DNS_CHECK"
    echo "   Expected: *.cfargotunnel.com"
fi

# Summary
echo ""
echo "✅ Cloudflare Tunnel Setup Complete!"
echo "===================================="
echo ""
echo "📋 Summary:"
echo "   Tunnel ID: $TUNNEL_ID"
echo "   Domain: $DOMAIN"
echo "   Service: http://localhost:$SERVICE_PORT"
echo "   Config: $CONFIG_FILE"
echo ""
echo "🔗 Access URLs:"
echo "   HTTPS: https://$DOMAIN"
echo "   (Wait 2-5 minutes for DNS propagation)"
echo ""
echo "🧪 Test:"
echo "   curl https://$DOMAIN/healthz"
echo ""
echo "📊 Service Status:"
echo "   systemctl status cloudflared"
echo "   journalctl -u cloudflared -f"
echo ""
