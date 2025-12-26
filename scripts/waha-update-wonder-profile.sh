#!/bin/bash
# WAHA Profile Picture Upload and Update Script for Wonder Session
# Uploads a local image file to VPS and updates WAHA profile picture

API_KEY="4fc7e008d7d24fc995475029effc8fa8"
VPS_IP="172.245.56.50"
VPS_USER="root"
VPS_PASSWORD="y0JEu4uI0hAQ606Mfr"
SESSION_NAME="wonder"
IMAGE_FILENAME="wonder-logo.png"
VPS_IMAGE_PATH="/var/www/html/images/${IMAGE_FILENAME}"
PUBLIC_URL="http://${VPS_IP}/images/${IMAGE_FILENAME}"

# Use provided image file or default
IMAGE_FILE="${1:-/Users/shaifriedman/New Rensto/rensto/assets/cropped-logo-4-rfszeu1jrsg7799kop1ftnks89w4iyuwgtodmjz2ow.png}"

# Check if file exists
if [ ! -f "$IMAGE_FILE" ]; then
  echo "❌ Error: File not found: $IMAGE_FILE"
  exit 1
fi

echo "📤 Uploading image to VPS..."
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

# Update profile picture
echo "📷 Updating WAHA profile picture..."
echo "   Session: $SESSION_NAME"
echo "   Image URL: $PUBLIC_URL"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"file\":{\"url\":\"${PUBLIC_URL}\"}}" \
  "http://${VPS_IP}:3000/api/${SESSION_NAME}/profile/picture")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Profile picture updated successfully"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  echo ""
  echo "📋 Next Steps:"
  echo "1. Check WhatsApp to see the updated profile picture"
  echo "2. It may take 10-30 seconds to sync"
  echo "3. Image is available at: $PUBLIC_URL"
else
  echo "❌ Failed to update profile picture (HTTP $HTTP_STATUS)"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi

