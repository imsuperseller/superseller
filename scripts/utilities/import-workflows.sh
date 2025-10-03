#!/bin/bash

# Import Remaining n8n Workflows v3
# This script imports the remaining 4 workflows using minimal API format

set -e

echo "=========================================="
echo "Importing Remaining n8n Workflows v3"
echo "=========================================="

# Configuration
N8N_URL="http://173.254.201.134:5678"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE"
WORKFLOWS_DIR="./n8n-workflows"

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

# Function to import a workflow
import_workflow() {
    local workflow_file="$1"
    local workflow_name=$(basename "$workflow_file" .json)

    log_info "Importing $workflow_name..."

    # Create the API payload with only the minimal required fields
    local api_payload=$(jq -c '{
        name: .name,
        nodes: .nodes,
        connections: .connections,
        settings: .settings
    }' "$WORKFLOWS_DIR/$workflow_file")

    # Import the workflow
    local response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -H "X-N8N-API-KEY: $API_KEY" \
        -d "$api_payload")

    # Check if import was successful
    if echo "$response" | grep -q "id"; then
        local workflow_id=$(echo "$response" | jq -r '.id')
        log_success "✅ Successfully imported $workflow_name (ID: $workflow_id)"
        return 0
    else
        log_error "❌ Failed to import $workflow_name: $response"
        return 1
    fi
}

# Check if n8n is accessible
log_info "Checking n8n availability..."
if ! curl -s -f "$N8N_URL/healthz" > /dev/null; then
    log_error "n8n is not accessible at $N8N_URL"
    exit 1
fi

log_success "n8n is accessible"

# Import the remaining workflows
workflows_to_import=(
    "leads-daily-followups.json"
    "projects-digest.json"
    "assets-renewals.json"
    "finance-unpaid-invoices.json"
)

success_count=0
total_count=${#workflows_to_import[@]}

for workflow_file in "${workflows_to_import[@]}"; do
    if [ -f "$WORKFLOWS_DIR/$workflow_file" ]; then
        if import_workflow "$workflow_file"; then
            ((success_count++))
        fi
    else
        log_error "Workflow file not found: $workflow_file"
    fi
done

# Summary
echo ""
log_info "=== IMPORT SUMMARY ==="
log_success "✅ Successfully imported: $success_count/$total_count workflows"
log_info "Access n8n at: $N8N_URL"

if [ $success_count -eq $total_count ]; then
    log_success "🎉 All workflows imported successfully!"
else
    log_warn "⚠️  Some workflows failed to import. Check the errors above."
fi
