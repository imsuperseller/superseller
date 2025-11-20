#!/bin/bash
# WAHA QR Code Generator Script
# Gets QR code for WhatsApp linking

API_KEY="4fc7e008d7d24fc995475029effc8fa8"
VPS_IP="173.254.201.134"
SESSION_NAME="default"

echo "🔍 Checking existing sessions..."
SESSIONS=$(curl -s -H "x-api-key: ${API_KEY}" "http://${VPS_IP}:3000/api/sessions")
echo "Sessions: $SESSIONS"
echo ""

# Create session if it doesn't exist
echo "📱 Creating/Starting session: ${SESSION_NAME}..."
SESSION_RESPONSE=$(curl -s -X POST \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${SESSION_NAME}\"}" \
  "http://${VPS_IP}:3000/api/sessions")

echo "Session Response: $SESSION_RESPONSE"
echo ""

# Start the session
echo "🚀 Starting session..."
START_RESPONSE=$(curl -s -X POST \
  -H "x-api-key: ${API_KEY}" \
  "http://${VPS_IP}:3000/api/sessions/${SESSION_NAME}/start")

echo "Start Response: $START_RESPONSE"
echo ""

# Get QR code (save as PNG image)
echo "📷 Getting QR code..."
QR_FILE="/tmp/waha-qr-code.png"
curl -s -H "x-api-key: ${API_KEY}" \
  "http://${VPS_IP}:3000/api/${SESSION_NAME}/auth/qr" \
  -o "$QR_FILE"

if [ -f "$QR_FILE" ] && [ -s "$QR_FILE" ]; then
  echo "✅ QR Code saved to: $QR_FILE"
  echo ""
  echo "📱 Opening QR code image..."
  # Try to open with default image viewer
  if command -v open >/dev/null 2>&1; then
    # macOS
    open "$QR_FILE"
  elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "$QR_FILE"
  else
    echo "💡 Please open this file manually: $QR_FILE"
  fi
else
  echo "❌ Failed to get QR code. Check session status."
  echo "Session status:"
  curl -s -H "x-api-key: ${API_KEY}" \
    "http://${VPS_IP}:3000/api/sessions/${SESSION_NAME}" | python3 -m json.tool 2>/dev/null || echo "Failed to get status"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Open the QR code URL/image above"
echo "2. Open WhatsApp on your phone"
echo "3. Go to Settings → Linked Devices → Link a Device"
echo "4. Scan the QR code"
echo "5. Done! Your phone can now be offline."

