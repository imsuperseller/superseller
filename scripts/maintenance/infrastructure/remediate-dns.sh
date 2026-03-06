#!/bin/bash
# 🛠️ Cloudflare DNS Remediation Script
# Purpose: Align DNS records with the SuperSeller AI System Blueprint

ZONE_ID="031333b77c859d1dd4d4fd4afdc1b9bc"
TOKEN="${CLOUDFLARE_API_TOKEN}"
VPS_IP="172.245.56.50"

echo "🚀 Starting DNS Remediation for superseller.agency..."

# Function to add/update A record
upsert_a_record() {
    local SUBDOMAIN=$1
    local CONTENT=$2
    echo "Processing $SUBDOMAIN -> $CONTENT..."
    
    # Check if record exists
    local RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$SUBDOMAIN" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['result'][0]['id'] if data['result'] else '')")

    if [ -n "$RECORD_ID" ]; then
        echo "Updating existing record $SUBDOMAIN ($RECORD_ID)..."
        curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"A\",\"name\":\"$SUBDOMAIN\",\"content\":\"$CONTENT\",\"proxied\":true}" > /dev/null
    else
        echo "Creating new record $SUBDOMAIN..."
        curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"A\",\"name\":\"$SUBDOMAIN\",\"content\":\"$CONTENT\",\"proxied\":true}" > /dev/null
    fi
}

# 1. Management: api.superseller.agency & market.superseller.agency
# These are handled by Vercel (CNAME to cname.vercel-dns.com)
# Removed A record upserts to avoid invalid configurations.

# 3. Add gateway.superseller.agency
upsert_a_record "gateway.superseller.agency" "$VPS_IP"

# 4. Add waha.superseller.agency
upsert_a_record "waha.superseller.agency" "$VPS_IP"

# 5. Add browserless.superseller.agency
upsert_a_record "browserless.superseller.agency" "$VPS_IP"

# 6. Add hyperise.superseller.agency
upsert_a_record "hyperise.superseller.agency" "$VPS_IP"

# 7. Add rag.superseller.agency
upsert_a_record "rag.superseller.agency" "$VPS_IP"

echo "✅ DNS Remediation Complete."
