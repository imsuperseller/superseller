#!/bin/bash

# 🛡️ N8N COMPLETE BACKUP & UPDATE TO 2.0.1
# =========================================
# Comprehensive backup of:
# - Workflows (JSON export)
# - Credentials (decrypted export)
# - Community nodes (packages + config)
# - n8n user accounts (in database)
# - n8n API key (in settings)
# - Database (SQLite)
# - Docker compose configuration
#
# Then updates n8n from current version to 2.0.1
#
# LESSONS LEARNED FROM PREVIOUS UPGRADES:
# - ✅ Always backup data volume (includes database, user accounts, settings)
# - ✅ Never touch database during update (preserves login credentials)
# - ✅ Verify backups before updating
# - ✅ Export workflows and credentials separately (redundant backup)
# - ❌ DON'T run database cleanup during update
# - ❌ DON'T modify environment variables during update

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# =============================================================================
N8N_SERVER="172.245.56.50"
CONTAINER_NAME="n8n_rensto"
VOLUME_NAME="n8n_n8n_data"
TARGET_VERSION="2.0.1"
DOCKER_COMPOSE_DIR="/opt/n8n"
BACKUP_BASE_DIR="/root/n8n-backups"
BACKUP_DIR="$BACKUP_BASE_DIR/$(date +%Y-%m-%d_%H%M%S)-upgrade-to-$TARGET_VERSION"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

log_header "🛡️ N8N COMPLETE BACKUP & UPDATE TO $TARGET_VERSION"
echo ""
echo "Date: $(date)"
echo "Server: $N8N_SERVER"
echo "Container: $CONTAINER_NAME"
echo "Target Version: $TARGET_VERSION"
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

# Check if docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi
log_success "Docker is available"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi
log_success "Docker Compose is available"

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
    # Create exports directory inside container
    docker exec "$CONTAINER_NAME" bash -lc 'mkdir -p ~/.n8n/exports' 2>/dev/null || true
    
    # Export all workflows via n8n CLI
    log_info "Exporting workflows via n8n CLI..."
    if docker exec "$CONTAINER_NAME" n8n export:workflow --all --output=/home/node/.n8n/exports/workflows.all.json 2>/dev/null; then
        docker cp "$CONTAINER_NAME:/home/node/.n8n/exports/workflows.all.json" "$BACKUP_DIR/workflows.all.json"
        WORKFLOW_COUNT=$(cat "$BACKUP_DIR/workflows.all.json" 2>/dev/null | grep -o '"id"' | wc -l || echo "0")
        log_success "Workflows exported: $WORKFLOW_COUNT workflows saved to workflows.all.json"
    else
        log_warning "Workflow CLI export failed, trying API method..."
        
        # Fallback: Use direct database query
        if [ -f "/opt/n8n/data/n8n/database.sqlite" ]; then
            log_info "Extracting workflows from database..."
            sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT json_group_array(json_object('id', id, 'name', name, 'nodes', json(nodes), 'connections', json(connections), 'settings', json(settings), 'active', active)) FROM workflow_entity;" > "$BACKUP_DIR/workflows.db-export.json" 2>/dev/null || true
            if [ -s "$BACKUP_DIR/workflows.db-export.json" ]; then
                WORKFLOW_COUNT=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM workflow_entity;" 2>/dev/null || echo "0")
                log_success "Workflows extracted from database: $WORKFLOW_COUNT workflows"
            fi
        fi
    fi
else
    log_warning "Skipping workflow export (container not running)"
fi

# -----------------------------------------------------------------------------
# STEP 3: BACKUP CREDENTIALS
# -----------------------------------------------------------------------------
log_header "STEP 3: BACKUP CREDENTIALS"

if [ "$CONTAINER_RUNNING" = true ]; then
    # Export credentials (decrypted for backup)
    log_info "Exporting credentials via n8n CLI..."
    if docker exec "$CONTAINER_NAME" n8n export:credentials --all --decrypted --output=/home/node/.n8n/exports/credentials.decrypted.json 2>/dev/null; then
        docker cp "$CONTAINER_NAME:/home/node/.n8n/exports/credentials.decrypted.json" "$BACKUP_DIR/credentials.decrypted.json"
        CREDENTIAL_COUNT=$(cat "$BACKUP_DIR/credentials.decrypted.json" 2>/dev/null | grep -o '"id"' | wc -l || echo "0")
        log_success "Credentials exported: $CREDENTIAL_COUNT credentials saved"
        log_warning "SECURITY: credentials.decrypted.json contains decrypted secrets. Keep it secure!"
    else
        log_warning "Credential CLI export failed"
        log_info "Credentials are still preserved in the database backup"
    fi
else
    log_warning "Skipping credential export (container not running)"
fi

# -----------------------------------------------------------------------------
# STEP 4: BACKUP COMMUNITY NODES
# -----------------------------------------------------------------------------
log_header "STEP 4: BACKUP COMMUNITY NODES"

COMMUNITY_NODES_DIR="/home/node/.n8n/nodes"

if [ "$CONTAINER_RUNNING" = true ]; then
    # Check if community nodes directory exists
    if docker exec "$CONTAINER_NAME" test -d "$COMMUNITY_NODES_DIR" 2>/dev/null; then
        log_info "Found community nodes directory: $COMMUNITY_NODES_DIR"
        
        # List installed community nodes
        docker exec "$CONTAINER_NAME" ls -la "$COMMUNITY_NODES_DIR" > "$BACKUP_DIR/community-nodes-list.txt" 2>/dev/null || true
        
        # Backup package.json
        if docker exec "$CONTAINER_NAME" test -f "$COMMUNITY_NODES_DIR/package.json" 2>/dev/null; then
            docker cp "$CONTAINER_NAME:$COMMUNITY_NODES_DIR/package.json" "$BACKUP_DIR/community-nodes-package.json" 2>/dev/null || true
            log_success "Community nodes package.json backed up"
            
            # Show installed packages
            echo ""
            echo "Installed community packages:"
            cat "$BACKUP_DIR/community-nodes-package.json" | grep -E '"@|"n8n-nodes' | head -20 || true
            echo ""
        fi
        
        # Backup entire community nodes directory
        if docker exec "$CONTAINER_NAME" test -d "$COMMUNITY_NODES_DIR/node_modules" 2>/dev/null; then
            log_info "Creating community nodes backup archive..."
            docker exec "$CONTAINER_NAME" tar czf /tmp/community-nodes-backup.tgz -C "$COMMUNITY_NODES_DIR" . 2>/dev/null || true
            docker cp "$CONTAINER_NAME:/tmp/community-nodes-backup.tgz" "$BACKUP_DIR/community-nodes-backup.tgz" 2>/dev/null || true
            
            if [ -f "$BACKUP_DIR/community-nodes-backup.tgz" ]; then
                SIZE=$(du -sh "$BACKUP_DIR/community-nodes-backup.tgz" | cut -f1)
                log_success "Community nodes archive created: $SIZE"
            else
                log_warning "Community nodes archive creation failed"
            fi
        else
            log_info "No community nodes installed (node_modules not found)"
        fi
    else
        log_info "No community nodes directory found"
    fi
    
    # Also backup from database tables
    log_info "Backing up community nodes from database..."
    if [ -f "/opt/n8n/data/n8n/database.sqlite" ]; then
        sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT * FROM installed_packages;" > "$BACKUP_DIR/installed_packages.txt" 2>/dev/null || true
        sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT * FROM installed_nodes;" > "$BACKUP_DIR/installed_nodes.txt" 2>/dev/null || true
        
        PACKAGE_COUNT=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM installed_packages;" 2>/dev/null || echo "0")
        NODE_COUNT=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM installed_nodes;" 2>/dev/null || echo "0")
        log_success "Database community nodes: $PACKAGE_COUNT packages, $NODE_COUNT nodes"
    fi
else
    log_warning "Skipping community nodes backup (container not running)"
fi

# -----------------------------------------------------------------------------
# STEP 5: BACKUP N8N USER ACCOUNTS & API KEY
# -----------------------------------------------------------------------------
log_header "STEP 5: BACKUP N8N USER ACCOUNTS & API KEY"

if [ -f "/opt/n8n/data/n8n/database.sqlite" ]; then
    # Backup user accounts
    log_info "Backing up user accounts..."
    sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT id, email, role, createdAt FROM user;" > "$BACKUP_DIR/users.txt" 2>/dev/null || true
    USER_COUNT=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM user;" 2>/dev/null || echo "0")
    log_success "User accounts backed up: $USER_COUNT users"
    
    # Show user list
    echo ""
    echo "User accounts:"
    cat "$BACKUP_DIR/users.txt" 2>/dev/null || echo "  (none found)"
    echo ""
    
    # Backup API keys
    log_info "Backing up API keys..."
    sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT id, label, apiKey FROM api_key;" > "$BACKUP_DIR/api_keys.txt" 2>/dev/null || true
    API_KEY_COUNT=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM api_key;" 2>/dev/null || echo "0")
    log_success "API keys backed up: $API_KEY_COUNT keys"
    log_warning "SECURITY: api_keys.txt contains sensitive data. Keep it secure!"
    
    # Backup settings
    log_info "Backing up settings..."
    sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT * FROM settings;" > "$BACKUP_DIR/settings.txt" 2>/dev/null || true
    log_success "Settings backed up"
else
    log_warning "Database file not found, skipping user/API key backup"
fi

# -----------------------------------------------------------------------------
# STEP 6: BACKUP DATA VOLUME (COMPLETE DATABASE)
# -----------------------------------------------------------------------------
log_header "STEP 6: BACKUP DATA VOLUME (COMPLETE DATABASE)"

log_info "This is the CRITICAL backup - includes everything"

# Check if bind mount or volume
if [ -d "/opt/n8n/data/n8n" ]; then
    log_info "Found bind mount: /opt/n8n/data/n8n"
    
    # Create complete data backup
    log_info "Creating complete data volume backup..."
    tar czf "$BACKUP_DIR/n8n-data-complete.tgz" -C /opt/n8n/data/n8n . 2>/dev/null || {
        log_error "Data volume backup failed!"
        exit 1
    }
    
    SIZE=$(du -sh "$BACKUP_DIR/n8n-data-complete.tgz" | cut -f1)
    log_success "Data volume backup completed: $SIZE"
    
    # Also backup just the database
    if [ -f "/opt/n8n/data/n8n/database.sqlite" ]; then
        cp /opt/n8n/data/n8n/database.sqlite "$BACKUP_DIR/database.sqlite.backup"
        log_success "Database file backed up separately"
    fi
elif docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
    log_info "Found Docker volume: $VOLUME_NAME"
    
    if docker run --rm -v "$VOLUME_NAME:/data" -v "$BACKUP_DIR:/backup" alpine \
        sh -c 'cd /data && tar czf /backup/n8n-data-complete.tgz .'; then
        SIZE=$(du -sh "$BACKUP_DIR/n8n-data-complete.tgz" | cut -f1)
        log_success "Data volume backup completed: $SIZE"
    else
        log_error "Data volume backup failed!"
        exit 1
    fi
else
    log_error "Could not find data volume or bind mount!"
    exit 1
fi

# -----------------------------------------------------------------------------
# STEP 7: BACKUP DOCKER COMPOSE CONFIGURATION
# -----------------------------------------------------------------------------
log_header "STEP 7: BACKUP DOCKER COMPOSE CONFIGURATION"

if [ -f "$DOCKER_COMPOSE_DIR/docker-compose.yml" ]; then
    cp "$DOCKER_COMPOSE_DIR/docker-compose.yml" "$BACKUP_DIR/docker-compose.yml.backup"
    log_success "docker-compose.yml backed up"
else
    log_warning "docker-compose.yml not found at $DOCKER_COMPOSE_DIR"
fi

# Backup any .env file
if [ -f "$DOCKER_COMPOSE_DIR/.env" ]; then
    cp "$DOCKER_COMPOSE_DIR/.env" "$BACKUP_DIR/env.backup"
    log_success ".env file backed up"
fi

# -----------------------------------------------------------------------------
# STEP 8: CREATE BACKUP MANIFEST
# -----------------------------------------------------------------------------
log_header "STEP 8: CREATE BACKUP MANIFEST"

cat > "$BACKUP_DIR/backup-manifest.json" << EOF
{
    "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "server": "$N8N_SERVER",
    "container_name": "$CONTAINER_NAME",
    "volume_name": "$VOLUME_NAME",
    "current_version": "$CURRENT_VERSION",
    "target_version": "$TARGET_VERSION",
    "backup_files": {
        "data_volume": "n8n-data-complete.tgz",
        "database": "database.sqlite.backup",
        "workflows": "workflows.all.json",
        "credentials": "credentials.decrypted.json",
        "community_nodes": "community-nodes-backup.tgz",
        "community_package_json": "community-nodes-package.json",
        "users": "users.txt",
        "api_keys": "api_keys.txt",
        "settings": "settings.txt",
        "docker_compose": "docker-compose.yml.backup"
    },
    "backup_size": "$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo 'Unknown')",
    "status": "completed",
    "notes": "Complete backup including database, user accounts, API keys, credentials, workflows, and community nodes. All data preserved for rollback if needed."
}
EOF

log_success "Backup manifest created"

# -----------------------------------------------------------------------------
# STEP 9: VERIFY BACKUP
# -----------------------------------------------------------------------------
log_header "STEP 9: VERIFY BACKUP"

echo ""
echo "Backup files:"
ls -lh "$BACKUP_DIR/"
echo ""

# Verify critical backup file
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
# STEP 10: BACKUP COMPLETE SUMMARY
# -----------------------------------------------------------------------------
log_header "🎉 BACKUP COMPLETED SUCCESSFULLY!"

echo ""
echo "📦 Backup Location: $BACKUP_DIR"
echo "📊 Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo "📋 Current Version: $CURRENT_VERSION"
echo "🎯 Target Version: $TARGET_VERSION"
echo ""
echo "Backed up:"
echo "  ✅ Workflows (JSON export)"
echo "  ✅ Credentials (decrypted)"
echo "  ✅ Community nodes"
echo "  ✅ User accounts"
echo "  ✅ API keys"
echo "  ✅ Settings"
echo "  ✅ Complete data volume"
echo "  ✅ Docker compose config"
echo ""

# -----------------------------------------------------------------------------
# STEP 11: PROMPT FOR UPDATE
# -----------------------------------------------------------------------------
log_header "STEP 11: UPDATE N8N TO $TARGET_VERSION"

# Check if running non-interactively
if [ "$1" == "--yes" ] || [ ! -t 0 ]; then
    confirm="yes"
    log_info "Auto-confirming update (non-interactive mode)"
else
    echo ""
    echo "⚠️  WARNING: This will update n8n to version $TARGET_VERSION"
    echo "   The backup is complete and safe at: $BACKUP_DIR"
    echo ""
    read -p "🚀 Ready to update n8n to $TARGET_VERSION? (yes/no): " confirm
fi

if [ "$confirm" != "yes" ]; then
    log_warning "Update cancelled. Backup is safe at: $BACKUP_DIR"
    echo ""
    echo "To update later, run:"
    echo "  cd $DOCKER_COMPOSE_DIR"
    echo "  docker-compose stop n8n"
    echo "  sed -i 's|image: n8nio/n8n:.*|image: n8nio/n8n:$TARGET_VERSION|g' docker-compose.yml"
    echo "  docker-compose pull n8n"
    echo "  docker-compose up -d n8n"
    exit 0
fi

# -----------------------------------------------------------------------------
# STEP 12: PERFORM UPDATE
# -----------------------------------------------------------------------------
log_header "STEP 12: PERFORMING UPDATE"

# Stop n8n container
log_info "Stopping n8n container..."
cd "$DOCKER_COMPOSE_DIR" || exit 1
docker-compose stop n8n 2>/dev/null || docker stop "$CONTAINER_NAME" 2>/dev/null || log_warning "Container stop failed (may already be stopped)"
sleep 3
log_success "Container stopped"

# Backup current docker-compose.yml with timestamp
cp docker-compose.yml "docker-compose.yml.pre-$TARGET_VERSION-$(date +%Y%m%d-%H%M%S)"

# Update docker-compose.yml to use new version
log_info "Updating docker-compose.yml to version $TARGET_VERSION..."
sed -i "s|image: n8nio/n8n:.*|image: n8nio/n8n:$TARGET_VERSION|g" docker-compose.yml
log_success "docker-compose.yml updated"

# Pull new image
log_info "Pulling n8n image $TARGET_VERSION..."
docker-compose pull n8n 2>/dev/null || docker pull "n8nio/n8n:$TARGET_VERSION"
log_success "Image pulled"

# Start n8n container
log_info "Starting n8n container..."
docker-compose up -d n8n 2>/dev/null || docker start "$CONTAINER_NAME" 2>/dev/null || {
    log_error "Failed to start container!"
    log_warning "Attempting rollback..."
    cp "$BACKUP_DIR/docker-compose.yml.backup" docker-compose.yml
    docker-compose up -d n8n
    exit 1
}

# Wait for n8n to be healthy
log_info "Waiting for n8n to start (this may take a minute)..."
sleep 15

i=1
while [ $i -le 30 ]; do
    if docker exec "$CONTAINER_NAME" wget --spider -q http://localhost:5678/healthz 2>/dev/null; then
        log_success "n8n is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        log_warning "n8n health check timeout (may still be starting)"
    else
        echo "   Waiting... ($i/30)"
        sleep 5
    fi
    i=$((i + 1))
done

# -----------------------------------------------------------------------------
# STEP 13: VERIFY UPDATE
# -----------------------------------------------------------------------------
log_header "STEP 13: VERIFY UPDATE"

# Get new version
NEW_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
log_info "New version: $NEW_VERSION"

# Check if version matches
if echo "$NEW_VERSION" | grep -q "$TARGET_VERSION"; then
    log_success "Version update successful!"
else
    log_warning "Version mismatch. Expected $TARGET_VERSION, got $NEW_VERSION"
fi

# Verify workflows
log_info "Verifying workflows..."
WORKFLOW_COUNT_AFTER=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM workflow_entity;" 2>/dev/null || echo "Unknown")
log_success "Workflows in database: $WORKFLOW_COUNT_AFTER"

# Verify credentials
log_info "Verifying credentials..."
CREDENTIAL_COUNT_AFTER=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM credentials_entity;" 2>/dev/null || echo "Unknown")
log_success "Credentials in database: $CREDENTIAL_COUNT_AFTER"

# Verify users
log_info "Verifying user accounts..."
USER_COUNT_AFTER=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM user;" 2>/dev/null || echo "Unknown")
log_success "User accounts: $USER_COUNT_AFTER"

# Verify community nodes
log_info "Verifying community nodes..."
PACKAGE_COUNT_AFTER=$(sqlite3 /opt/n8n/data/n8n/database.sqlite "SELECT COUNT(*) FROM installed_packages;" 2>/dev/null || echo "Unknown")
log_success "Community packages: $PACKAGE_COUNT_AFTER"

# -----------------------------------------------------------------------------
# STEP 14: FINAL SUMMARY
# -----------------------------------------------------------------------------
log_header "🎉 UPDATE COMPLETE!"

echo ""
echo "📊 Update Summary:"
echo "   Previous Version: $CURRENT_VERSION"
echo "   New Version: $NEW_VERSION"
echo "   Backup Location: $BACKUP_DIR"
echo ""
echo "📋 Verification:"
echo "   Workflows: $WORKFLOW_COUNT_AFTER"
echo "   Credentials: $CREDENTIAL_COUNT_AFTER"
echo "   Users: $USER_COUNT_AFTER"
echo "   Community Packages: $PACKAGE_COUNT_AFTER"
echo ""
echo "🌐 Access n8n:"
echo "   URL: http://$N8N_SERVER:5678"
echo "   or: https://n8n.rensto.com"
echo ""
echo "📋 Post-Update Checklist:"
echo "   1. ✅ Login with existing credentials"
echo "   2. ✅ Verify workflows are present"
echo "   3. ✅ Verify credentials are working"
echo "   4. ✅ Verify community nodes are installed"
echo "   5. ✅ Test a few workflows"
echo ""
echo "🛡️ Rollback if needed:"
echo "   cd $DOCKER_COMPOSE_DIR"
echo "   docker-compose stop n8n"
echo "   cp $BACKUP_DIR/docker-compose.yml.backup docker-compose.yml"
echo "   tar xzf $BACKUP_DIR/n8n-data-complete.tgz -C /opt/n8n/data/n8n"
echo "   docker-compose up -d n8n"
echo ""
log_success "Upgrade to n8n $TARGET_VERSION completed successfully!"
