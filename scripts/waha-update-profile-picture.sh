#!/bin/bash
# WAHA Profile Picture Update Script
# Updates the WhatsApp profile picture for the default session

API_KEY="4fc7e008d7d24fc995475029effc8fa8"
VPS_IP="173.254.201.134"
SESSION_NAME="default"

# Check if image URL is provided
if [ -z "$1" ]; then
  echo "❌ Error: Image URL is required"
  echo ""
  echo "Usage: $0 <image_url>"
  echo ""
  echo "Example:"
  echo "  $0 https://example.com/profile-picture.jpg"
  echo ""
  echo "Or to remove profile picture:"
  echo "  $0 --delete"
  exit 1
fi

# Handle delete operation
if [ "$1" = "--delete" ] || [ "$1" = "-d" ]; then
  echo "🗑️  Deleting profile picture..."
  RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE \
    -H "x-api-key: ${API_KEY}" \
    "http://${VPS_IP}:3000/api/${SESSION_NAME}/profile/picture")
  
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
  
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Profile picture deleted successfully"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  else
    echo "❌ Failed to delete profile picture (HTTP $HTTP_STATUS)"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
  fi
  exit 0
fi

IMAGE_URL="$1"

# Validate URL format
if [[ ! "$IMAGE_URL" =~ ^https?:// ]]; then
  echo "❌ Error: Invalid URL format. Must start with http:// or https://"
  exit 1
fi

echo "📷 Updating profile picture..."
echo "   Session: ${SESSION_NAME}"
echo "   Image URL: ${IMAGE_URL}"
echo ""

# Update profile picture
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"file\":{\"url\":\"${IMAGE_URL}\"}}" \
  "http://${VPS_IP}:3000/api/${SESSION_NAME}/profile/picture")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Profile picture updated successfully"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo "❌ Failed to update profile picture (HTTP $HTTP_STATUS)"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "1. Check WhatsApp to see the updated profile picture"
echo "2. It may take a few seconds to sync"
echo "3. To remove: $0 --delete"

