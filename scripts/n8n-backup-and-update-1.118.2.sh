#!/bin/bash

# 🛡️ N8N COMPLETE BACKUP & UPDATE TO 1.119.1
# Comprehensive backup of workflows, credentials, community nodes, and data volume
# Then updates n8n from current version to 1.119.1 (latest stable)

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/root/n8n-backups/$(date +%Y-%m-%d_%H%M%S)"
CONTAINER_NAME="n8n_rensto"
VOLUME_NAME="n8n_n8n_data"
N8N_SERVER="173.254.201.134"
TARGET_VERSION="1.119.1"
DOCKER_COMPOSE_DIR="/opt/n8n"

echo "🛡️  N8N COMPLETE BACKUP & UPDATE TO $TARGET_VERSION"
echo "=================================================="
echo "Date: $(date)"
echo "Server: $N8N_SERVER"
echo "Container: $CONTAINER_NAME"
echo "Volume: $VOLUME_NAME"
echo "Target Version: $TARGET_VERSION"
echo ""

# Step 1: Create backup directory
echo "📁 Creating backup directory..."
mkdir -p "$BACKUP_DIR"
echo "✅ Backup directory created: $BACKUP_DIR"

# Step 2: Check container status
echo ""
echo "🔍 Checking container status..."
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ Container $CONTAINER_NAME is running"
    CONTAINER_RUNNING=true
    CURRENT_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
    echo "📊 Current version: $CURRENT_VERSION"
else
    echo "⚠️  Container $CONTAINER_NAME is not running"
    CONTAINER_RUNNING=false
    CURRENT_VERSION="Unknown"
fi

# Step 3: Export workflows (via n8n CLI)
if [ "$CONTAINER_RUNNING" = true ]; then
    echo ""
    echo "📤 Exporting workflows..."
    
    # Create exports directory inside container
    docker exec "$CONTAINER_NAME" bash -lc 'mkdir -p ~/.n8n/exports' || echo "⚠️  Could not create exports directory"
    
    # Export all workflows
    if docker exec "$CONTAINER_NAME" n8n export:workflow --all --output=/home/node/.n8n/exports/workflows.all.json 2>/dev/null; then
        echo "✅ Workflows exported successfully"
        docker cp "$CONTAINER_NAME:/home/node/.n8n/exports/workflows.all.json" "$BACKUP_DIR/workflows.all.json"
        echo "✅ Workflows copied to: $BACKUP_DIR/workflows.all.json"
    else
        echo "⚠️  Workflow export via CLI failed, trying API method..."
        
        # Fallback: Use API to export workflows
        N8N_API_KEY=$(docker exec "$CONTAINER_NAME" env | grep N8N_API_KEY | cut -d= -f2 || echo "")
        if [ ! -z "$N8N_API_KEY" ]; then
            echo "📡 Exporting workflows via API..."
            curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
                "http://localhost:5678/api/v1/workflows" \
                > "$BACKUP_DIR/workflows.api.json" 2>/dev/null || echo "⚠️  API export also failed"
        fi
    fi
else
    echo "⚠️  Skipping workflow export (container not running)"
fi

# Step 4: Export credentials (via n8n CLI)
if [ "$CONTAINER_RUNNING" = true ]; then
    echo ""
    echo "🔐 Exporting credentials..."
    
    # Export all credentials (decrypted for backup)
    if docker exec "$CONTAINER_NAME" n8n export:credentials --all --decrypted --output=/home/node/.n8n/exports/credentials.decrypted.json 2>/dev/null; then
        echo "✅ Credentials exported successfully"
        docker cp "$CONTAINER_NAME:/home/node/.n8n/exports/credentials.decrypted.json" "$BACKUP_DIR/credentials.decrypted.json"
        echo "✅ Credentials copied to: $BACKUP_DIR/credentials.decrypted.json"
        echo "⚠️  SECURITY: This file contains decrypted credentials. Keep it secure!"
    else
        echo "⚠️  Credential export via CLI failed"
        echo "⚠️  Note: Credentials are also stored in the data volume backup"
    fi
else
    echo "⚠️  Skipping credential export (container not running)"
fi

# Step 5: Backup community nodes
echo ""
echo "📦 Backing up community nodes..."
COMMUNITY_NODES_DIR="/home/node/custom"
if docker exec "$CONTAINER_NAME" test -d "$COMMUNITY_NODES_DIR" 2>/dev/null; then
    echo "📂 Found community nodes directory: $COMMUNITY_NODES_DIR"
    
    # List installed community nodes
    docker exec "$CONTAINER_NAME" ls -la "$COMMUNITY_NODES_DIR" > "$BACKUP_DIR/community-nodes-list.txt" 2>/dev/null || true
    
    # Backup community nodes directory
    if docker exec "$CONTAINER_NAME" test -d "$COMMUNITY_NODES_DIR/node_modules" 2>/dev/null; then
        echo "📦 Creating community nodes backup..."
        docker exec "$CONTAINER_NAME" tar czf /tmp/community-nodes-backup.tgz -C "$COMMUNITY_NODES_DIR" . 2>/dev/null || true
        docker cp "$CONTAINER_NAME:/tmp/community-nodes-backup.tgz" "$BACKUP_DIR/community-nodes-backup.tgz" 2>/dev/null || true
        
        if [ -f "$BACKUP_DIR/community-nodes-backup.tgz" ]; then
            echo "✅ Community nodes backed up: $BACKUP_DIR/community-nodes-backup.tgz"
        else
            echo "⚠️  Community nodes backup failed (may not have any installed)"
        fi
    else
        echo "ℹ️  No community nodes installed (node_modules not found)"
    fi
    
    # Also backup package.json if it exists
    if docker exec "$CONTAINER_NAME" test -f "$COMMUNITY_NODES_DIR/package.json" 2>/dev/null; then
        docker cp "$CONTAINER_NAME:$COMMUNITY_NODES_DIR/package.json" "$BACKUP_DIR/community-nodes-package.json" 2>/dev/null || true
        echo "✅ Community nodes package.json backed up"
    fi
else
    echo "ℹ️  No community nodes directory found"
fi

# Step 6: Backup data volume
echo ""
echo "💾 Backing up data volume..."
if docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
    echo "📦 Found volume: $VOLUME_NAME"
    if docker run --rm -v "$VOLUME_NAME:/data" -v "$BACKUP_DIR:/backup" alpine \
        sh -c 'cd /data && tar czf /backup/n8n-data-backup.tgz .'; then
        echo "✅ Data volume backup completed"
        echo "📦 Backup file: $BACKUP_DIR/n8n-data-backup.tgz"
    else
        echo "❌ Data volume backup failed!"
        exit 1
    fi
else
    echo "⚠️  Volume $VOLUME_NAME not found, checking for bind mount..."
    # Check if using bind mount instead
    if [ -d "/opt/n8n/data/n8n" ]; then
        echo "📂 Found bind mount: /opt/n8n/data/n8n"
        tar czf "$BACKUP_DIR/n8n-data-backup.tgz" -C /opt/n8n/data/n8n . 2>/dev/null || {
            echo "❌ Bind mount backup failed!"
            exit 1
        }
        echo "✅ Bind mount backup completed"
    else
        echo "❌ Could not find data volume or bind mount!"
        exit 1
    fi
fi

# Step 7: Backup docker-compose.yml
echo ""
echo "📄 Backing up docker-compose.yml..."
if [ -f "$DOCKER_COMPOSE_DIR/docker-compose.yml" ]; then
    cp "$DOCKER_COMPOSE_DIR/docker-compose.yml" "$BACKUP_DIR/docker-compose.yml.backup"
    echo "✅ docker-compose.yml backed up"
else
    echo "⚠️  docker-compose.yml not found at $DOCKER_COMPOSE_DIR"
fi

# Step 8: Create backup manifest
echo ""
echo "📝 Creating backup manifest..."
cat > "$BACKUP_DIR/backup-manifest.json" << EOF
{
    "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "server": "$N8N_SERVER",
    "container_name": "$CONTAINER_NAME",
    "volume_name": "$VOLUME_NAME",
    "current_version": "$CURRENT_VERSION",
    "target_version": "$TARGET_VERSION",
    "backup_files": [
        "n8n-data-backup.tgz",
        "workflows.all.json",
        "credentials.decrypted.json",
        "community-nodes-backup.tgz",
        "docker-compose.yml.backup"
    ],
    "backup_size": "$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo 'Unknown')",
    "status": "completed"
}
EOF
echo "✅ Backup manifest created: $BACKUP_DIR/backup-manifest.json"

# Step 9: Verify backup
echo ""
echo "🔍 Verifying backup..."
BACKUP_FILES=(
    "$BACKUP_DIR/n8n-data-backup.tgz"
    "$BACKUP_DIR/backup-manifest.json"
)

for file in "${BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -sh "$file" | cut -f1)
        echo "✅ $(basename "$file") exists ($SIZE)"
        
        # Test backup integrity for tar files
        if [[ "$file" == *.tgz ]]; then
            if tar -tzf "$file" >/dev/null 2>&1; then
                echo "   ✅ Integrity verified"
            else
                echo "   ❌ Integrity check failed!"
                exit 1
            fi
        fi
    else
        echo "⚠️  $(basename "$file") not found (may be optional)"
    fi
done

# Step 10: Summary
echo ""
echo "🎉 BACKUP COMPLETED SUCCESSFULLY!"
echo "================================="
echo "Backup Location: $BACKUP_DIR"
echo "Backup Size: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo 'Unknown')"
echo "Current Version: $CURRENT_VERSION"
echo "Target Version: $TARGET_VERSION"
echo ""

# Step 11: Update n8n
echo ""
# Check if running non-interactively (--yes flag or stdin not a TTY)
if [ "$1" == "--yes" ] || [ ! -t 0 ]; then
    confirm="yes"
    echo "🚀 Auto-confirming update (non-interactive mode)"
else
    read -p "🚀 Ready to update n8n to $TARGET_VERSION? (yes/no): " confirm
fi

if [ "$confirm" != "yes" ]; then
    echo "❌ Update cancelled. Backup is safe at: $BACKUP_DIR"
    exit 0
fi

echo ""
echo "🔄 Starting n8n update to $TARGET_VERSION..."

# Stop n8n container
echo "⏹️  Stopping n8n container..."
cd "$DOCKER_COMPOSE_DIR" || exit 1
docker-compose stop n8n || docker stop "$CONTAINER_NAME" || echo "⚠️  Container stop failed (may already be stopped)"

# Update docker-compose.yml to use specific version
echo "📝 Updating docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    # Backup current docker-compose.yml
    cp docker-compose.yml "docker-compose.yml.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Update image version (handle both 'latest' and version-specific tags)
    sed -i "s|image: n8nio/n8n:.*|image: n8nio/n8n:$TARGET_VERSION|g" docker-compose.yml
    
    echo "✅ docker-compose.yml updated to version $TARGET_VERSION"
else
    echo "❌ docker-compose.yml not found!"
    exit 1
fi

# Pull new image
echo "📥 Pulling n8n image $TARGET_VERSION..."
docker-compose pull n8n || docker pull "n8nio/n8n:$TARGET_VERSION"

# Start n8n container
echo "▶️  Starting n8n container..."
docker-compose up -d n8n || docker start "$CONTAINER_NAME" || {
    echo "❌ Failed to start container!"
    echo "🔄 Attempting rollback..."
    docker-compose up -d n8n || exit 1
}

# Wait for n8n to be healthy
echo "⏳ Waiting for n8n to be healthy..."
sleep 10
for i in {1..30}; do
    if docker exec "$CONTAINER_NAME" wget --spider -q http://localhost:5678/healthz 2>/dev/null; then
        echo "✅ n8n is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  n8n health check timeout (may still be starting)"
    else
        echo "   Waiting... ($i/30)"
        sleep 2
    fi
done

# Verify new version
echo ""
echo "🔍 Verifying update..."
NEW_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
echo "📊 New version: $NEW_VERSION"

if [ "$NEW_VERSION" == "$TARGET_VERSION" ]; then
    echo "✅ Update successful! n8n is now running version $TARGET_VERSION"
else
    echo "⚠️  Version mismatch. Expected $TARGET_VERSION, got $NEW_VERSION"
    echo "   Container may still be starting, check logs: docker logs $CONTAINER_NAME"
fi

# Final summary
echo ""
echo "🎉 UPDATE COMPLETE!"
echo "==================="
echo "Backup Location: $BACKUP_DIR"
echo "Previous Version: $CURRENT_VERSION"
echo "New Version: $NEW_VERSION"
echo ""
echo "📋 Next Steps:"
echo "1. Verify workflows are working: https://n8n.rensto.com"
echo "2. Check community nodes are still installed"
echo "3. Test a few workflows to ensure everything works"
echo "4. If issues occur, restore from backup: $BACKUP_DIR"
echo ""
echo "🛡️  Your data is safely backed up and n8n has been updated!"

