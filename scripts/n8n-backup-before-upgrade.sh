#!/bin/bash

# 🛡️ N8N BACKUP SCRIPT - PRE-UPGRADE SAFETY
# Based on successful backup strategy from previous upgrade (1.109.2 → 1.110.1)

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/root/n8n-backups/$(date +%Y-%m-%d_%H%M)"
CONTAINER_NAME="n8n_rensto"
VOLUME_NAME="n8n_n8n_data"
N8N_SERVER="173.254.201.134"

echo "🛡️  N8N BACKUP SCRIPT - PRE-UPGRADE SAFETY"
echo "=========================================="
echo "Date: $(date)"
echo "Server: $N8N_SERVER"
echo "Container: $CONTAINER_NAME"
echo "Volume: $VOLUME_NAME"
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
else
    echo "⚠️  Container $CONTAINER_NAME is not running"
    CONTAINER_RUNNING=false
fi

# Step 3: Export workflows and credentials (if container is running)
if [ "$CONTAINER_RUNNING" = true ]; then
    echo ""
    echo "📤 Exporting workflows and credentials..."
    
    # Create exports directory inside container
    docker exec "$CONTAINER_NAME" bash -lc 'mkdir -p ~/.n8n/exports' || echo "⚠️  Could not create exports directory"
    
    # Export workflows
    echo "📋 Exporting workflows..."
    if docker exec "$CONTAINER_NAME" n8n export:workflow --all --output=/home/node/.n8n/exports/workflows.all.json; then
        echo "✅ Workflows exported successfully"
    else
        echo "⚠️  Workflow export failed, but continuing..."
    fi
    
    # Export credentials
    echo "🔐 Exporting credentials..."
    if docker exec "$CONTAINER_NAME" n8n export:credentials --all --decrypted --output=/home/node/.n8n/exports/credentials.decrypted.json; then
        echo "✅ Credentials exported successfully"
    else
        echo "⚠️  Credential export failed, but continuing..."
    fi
else
    echo "⚠️  Skipping workflow/credential export (container not running)"
fi

# Step 4: Backup data volume
echo ""
echo "💾 Backing up data volume..."
if docker run --rm -v "$VOLUME_NAME:/data" -v "$BACKUP_DIR:/backup" alpine \
    sh -c 'cd /data && tar czf /backup/n8n-data-backup.tgz .'; then
    echo "✅ Data volume backup completed"
    echo "📦 Backup file: $BACKUP_DIR/n8n-data-backup.tgz"
else
    echo "❌ Data volume backup failed!"
    exit 1
fi

# Step 5: Get current version
echo ""
echo "📊 Getting current version..."
if [ "$CONTAINER_RUNNING" = true ]; then
    CURRENT_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
    echo "Current version: $CURRENT_VERSION"
else
    echo "⚠️  Could not get version (container not running)"
    CURRENT_VERSION="Unknown"
fi

# Step 6: Create backup manifest
echo ""
echo "📝 Creating backup manifest..."
cat > "$BACKUP_DIR/backup-manifest.json" << EOF
{
    "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "server": "$N8N_SERVER",
    "container_name": "$CONTAINER_NAME",
    "volume_name": "$VOLUME_NAME",
    "current_version": "$CURRENT_VERSION",
    "target_version": "1.113.3",
    "backup_files": [
        "n8n-data-backup.tgz"
    ],
    "exports_available": $CONTAINER_RUNNING,
    "backup_size": "$(du -sh "$BACKUP_DIR" | cut -f1)",
    "status": "completed"
}
EOF

echo "✅ Backup manifest created: $BACKUP_DIR/backup-manifest.json"

# Step 7: Verify backup
echo ""
echo "🔍 Verifying backup..."
if [ -f "$BACKUP_DIR/n8n-data-backup.tgz" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR/n8n-data-backup.tgz" | cut -f1)
    echo "✅ Backup file exists: $BACKUP_SIZE"
    
    # Test backup integrity
    if tar -tzf "$BACKUP_DIR/n8n-data-backup.tgz" >/dev/null 2>&1; then
        echo "✅ Backup integrity verified"
    else
        echo "❌ Backup integrity check failed!"
        exit 1
    fi
else
    echo "❌ Backup file not found!"
    exit 1
fi

# Step 8: Summary
echo ""
echo "🎉 BACKUP COMPLETED SUCCESSFULLY!"
echo "================================="
echo "Backup Location: $BACKUP_DIR"
echo "Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo "Current Version: $CURRENT_VERSION"
echo "Target Version: 1.113.3"
echo "Status: ✅ READY FOR UPGRADE"
echo ""
echo "📋 Next Steps:"
echo "1. Run the upgrade script: ./n8n-upgrade-to-1.113.3.sh"
echo "2. Verify the upgrade: ./n8n-verify-upgrade.sh"
echo "3. If issues occur, use rollback: ./n8n-rollback.sh"
echo ""
echo "🛡️  Your data is safely backed up and ready for upgrade!"
