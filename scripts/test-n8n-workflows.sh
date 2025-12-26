#!/bin/bash
# n8n Marketing Agency Workflow Test Suite
# Usage: ./test-n8n-workflows.sh [test_email]

set -e

# Configuration
N8N_BASE_URL="https://n8n.rensto.com/webhook"
TEST_EMAIL="${1:-test@example.com}"
TEST_NAME="Test User $(date +%s)"
TEST_COMPANY="Test Corp"
TEST_PHONE="+1234567890"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 n8n Marketing Agency Workflow Tests"
echo "=========================================="
echo "Test Email: $TEST_EMAIL"
echo ""

# Test 1: Lead Intake
echo -e "${YELLOW}[1/5] Testing Workflow #1: Lead Intake...${NC}"
RESPONSE=$(curl -s -X POST "$N8N_BASE_URL/lead-intake" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"phone\": \"$TEST_PHONE\",
    \"message\": \"I need help automating my sales process. Looking for a quote.\",
    \"company\": \"$TEST_COMPANY\",
    \"website\": \"https://example.com\",
    \"source\": \"test-script\",
    \"consent\": true
  }")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Lead Intake: SUCCESS${NC}"
  echo "   Response: $RESPONSE"
else
  echo -e "${RED}❌ Lead Intake: FAILED${NC}"
  echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: TidyCal Booking (simulated)
echo -e "${YELLOW}[2/5] Testing Workflow #3a: TidyCal Booking...${NC}"
RESPONSE=$(curl -s -X POST "$N8N_BASE_URL/tidycal-booking" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"event_name\": \"Discovery Call\",
    \"name\": \"$TEST_NAME\",
    \"body\": {
      \"email\": \"$TEST_EMAIL\",
      \"event_name\": \"Discovery Call\"
    }
  }")

echo "   Response: $RESPONSE"
if [ -n "$RESPONSE" ]; then
  echo -e "${GREEN}✅ TidyCal Webhook: Received${NC}"
else
  echo -e "${YELLOW}⚠️  TidyCal Webhook: No response (check n8n logs)${NC}"
fi
echo ""

# Test 3: eSignatures Contract Signed (simulated)
echo -e "${YELLOW}[3/5] Testing Workflow #3b: Contract Signed...${NC}"
RESPONSE=$(curl -s -X POST "$N8N_BASE_URL/esignatures-webhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"contract-signed\",
    \"body\": {
      \"status\": \"contract-signed\",
      \"data\": {
        \"contract\": {
          \"id\": \"test-contract-$(date +%s)\",
          \"metadata\": \"test-lead-id\",
          \"signers\": [{\"name\": \"$TEST_NAME\", \"email\": \"$TEST_EMAIL\"}],
          \"contract_pdf_url\": \"https://example.com/contract.pdf\"
        }
      }
    },
    \"data\": {
      \"contract\": {
        \"id\": \"test-contract-$(date +%s)\",
        \"metadata\": \"test-lead-id\",
        \"signers\": [{\"name\": \"$TEST_NAME\", \"email\": \"$TEST_EMAIL\"}],
        \"contract_pdf_url\": \"https://example.com/contract.pdf\"
      }
    }
  }")

echo "   Response: $RESPONSE"
if [ -n "$RESPONSE" ]; then
  echo -e "${GREEN}✅ eSignatures Webhook: Received${NC}"
else
  echo -e "${YELLOW}⚠️  eSignatures Webhook: No response (check n8n logs)${NC}"
fi
echo ""

# Test 4: Stripe Payment Complete (simulated)
echo -e "${YELLOW}[4/5] Testing Workflow #3c: Payment Complete...${NC}"
RESPONSE=$(curl -s -X POST "$N8N_BASE_URL/stripe-payment-complete" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"checkout.session.completed\",
    \"body\": {
      \"type\": \"checkout.session.completed\",
      \"data\": {
        \"object\": {
          \"metadata\": {\"lead_id\": \"test-lead\", \"contract_id\": \"test-contract\"},
          \"customer_details\": {\"email\": \"$TEST_EMAIL\"},
          \"amount_total\": 500000,
          \"payment_intent\": \"pi_test_$(date +%s)\"
        }
      }
    },
    \"data\": {
      \"object\": {
        \"metadata\": {\"lead_id\": \"test-lead\", \"contract_id\": \"test-contract\"},
        \"customer_details\": {\"email\": \"$TEST_EMAIL\"},
        \"amount_total\": 500000,
        \"payment_intent\": \"pi_test_$(date +%s)\"
      }
    }
  }")

echo "   Response: $RESPONSE"
if [ -n "$RESPONSE" ]; then
  echo -e "${GREEN}✅ Stripe Webhook: Received${NC}"
else
  echo -e "${YELLOW}⚠️  Stripe Webhook: No response (check n8n logs)${NC}"
fi
echo ""

# Test 5: Validation test (missing email/phone)
echo -e "${YELLOW}[5/5] Testing Lead Intake Validation (should reject)...${NC}"
RESPONSE=$(curl -s -X POST "$N8N_BASE_URL/lead-intake" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"No Contact Info\",
    \"message\": \"Test without email or phone\"
  }")

if echo "$RESPONSE" | grep -q '"ok":false'; then
  echo -e "${GREEN}✅ Validation: Correctly rejected${NC}"
  echo "   Response: $RESPONSE"
else
  echo -e "${RED}❌ Validation: Should have rejected but didn't${NC}"
  echo "   Response: $RESPONSE"
fi
echo ""

echo "=========================================="
echo "🏁 Test Suite Complete"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "  1. Check your Telegram for alerts"
echo "  2. Check your email inbox ($TEST_EMAIL)"
echo "  3. Verify Data Table records in n8n"
echo "  4. Check n8n execution history for errors"
echo ""
echo "🔗 Workflow #2 (Proposal Generator) runs on schedule."
echo "   To test manually:"
echo "   - Ensure a Qualified lead exists with intent='quote', urgency='high'"
echo "   - Execute workflow manually in n8n UI"
