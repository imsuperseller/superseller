#!/bin/bash
# Fix MCP to use version 2.26.5 with patch

MCP_JSON="$HOME/.cursor/mcp.json"
BACKUP="$MCP_JSON.backup-$(date +%Y%m%d-%H%M%S)"

echo "Backing up mcp.json to $BACKUP"
cp "$MCP_JSON" "$BACKUP"

echo "Updating to version 2.26.5..."
sed -i '' 's|ghcr.io/czlonkowski/n8n-mcp:latest|ghcr.io/czlonkowski/n8n-mcp:2.26.5|g' "$MCP_JSON"

echo "✅ Updated mcp.json to use version 2.26.5"
echo ""
echo "⚠️  Note: Version 2.26.5 still needs a patch for 3 missing fields:"
echo "   - webhookId"
echo "   - activeVersion"
echo "   - activeVersionId"
echo ""
echo "After restarting Cursor, the container will need to be patched."
echo "Or wait for n8n-mcp maintainers to release a version with the complete fix."

