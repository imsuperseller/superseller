#!/bin/bash

# List workflows from all 3 n8n instances
# Usage: ./list-all-workflows.sh

cd "$(dirname "$0")/.."

echo "====================================================================="
echo "n8n Workflows - All Instances"
echo "====================================================================="
echo ""

for instance in superseller tax4us shelly; do
  echo "=== ${instance^^} ==="

  result=$(node multi-instance-api.js list-workflows $instance 2>/dev/null)

  if [ $? -eq 0 ]; then
    count=$(echo "$result" | jq '.data | length' 2>/dev/null)

    if [ ! -z "$count" ]; then
      echo "✅ $count workflows found"
      echo ""

      # Show workflow names and status
      echo "$result" | jq -r '.data[] | "  \(if .active then "🟢" else "⚪" end) \(.name)"' 2>/dev/null | head -10

      if [ $count -gt 10 ]; then
        echo "  ... and $(($count - 10)) more"
      fi

      echo ""
    else
      echo "⚠️  Could not parse response"
      echo ""
    fi
  else
    echo "❌ Failed to connect"
    echo ""
  fi
done

echo "====================================================================="
echo "Legend: 🟢 Active | ⚪ Inactive"
echo "====================================================================="
