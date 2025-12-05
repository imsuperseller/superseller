#!/bin/bash
# 🧹 N8N Cleanup Old Backup Files
# Removes backup scripts and documentation from before n8n 1.122.0
# 
# This script identifies and optionally deletes old backup files that are
# no longer needed after updating to n8n 1.122.0+

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE_DIR="$SCRIPT_DIR/archive/pre-1.122.0"

echo "🧹 N8N CLEANUP OLD BACKUP FILES"
echo "================================"
echo ""

# Files to clean up (from before 1.122.0)
OLD_FILES=(
    "n8n-backup-and-update-1.118.2.sh"
    "n8n-backup-and-update-1.119.1.sh"
    "n8n-backup-and-update-1.119.1-EXECUTE.md"
    "n8n-backup-and-update-1.119.1-INSTRUCTIONS.md"
)

echo "📋 Files to clean up (from before 1.122.0):"
for file in "${OLD_FILES[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        echo "  - $file"
    else
        echo "  - $file (not found)"
    fi
done
echo ""

# Ask for confirmation
read -p "Archive these files instead of deleting? (yes/no): " archive_choice
read -p "Proceed with cleanup? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled."
    exit 0
fi

# Create archive directory if archiving
if [ "$archive_choice" == "yes" ]; then
    mkdir -p "$ARCHIVE_DIR"
    echo "📦 Archiving files to: $ARCHIVE_DIR"
fi

# Process each file
for file in "${OLD_FILES[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        if [ "$archive_choice" == "yes" ]; then
            mv "$SCRIPT_DIR/$file" "$ARCHIVE_DIR/"
            echo "✅ Archived: $file"
        else
            rm "$SCRIPT_DIR/$file"
            echo "✅ Deleted: $file"
        fi
    fi
done

echo ""
echo "🎉 Cleanup complete!"
if [ "$archive_choice" == "yes" ]; then
    echo "📦 Files archived to: $ARCHIVE_DIR"
else
    echo "🗑️  Files deleted."
fi
