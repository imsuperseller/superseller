#!/bin/bash

# 🔄 N8N ROLLBACK SCRIPT
# ======================
# Rollback n8n to previous version from backup

set -e

# Configuration
N8N_SERVER="172.245.56.50"
CONTAINER_NAME="n8n_rensto"
DOCKER_COMPOSE_DIR="/opt/n8n"
DATA_DIR="/opt/n8n/data/n8n"
BACKUP_BASE_DIR="/root/n8n-backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() {
    echo ""
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  $1${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
}

log_header "🔄 N8N ROLLBACK SCRIPT"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root"
    exit 1
fi

# List available backups
echo ""
log_info "Available backups:"
echo ""
ls -lt "$BACKUP_BASE_DIR" 2>/dev/null | head -10 || {
    log_error "No backups found in $BACKUP_BASE_DIR"
    exit 1
}

echo ""

# Get backup directory from user or argument
if [ -n "$1" ]; then
    BACKUP_DIR="$1"
else
    read -p "Enter backup directory name (e.g., 2025-12-10_185959-upgrade-to-2.0.1): " BACKUP_NAME
    BACKUP_DIR="$BACKUP_BASE_DIR/$BACKUP_NAME"
fi

# Verify backup exists
if [ ! -d "$BACKUP_DIR" ]; then
    log_error "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

if [ ! -f "$BACKUP_DIR/n8n-data-complete.tgz" ]; then
    log_error "Backup data file not found: $BACKUP_DIR/n8n-data-complete.tgz"
    exit 1
fi

log_success "Backup found: $BACKUP_DIR"

# Show backup manifest
if [ -f "$BACKUP_DIR/backup-manifest.json" ]; then
    echo ""
    log_info "Backup details:"
    cat "$BACKUP_DIR/backup-manifest.json"
    echo ""
fi

# Confirm rollback
echo ""
log_warning "⚠️  WARNING: This will restore n8n to the backup state"
log_warning "   All changes since the backup will be LOST"
echo ""
read -p "Are you sure you want to rollback? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_warning "Rollback cancelled"
    exit 0
fi

# Stop n8n
log_header "STEP 1: Stopping n8n"
docker stop "$CONTAINER_NAME" 2>/dev/null || log_warning "Container already stopped"
sleep 3
log_success "Container stopped"

# Backup current state (just in case)
log_header "STEP 2: Backing up current state"
CURRENT_BACKUP="$BACKUP_BASE_DIR/pre-rollback-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$CURRENT_BACKUP"
tar czf "$CURRENT_BACKUP/n8n-data-pre-rollback.tgz" -C "$DATA_DIR" . 2>/dev/null || log_warning "Could not backup current state"
log_success "Current state backed up to: $CURRENT_BACKUP"

# Restore docker-compose.yml
log_header "STEP 3: Restoring docker-compose.yml"
if [ -f "$BACKUP_DIR/docker-compose.yml.backup" ]; then
    cp "$BACKUP_DIR/docker-compose.yml.backup" "$DOCKER_COMPOSE_DIR/docker-compose.yml"
    log_success "docker-compose.yml restored"
else
    log_warning "No docker-compose.yml backup found, skipping"
fi

# Restore data
log_header "STEP 4: Restoring data"
log_info "Clearing current data directory..."
rm -rf "$DATA_DIR"/*

log_info "Extracting backup..."
tar xzf "$BACKUP_DIR/n8n-data-complete.tgz" -C "$DATA_DIR"
log_success "Data restored"

# Start n8n
log_header "STEP 5: Starting n8n"
cd "$DOCKER_COMPOSE_DIR"
docker-compose up -d n8n 2>/dev/null || docker start "$CONTAINER_NAME"

log_info "Waiting for n8n to start..."
sleep 15

# Verify
log_header "STEP 6: Verification"

if docker ps | grep -q "$CONTAINER_NAME"; then
    log_success "Container is running"
    
    VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
    log_info "n8n version: $VERSION"
    
    WORKFLOW_COUNT=$(sqlite3 "$DATA_DIR/database.sqlite" "SELECT COUNT(*) FROM workflow_entity;" 2>/dev/null || echo "Unknown")
    log_info "Workflows: $WORKFLOW_COUNT"
else
    log_error "Container failed to start!"
    exit 1
fi

log_header "🎉 ROLLBACK COMPLETE!"
echo ""
echo "📊 Status:"
echo "   Version: $VERSION"
echo "   Workflows: $WORKFLOW_COUNT"
echo ""
echo "🌐 Access:"
echo "   URL: http://$N8N_SERVER:5678"
echo "   or: https://n8n.rensto.com"
echo ""
log_success "Rollback completed successfully!"
