#!/bin/bash

# Rensto n8n Workflow Field Fix Script
# This script updates field references in n8n workflows to match Airtable schema

set -e

echo "=========================================="
echo "Rensto n8n Workflow Field Fix"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

WORKFLOWS_DIR="./n8n-workflows"
BACKUP_DIR="./n8n-workflows/backup"

# Create backup directory
mkdir -p "$BACKUP_DIR"

log_info "Creating backup of original workflows..."
cp "$WORKFLOWS_DIR"/*.json "$BACKUP_DIR/"

log_info "Updating field references in workflows..."

# Fix leads-daily-followups.json
if [ -f "$WORKFLOWS_DIR/leads-daily-followups.json" ]; then
    log_info "Fixing leads-daily-followups.json..."
    sed -i '' 's/"contact_name"/"name"/g' "$WORKFLOWS_DIR/leads-daily-followups.json"
    sed -i '' 's/"client_name"/"company"/g' "$WORKFLOWS_DIR/leads-daily-followups.json"
    sed -i '' 's/"client_email"/"email"/g' "$WORKFLOWS_DIR/leads-daily-followups.json"
fi

# Fix projects-digest.json
if [ -f "$WORKFLOWS_DIR/projects-digest.json" ]; then
    log_info "Fixing projects-digest.json..."
    sed -i '' 's/"project_name"/"name"/g' "$WORKFLOWS_DIR/projects-digest.json"
    sed -i '' 's/"due_date"/"acceptance_date"/g' "$WORKFLOWS_DIR/projects-digest.json"
    sed -i '' 's/"budget"/"type"/g' "$WORKFLOWS_DIR/projects-digest.json"
fi

# Fix assets-renewals.json
if [ -f "$WORKFLOWS_DIR/assets-renewals.json" ]; then
    log_info "Fixing assets-renewals.json..."
    sed -i '' 's/"renewal_date"/"renewal"/g' "$WORKFLOWS_DIR/assets-renewals.json"
    sed -i '' 's/"asset_name"/"type"/g' "$WORKFLOWS_DIR/assets-renewals.json"
    sed -i '' 's/"monthly_cost"/"cost_usd"/g' "$WORKFLOWS_DIR/assets-renewals.json"
    sed -i '' 's/"provider"/"url"/g' "$WORKFLOWS_DIR/assets-renewals.json"
fi

# Fix finance-unpaid-invoices.json
if [ -f "$WORKFLOWS_DIR/finance-unpaid-invoices.json" ]; then
    log_info "Fixing finance-unpaid-invoices.json..."
    sed -i '' 's/"client_name"/"client_id"/g' "$WORKFLOWS_DIR/finance-unpaid-invoices.json"
    sed -i '' 's/"client_email"/"link"/g' "$WORKFLOWS_DIR/finance-unpaid-invoices.json"
    sed -i '' 's/"amount"/"amount_usd"/g' "$WORKFLOWS_DIR/finance-unpaid-invoices.json"
    # Note: due_date field needs to be added to Airtable
    log_warn "Note: 'due_date' field needs to be added to Finances table in Airtable"
fi

# Fix contact-intake.json
if [ -f "$WORKFLOWS_DIR/contact-intake.json" ]; then
    log_info "Fixing contact-intake.json..."
    sed -i '' 's/"contact_name"/"name"/g' "$WORKFLOWS_DIR/contact-intake.json"
    sed -i '' 's/"client_name"/"company"/g' "$WORKFLOWS_DIR/contact-intake.json"
    sed -i '' 's/"client_email"/"email"/g' "$WORKFLOWS_DIR/contact-intake.json"
fi

log_info "Field references updated successfully!"
log_info "Backup created in: $BACKUP_DIR"

echo ""
log_info "Summary of changes:"
echo "  • contact_name → name (Leads table)"
echo "  • project_name → name (Projects table)"
echo "  • renewal_date → renewal (Assets table)"
echo "  • client_name → company (Leads table) / client_id (Finances table)"
echo "  • client_email → email (Leads table) / link (Finances table)"
echo "  • amount → amount_usd (Finances table)"
echo "  • monthly_cost → cost_usd (Assets table)"
echo "  • asset_name → type (Assets table)"
echo "  • provider → url (Assets table)"
echo ""

log_warn "IMPORTANT: Add 'due_date' field to Finances table in Airtable"
log_info "Field type: dateTime with friendly format"
