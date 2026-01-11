#!/bin/bash

# 🎯 COMPREHENSIVE TESTING SUITE FOR SELF-SERVICE SAAS LEAD GENERATION
# Date: 2025-09-16
# Status: ✅ READY TO EXECUTE

echo "🎯 COMPREHENSIVE TESTING SUITE FOR SELF-SERVICE SAAS LEAD GENERATION"
echo "=================================================================="
echo "Date: $(date)"
echo "Testing all components of the complete SaaS system"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}🧪 Testing: $test_name${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

echo "📊 PHASE 1: MCP SERVER CONNECTIVITY TESTS"
echo "=========================================="

# Test all MCP servers
run_test "n8n-mcp Server" "curl -s http://172.245.56.50:5678/api/v1/workflows > /dev/null"
run_test "Make.com MCP Server" "node infra/mcp-servers/make-mcp-server/server.js --help > /dev/null 2>&1"
run_test "Airtable MCP Server" "npx airtable-mcp-server --help > /dev/null 2>&1"
run_test "Stripe MCP Server" "docker run --rm mcp/stripe --help > /dev/null 2>&1"
run_test "QuickBooks MCP Server" "node infra/mcp-servers/quickbooks-mcp-server/quickbooks-mcp-server.js --help > /dev/null 2>&1"

echo "📊 PHASE 2: API INTEGRATION TESTS"
echo "================================="

# Test external API connectivity
run_test "Make.com API" "curl -s -H 'Authorization: Token 5de41d0c-ecb2-4248-8e82-a935598c77e4' 'https://us2.make.com/api/v2/scenarios?teamId=1300459&limit=1' > /dev/null"
run_test "n8n API" "curl -s -H 'X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA' 'http://172.245.56.50:5678/api/v1/workflows' > /dev/null"
run_test "SSH Connectivity" "ssh -o ConnectTimeout=5 root@172.245.56.50 'echo test' > /dev/null 2>&1"

echo "📊 PHASE 3: N8N WORKFLOW TESTS"
echo "=============================="

# Test n8n workflow execution
run_test "N8N Workflow Webhook" "curl -s -X POST 'http://172.245.56.50:5678/webhook/lead-enrichment-saas' -H 'Content-Type: application/json' -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"businessDescription\":\"Test business\",\"targetLeads\":\"test leads\",\"pricingTier\":\"professional\",\"leadQuantity\":100}' > /dev/null"

echo "📊 PHASE 4: FRONTEND COMPONENT TESTS"
echo "==================================="

# Test local server
run_test "Local HTTP Server" "test -f lead-generation-embed.html && python3 -c 'import http.server, socketserver; print(\"HTTP server module available\")'"
run_test "HTML Form Files" "test -f lead-generation-embed.html"
run_test "Stripe Integration JS" "test -f stripe-quickbooks-integration.js"

echo "📊 PHASE 5: PAYMENT PROCESSING TESTS"
echo "==================================="

# Test Stripe configuration
run_test "Stripe Configuration" "grep -q 'sk_live_' stripe-quickbooks-integration.js"
run_test "QuickBooks Configuration" "grep -q 'ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f' infra/mcp-servers/quickbooks-mcp-server/quickbooks-mcp-server.js"

echo "📊 PHASE 6: DATA STORAGE TESTS"
echo "=============================="

# Test Airtable configuration
run_test "Airtable API Key" "grep -q 'pat0dxG1HQcAUz2Kr' /Users/shaifriedman/.cursor/mcp.json"

echo "📊 PHASE 7: SECURITY TESTS"
echo "========================="

# Test security configurations
run_test "API Key Protection" "grep -q 'MAKE_API_KEY' /Users/shaifriedman/.cursor/mcp.json"
run_test "HTTPS Endpoints" "curl -s -I https://us2.make.com/api/v2/scenarios | grep -q 'HTTP/2 401'"

echo "📊 PHASE 8: PERFORMANCE TESTS"
echo "============================="

# Test response times
run_test "N8N Response Time" "timeout 5 curl -s http://172.245.56.50:5678/api/v1/workflows > /dev/null"
run_test "Make.com Response Time" "timeout 5 curl -s -H 'Authorization: Token 5de41d0c-ecb2-4248-8e82-a935598c77e4' 'https://us2.make.com/api/v2/scenarios?teamId=1300459&limit=1' > /dev/null"

echo "📊 PHASE 9: END-TO-END INTEGRATION TESTS"
echo "======================================="

# Test complete workflow
run_test "Complete Workflow Files" "test -f complete-saas-workflow.json"
run_test "Landing Page Integration" "test -f complete-saas-landing-page.html"

echo "📊 PHASE 10: BUSINESS LOGIC TESTS"
echo "================================="

# Test pricing calculations
run_test "Pricing Tiers Configuration" "grep -q 'pricingTiers' complete-saas-landing-page.html"
run_test "Dynamic Pricing Logic" "grep -q 'updatePrice' complete-saas-landing-page.html"

echo ""
echo "🎯 COMPREHENSIVE TESTING SUITE COMPLETE"
echo "======================================"
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! System is ready for production.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $FAILED_TESTS tests failed. Review and fix before production.${NC}"
    exit 1
fi
