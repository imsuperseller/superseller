#!/bin/bash

# 🔍 N8N UPGRADE VERIFICATION SCRIPT FOR 2.0.1
# =============================================
# Comprehensive verification of:
# - Container status
# - Version
# - Workflows
# - Credentials
# - Community nodes
# - User accounts
# - API keys
# - API accessibility

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION
# =============================================================================
N8N_SERVER="172.245.56.50"
CONTAINER_NAME="n8n_rensto"
TARGET_VERSION="2.0.1"
PORT="5678"
DATA_DIR="/opt/n8n/data/n8n"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

# =============================================================================
# VERIFICATION CHECKS
# =============================================================================

log_header "🔍 N8N UPGRADE VERIFICATION FOR $TARGET_VERSION"
echo ""
echo "Date: $(date)"
echo "Server: $N8N_SERVER:$PORT"
echo "Container: $CONTAINER_NAME"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0

# -----------------------------------------------------------------------------
# CHECK 1: Container Status
# -----------------------------------------------------------------------------
log_header "CHECK 1: Container Status"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if docker ps | grep -q "$CONTAINER_NAME"; then
    log_success "Container is running"
    CONTAINER_STATUS="running"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    
    # Get container details
    CONTAINER_ID=$(docker ps | grep "$CONTAINER_NAME" | awk '{print $1}')
    IMAGE_NAME=$(docker ps | grep "$CONTAINER_NAME" | awk '{print $2}')
    UPTIME=$(docker ps | grep "$CONTAINER_NAME" | awk '{print $4, $5, $6}')
    echo "   Container ID: $CONTAINER_ID"
    echo "   Image: $IMAGE_NAME"
    echo "   Uptime: $UPTIME"
else
    log_error "Container is NOT running!"
    CONTAINER_STATUS="stopped"
    echo ""
    echo "   To start: docker start $CONTAINER_NAME"
    exit 1
fi

# -----------------------------------------------------------------------------
# CHECK 2: Version Verification
# -----------------------------------------------------------------------------
log_header "CHECK 2: Version Verification"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
CURRENT_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
echo "   Current version: $CURRENT_VERSION"
echo "   Target version: $TARGET_VERSION"

if echo "$CURRENT_VERSION" | grep -q "$TARGET_VERSION"; then
    log_success "Version matches target"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    log_warning "Version does not match target (may be OK if close)"
fi

# -----------------------------------------------------------------------------
# CHECK 3: Database Status
# -----------------------------------------------------------------------------
log_header "CHECK 3: Database Status"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$DATA_DIR/database.sqlite" ]; then
    DB_SIZE=$(du -sh "$DATA_DIR/database.sqlite" | cut -f1)
    log_success "Database file exists: $DB_SIZE"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    
    # Check database integrity
    INTEGRITY=$(sqlite3 "$DATA_DIR/database.sqlite" "PRAGMA integrity_check;" 2>/dev/null | head -1)
    if [ "$INTEGRITY" = "ok" ]; then
        log_success "Database integrity: OK"
    else
        log_warning "Database integrity check: $INTEGRITY"
    fi
else
    log_error "Database file not found!"
fi

# -----------------------------------------------------------------------------
# CHECK 4: Workflows
# -----------------------------------------------------------------------------
log_header "CHECK 4: Workflows"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$DATA_DIR/database.sqlite" ]; then
    WORKFLOW_COUNT=$(sqlite3 "$DATA_DIR/database.sqlite" "SELECT COUNT(*) FROM workflow_entity;" 2>/dev/null || echo "0")
    ACTIVE_COUNT=$(sqlite3 "$DATA_DIR/database.sqlite" "SELECT COUNT(*) FROM workflow_entity WHERE active = 1;" 2>/dev/null || echo "0")
    
    if [ "$WORKFLOW_COUNT" -gt 0 ]; then
        log_success "Workflows found: $WORKFLOW_COUNT total, $ACTIVE_COUNT active"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        
        # List first 5 workflows
        echo ""
        echo "   Sample workflows:"
        sqlite3 "$DATA_DIR/database.sqlite" "SELECT '   - ' || name || ' (' || CASE WHEN active = 1 THEN 'active' ELSE 'inactive' END || ')' FROM workflow_entity ORDER BY updatedAt DESC LIMIT 5;" 2>/dev/null || true
    else
        log_warning "No workflows found"
    fi
else
    log_error "Cannot check workflows (database not found)"
fi

# -----------------------------------------------------------------------------
# CHECK 5: Credentials
# -----------------------------------------------------------------------------
log_header "CHECK 5: Credentials"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$DATA_DIR/database.sqlite" ]; then
    CREDENTIAL_COUNT=$(sqlite3 "$DATA_DIR/database.sqlite" "SELECT COUNT(*) FROM credentials_entity;" 2>/dev/null || echo "0")
    
    if [ "$CREDENTIAL_COUNT" -gt 0 ]; then
        log_success "Credentials found: $CREDENTIAL_COUNT"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        
        # List credential types
        echo ""
        echo "   Credential types:"
        sqlite3 "$DATA_DIR/database.sqlite" "SELECT '   - ' || type || ': ' || COUNT(*) FROM credentials_entity GROUP BY type LIMIT 10;" 2>/dev/null || true
    else
        log_warning "No credentials found"
    fi
else
    log_error "Cannot check credentials (database not found)"
fi

# -----------------------------------------------------------------------------
# CHECK 6: Community Nodes
# -----------------------------------------------------------------------------
log_header "CHECK 6: Community Nodes"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$DATA_DIR/database.sqlite" ]; then
    PACKAGE_COUNT=$(sqlite3 "$DATA_DIR/database.sqlite" "SELECT COUNT(*) FROM installed_packages;" 2>/dev/null || echo "0")
    NODE_COUNT=$(sqlite3 "$DATA_DIR/database.sqlite" "SELECT COUNT(*) FROM installed_nodes;" 2>/dev/null || echo "0")
    
    if [ "$PACKAGE_COUNT" -gt 0 ]; then
        log_success "Community packages: $PACKAGE_COUNT packages, $NODE_COUNT nodes"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        
        # List packages
        echo ""
        echo "   Installed packages:"
        sqlite3 "$DATA_DIR/database.sqlite" "SELECT '   - ' || packageName || ' v' || installedVersion FROM installed_packages LIMIT 10;" 2>/dev/null || true
    else
        log_info "No community packages installed (this may be OK)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
else
    log_warning "Cannot check community nodes (database not found)"
fi

# -----------------------------------------------------------------------------
# CHECK 7: User Accounts
# -----------------------------------------------------------------------------
log_header "CHECK 7: User Accounts"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$DATA_DIR/database.sqlite" ]; then
    USER_COUNT=$(sqlite3 "$DATA_DIR/database.sqlite" "SELECT COUNT(*) FROM user;" 2>/dev/null || echo "0")
    
    if [ "$USER_COUNT" -gt 0 ]; then
        log_success "User accounts found: $USER_COUNT"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        
        # List users
        echo ""
        echo "   Users:"
        sqlite3 "$DATA_DIR/database.sqlite" "SELECT '   - ' || email || ' (' || role || ')' FROM user;" 2>/dev/null || true
    else
        log_warning "No user accounts found"
    fi
else
    log_error "Cannot check users (database not found)"
fi

# -----------------------------------------------------------------------------
# CHECK 8: API Keys
# -----------------------------------------------------------------------------
log_header "CHECK 8: API Keys"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$DATA_DIR/database.sqlite" ]; then
    API_KEY_COUNT=$(sqlite3 "$DATA_DIR/database.sqlite" "SELECT COUNT(*) FROM api_key;" 2>/dev/null || echo "0")
    
    if [ "$API_KEY_COUNT" -gt 0 ]; then
        log_success "API keys found: $API_KEY_COUNT"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        
        # List API key labels (not the keys themselves)
        echo ""
        echo "   API key labels:"
        sqlite3 "$DATA_DIR/database.sqlite" "SELECT '   - ' || label FROM api_key;" 2>/dev/null || true
    else
        log_info "No API keys found (this may be OK)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
else
    log_warning "Cannot check API keys (database not found)"
fi

# -----------------------------------------------------------------------------
# CHECK 9: Web UI Accessibility
# -----------------------------------------------------------------------------
log_header "CHECK 9: Web UI Accessibility"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
log_info "Testing web UI accessibility..."

if curl -s -o /dev/null -w "%{http_code}" "http://$N8N_SERVER:$PORT" 2>/dev/null | grep -q "200\|301\|302"; then
    log_success "Web UI is accessible at http://$N8N_SERVER:$PORT"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    log_warning "Web UI may not be accessible (check firewall)"
fi

# Test healthz endpoint
if docker exec "$CONTAINER_NAME" wget --spider -q http://localhost:5678/healthz 2>/dev/null; then
    log_success "Health endpoint responding"
else
    log_warning "Health endpoint not responding"
fi

# -----------------------------------------------------------------------------
# CHECK 10: Container Resources
# -----------------------------------------------------------------------------
log_header "CHECK 10: Container Resources"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
log_info "Checking container resource usage..."

docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" "$CONTAINER_NAME" 2>/dev/null || log_warning "Could not get resource stats"
PASSED_CHECKS=$((PASSED_CHECKS + 1))

# Check disk space
echo ""
log_info "Disk space:"
df -h "$DATA_DIR" | tail -1

# =============================================================================
# FINAL SUMMARY
# =============================================================================

log_header "📊 VERIFICATION SUMMARY"

echo ""
echo "Checks Passed: $PASSED_CHECKS / $TOTAL_CHECKS"
echo ""

if [ "$PASSED_CHECKS" -eq "$TOTAL_CHECKS" ]; then
    log_success "ALL CHECKS PASSED!"
    OVERALL_STATUS="SUCCESS"
elif [ "$PASSED_CHECKS" -ge $((TOTAL_CHECKS - 2)) ]; then
    log_warning "MOST CHECKS PASSED (minor issues)"
    OVERALL_STATUS="WARNING"
else
    log_error "MULTIPLE CHECKS FAILED"
    OVERALL_STATUS="FAILED"
fi

echo ""
echo "📊 Quick Stats:"
echo "   Version: $CURRENT_VERSION"
echo "   Workflows: $WORKFLOW_COUNT ($ACTIVE_COUNT active)"
echo "   Credentials: $CREDENTIAL_COUNT"
echo "   Community Packages: $PACKAGE_COUNT"
echo "   Users: $USER_COUNT"
echo "   API Keys: $API_KEY_COUNT"
echo ""
echo "🌐 Access:"
echo "   URL: http://$N8N_SERVER:$PORT"
echo "   or: https://n8n.rensto.com"
echo ""

if [ "$OVERALL_STATUS" = "SUCCESS" ]; then
    log_success "n8n $TARGET_VERSION upgrade verification SUCCESSFUL!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Login and verify your account works"
    echo "   2. Test a few workflows"
    echo "   3. Verify API integrations"
else
    log_warning "Some issues detected. Review the checks above."
    echo ""
    echo "📋 Troubleshooting:"
    echo "   - Check logs: docker logs $CONTAINER_NAME"
    echo "   - Restart: docker restart $CONTAINER_NAME"
    echo "   - Rollback if needed"
fi

echo ""
echo "🕒 Verification completed at: $(date)"
