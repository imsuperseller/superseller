#!/bin/bash

# Clean workflow file for n8n import
INPUT_FILE="infra/n8n-workflows/facebook-group-scraper.json"
OUTPUT_FILE="infra/n8n-workflows/facebook-group-scraper-clean.json"

echo "🧹 Cleaning workflow file for n8n import..."

# Extract only the required fields for n8n import
jq '{
  name: .name,
  nodes: .nodes,
  connections: .connections,
  settings: .settings
}' "$INPUT_FILE" > "$OUTPUT_FILE"

echo "✅ Clean workflow file created: $OUTPUT_FILE"
echo "📊 File size: $(wc -c < "$OUTPUT_FILE") bytes"
