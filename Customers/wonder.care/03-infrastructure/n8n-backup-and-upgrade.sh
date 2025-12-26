#!/bin/bash

# 🛡️ N8N COMPLETE BACKUP & UPGRADE - WONDER.CARE
# ================================================
# Comprehensive backup of:
# - Workflows (JSON export)
# - Credentials (decrypted export)
# - Community nodes (packages + config)
# - n8n user accounts (in database)
# - n8n API key (in settings)
# - Database (SQLite)
# - Docker compose configuration
#
# Then upgrades n8n to specified version (default: latest)
#
# Usage:
#   ./n8n-backup-and-upgrade.sh           # Backup + upgrade to latest
#   ./n8n-backup-and-upgrade.sh 2.1.0     # Backup + upgrade to specific version
#   ./n8n-backup-and-upgrade.sh --backup-only  # Just backup, no upgrade

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION - WONDER.CARE SPECIFIC
# =============================================================================
N8N_SERVER="192.227.249.73"
CONTAINER_NAME="n8n-wondercare"
N8N_DATA_DIR="/root/n8n/data"
DOCKER_COMPOSE_DIR="/root/n8n"
BACKUP_BASE_DIR="/root/n8n/backups"

# Get target version
if [ "$1" == "--backup-only" ]; then
    BACKUP_ONLY=true
    TARGET_VERSION="backup-only"
elif [ -n "$1" ]; then
    TARGET_VERSION="$1"
    BACKUP_ONLY=false
else
    # Get latest version from Docker Hub
    TARGET_VERSION=$(curl -s https://registry.hub.docker.com/v2/repositories/n8nio/n8n/tags?page_size=1 | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4 2>/dev/null || echo "latest")
    BACKUP_ONLY=false
fi

BACKUP_DIR="$BACKUP_BASE_DIR/$(date +%Y-%m-%d_%H%M%S)-upgrade-to-$TARGET_VERSION"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# =============================================================================
# FUNCTIONS
# =============================================================================

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

log_header "🛡️ N8N BACKUP & UPGRADE - WONDER.CARE"
echo ""
echo "Date: $(date)"
echo "Server: $N8N_SERVER"
echo "Container: $CONTAINER_NAME"
echo "Target Version: $TARGET_VERSION"
echo "Backup Only: $BACKUP_ONLY"
echo "Backup Directory: $BACKUP_DIR"
echo ""

# -----------------------------------------------------------------------------
# STEP 1: PRE-FLIGHT CHECKS
# -----------------------------------------------------------------------------
log_header "STEP 1: PRE-FLIGHT CHECKS"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root"
    exit 1
fi
log_success "Running as root"

# Check docker
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi
log_success "Docker is available"

# Check disk space (require at least 2GB free)
FREE_SPACE=$(df -BG "$BACKUP_BASE_DIR" 2>/dev/null | tail -1 | awk '{print $4}' | tr -d 'G')
if [ "$FREE_SPACE" -lt 2 ]; then
    log_error "Not enough disk space. Need at least 2GB, have ${FREE_SPACE}GB"
    exit 1
fi
log_success "Disk space OK: ${FREE_SPACE}GB available"

# Check container status
if docker ps | grep -q "$CONTAINER_NAME"; then
    log_success "Container $CONTAINER_NAME is running"
    CONTAINER_RUNNING=true
    CURRENT_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
    log_info "Current version: $CURRENT_VERSION"
else
    log_warning "Container $CONTAINER_NAME is not running"
    CONTAINER_RUNNING=false
    CURRENT_VERSION="Unknown"
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
log_success "Backup directory created: $BACKUP_DIR"

# -----------------------------------------------------------------------------
# STEP 2: BACKUP WORKFLOWS
# -----------------------------------------------------------------------------
log_header "STEP 2: BACKUP WORKFLOWS"

if [ "$CONTAINER_RUNNING" = true ]; then
    docker exec "$CONTAINER_NAME" mkdir -p /home/node/.n8n/exports 2>/dev/null || true
    
    log_info "Exporting workflows via n8n CLI..."
    if docker exec "$CONTAINER_NAME" n8n export:workflow --all --output=/home/node/.n8n/exports/workflows.all.json 2>/dev/null; then
        docker cp "$CONTAINER_NAME:/home/node/.n8n/exports/workflows.all.json" "$BACKUP_DIR/workflows.all.json"
        WORKFLOW_COUNT=$(grep -o '"id"' "$BACKUP_DIR/workflows.all.json" 2>/dev/null | wc -l || echo "0")
        log_success "Workflows exported: $WORKFLOW_COUNT workflows"
    else
        log_warning "Workflow CLI export failed"
    fi
else
    log_warning "Skipping workflow export (container not running)"
fi

# -----------------------------------------------------------------------------
# STEP 3: BACKUP CREDENTIALS
# -----------------------------------------------------------------------------
log_header "STEP 3: BACKUP CREDENTIALS"

if [ "$CONTAINER_RUNNING" = true ]; then
    log_info "Exporting credentials via n8n CLI..."
    if docker exec "$CONTAINER_NAME" n8n export:credentials --all --decrypted --output=/home/node/.n8n/exports/credentials.decrypted.json 2>/dev/null; then
        docker cp "$CONTAINER_NAME:/home/node/.n8n/exports/credentials.decrypted.json" "$BACKUP_DIR/credentials.decrypted.json"
        CREDENTIAL_COUNT=$(grep -o '"id"' "$BACKUP_DIR/credentials.decrypted.json" 2>/dev/null | wc -l || echo "0")
        log_success "Credentials exported: $CREDENTIAL_COUNT credentials"
        log_warning "SECURITY: credentials.decrypted.json contains secrets. Keep secure!"
    else
        log_warning "Credential CLI export failed"
    fi
else
    log_warning "Skipping credential export (container not running)"
fi

# -----------------------------------------------------------------------------
# STEP 4: BACKUP COMMUNITY NODES
# -----------------------------------------------------------------------------
log_header "STEP 4: BACKUP COMMUNITY NODES"

if [ "$CONTAINER_RUNNING" = true ]; then
    COMMUNITY_NODES_DIR="/home/node/.n8n/nodes"
    
    if docker exec "$CONTAINER_NAME" test -d "$COMMUNITY_NODES_DIR" 2>/dev/null; then
        log_info "Found community nodes directory"
        
        # List installed
        docker exec "$CONTAINER_NAME" ls -la "$COMMUNITY_NODES_DIR" > "$BACKUP_DIR/community-nodes-list.txt" 2>/dev/null || true
        
        # Backup package.json
        if docker exec "$CONTAINER_NAME" test -f "$COMMUNITY_NODES_DIR/package.json" 2>/dev/null; then
            docker cp "$CONTAINER_NAME:$COMMUNITY_NODES_DIR/package.json" "$BACKUP_DIR/community-nodes-package.json" 2>/dev/null || true
            log_success "Community nodes package.json backed up"
            
            echo ""
            echo "Installed community packages:"
            cat "$BACKUP_DIR/community-nodes-package.json" | grep -E '"@|"n8n-nodes' | head -20 || echo "  (none found)"
            echo ""
        fi
        
        # Backup entire directory
        if docker exec "$CONTAINER_NAME" test -d "$COMMUNITY_NODES_DIR/node_modules" 2>/dev/null; then
            log_info "Creating community nodes archive..."
            docker exec "$CONTAINER_NAME" tar czf /tmp/community-nodes-backup.tgz -C "$COMMUNITY_NODES_DIR" . 2>/dev/null || true
            docker cp "$CONTAINER_NAME:/tmp/community-nodes-backup.tgz" "$BACKUP_DIR/community-nodes-backup.tgz" 2>/dev/null || true
            
            if [ -f "$BACKUP_DIR/community-nodes-backup.tgz" ]; then
                SIZE=$(du -sh "$BACKUP_DIR/community-nodes-backup.tgz" | cut -f1)
                log_success "Community nodes archive: $SIZE"
            fi
        else
            log_info "No community nodes installed"
        fi
    else
        log_info "No community nodes directory found"
    fi
else
    log_warning "Skipping community nodes backup (container not running)"
fi

# -----------------------------------------------------------------------------
# STEP 5: BACKUP DATA VOLUME (COMPLETE)
# -----------------------------------------------------------------------------
log_header "STEP 5: BACKUP DATA VOLUME (COMPLETE)"

log_info "This is the CRITICAL backup - includes everything"

if [ -d "$N8N_DATA_DIR" ]; then
    log_info "Found data directory: $N8N_DATA_DIR"
    
    tar czf "$BACKUP_DIR/n8n-data-complete.tgz" -C "$N8N_DATA_DIR" . 2>/dev/null || {
        log_error "Data volume backup failed!"
        exit 1
    }
    
    SIZE=$(du -sh "$BACKUP_DIR/n8n-data-complete.tgz" | cut -f1)
    log_success "Data volume backup completed: $SIZE"
    
    # Also backup just the database if exists
    if [ -f "$N8N_DATA_DIR/database.sqlite" ]; then
        cp "$N8N_DATA_DIR/database.sqlite" "$BACKUP_DIR/database.sqlite.backup"
        log_success "Database file backed up separately"
    fi
else
    log_error "Data directory not found: $N8N_DATA_DIR"
    exit 1
fi

# -----------------------------------------------------------------------------
# STEP 6: BACKUP DOCKER COMPOSE CONFIG
# -----------------------------------------------------------------------------
log_header "STEP 6: BACKUP DOCKER COMPOSE CONFIG"

if [ -f "$DOCKER_COMPOSE_DIR/docker-compose.yml" ]; then
    cp "$DOCKER_COMPOSE_DIR/docker-compose.yml" "$BACKUP_DIR/docker-compose.yml.backup"
    log_success "docker-compose.yml backed up"
else
    log_warning "docker-compose.yml not found"
fi

# -----------------------------------------------------------------------------
# STEP 7: CREATE BACKUP MANIFEST
# -----------------------------------------------------------------------------
log_header "STEP 7: CREATE BACKUP MANIFEST"

cat > "$BACKUP_DIR/backup-manifest.json" << EOF
{
    "customer": "Wonder.Care (Ortal Flanary)",
    "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "server": "$N8N_SERVER",
    "container_name": "$CONTAINER_NAME",
    "current_version": "$CURRENT_VERSION",
    "target_version": "$TARGET_VERSION",
    "backup_files": {
        "data_volume": "n8n-data-complete.tgz",
        "database": "database.sqlite.backup",
        "workflows": "workflows.all.json",
        "credentials": "credentials.decrypted.json",
        "community_nodes": "community-nodes-backup.tgz",
        "docker_compose": "docker-compose.yml.backup"
    },
    "backup_size": "$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo 'Unknown')",
    "status": "completed"
}
EOF

log_success "Backup manifest created"

# -----------------------------------------------------------------------------
# STEP 8: VERIFY BACKUP
# -----------------------------------------------------------------------------
log_header "STEP 8: VERIFY BACKUP"

echo ""
echo "Backup files:"
ls -lh "$BACKUP_DIR/"
echo ""

if [ -f "$BACKUP_DIR/n8n-data-complete.tgz" ]; then
    if tar -tzf "$BACKUP_DIR/n8n-data-complete.tgz" >/dev/null 2>&1; then
        log_success "Data backup integrity verified"
    else
        log_error "Data backup integrity check failed!"
        exit 1
    fi
else
    log_error "Critical backup file missing!"
    exit 1
fi

# -----------------------------------------------------------------------------
# STEP 9: BACKUP COMPLETE SUMMARY
# -----------------------------------------------------------------------------
log_header "🎉 BACKUP COMPLETED SUCCESSFULLY!"

echo ""
echo "📦 Backup Location: $BACKUP_DIR"
echo "📊 Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo "📋 Current Version: $CURRENT_VERSION"
echo ""

if [ "$BACKUP_ONLY" = true ]; then
    log_success "Backup-only mode. No upgrade performed."
    echo ""
    echo "To upgrade later, run:"
    echo "  $0 <version>"
    echo ""
    exit 0
fi

# -----------------------------------------------------------------------------
# STEP 10: PROMPT FOR UPGRADE
# -----------------------------------------------------------------------------
log_header "STEP 10: UPGRADE N8N TO $TARGET_VERSION"

echo ""
echo "⚠️  WARNING: This will upgrade n8n to version $TARGET_VERSION"
echo "   Backup is complete and safe at: $BACKUP_DIR"
echo ""
read -p "🚀 Ready to upgrade n8n to $TARGET_VERSION? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_warning "Upgrade cancelled. Backup is safe."
    exit 0
fi

# -----------------------------------------------------------------------------
# STEP 11: PERFORM UPGRADE
# -----------------------------------------------------------------------------
log_header "STEP 11: PERFORMING UPGRADE"

cd "$DOCKER_COMPOSE_DIR" || exit 1

# Stop container
log_info "Stopping n8n container..."
docker-compose stop 2>/dev/null || docker stop "$CONTAINER_NAME" 2>/dev/null || true
sleep 3
log_success "Container stopped"

# Backup current docker-compose.yml
cp docker-compose.yml "docker-compose.yml.pre-$TARGET_VERSION-$(date +%Y%m%d-%H%M%S)"

# Update docker-compose.yml
log_info "Updating docker-compose.yml to version $TARGET_VERSION..."
sed -i "s|image: n8nio/n8n:.*|image: n8nio/n8n:$TARGET_VERSION|g" docker-compose.yml
log_success "docker-compose.yml updated"

# Pull new image
log_info "Pulling n8n image $TARGET_VERSION..."
docker-compose pull 2>/dev/null || docker pull "n8nio/n8n:$TARGET_VERSION"
log_success "Image pulled"

# Start container
log_info "Starting n8n container..."
docker-compose up -d 2>/dev/null || {
    log_error "Failed to start container!"
    log_warning "Attempting rollback..."
    cp "$BACKUP_DIR/docker-compose.yml.backup" docker-compose.yml
    docker-compose up -d
    exit 1
}

# Wait for n8n to be ready
log_info "Waiting for n8n to start..."
sleep 15

for i in $(seq 1 30); do
    if curl -s -o /dev/null -w '%{http_code}' http://localhost:5678 2>/dev/null | grep -q "200\|302"; then
        log_success "n8n is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        log_warning "n8n health check timeout (may still be starting)"
    else
        echo "   Waiting... ($i/30)"
        sleep 5
    fi
done

# -----------------------------------------------------------------------------
# STEP 12: VERIFY UPGRADE
# -----------------------------------------------------------------------------
log_header "STEP 12: VERIFY UPGRADE"

NEW_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
log_info "New version: $NEW_VERSION"

if echo "$NEW_VERSION" | grep -q "$TARGET_VERSION"; then
    log_success "Version upgrade successful!"
else
    log_warning "Version mismatch. Expected $TARGET_VERSION, got $NEW_VERSION"
fi

# -----------------------------------------------------------------------------
# STEP 13: FINAL SUMMARY
# -----------------------------------------------------------------------------
log_header "🎉 UPGRADE COMPLETE!"

echo ""
echo "📊 Upgrade Summary:"
echo "   Previous Version: $CURRENT_VERSION"
echo "   New Version: $NEW_VERSION"
echo "   Backup Location: $BACKUP_DIR"
echo ""
echo "🌐 Access n8n:"
echo "   URL: http://$N8N_SERVER:5678"
echo ""
echo "📋 Post-Upgrade Checklist:"
echo "   1. Login with existing credentials"
echo "   2. Verify workflows are present"
echo "   3. Verify credentials are working"
echo "   4. Test a few workflows"
echo ""
echo "🛡️ Rollback if needed:"
echo "   cd $DOCKER_COMPOSE_DIR"
echo "   docker-compose down"
echo "   cp $BACKUP_DIR/docker-compose.yml.backup docker-compose.yml"
echo "   rm -rf $N8N_DATA_DIR/*"
echo "   tar xzf $BACKUP_DIR/n8n-data-complete.tgz -C $N8N_DATA_DIR"
echo "   chown -R 1000:1000 $N8N_DATA_DIR"
echo "   docker-compose up -d"
echo ""
log_success "Upgrade to n8n $TARGET_VERSION completed!"

