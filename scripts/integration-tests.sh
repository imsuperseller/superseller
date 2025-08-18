#!/bin/bash

# Test All Integrations
# This script tests all integrations and provides a complete status report

set -e

echo "=========================================="
echo "Testing All Integrations"
echo "=========================================="

# Configuration
N8N_URL="http://173.254.201.134:5678"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE"
AIRTABLE_API_KEY="patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12"
AIRTABLE_BASE_ID="appQijHhqqP4z6wGe"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${BLUE}[SUCCESS]${NC} $1"
}

# Test n8n connectivity
test_n8n() {
    log_info "Testing n8n connectivity..."

    if curl -s -f "$N8N_URL/healthz" > /dev/null; then
        log_success "✅ n8n is accessible"
        return 0
    else
        log_error "❌ n8n is not accessible"
        return 1
    fi
}

# Test n8n API
test_n8n_api() {
    log_info "Testing n8n API..."

    local response=$(curl -s -X GET "$N8N_URL/api/v1/workflows" \
        -H "X-N8N-API-KEY: $API_KEY")

    if echo "$response" | grep -q "name"; then
        log_success "✅ n8n API is working"
        local workflow_count=$(echo "$response" | jq 'length')
        log_info "📊 Found $workflow_count workflows"
        return 0
    else
        log_error "❌ n8n API failed: $response"
        return 1
    fi
}

# Test Airtable connectivity
test_airtable() {
    log_info "Testing Airtable connectivity..."

    local response=$(curl -s -X GET "https://api.airtable.com/v0/$AIRTABLE_BASE_ID/Leads?maxRecords=1" \
        -H "Authorization: Bearer $AIRTABLE_API_KEY")

    if echo "$response" | grep -q "records"; then
        log_success "✅ Airtable API is working"
        return 0
    else
        log_error "❌ Airtable API failed: $response"
        return 1
    fi
}

# Test Airtable tables
test_airtable_tables() {
    log_info "Testing Airtable tables..."

    local tables=("Leads" "Projects" "Assets" "Finances")
    local success_count=0

    for table in "${tables[@]}"; do
        local response=$(curl -s -X GET "https://api.airtable.com/v0/$AIRTABLE_BASE_ID/$table?maxRecords=1" \
            -H "Authorization: Bearer $AIRTABLE_API_KEY")

        if echo "$response" | grep -q "records"; then
            log_success "✅ Table '$table' is accessible"
            ((success_count++))
        else
            log_error "❌ Table '$table' failed: $response"
        fi
    done

    if [ $success_count -eq ${#tables[@]} ]; then
        log_success "✅ All Airtable tables are working"
        return 0
    else
        log_warn "⚠️  Some Airtable tables failed"
        return 1
    fi
}

# Test workflow webhooks
test_webhooks() {
    log_info "Testing workflow webhooks..."

    # Test contact-intake webhook
    local response=$(curl -s -X POST "$N8N_URL/webhook/contact-intake" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test Contact","email":"test@example.com","message":"Test message"}')

    if echo "$response" | grep -q "success"; then
        log_success "✅ Contact intake webhook is working"
        return 0
    else
        log_warn "⚠️  Contact intake webhook test failed or not configured"
        return 1
    fi
}

# Test database connectivity
test_databases() {
    log_info "Testing database connectivity..."

    # Test PostgreSQL (n8n database)
    if docker exec rensto-postgres pg_isready -U n8n > /dev/null 2>&1; then
        log_success "✅ PostgreSQL (n8n) is running"
    else
        log_error "❌ PostgreSQL (n8n) is not accessible"
    fi

    # Test MongoDB
    if docker exec rensto-mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        log_success "✅ MongoDB is running"
    else
        log_error "❌ MongoDB is not accessible"
    fi
}

# Generate comprehensive report
generate_report() {
    echo ""
    log_info "=== COMPREHENSIVE INTEGRATION REPORT ==="

    # Test all integrations
    local n8n_status=0
    local n8n_api_status=0
    local airtable_status=0
    local airtable_tables_status=0
    local webhook_status=0
    local db_status=0

    test_n8n || n8n_status=1
    test_n8n_api || n8n_api_status=1
    test_airtable || airtable_status=1
    test_airtable_tables || airtable_tables_status=1
    test_webhooks || webhook_status=1
    test_databases || db_status=1

    # Summary
    echo ""
    log_info "=== SUMMARY ==="

    if [ $n8n_status -eq 0 ]; then
        log_success "✅ n8n Platform: OPERATIONAL"
    else
        log_error "❌ n8n Platform: FAILED"
    fi

    if [ $n8n_api_status -eq 0 ]; then
        log_success "✅ n8n API: OPERATIONAL"
    else
        log_error "❌ n8n API: FAILED"
    fi

    if [ $airtable_status -eq 0 ]; then
        log_success "✅ Airtable API: OPERATIONAL"
    else
        log_error "❌ Airtable API: FAILED"
    fi

    if [ $airtable_tables_status -eq 0 ]; then
        log_success "✅ Airtable Tables: OPERATIONAL"
    else
        log_error "❌ Airtable Tables: FAILED"
    fi

    if [ $webhook_status -eq 0 ]; then
        log_success "✅ Workflow Webhooks: OPERATIONAL"
    else
        log_warn "⚠️  Workflow Webhooks: PARTIAL"
    fi

    if [ $db_status -eq 0 ]; then
        log_success "✅ Databases: OPERATIONAL"
    else
        log_error "❌ Databases: FAILED"
    fi

    # Overall status
    local total_failures=$((n8n_status + n8n_api_status + airtable_status + airtable_tables_status + db_status))

    if [ $total_failures -eq 0 ]; then
        log_success "🎉 ALL INTEGRATIONS ARE OPERATIONAL!"
        log_success "🚀 Rensto is ready for production!"
    else
        log_warn "⚠️  $total_failures integration(s) have issues"
        log_info "Check the errors above for details"
    fi
}

# Run the comprehensive test
generate_report
