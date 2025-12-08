#!/bin/bash

# Test Stripe Webhook Integration with Real Event
# This script uses Stripe CLI to trigger a real test event

set -e

echo "🧪 Stripe Webhook Integration Test - Real Event"
echo "================================================"
echo ""

# Configuration
VERCEL_WEBHOOK_URL="${VERCEL_WEBHOOK_URL:-https://rensto.com/api/stripe/webhook}"
N8N_URL="${N8N_URL:-https://n8n.rensto.com}"

echo "📋 Configuration:"
echo "   Vercel Webhook: $VERCEL_WEBHOOK_URL"
echo "   n8n URL: $N8N_URL"
echo ""

# Step 1: Check Stripe CLI authentication
echo "1️⃣  Checking Stripe CLI authentication..."
if ! stripe config --list > /dev/null 2>&1; then
    echo "   ⚠️  Stripe CLI not authenticated. Please run: stripe login"
    exit 1
fi
echo "   ✅ Stripe CLI authenticated"
echo ""

# Step 2: Test n8n connectivity
echo "2️⃣  Testing n8n connectivity..."
if curl -s -f "${N8N_URL}/healthz" > /dev/null; then
    echo "   ✅ n8n is accessible"
else
    echo "   ❌ n8n is not accessible"
    exit 1
fi
echo ""

# Step 3: Trigger test checkout.session.completed event
echo "3️⃣  Triggering test checkout.session.completed event..."
echo "   This will send a real Stripe event to: $VERCEL_WEBHOOK_URL"
echo ""

# Create a test checkout session first (optional, but more realistic)
echo "   Creating test checkout session..."
SESSION_ID=$(stripe checkout sessions create \
    --success-url="https://rensto.com/success" \
    --cancel-url="https://rensto.com/cancel" \
    --mode=payment \
    --line-items[0][price_data][currency]=usd \
    --line-items[0][price_data][product_data][name]="Test Product" \
    --line-items[0][price_data][unit_amount]=19700 \
    --metadata[flowType]=marketplace-template \
    --metadata[productId]=test-product-123 \
    --metadata[customerName]="Test Customer" \
    --customer-email="test@rensto.com" \
    --format=json 2>/dev/null | jq -r '.id' || echo "")

if [ -n "$SESSION_ID" ]; then
    echo "   ✅ Created test session: $SESSION_ID"
else
    echo "   ⚠️  Could not create session (may need Stripe account setup)"
    SESSION_ID="cs_test_$(date +%s)"
fi
echo ""

# Step 4: Trigger the webhook event
echo "4️⃣  Triggering webhook event..."
echo "   Event: checkout.session.completed"
echo "   Session ID: $SESSION_ID"
echo ""

# Trigger the event - this sends it to Stripe's webhook endpoint
# We need to forward it to our Vercel endpoint
echo "   Using Stripe CLI to trigger event..."
echo "   Note: This will send to Stripe's webhook endpoint"
echo "   To forward to Vercel, use: stripe listen --forward-to $VERCEL_WEBHOOK_URL"
echo ""

# Alternative: Use stripe trigger to create a test event
echo "   Triggering test event via Stripe CLI..."
stripe trigger checkout.session.completed \
    --override checkout.session.id="$SESSION_ID" \
    --override checkout.session.amount_total=19700 \
    --override checkout.session.currency=usd \
    --override checkout.session.customer_email="test@rensto.com" \
    --override checkout.session.metadata.flowType="marketplace-template" \
    --override checkout.session.metadata.productId="test-product-123" \
    --override checkout.session.metadata.customerName="Test Customer" \
    --format=json || {
    echo "   ⚠️  Could not trigger event (may need webhook endpoint configured)"
    echo ""
    echo "   💡 Alternative: Use Stripe Dashboard to send test webhook"
    echo "      1. Go to: https://dashboard.stripe.com/test/webhooks"
    echo "      2. Click on your webhook endpoint"
    echo "      3. Click 'Send test webhook'"
    echo "      4. Select 'checkout.session.completed'"
    echo ""
}

echo ""
echo "5️⃣  Monitoring for execution..."
echo "   Waiting 5 seconds for webhook to process..."
sleep 5

# Check n8n executions
echo ""
echo "📊 Checking n8n executions..."
EXECUTIONS=$(curl -s "${N8N_URL}/api/v1/executions?limit=3" \
    -H "X-N8N-API-KEY: ${N8N_API_KEY:-}" 2>/dev/null || echo "{}")

if echo "$EXECUTIONS" | jq -e '.data.executions[0]' > /dev/null 2>&1; then
    LATEST_EXEC=$(echo "$EXECUTIONS" | jq -r '.data.executions[0] | "\(.id) - \(.workflowId) - \(.status)"')
    echo "   Latest execution: $LATEST_EXEC"
else
    echo "   ⚠️  Could not fetch executions (may need API key)"
fi

echo ""
echo "✅ Test complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Check Vercel logs: https://vercel.com/shais-projects-f9b9e359/api-rensto-site"
echo "   2. Check n8n executions: ${N8N_URL}/executions"
echo "   3. Verify workflow execution: STRIPE-MARKETPLACE-001"
echo "   4. Check Boost.space/Airtable for new records"
echo ""
