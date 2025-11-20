#!/bin/sh
# n8n Backup Cleanup Script
# Keeps only the most recent N backups (default: 2)
# Deletes older backups to free up disk space

set -e

BACKUP_DIR="/root/n8n-backups"
KEEP_BACKUPS=${1:-2}  # Default: keep 2 most recent backups

echo "🧹 n8n Backup Cleanup"
echo "===================="
echo "Backup directory: $BACKUP_DIR"
echo "Keep backups: $KEEP_BACKUPS"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Get total backups
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l)
echo "📊 Total backups found: $TOTAL_BACKUPS"

if [ "$TOTAL_BACKUPS" -le "$KEEP_BACKUPS" ]; then
    echo "✅ No cleanup needed (only $TOTAL_BACKUPS backups, keeping $KEEP_BACKUPS)"
    exit 0
fi

# Calculate how many to delete
DELETE_COUNT=$((TOTAL_BACKUPS - KEEP_BACKUPS))
echo "🗑️  Will delete $DELETE_COUNT oldest backup(s)"
echo ""

# Get backups sorted by date (oldest first)
OLDEST_BACKUPS=$(ls -1t "$BACKUP_DIR" | tail -n "$DELETE_COUNT")

# Show what will be deleted
echo "Backups to be deleted:"
for backup in $OLDEST_BACKUPS; do
    SIZE=$(du -sh "$BACKUP_DIR/$backup" 2>/dev/null | cut -f1)
    DATE=$(stat -c %y "$BACKUP_DIR/$backup" 2>/dev/null | cut -d' ' -f1 || echo "Unknown")
    echo "  - $backup ($SIZE, created: $DATE)"
done

echo ""
read -p "⚠️  Delete these backups? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

# Delete old backups
TOTAL_FREED=0
for backup in $OLDEST_BACKUPS; do
    BACKUP_PATH="$BACKUP_DIR/$backup"
    SIZE_BYTES=$(du -sb "$BACKUP_PATH" 2>/dev/null | cut -f1)
    SIZE_MB=$((SIZE_BYTES / 1024 / 1024))
    
    echo "🗑️  Deleting: $backup ($SIZE_MB MB)..."
    rm -rf "$BACKUP_PATH"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Deleted successfully"
        TOTAL_FREED=$((TOTAL_FREED + SIZE_MB))
    else
        echo "   ❌ Failed to delete"
    fi
done

echo ""
echo "🎉 Cleanup Complete!"
echo "==================="
echo "Backups deleted: $DELETE_COUNT"
echo "Space freed: ~${TOTAL_FREED} MB"
echo "Backups remaining: $KEEP_BACKUPS"

# Show remaining backups
echo ""
echo "Remaining backups:"
ls -1ht "$BACKUP_DIR" | head -n "$KEEP_BACKUPS" | while read backup; do
    SIZE=$(du -sh "$BACKUP_DIR/$backup" 2>/dev/null | cut -f1)
    DATE=$(stat -c %y "$BACKUP_DIR/$backup" 2>/dev/null | cut -d' ' -f1 || echo "Unknown")
    echo "  ✅ $backup ($SIZE, created: $DATE)"
done

