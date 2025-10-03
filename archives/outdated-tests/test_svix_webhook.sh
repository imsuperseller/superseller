#!/bin/bash

# Test script for Svix webhook integration
# This script helps test the n8n workflow with real lead data

echo "🧪 Testing Svix Webhook Integration"
echo "=================================="

# Webhook URL
WEBHOOK_URL="https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis"

# Test data - Replace with real lead data from Surense
TEST_DATA='{
  "type": "lead.created",
  "data": {
    "leadId": "REPLACE_WITH_REAL_LEAD_ID",
    "fullName": "REPLACE_WITH_REAL_NAME",
    "age": 35,
    "city": "REPLACE_WITH_REAL_CITY",
    "email": "REPLACE_WITH_REAL_EMAIL",
    "phoneNumber1": "REPLACE_WITH_REAL_PHONE",
    "monthlyIncome": 20000,
    "childCount": 2,
    "street": "REPLACE_WITH_REAL_ADDRESS",
    "profession": "REPLACE_WITH_REAL_PROFESSION"
  }
}'

echo "📋 Test Data Template:"
echo "$TEST_DATA" | jq '.'

echo ""
echo "🔧 To test with real data:"
echo "1. Replace the placeholder values with real lead data from Surense"
echo "2. Run: curl -X POST $WEBHOOK_URL -H 'Content-Type: application/json' -d '$TEST_DATA'"
echo ""

# Test with sample data
echo "🧪 Testing with sample data..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\nTIME:%{time_total}" \
  -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "lead.created",
    "data": {
      "leadId": "test-lead-'$(date +%s)'",
      "fullName": "Test User",
      "age": 30,
      "city": "Tel Aviv",
      "email": "test@example.com",
      "phoneNumber1": "050-1234567",
      "monthlyIncome": 15000,
      "childCount": 1,
      "street": "Test Street 123",
      "profession": "Software Engineer"
    }
  }')

echo "📊 Response:"
echo "$RESPONSE"

echo ""
echo "✅ If HTTP_STATUS:200, the workflow is working correctly!"
echo "📝 Check the n8n workflow executions for detailed results"
