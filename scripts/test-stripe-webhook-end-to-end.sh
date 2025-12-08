#!/bin/bash

# End-to-End Stripe Webhook Test
# Uses Stripe CLI to forward webhooks and trigger test events

set -e

echo "🧪 Stripe Webhook End-to-End Test"
echo "==================================="
echo ""

VERCEL_WEBHOOK_URL="${VERCEL_WEBHOOK_URL:-https://rensto.com/api/stripe/webhook}"
N8N_URL="${N8N_URL:-https://n8n.rensto.com}"

# Step 1: Start Stripe webhook listener in background
echo "1️⃣  Starting Stripe webhook listener..."
echo "   Forwarding to: $VERCEL_WEBHOOK_URL"
echo ""

# Get the webhook signing secret from Stripe CLI
WEBHOOK_SECRET=$(stripe listen --forward-to "$VERCEL_WEBHOOK_URL" --print-secret 2>&1 | grep -o 'whsec_[a-zA-Z0-9]*' | head -1 || echo "")

if [ -z "$WEBHOOK_SECRET" ]; then
    echo "   ⚠️  Starting listener in background..."
    stripe listen --forward-to "$VERCEL_WEBHOOK_URL" > /tmp/stripe-listener.log 2>&1 &
    LISTENER_PID=$!
    sleep 5
    
    # Extract webhook secret from logs
    WEBHOOK_SECRET=$(grep -o 'whsec_[a-zA-Z0-9]*' /tmp/stripe-listener.log | head -1 || echo "")
    
    if [ -z "$WEBHOOK_SECRET" ]; then
        echo "   ❌ Could not get webhook secret. Check /tmp/stripe-listener.log"
        kill $LISTENER_PID 2>/dev/null || true
        exit 1
    fi
    
    echo "   ✅ Listener started (PID: $LISTENER_PID)"
    echo "   ✅ Webhook secret: $WEBHOOK_SECRET"
else
    echo "   ✅ Webhook secret: $WEBHOOK_SECRET"
    LISTENER_PID=""
fi

echo ""

# Step 2: Trigger test event
echo "2️⃣  Triggering test checkout.session.completed event..."
echo ""

# Use correct Stripe CLI syntax
stripe trigger checkout.session.completed \
    --override checkout_session:metadata[flowType]=marketplace-template \
    --override checkout_session:metadata[productId]=test-product-123 \
    --override checkout_session:metadata[customerName]="Test Customer" \
    --override checkout_session:amount_total=19700 \
    --override checkout_session:currency=usd \
    --override checkout_session:customer_email=test@rensto.com \
    --format=json > /tmp/stripe-event.json 2>&1 || {
    echo "   ⚠️  Event trigger failed. Trying alternative method..."
    echo ""
    echo "   💡 Alternative: Use Stripe Dashboard"
    echo "      1. Go to: https://dashboard.stripe.com/test/webhooks"
    echo "      2. Click 'Send test webhook'"
    echo "      3. Select 'checkout.session.completed'"
    echo "      4. Add metadata: flowType=marketplace-template"
    echo ""
}

if [ -f /tmp/stripe-event.json ]; then
    EVENT_ID=$(jq -r '.id' /tmp/stripe-event.json 2>/dev/null || echo "")
    if [ -n "$EVENT_ID" ] && [ "$EVENT_ID" != "null" ]; then
        echo "   ✅ Event triggered: $EVENT_ID"
    fi
fi

echo ""

# Step 3: Wait and check results
echo "3️⃣  Waiting for webhook processing (10 seconds)..."
sleep 10
echo ""

# Step 4: Check Vercel logs (if accessible)
echo "4️⃣  Checking integration status..."
echo "   📊 Vercel logs: https://vercel.com/shais-projects-f9b9e359/api-rensto-site"
echo "   📊 n8n executions: $N8N_URL/executions"
echo ""

# Step 5: Check n8n executions
echo "5️⃣  Checking n8n executions..."
if command -v curl > /dev/null; then
    EXECUTIONS=$(curl -s "${N8N_URL}/api/v1/executions?limit=3" 2>/dev/null || echo "{}")
    if echo "$EXECUTIONS" | jq -e '.data.executions[0]' > /dev/null 2>&1; then
        LATEST=$(echo "$EXECUTIONS" | jq -r '.data.executions[0] | "ID: \(.id) | Workflow: \(.workflowId) | Status: \(.status)"')
        echo "   Latest execution: $LATEST"
    else
        echo "   ⚠️  Could not fetch executions (may need API key or check manually)"
    fi
else
    echo "   ⚠️  curl not available, skipping execution check"
fi

echo ""

# Cleanup
if [ -n "$LISTENER_PID" ]; then
    echo "6️⃣  Stopping webhook listener..."
    kill $LISTENER_PID 2>/dev/null || true
    echo "   ✅ Listener stopped"
    echo ""
fi

echo "✅ Test complete!"
echo ""
echo "📝 Verification Steps:"
echo "   1. Check Vercel logs for webhook receipt"
echo "   2. Check n8n executions for workflow trigger"
echo "   3. Verify STRIPE-MARKETPLACE-001 workflow executed"
echo "   4. Check Boost.space/Airtable for new customer/purchase records"
echo ""
