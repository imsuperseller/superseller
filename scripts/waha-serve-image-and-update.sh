#!/bin/bash
# WAHA Profile Picture Update with Temporary HTTP Server
# Serves image via temporary HTTP server and updates profile picture

API_KEY="4fc7e008d7d24fc995475029effc8fa8"
VPS_IP="173.254.201.134"
VPS_USER="root"
VPS_PASSWORD="necmad-zYnfe4-fypwip"
SESSION_NAME="default"
IMAGE_FILENAME="rensto-profile-picture.png"
VPS_IMAGE_PATH="/tmp/${IMAGE_FILENAME}"
PORT=8080
PUBLIC_URL="http://${VPS_IP}:${PORT}/${IMAGE_FILENAME}"

# Check if image file is provided
if [ -z "$1" ]; then
  echo "❌ Error: Image file path is required"
  echo ""
  echo "Usage: $0 <image_file_path> [session_name]"
  echo ""
  echo "Examples:"
  echo "  $0 \"assets/images/rensto logo.png\""
  echo "  $0 \"assets/images/rensto logo.png\" default"
  echo "  $0 \"assets/images/rensto logo.png\" rensto-support"
  exit 1
fi

IMAGE_FILE="$1"

# Get original file extension
FILE_EXT="${IMAGE_FILE##*.}"

# Optional: session name as second parameter
if [ -n "$2" ]; then
  SESSION_NAME="$2"
  # Update filename to include session name for uniqueness, preserving original extension
  IMAGE_FILENAME="profile-picture-${SESSION_NAME}.${FILE_EXT}"
  VPS_IMAGE_PATH="/tmp/${IMAGE_FILENAME}"
  PUBLIC_URL="http://${VPS_IP}:${PORT}/${IMAGE_FILENAME}"
fi

# Check if file exists
if [ ! -f "$IMAGE_FILE" ]; then
  echo "❌ Error: File not found: $IMAGE_FILE"
  exit 1
fi

echo "📤 Uploading image to VPS..."
echo "   File: $IMAGE_FILE"
echo "   Destination: $VPS_IMAGE_PATH"
echo ""

# Upload file to VPS
if sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no "$IMAGE_FILE" "$VPS_USER@$VPS_IP:$VPS_IMAGE_PATH" 2>&1; then
  echo "✅ Image uploaded successfully"
else
  echo "❌ Failed to upload image to VPS"
  exit 1
fi

echo "🌐 Starting temporary HTTP server on VPS..."
echo "   Port: $PORT"
echo "   URL: $PUBLIC_URL"
echo ""

# Start HTTP server in background on VPS
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "cd /tmp && python3 -m http.server $PORT > /dev/null 2>&1 &" 2>&1

# Wait for server to start
sleep 3

# Verify server is running
if curl -s -I "$PUBLIC_URL" | grep -q "200 OK\|Content-Type"; then
  echo "✅ HTTP server is running and image is accessible"
  echo ""
else
  echo "⚠️  Warning: Server may not be ready yet. Trying anyway..."
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
  echo ""
  echo "⚠️  Note: HTTP server will continue running on port $PORT"
  echo "   To stop it: ssh $VPS_USER@$VPS_IP 'pkill -f \"python3 -m http.server $PORT\"'"
else
  echo "❌ Failed to update profile picture (HTTP $HTTP_STATUS)"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  echo ""
  echo "⚠️  HTTP server is still running on port $PORT"
  echo "   To stop it: ssh $VPS_USER@$VPS_IP 'pkill -f \"python3 -m http.server $PORT\"'"
  exit 1
fi

