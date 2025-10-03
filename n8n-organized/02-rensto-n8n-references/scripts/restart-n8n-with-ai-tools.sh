#!/bin/bash

# Restart n8n with AI tool functionality enabled
# This script sets the N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE environment variable

echo "🚀 Restarting n8n with AI tool functionality enabled..."

# Set the environment variable for current session
export N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true

# Navigate to docker config directory
cd /Users/shaifriedman/New\ Rensto/rensto/configs/docker

# Stop existing n8n container
echo "⏹️  Stopping existing n8n container..."
docker-compose stop n8n

# Remove the container to ensure clean restart
echo "🗑️  Removing n8n container..."
docker-compose rm -f n8n

# Start n8n with new environment variable
echo "▶️  Starting n8n with AI tools enabled..."
docker-compose up -d n8n

# Wait for n8n to be ready
echo "⏳ Waiting for n8n to be ready..."
sleep 10

# Check if n8n is running
if docker-compose ps n8n | grep -q "Up"; then
    echo "✅ n8n is running with AI tool functionality enabled!"
    echo "🌐 Access n8n at: http://173.254.201.134:5678"
    echo "🔧 Environment variable N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true is now active"
else
    echo "❌ Failed to start n8n. Check logs with: docker-compose logs n8n"
fi

echo "📋 To verify AI tools are working:"
echo "   1. Go to n8n interface"
echo "   2. Create a new workflow"
echo "   3. Add SerpAPI, HuggingFace, or other AI tool nodes"
echo "   4. They should now be available and functional"
