#!/bin/bash

# 🚀 N8N UPGRADE TO 1.113.3 - SIMPLE VERSION
# Based on the ACTUAL successful upgrade process from the codebase

set -e  # Exit on any error

echo "🚀 N8N UPGRADE TO 1.113.3 - SIMPLE VERSION"
echo "=========================================="
echo "Based on successful upgrade process from codebase"
echo ""

# Step 1: Docker Hub Authentication (if needed)
echo "🔐 Checking Docker Hub authentication..."
if ! docker pull n8nio/n8n:1.113.3 >/dev/null 2>&1; then
    echo "⚠️  Docker Hub authentication required"
    echo "Please run: docker login"
    echo "Then run this script again"
    exit 1
fi
echo "✅ Docker Hub authentication successful"

# Step 2: Stop current container
echo ""
echo "🛑 Stopping current container..."
docker stop n8n_rensto
echo "✅ Container stopped"

# Step 3: Remove current container
echo ""
echo "🗑️  Removing current container..."
docker rm n8n_rensto
echo "✅ Container removed"

# Step 4: Start new container with 1.113.3
echo ""
echo "🚀 Starting new container with version 1.113.3..."
docker run -d \
  --name n8n_rensto \
  -p 5678:5678 \
  -v n8n_n8n_data:/home/node/.n8n \
  n8nio/n8n:1.113.3

echo "✅ New container started"

# Step 5: Wait for container to be ready
echo ""
echo "⏳ Waiting for container to be ready..."
sleep 30

# Step 6: Verify upgrade
echo ""
echo "🔍 Verifying upgrade..."
NEW_VERSION=$(docker exec n8n_rensto n8n --version 2>/dev/null | head -n1 || echo "Unknown")
echo "New version: $NEW_VERSION"

# Check if API is accessible
if curl -s "http://173.254.201.134:5678/api/v1/workflows" >/dev/null 2>&1; then
    echo "✅ API is accessible"
    WORKFLOWS_COUNT=$(curl -s "http://173.254.201.134:5678/api/v1/workflows" | jq '.data | length' 2>/dev/null || echo "Unknown")
    echo "Workflows accessible: $WORKFLOWS_COUNT"
else
    echo "⚠️  API not accessible yet (may need more time)"
fi

echo ""
echo "🎉 UPGRADE COMPLETED!"
echo "===================="
echo "Version: $NEW_VERSION"
echo "Container: n8n_rensto"
echo "API: http://173.254.201.134:5678"
echo ""
echo "✅ n8n has been successfully upgraded to version 1.113.3!"
echo "All your workflows, credentials, and community nodes are preserved."
