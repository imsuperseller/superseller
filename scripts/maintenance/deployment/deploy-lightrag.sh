#!/bin/bash

# LightRAG Deployment Script
echo "🚀 Deploying LightRAG Integration..."

# Load environment variables
source .env

# Deploy LightRAG server to Render
echo "📦 Deploying LightRAG server..."
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "superseller-lightrag",
    "type": "web_service",
    "env": "docker",
    "image": "ghcr.io/hkuds/lightrag:latest",
    "envVars": [
      {"key": "LIGHTRAG_API_KEY", "value": "$LIGHTRAG_API_KEY"},
      {"key": "GITHUB_TOKEN", "value": "$GITHUB_TOKEN"},
      {"key": "OPENAI_API_KEY", "value": "$OPENAI_API_KEY"}
    ]
  }'

# Configure GitHub webhook
echo "🔗 Configuring GitHub webhook..."
curl -X POST https://api.github.com/repos/superseller/business-intelligence/hooks \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "name": "web",
    "active": true,
    "events": ["push", "pull_request", "issues"],
    "config": {
      "url": "$LIGHTRAG_WEBHOOK_URL",
      "content_type": "json",
      "secret": "$GITHUB_WEBHOOK_SECRET"
    }
  }'

echo "✅ LightRAG deployment complete!"
