#!/bin/bash

# 🔄 N8N ROLLBACK SCRIPT - EMERGENCY RESTORATION
# Restore from backup in case of upgrade issues

set -e  # Exit on any error

# Configuration
CONTAINER_NAME="n8n_rensto"
VOLUME_NAME="n8n_n8n_data"
N8N_SERVER="173.254.201.134"
PORT="5678"
BACKUP_BASE="/root/n8n-backups"

echo "🔄 N8N ROLLBACK SCRIPT - EMERGENCY RESTORATION"
echo "============================================="
echo "Date: $(date)"
echo "Server: $N8N_SERVER"
echo "Container: $CONTAINER_NAME"
echo "Volume: $VOLUME_NAME"
echo ""

# Step 1: Find latest backup
echo "🔍 Finding latest backup..."
echo "=========================="

if [ ! -d "$BACKUP_BASE" ]; then
    echo "❌ Backup directory not found: $BACKUP_BASE"
    echo "Please check if backups exist or run backup script first"
    exit 1
fi

# Find the most recent backup
LATEST_BACKUP=$(ls -t "$BACKUP_BASE" | head -n1)
if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backups found in $BACKUP_BASE"
    exit 1
fi

BACKUP_PATH="$BACKUP_BASE/$LATEST_BACKUP"
BACKUP_FILE="$BACKUP_PATH/n8n-data-backup.tgz"

echo "✅ Latest backup found: $LATEST_BACKUP"
echo "Backup path: $BACKUP_PATH"
echo "Backup file: $BACKUP_FILE"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "✅ Backup file verified: $(du -sh "$BACKUP_FILE" | cut -f1)"
echo ""

# Step 2: Stop current container
echo "🛑 Stopping current container..."
echo "==============================="

if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Stopping container $CONTAINER_NAME..."
    docker stop "$CONTAINER_NAME"
    echo "✅ Container stopped"
else
    echo "⚠️  Container was not running"
fi

echo ""

# Step 3: Remove current container
echo "🗑️  Removing current container..."
echo "================================="

if docker ps -a | grep -q "$CONTAINER_NAME"; then
    echo "Removing container $CONTAINER_NAME..."
    docker rm "$CONTAINER_NAME"
    echo "✅ Container removed"
else
    echo "⚠️  Container not found"
fi

echo ""

# Step 4: Restore data from backup
echo "💾 Restoring data from backup..."
echo "==============================="

echo "Restoring data from: $BACKUP_FILE"
echo "To volume: $VOLUME_NAME"

# Create a temporary container to restore data
if docker run --rm -v "$VOLUME_NAME:/data" -v "$BACKUP_PATH:/backup" alpine \
    sh -c 'cd /data && rm -rf * && tar xzf /backup/n8n-data-backup.tgz'; then
    echo "✅ Data restored successfully"
else
    echo "❌ Data restoration failed!"
    exit 1
fi

echo ""

# Step 5: Start container with previous version
echo "🚀 Starting container with previous version..."
echo "============================================="

# Try to determine the previous version from backup manifest
if [ -f "$BACKUP_PATH/backup-manifest.json" ]; then
    PREVIOUS_VERSION=$(cat "$BACKUP_PATH/backup-manifest.json" | jq -r '.current_version' 2>/dev/null || echo "1.110.1")
    echo "Previous version from manifest: $PREVIOUS_VERSION"
else
    PREVIOUS_VERSION="1.110.1"
    echo "Using default previous version: $PREVIOUS_VERSION"
fi

# Start container with previous version
echo "Starting container with version: $PREVIOUS_VERSION"
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$PORT:5678" \
  -v "$VOLUME_NAME:/home/node/.n8n" \
  -e N8N_COMMUNITY_NODES_ENABLED=true \
  "n8nio/n8n:$PREVIOUS_VERSION"

echo "✅ Container started with previous version"

echo ""

# Step 6: Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
echo "====================================="

# Wait for container to be healthy
for i in {1..30}; do
    if docker ps | grep -q "$CONTAINER_NAME"; then
        echo "✅ Container is running"
        break
    fi
    echo "⏳ Waiting... ($i/30)"
    sleep 2
done

# Wait for n8n to be accessible
echo "⏳ Waiting for n8n to be accessible..."
for i in {1..30}; do
    if curl -s "http://$N8N_SERVER:$PORT/api/v1/workflows" >/dev/null 2>&1; then
        echo "✅ n8n API is accessible"
        break
    fi
    echo "⏳ Waiting for API... ($i/30)"
    sleep 2
done

echo ""

# Step 7: Verify rollback
echo "🔍 Verifying rollback..."
echo "======================"

# Check container status
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ Container is running"
else
    echo "❌ Container is not running!"
    exit 1
fi

# Check version
RESTORED_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
echo "Restored version: $RESTORED_VERSION"

# Check API access
if curl -s "http://$N8N_SERVER:$PORT/api/v1/workflows" >/dev/null 2>&1; then
    echo "✅ API is accessible"
else
    echo "⚠️  API not accessible yet (may need more time)"
fi

# Check workflows count
WORKFLOWS_COUNT=$(curl -s "http://$N8N_SERVER:$PORT/api/v1/workflows" | jq '.data | length' 2>/dev/null || echo "Unknown")
echo "Workflows accessible: $WORKFLOWS_COUNT"

echo ""

# Step 8: Summary
echo "🎉 ROLLBACK COMPLETED!"
echo "===================="
echo "Backup used: $LATEST_BACKUP"
echo "Previous version: $PREVIOUS_VERSION"
echo "Restored version: $RESTORED_VERSION"
echo "Container: $CONTAINER_NAME"
echo "Volume: $VOLUME_NAME"
echo "API: http://$N8N_SERVER:$PORT"
echo ""

if [ "$WORKFLOWS_COUNT" != "Unknown" ] && [ "$WORKFLOWS_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS: $WORKFLOWS_COUNT workflows restored"
else
    echo "⚠️  WARNING: Could not verify workflows count"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Verify rollback: ./n8n-verify-upgrade.sh"
echo "2. Check n8n UI: http://$N8N_SERVER:$PORT"
echo "3. Test critical workflows"
echo "4. If rollback successful, investigate upgrade issues"
echo "5. Consider alternative upgrade approach"
echo ""
echo "🔄 n8n has been successfully rolled back to previous version!"

# Step 9: Additional troubleshooting info
echo ""
echo "🔧 Troubleshooting Information"
echo "============================="
echo "If rollback was successful but issues persist:"
echo "1. Check container logs: docker logs $CONTAINER_NAME"
echo "2. Check volume mount: docker inspect $CONTAINER_NAME"
echo "3. Verify data integrity: docker exec $CONTAINER_NAME ls -la /home/node/.n8n"
echo "4. Check backup integrity: tar -tzf $BACKUP_FILE | head -10"
echo ""
echo "If rollback failed:"
echo "1. Check if backup file is valid: tar -tzf $BACKUP_FILE"
echo "2. Try manual restoration: docker run --rm -v $VOLUME_NAME:/data -v $BACKUP_PATH:/backup alpine sh -c 'cd /data && tar xzf /backup/n8n-data-backup.tgz'"
echo "3. Contact support with backup manifest: $BACKUP_PATH/backup-manifest.json"
