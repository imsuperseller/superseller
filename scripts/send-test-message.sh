#!/bin/bash
# Send test WhatsApp message via WAHA API

API_KEY="4fc7e008d7d24fc995475029effc8fa8"
VPS_IP="173.254.201.134"
SESSION="default"
CHAT_ID="14695885133@c.us"  # User's WhatsApp number
MESSAGE="Hello Donna, what materials are best for kitchen cabinets?"

echo "📤 Sending test message via WAHA..."
echo "To: ${CHAT_ID}"
echo "Message: ${MESSAGE}"
echo ""

RESPONSE=$(curl -s -X POST \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"session\": \"${SESSION}\",
    \"chatId\": \"${CHAT_ID}\",
    \"text\": \"${MESSAGE}\"
  }" \
  "http://${VPS_IP}:3000/api/sendText")

echo "Response: ${RESPONSE}"
echo ""

if echo "${RESPONSE}" | grep -q "sent\|id\|messageId"; then
  echo "✅ Message sent successfully!"
  echo "📱 Check your WhatsApp for the message"
  echo "🔄 Reply to it to trigger the workflow"
else
  echo "❌ Failed to send message"
  echo "Response: ${RESPONSE}"
fi

