#!/bin/bash

# Complete Stripe Webhook Test with Real Event Forwarding
# This script properly forwards a Stripe event to Vercel

set -e

VERCEL_URL="${VERCEL_URL:-https://rensto.com/api/stripe/webhook}"
N8N_URL="${N8N_URL:-https://n8n.rensto.com}"

echo "🧪 Complete Stripe Webhook Test"
echo "================================"
echo ""
echo "📋 Configuration:"
echo "   Vercel: $VERCEL_URL"
echo "   n8n: $N8N_URL"
echo ""

# Step 1: Start listener in background
echo "1️⃣  Starting Stripe webhook listener..."
echo "   This will forward events to: $VERCEL_URL"
echo "   Press Ctrl+C to stop after test completes"
echo ""

# Start listener and capture PID
stripe listen --forward-to "$VERCEL_URL" > /tmp/stripe-forward.log 2>&1 &
LISTENER_PID=$!

# Wait for listener to start
sleep 3

# Extract webhook secret
WEBHOOK_SECRET=$(grep -o 'whsec_[a-zA-Z0-9]*' /tmp/stripe-forward.log | head -1 || echo "")

if [ -z "$WEBHOOK_SECRET" ]; then
    echo "   ⚠️  Could not extract webhook secret from logs"
    echo "   Check /tmp/stripe-forward.log for details"
    kill $LISTENER_PID 2>/dev/null || true
    exit 1
fi

echo "   ✅ Listener started (PID: $LISTENER_PID)"
echo "   ✅ Webhook secret: $WEBHOOK_SECRET"
echo ""

# Step 2: Trigger test event
echo "2️⃣  Triggering test checkout.session.completed event..."
echo ""

EVENT_OUTPUT=$(stripe trigger checkout.session.completed --format=json 2>&1)
EVENT_ID=$(echo "$EVENT_OUTPUT" | jq -r '.id // empty' 2>/dev/null || echo "")

if [ -n "$EVENT_ID" ] && [ "$EVENT_ID" != "null" ]; then
    echo "   ✅ Event triggered: $EVENT_ID"
else
    echo "   ⚠️  Event triggered (check Stripe Dashboard for details)"
    echo "$EVENT_OUTPUT" | head -10
fi

echo ""

# Step 3: Wait for processing
echo "3️⃣  Waiting for webhook processing (10 seconds)..."
echo "   Monitor /tmp/stripe-forward.log for delivery status"
sleep 10
echo ""

# Step 4: Check logs
echo "4️⃣  Checking delivery status..."
if [ -f /tmp/stripe-forward.log ]; then
    if grep -q "200 OK" /tmp/stripe-forward.log; then
        echo "   ✅ Webhook delivered successfully (200 OK)"
    elif grep -q "400\|401\|403\|500" /tmp/stripe-forward.log; then
        echo "   ⚠️  Webhook delivery had errors:"
        grep -E "400|401|403|500" /tmp/stripe-forward.log | tail -3
    else
        echo "   ℹ️  Check /tmp/stripe-forward.log for delivery details"
    fi
fi
echo ""

# Step 5: Check n8n executions
echo "5️⃣  Checking n8n executions..."
EXECUTIONS=$(curl -s "${N8N_URL}/api/v1/executions?limit=3" 2>/dev/null || echo "{}")

if echo "$EXECUTIONS" | jq -e '.data.executions[0]' > /dev/null 2>&1; then
    LATEST=$(echo "$EXECUTIONS" | jq -r '.data.executions[0]')
    EXEC_ID=$(echo "$LATEST" | jq -r '.id')
    WORKFLOW_ID=$(echo "$LATEST" | jq -r '.workflowId')
    STATUS=$(echo "$LATEST" | jq -r '.status')
    STARTED=$(echo "$LATEST" | jq -r '.startedAt')
    
    echo "   Latest execution:"
    echo "      ID: $EXEC_ID"
    echo "      Workflow: $WORKFLOW_ID"
    echo "      Status: $STATUS"
    echo "      Started: $STARTED"
    
    if [ "$STATUS" = "success" ]; then
        echo "   ✅ Workflow executed successfully!"
    elif [ "$STATUS" = "error" ]; then
        echo "   ⚠️  Workflow execution had errors (check workflow configuration)"
    fi
else
    echo "   ⚠️  Could not fetch executions"
fi

echo ""

# Step 6: Summary
echo "📊 Test Summary"
echo "==============="
echo "✅ Stripe listener: Started"
echo "✅ Test event: Triggered"
echo "✅ Webhook forwarding: Active"
echo "✅ n8n execution: Checked"
echo ""

# Keep listener running for manual testing
echo "💡 Listener is still running (PID: $LISTENER_PID)"
echo "   To stop: kill $LISTENER_PID"
echo "   Logs: /tmp/stripe-forward.log"
echo ""
echo "📝 Next Steps:"
echo "   1. Check Vercel logs: https://vercel.com/shais-projects-f9b9e359/api-rensto-site"
echo "   2. Check n8n workflow: STRIPE-MARKETPLACE-001"
echo "   3. Verify Boost.space/Airtable records"
echo "   4. Trigger more events: stripe trigger checkout.session.completed"
echo ""
