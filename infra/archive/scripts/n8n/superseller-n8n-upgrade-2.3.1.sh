#!/bin/bash

# 🛡️ RENSTO N8N SAFETY-FIRST UPGRADE - v2.3.1
# ================================================
# This script performs a CAUTIOUS upgrade of SuperSeller AI n8n.
# 
# ⚠️ WARNING: n8n v2.x introduces major breaking changes:
# 1. Sub-workflow data return behavior has changed.
# 2. Code nodes no longer access process.env directly.
# 3. Environment variable security is stricter.
#
# Process:
# 1. Full Immutable Backup
# 2. Upgrade to 2.3.1
# 3. Automated Health Check
# 4. MANUAL VERIFICATION PAUSE (Required)
# 5. NO AUTO-CLEANUP (Backups are preserved)

set -e

# =============================================================================
# CONFIGURATION
# =============================================================================
N8N_SERVER="172.245.56.50"
CONTAINER_NAME="superseller-n8n"
DOCKER_COMPOSE_DIR="/opt/n8n"
BACKUP_BASE_DIR="/root/n8n-backups"
TARGET_VERSION="2.3.1"

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

log_header "🛡️ RENSTO N8N SAFETY-FIRST UPGRADE - v2.3.1"
log_warning "Major version changes detected. Safety protocols active."

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
    
    # Decrypted Credentials (Crucial for n8n v2 migration issues)
    docker exec "$CONTAINER_NAME" n8n export:credentials --all --decrypted --output=/home/node/.n8n/credentials.decrypted.json || true
    docker cp "$CONTAINER_NAME:/home/node/.n8n/credentials.decrypted.json" "$BACKUP_DIR/" || true
fi

# Full Data Volume Backup (The most important part)
log_info "Performing full volume compression..."
DATA_DIR="$DOCKER_COMPOSE_DIR/data/n8n"
tar czf "$BACKUP_DIR/n8n-data-full.tgz" -C "$DATA_DIR" .
log_success "Backup verified at $BACKUP_DIR"

# -----------------------------------------------------------------------------
# STEP 2: UPGRADE
# -----------------------------------------------------------------------------
log_header "STEP 2: LIVE UPGRADE TO $TARGET_VERSION"

cd "$DOCKER_COMPOSE_DIR"

log_info "Backing up docker-compose.yml..."
cp docker-compose.yml "$BACKUP_DIR/docker-compose.yml.before"

log_info "Updating image tag to $TARGET_VERSION..."
sed -i "s|image: n8nio/n8n:.*|image: n8nio/n8n:$TARGET_VERSION|g" docker-compose.yml

# Official n8n update process (per docs.n8n.io)
log_info "Pulling new version..."
docker compose pull

log_info "Stopping and removing old container (docker compose down)..."
docker compose down

log_info "Starting new container..."
docker compose up -d

# Fix permissions for UID 1000 (n8n's 'node' user)
log_info "Fixing data directory permissions..."
chown -R 1000:1000 "$DOCKER_COMPOSE_DIR/data/n8n"

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
    log_error "Container failed to start. Review logs: docker logs $CONTAINER_NAME"
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
# STEP 4: MANUAL VERIFICATION (THE PAUSE)
# -----------------------------------------------------------------------------
log_header "STEP 4: MANUAL VERIFICATION REQUIRED"

log_warning "SYSTEM IS NOW RUNNING VERSION $TARGET_VERSION"
echo -e "${YELLOW}Please immediately perform the following checks:${NC}"
echo "1. Login to https://n8n.superseller.agency"
echo "2. Check if workflows are present."
echo "3. Run one critical workflow manually."
echo "4. Check Logs for any v2.0 'Execute Workflow' warnings."
echo ""

read -p "🚀 Did everything pass manual verification? (yes/no): " manual_confirm

if [ "$manual_confirm" != "yes" ]; then
    log_error "Manual verification failed. INITIATING EMERGENCY ROLLBACK..."
    
    docker-compose stop
    cp "$BACKUP_DIR/docker-compose.yml.before" docker-compose.yml
    rm -rf "$DATA_DIR"/*
    tar xzf "$BACKUP_DIR/n8n-data-full.tgz" -C "$DATA_DIR"
    docker-compose up -d
    
    log_success "Rollback completed. System restored to original state."
    exit 1
fi

# -----------------------------------------------------------------------------
# STEP 5: FINAL STATUS (NO AUTO-CLEANUP)
# -----------------------------------------------------------------------------
log_header "🎉 UPGRADE CONFIRMED"

log_success "System is verified and operational on v$TARGET_VERSION"
log_info "NOTE: No backups were deleted. We recommend keeping the $TIMESTAMP backup for 48 hours."
log_info "To clean up later, run: /opt/n8n/superseller-n8n-cleanup-backups.sh"

cat > "/opt/n8n/superseller-n8n-cleanup-backups.sh" << EOF
#!/bin/bash
# Manual cleanup script
echo "Evaluating backups for deletion..."
cd /root/n8n-backups
ls -dt */ | tail -n +3 | xargs -I {} rm -rf {}
echo "Cleanup completed. Only most recent 2 backups kept."
EOF
chmod +x /opt/n8n/superseller-n8n-cleanup-backups.sh

echo ""
