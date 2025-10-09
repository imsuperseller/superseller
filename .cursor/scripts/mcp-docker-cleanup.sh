#!/bin/bash

# MCP Docker Container Cleanup Script
# Purpose: Clean up orphaned Docker containers from MCP servers
# Usage: Run this before starting Cursor to prevent container accumulation

echo "🧹 MCP Docker Container Cleanup"
echo "================================"

# Function to safely stop and remove containers
cleanup_containers() {
    local image=$1
    local name=$2

    echo ""
    echo "Checking for $name containers..."

    # Get list of running containers for this image
    CONTAINERS=$(docker ps -q --filter "ancestor=$image" 2>/dev/null)

    if [ -n "$CONTAINERS" ]; then
        echo "  Found $(echo "$CONTAINERS" | wc -l | tr -d ' ') running container(s)"
        echo "  Stopping containers..."
        docker stop $CONTAINERS 2>/dev/null
        echo "  ✅ Containers stopped (auto-removed with --rm flag)"
    else
        echo "  ✅ No running containers found"
    fi
}

# Clean up n8n-mcp containers
cleanup_containers "ghcr.io/czlonkowski/n8n-mcp:latest" "n8n-mcp"

# Clean up stripe-mcp containers
cleanup_containers "mcp/stripe" "stripe-mcp"

# Clean up any exited containers (safety check)
echo ""
echo "Checking for exited containers..."
EXITED=$(docker ps -aq --filter "status=exited" 2>/dev/null)
if [ -n "$EXITED" ]; then
    echo "  Found $(echo "$EXITED" | wc -l | tr -d ' ') exited container(s)"
    echo "  Removing exited containers..."
    docker rm $EXITED 2>/dev/null
    echo "  ✅ Exited containers removed"
else
    echo "  ✅ No exited containers found"
fi

echo ""
echo "================================"
echo "✅ Cleanup complete!"
echo ""
echo "Current Docker status:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
