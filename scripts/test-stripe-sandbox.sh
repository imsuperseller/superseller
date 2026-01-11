#!/bin/bash
# Stripe Webhook Test Script
# Simulates a checkout.session.completed event for pillar-purchase flow

# Configuration
API_URL="${1:-http://localhost:3002}"
TEST_EMAIL="${2:-test-sandbox@example.com}"
PILLAR_ID="${3:-leads}"

echo "=== Stripe Sandbox Test ==="
echo "API URL: $API_URL"
echo "Email: $TEST_EMAIL"
echo "Pillar: $PILLAR_ID"
echo ""

# 1. Test creating a checkout session
echo "📦 Step 1: Creating checkout session for pillar-purchase..."
CHECKOUT_RESPONSE=$(curl -s -X POST "$API_URL/api/checkout" \
  -H "Content-Type: application/json" \
  -d "{
    \"flowType\": \"pillar-purchase\",
    \"productId\": \"$PILLAR_ID\",
    \"customerEmail\": \"$TEST_EMAIL\",
    \"metadata\": {}
  }")

echo "$CHECKOUT_RESPONSE" | jq .

CHECKOUT_URL=$(echo "$CHECKOUT_RESPONSE" | jq -r '.url // empty')
if [ -z "$CHECKOUT_URL" ]; then
  echo "❌ Failed to create checkout session"
  echo "Error: $(echo "$CHECKOUT_RESPONSE" | jq -r '.error // "Unknown error"')"
  exit 1
fi

echo ""
echo "✅ Checkout session created!"
echo "🔗 Checkout URL: $CHECKOUT_URL"
echo ""

# 2. Extract session ID from URL
SESSION_ID=$(echo "$CHECKOUT_URL" | grep -o 'cs_[^/]*' | head -1)
echo "📋 Session ID: $SESSION_ID"

echo ""
echo "=== Next Steps ==="
echo "1. Open the checkout URL in a browser"
echo "2. Use Stripe test card: 4242 4242 4242 4242"
echo "3. Any future date, any CVC, any ZIP"
echo "4. Complete the payment"
echo "5. Check Firestore 'users' collection for entitlements update"
echo ""
echo "Or use Stripe CLI to trigger webhook:"
echo "  stripe trigger checkout.session.completed --override checkout_session:customer_email=$TEST_EMAIL"
