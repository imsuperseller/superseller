#!/bin/bash
# 🛠️ Cloudflare DNS Remediation Script
# Purpose: Align DNS records with the Rensto System Blueprint

ZONE_ID="031333b77c859d1dd4d4fd4afdc1b9bc"
TOKEN="UH1jMzVfPgk2NxMkrmucvgIK5xv4Q_tTvtb3zvo1"
VPS_IP="172.245.56.50"

echo "🚀 Starting DNS Remediation for rensto.com..."

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

# 1. Management: api.rensto.com & market.rensto.com
# These are handled by Vercel (CNAME to cname.vercel-dns.com)
# Removed A record upserts to avoid invalid configurations.

# 3. Add gateway.rensto.com
upsert_a_record "gateway.rensto.com" "$VPS_IP"

# 4. Add waha.rensto.com
upsert_a_record "waha.rensto.com" "$VPS_IP"

# 5. Add browserless.rensto.com
upsert_a_record "browserless.rensto.com" "$VPS_IP"

# 6. Add hyperise.rensto.com
upsert_a_record "hyperise.rensto.com" "$VPS_IP"

# 7. Add rag.rensto.com
upsert_a_record "rag.rensto.com" "$VPS_IP"

echo "✅ DNS Remediation Complete."
