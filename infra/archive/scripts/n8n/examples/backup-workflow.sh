#!/bin/bash

# Backup a workflow to JSON file
# Usage: ./backup-workflow.sh <instance> <workflow-id> [output-dir]

if [ $# -lt 2 ]; then
  echo "Usage: ./backup-workflow.sh <instance> <workflow-id> [output-dir]"
  echo ""
  echo "Instances: rensto, tax4us, shelly"
  echo ""
  echo "Example:"
  echo "  ./backup-workflow.sh tax4us zQIkACTYDgaehp6S"
  echo "  ./backup-workflow.sh rensto abc123 ~/Desktop/backups"
  exit 1
fi

cd "$(dirname "$0")/.."

instance=$1
workflow_id=$2
output_dir=${3:-./backups}

# Create output directory if it doesn't exist
mkdir -p "$output_dir"

# Get workflow data
echo "📥 Fetching workflow from $instance..."
result=$(node multi-instance-api.js get-workflow $instance $workflow_id 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ Failed to get workflow:"
  echo "$result"
  exit 1
fi

# Extract workflow name for filename
workflow_name=$(echo "$result" | jq -r '.name' 2>/dev/null | sed 's/[^a-zA-Z0-9_-]/_/g')
timestamp=$(date +%Y-%m-%d-%H%M%S)

# Generate filename
if [ ! -z "$workflow_name" ] && [ "$workflow_name" != "null" ]; then
  filename="${output_dir}/${instance}-${workflow_name}-${timestamp}.json"
else
  filename="${output_dir}/${instance}-${workflow_id}-${timestamp}.json"
fi

# Save to file
echo "$result" | jq '.' > "$filename" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Workflow backed up to:"
  echo "   $filename"
  echo ""

  # Show workflow info
  nodes=$(echo "$result" | jq '.nodes | length' 2>/dev/null)
  active=$(echo "$result" | jq '.active' 2>/dev/null)
  status="inactive"
  if [ "$active" == "true" ]; then
    status="active"
  fi

  echo "📊 Workflow Info:"
  echo "   Name: $workflow_name"
  echo "   ID: $workflow_id"
  echo "   Nodes: $nodes"
  echo "   Status: $status"
  echo ""
  echo "💾 File size: $(ls -lh "$filename" | awk '{print $5}')"
else
  echo "❌ Failed to save workflow"
  exit 1
fi
