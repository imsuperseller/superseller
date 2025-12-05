#!/bin/bash

# Export workflow from n8n and save as template
# Usage: ./export-and-save-template.sh <workflow-id>

WORKFLOW_ID="${1:-eQSCUFw91oXLxtvn}"
TEMPLATE_FILE="templates/base-whatsapp-agent-workflow.json"

echo "📥 Exporting workflow $WORKFLOW_ID from n8n..."
echo "💾 Saving to: $TEMPLATE_FILE"
echo ""
echo "⚠️  Note: This requires n8n MCP access. Run this via Node.js script instead:"
echo "   node save-workflow-template.js <workflow-json-file>"
echo ""
echo "Or manually:"
echo "1. Export workflow from n8n UI (Settings → Export)"
echo "2. Save JSON to: $TEMPLATE_FILE"

