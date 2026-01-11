#!/bin/bash

# Import Facebook Group Scraper Workflow to n8n
# This script imports the Facebook scraper workflow to the live n8n instance

set -e

echo "🚀 Importing Facebook Group Scraper Workflow to n8n..."

# Server details
SERVER_IP="172.245.56.50"
SERVER_USER="root"
SERVER_PASS="05ngBiq2pTA8XSF76x"
N8N_PORT="5678"

# Use the existing n8n API key
echo "📋 Using existing n8n API key..."
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE"

# Read the workflow file
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKFLOW_FILE="$SCRIPT_DIR/n8n-workflows/facebook-group-scraper-clean.json"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "📄 Reading workflow file: $WORKFLOW_FILE"

# Import workflow to n8n
echo "📤 Importing workflow to n8n..."

# Copy workflow file to server and import
echo "📤 Copying workflow file to server..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no "$WORKFLOW_FILE" $SERVER_USER@$SERVER_IP:/tmp/facebook-scraper.json

# Import workflow to n8n with API key
IMPORT_RESPONSE=$(sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "curl -s -X POST http://localhost:$N8N_PORT/api/v1/workflows -H 'Content-Type: application/json' -H 'X-N8N-API-KEY: $API_KEY' -d @/tmp/facebook-scraper.json")

# Check if import was successful
if [[ "$IMPORT_RESPONSE" == *"id"* ]] && [[ "$IMPORT_RESPONSE" != *"error"* ]]; then
    echo "✅ Workflow imported successfully!"
    echo "📊 Response: $IMPORT_RESPONSE"

    # Extract workflow ID from the response
    WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | grep -o '"id":"[^"]*"' | tail -1 | cut -d'"' -f4)

    if [ -n "$WORKFLOW_ID" ]; then
        echo "🆔 Workflow ID: $WORKFLOW_ID"

        # Activate the workflow
        echo "🔄 Activating workflow..."
        ACTIVATE_RESPONSE=$(sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "curl -s -X POST http://localhost:$N8N_PORT/api/v1/workflows/$WORKFLOW_ID/activate -H 'X-N8N-API-KEY: $API_KEY'")

        if [[ "$ACTIVATE_RESPONSE" == *"active\":true"* ]]; then
            echo "✅ Workflow activated successfully!"
        else
            echo "⚠️  Workflow imported but activation failed: $ACTIVATE_RESPONSE"
        fi
    fi

else
    echo "❌ Failed to import workflow: $IMPORT_RESPONSE"
    exit 1
fi

echo "🎉 Facebook Group Scraper Workflow deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Deploy the web application"
echo "   2. Configure Ortal's portal credentials"
echo "   3. Test the Facebook scraper"
echo ""
echo "🔗 Access Ortal's portal at: http://$SERVER_IP:3000/ortal"
