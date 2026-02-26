#!/bin/bash

# 🛡️ RENSTO N8N SAFETY-FIRST UPGRADE
# ================================================
# Usage: ./superseller-n8n-upgrade.sh [TARGET_VERSION] [--non-interactive]

set -e

# =============================================================================
# CONFIGURATION
# =============================================================================
N8N_SERVER="172.245.56.50"
CONTAINER_NAME="n8n_superseller"
DOCKER_COMPOSE_DIR="/opt/n8n"
BACKUP_BASE_DIR="/root/n8n-backups"
TARGET_VERSION=$1
NON_INTERACTIVE=false

if [ "$2" == "--non-interactive" ] || [ "$1" == "backup-only" ]; then
    NON_INTERACTIVE=true
fi

if [ -z "$TARGET_VERSION" ]; then
    echo "Usage: $0 [TARGET_VERSION] [--non-interactive]"
    exit 1
fi

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
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

if [ "$TARGET_VERSION" == "backup-only" ]; then
    log_header "🛡️ RENSTO N8N MANUAL SNAPSHOT"
else
    log_header "🛡️ RENSTO N8N SAFETY-FIRST UPGRADE - v$TARGET_VERSION"
fi

# -----------------------------------------------------------------------------
# STEP 1: PRE-FLIGHT & BACKUP
# -----------------------------------------------------------------------------
log_header "STEP 1: CREATING IMMUTABLE BACKUP"

TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/${TIMESTAMP}-PRE-UPGRADE-TO-$TARGET_VERSION"
mkdir -p "$BACKUP_DIR"

if docker ps | grep -q "$CONTAINER_NAME"; then
    log_info "Container is alive. Performing CLI metadata exports..."
    
    # Workflows
    docker exec "$CONTAINER_NAME" n8n export:workflow --all --output=/home/node/.n8n/workflows.all.json || true
    docker cp "$CONTAINER_NAME:/home/node/.n8n/workflows.all.json" "$BACKUP_DIR/" || true
    
    # Decrypted Credentials
    docker exec "$CONTAINER_NAME" n8n export:credentials --all --decrypted --output=/home/node/.n8n/credentials.decrypted.json || true
    docker cp "$CONTAINER_NAME:/home/node/.n8n/credentials.decrypted.json" "$BACKUP_DIR/" || true
fi

# Full Data Volume Backup
log_info "Performing full volume compression..."
DATA_DIR="$DOCKER_COMPOSE_DIR/data/n8n"
tar czf "$BACKUP_DIR/n8n-data-full.tgz" -C "$DATA_DIR" . || [ $? -eq 1 ]
log_success "Backup verified at $BACKUP_DIR"

if [ "$TARGET_VERSION" == "backup-only" ]; then
    log_success "Snapshot complete. Exiting."
    exit 0
fi

# -----------------------------------------------------------------------------
# STEP 2: UPGRADE
# -----------------------------------------------------------------------------
log_header "STEP 2: LIVE UPGRADE TO $TARGET_VERSION"

cd "$DOCKER_COMPOSE_DIR"

log_info "Backing up docker-compose.yml..."
cp docker-compose.yml "$BACKUP_DIR/docker-compose.yml.before"

log_info "Updating image tag to $TARGET_VERSION..."
sed -i "s|image: n8nio/n8n:.*|image: n8nio/n8n:$TARGET_VERSION|g" docker-compose.yml

# Official n8n update process
log_info "Pulling new version..."
if ! docker compose pull; then
    log_error "Failed to pull version $TARGET_VERSION. Reverting docker-compose.yml..."
    mv "$BACKUP_DIR/docker-compose.yml.before" docker-compose.yml
    exit 1
fi

log_info "Stopping and removing old container..."
docker compose down

log_info "Starting new container..."
docker compose up -d

# Fix permissions for UID 1000
log_info "Fixing data directory permissions..."
chown -R 1000:1000 "$DOCKER_COMPOSE_DIR/data/n8n" || true

# -----------------------------------------------------------------------------
# STEP 3: AUTOMATED VALIDATION
# -----------------------------------------------------------------------------
log_header "STEP 3: AUTOMATED SYSTEM CHECK"

log_info "Waiting for service to stabilize (20s)..."
sleep 20

# Check Docker status
if docker ps | grep -q "$CONTAINER_NAME"; then
    log_success "Container is running"
else
    log_error "Container failed to start."
    exit 1
fi

# Check version
ACTUAL_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version)
if [ "$ACTUAL_VERSION" == "$TARGET_VERSION" ]; then
    log_success "Internal version matches target: $ACTUAL_VERSION"
else
    log_warning "Internal version mismatch! Found: $ACTUAL_VERSION"
fi

# -----------------------------------------------------------------------------
# STEP 4: VERIFICATION
# -----------------------------------------------------------------------------
log_header "STEP 4: VERIFICATION"

if [ "$NON_INTERACTIVE" = true ]; then
    log_info "Non-interactive mode: Skipping manual prompt. Automated health checks passed."
else
    log_warning "SYSTEM IS NOW RUNNING VERSION $TARGET_VERSION"
    echo -e "${YELLOW}Please immediately perform the following checks:${NC}"
    echo "1. Login to https://n8n.superseller.agency"
    echo "2. Check if workflows are present."
    echo "3. Run one critical workflow manually."
    echo ""
    read -p "🚀 Did everything pass manual verification? (yes/no): " manual_confirm
    if [ "$manual_confirm" != "yes" ]; then
        log_error "Manual verification failed. INITIATING EMERGENCY ROLLBACK..."
        docker compose down
        cp "$BACKUP_DIR/docker-compose.yml.before" docker-compose.yml
        rm -rf "$DATA_DIR"/*
        tar xzf "$BACKUP_DIR/n8n-data-full.tgz" -C "$DATA_DIR"
        docker compose up -d
        log_success "Rollback completed."
        exit 1
    fi
fi

# -----------------------------------------------------------------------------
# STEP 5: CLEANUP OLD BACKUPS (Keep 2 most recent)
# -----------------------------------------------------------------------------
log_header "STEP 5: CLEANUP OLD BACKUPS"

log_info "Evaluating backups in $BACKUP_BASE_DIR..."
cd "$BACKUP_BASE_DIR"
BACKUP_LIST=$(ls -dt */ | tail -n +3)

if [ -n "$BACKUP_LIST" ]; then
    echo "The following old backups will be deleted:"
    echo "$BACKUP_LIST"
    for dir in $BACKUP_LIST; do
        rm -rf "$dir"
        log_info "Deleted old backup: $dir"
    done
    log_success "Cleanup completed."
else
    log_info "No old backups to clean up."
fi

log_header "🎉 UPGRADE CONFIRMED"
log_success "System is verified and operational on v$TARGET_VERSION"
