#!/bin/bash
# WAHA Profile Picture Upload and Update Script for Rensto Sessions
# Updates default, rensto-whatsapp, and tax4us sessions with Rensto logo

API_KEY="4fc7e008d7d24fc995475029effc8fa8"
VPS_IP="172.245.56.50"
VPS_USER="root"
VPS_PASSWORD="y0JEu4uI0hAQ606Mfr"
IMAGE_FILE="/Users/shaifriedman/New Rensto/rensto/assets/images/rensto logo.png"
IMAGE_FILENAME="rensto-logo.png"
VPS_IMAGE_PATH="/var/www/html/images/${IMAGE_FILENAME}"
PUBLIC_URL="http://${VPS_IP}/images/${IMAGE_FILENAME}"

# Sessions to update (Rensto logo)
SESSIONS=("default" "rensto-whatsapp")

# Check if file exists
if [ ! -f "$IMAGE_FILE" ]; then
  echo "❌ Error: File not found: $IMAGE_FILE"
  exit 1
fi

echo "📤 Uploading Rensto logo to VPS..."
echo "   File: $IMAGE_FILE"
echo "   Destination: $VPS_IMAGE_PATH"
echo ""

# Create directory on VPS if it doesn't exist
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "mkdir -p /var/www/html/images" 2>&1

# Upload file to VPS
if sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no "$IMAGE_FILE" "$VPS_USER@$VPS_IP:$VPS_IMAGE_PATH" 2>&1; then
  echo "✅ Image uploaded successfully"
  echo "   Public URL: $PUBLIC_URL"
  echo ""
else
  echo "❌ Failed to upload image to VPS"
  exit 1
fi

# Wait a moment for file to be accessible
sleep 2

# Verify file is accessible
if curl -s -I "$PUBLIC_URL" | grep -q "200 OK\|Content-Type: image"; then
  echo "✅ Image is publicly accessible"
  echo ""
else
  echo "⚠️  Warning: Image may not be accessible yet. Continuing anyway..."
  echo ""
fi

# Update profile picture for each session
for SESSION_NAME in "${SESSIONS[@]}"; do
  echo "📷 Updating WAHA profile picture for session: $SESSION_NAME"
  echo "   Image URL: $PUBLIC_URL"
  
  RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT \
    -H "x-api-key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"file\":{\"url\":\"${PUBLIC_URL}\"}}" \
    "http://${VPS_IP}:3000/api/${SESSION_NAME}/profile/picture")
  
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
  
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Profile picture updated successfully for $SESSION_NAME"
  else
    echo "   ❌ Failed to update profile picture for $SESSION_NAME (HTTP $HTTP_STATUS)"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  fi
  echo ""
done

echo "📋 Next Steps:"
echo "1. Check WhatsApp to see the updated profile pictures"
echo "2. It may take 10-30 seconds to sync"
echo "3. Image is available at: $PUBLIC_URL"

