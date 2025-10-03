#!/bin/bash

# 🚀 N8N UPGRADE SCRIPT - VERSION 1.113.3
# Based on successful upgrade process from 1.109.2 → 1.110.1

set -e  # Exit on any error

# Configuration
CONTAINER_NAME="n8n_rensto"
VOLUME_NAME="n8n_n8n_data"
TARGET_VERSION="1.113.3"
N8N_SERVER="173.254.201.134"
PORT="5678"

echo "🚀 N8N UPGRADE SCRIPT - VERSION 1.113.3"
echo "======================================"
echo "Date: $(date)"
echo "Server: $N8N_SERVER"
echo "Container: $CONTAINER_NAME"
echo "Volume: $VOLUME_NAME"
echo "Target Version: $TARGET_VERSION"
echo ""

# Step 1: Pre-flight checks
echo "🔍 Pre-flight checks..."
echo "======================"

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo "❌ Docker is not running!"
    exit 1
fi
echo "✅ Docker is running"

# Check if container exists
if docker ps -a | grep -q "$CONTAINER_NAME"; then
    echo "✅ Container $CONTAINER_NAME exists"
else
    echo "❌ Container $CONTAINER_NAME not found!"
    exit 1
fi

# Check if volume exists
if docker volume ls | grep -q "$VOLUME_NAME"; then
    echo "✅ Volume $VOLUME_NAME exists"
else
    echo "❌ Volume $VOLUME_NAME not found!"
    exit 1
fi

# Get current version
if docker ps | grep -q "$CONTAINER_NAME"; then
    CURRENT_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
    echo "Current version: $CURRENT_VERSION"
else
    echo "⚠️  Container is not running, cannot get current version"
    CURRENT_VERSION="Unknown"
fi

echo ""

# Step 2: Docker Hub authentication
echo "🔐 Docker Hub authentication..."
echo "==============================="
echo "Attempting to pull latest n8n image..."

# Try to pull the latest image
if docker pull "n8nio/n8n:$TARGET_VERSION"; then
    echo "✅ Successfully pulled n8nio/n8n:$TARGET_VERSION"
else
    echo "⚠️  Failed to pull specific version, trying latest..."
    if docker pull n8nio/n8n:latest; then
        echo "✅ Successfully pulled n8nio/n8n:latest"
        TARGET_VERSION="latest"
    else
        echo "❌ Failed to pull n8n image. Please check Docker Hub authentication."
        echo "Run: docker login"
        exit 1
    fi
fi

echo ""

# Step 3: Stop current container
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

# Step 4: Remove current container
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

# Step 5: Start new container with upgraded version
echo "🚀 Starting new container with version $TARGET_VERSION..."
echo "========================================================"
echo "Creating new container with:"
echo "  - Name: $CONTAINER_NAME"
echo "  - Port: $PORT"
echo "  - Volume: $VOLUME_NAME"
echo "  - Image: n8nio/n8n:$TARGET_VERSION"
echo "  - Community nodes: enabled"
echo ""

# Create new container with all the same settings
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$PORT:5678" \
  -v "$VOLUME_NAME:/home/node/.n8n" \
  -e N8N_COMMUNITY_NODES_ENABLED=true \
  "n8nio/n8n:$TARGET_VERSION"

echo "✅ New container created and started"

# Step 6: Wait for container to be ready
echo ""
echo "⏳ Waiting for container to be ready..."
echo "====================================="
echo "Waiting for n8n to start up (this may take 30-60 seconds)..."

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

# Step 7: Verify upgrade
echo "🔍 Verifying upgrade..."
echo "======================"

# Check container status
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ Container is running"
else
    echo "❌ Container is not running!"
    exit 1
fi

# Check version
NEW_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
echo "New version: $NEW_VERSION"

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
echo "🎉 UPGRADE COMPLETED!"
echo "===================="
echo "Previous version: $CURRENT_VERSION"
echo "New version: $NEW_VERSION"
echo "Container: $CONTAINER_NAME"
echo "Volume: $VOLUME_NAME"
echo "API: http://$N8N_SERVER:$PORT"
echo ""

if [ "$WORKFLOWS_COUNT" != "Unknown" ] && [ "$WORKFLOWS_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS: $WORKFLOWS_COUNT workflows preserved"
else
    echo "⚠️  WARNING: Could not verify workflows count"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Run verification script: ./n8n-verify-upgrade.sh"
echo "2. Check n8n UI: http://$N8N_SERVER:$PORT"
echo "3. Test critical workflows"
echo "4. If issues occur, use rollback: ./n8n-rollback.sh"
echo ""
echo "🚀 n8n has been successfully upgraded to version $TARGET_VERSION!"
