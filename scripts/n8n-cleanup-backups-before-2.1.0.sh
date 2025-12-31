#!/bin/bash
# 🧹 N8N Cleanup Backups Before 2.1.0
# Deletes all backup directories older than 2.1.0
# Keeps only the most recent backup (from 2.1.0) as safety net
#
# This script:
# 1. Finds all backups in /root/n8n-backups
# 2. Identifies backups from before 2.1.0 (by checking manifest or directory name)
# 3. Keeps only the most recent backup (should be from 2.1.0)
# 4. Deletes all older backups

set -e

BACKUP_BASE_DIR="/root/n8n-backups"
CURRENT_VERSION="2.1.0"
KEEP_MOST_RECENT=1  # Keep only the most recent backup

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🧹 N8N CLEANUP BACKUPS BEFORE $CURRENT_VERSION"
echo "=============================================="
echo ""
echo "Backup directory: $BACKUP_BASE_DIR"
echo "Current version: $CURRENT_VERSION"
echo "Keep most recent: $KEEP_MOST_RECENT backup(s)"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_BASE_DIR" ]; then
    log_error "Backup directory not found: $BACKUP_BASE_DIR"
    exit 1
fi

# Function to extract version from backup directory name or manifest
get_backup_version() {
    local backup_dir="$1"
    local version="unknown"
    
    # Try to get version from manifest file
    if [ -f "$backup_dir/backup-manifest.json" ]; then
        version=$(grep -o '"current_version": "[^"]*"' "$backup_dir/backup-manifest.json" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
        if [ "$version" == "unknown" ]; then
            # Try target_version instead
            version=$(grep -o '"target_version": "[^"]*"' "$backup_dir/backup-manifest.json" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
        fi
    fi
    
    # If still unknown, try to extract from directory name
    if [ "$version" == "unknown" ]; then
        if echo "$backup_dir" | grep -q "upgrade-to-"; then
            version=$(echo "$backup_dir" | grep -o "upgrade-to-[0-9.]*" | cut -d'-' -f3 || echo "unknown")
        fi
    fi
    
    echo "$version"
}

# Function to compare version numbers (returns 1 if v1 < v2, 0 if v1 >= v2)
version_less_than() {
    local v1="$1"
    local v2="$2"
    
    # Remove any non-numeric/dot characters
    v1=$(echo "$v1" | sed 's/[^0-9.]//g')
    v2=$(echo "$v2" | sed 's/[^0-9.]//g')
    
    # Compare using sort -V (version sort)
    if [ "$(printf '%s\n' "$v1" "$v2" | sort -V | head -n1)" != "$v1" ]; then
        return 1  # v1 >= v2
    else
        return 0  # v1 < v2
    fi
}

# Get all backup directories, sorted by modification time (newest first)
log_info "Scanning backup directories..."
BACKUP_DIRS=($(find "$BACKUP_BASE_DIR" -maxdepth 1 -type d ! -path "$BACKUP_BASE_DIR" | sort -t- -k1,1 -k2,2 -k3,3 -r | head -20))

if [ ${#BACKUP_DIRS[@]} -eq 0 ]; then
    log_warning "No backup directories found"
    exit 0
fi

log_info "Found ${#BACKUP_DIRS[@]} backup directory(ies)"
echo ""

# Analyze backups
BACKUPS_TO_DELETE=()
BACKUPS_TO_KEEP=()

for backup_dir in "${BACKUP_DIRS[@]}"; do
    backup_name=$(basename "$backup_dir")
    version=$(get_backup_version "$backup_dir")
    size=$(du -sh "$backup_dir" 2>/dev/null | cut -f1)
    date=$(stat -c %y "$backup_dir" 2>/dev/null | cut -d' ' -f1 || echo "Unknown")
    
    log_info "Backup: $backup_name"
    echo "   Version: $version"
    echo "   Size: $size"
    echo "   Date: $date"
    
    # Check if version is before 2.1.0
    if version_less_than "$version" "$CURRENT_VERSION"; then
        BACKUPS_TO_DELETE+=("$backup_dir")
        echo "   Status: ⚠️  Will DELETE (version < $CURRENT_VERSION)"
    else
        BACKUPS_TO_KEEP+=("$backup_dir")
        echo "   Status: ✅ Will KEEP (version >= $CURRENT_VERSION)"
    fi
    echo ""
done

# Keep only the most recent backup(s)
if [ ${#BACKUPS_TO_KEEP[@]} -gt $KEEP_MOST_RECENT ]; then
    log_warning "Found ${#BACKUPS_TO_KEEP[@]} backups >= $CURRENT_VERSION, but only keeping $KEEP_MOST_RECENT most recent"
    
    # Sort by modification time and keep only the most recent
    KEEP_SORTED=($(printf '%s\n' "${BACKUPS_TO_KEEP[@]}" | xargs -I{} sh -c 'echo "$(stat -c %Y {}) {}"' | sort -rn | head -n $KEEP_MOST_RECENT | cut -d' ' -f2-))
    
    # Move extra ones to delete list
    for keep_backup in "${BACKUPS_TO_KEEP[@]}"; do
        should_keep=false
        for keep_sorted in "${KEEP_SORTED[@]}"; do
            if [ "$keep_backup" == "$keep_sorted" ]; then
                should_keep=true
                break
            fi
        done
        if [ "$should_keep" == false ]; then
            BACKUPS_TO_DELETE+=("$keep_backup")
        fi
    done
    
    BACKUPS_TO_KEEP=("${KEEP_SORTED[@]}")
fi

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "📊 CLEANUP SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Backups to KEEP: ${#BACKUPS_TO_KEEP[@]}"
for keep_backup in "${BACKUPS_TO_KEEP[@]}"; do
    backup_name=$(basename "$keep_backup")
    version=$(get_backup_version "$keep_backup")
    size=$(du -sh "$keep_backup" 2>/dev/null | cut -f1)
    echo "  ✅ $backup_name (v$version, $size)"
done
echo ""
echo "Backups to DELETE: ${#BACKUPS_TO_DELETE[@]}"
TOTAL_FREED=0
for delete_backup in "${BACKUPS_TO_DELETE[@]}"; do
    backup_name=$(basename "$delete_backup")
    version=$(get_backup_version "$delete_backup")
    size=$(du -sh "$delete_backup" 2>/dev/null | cut -f1)
    size_bytes=$(du -sb "$delete_backup" 2>/dev/null | cut -f1)
    size_mb=$((size_bytes / 1024 / 1024))
    TOTAL_FREED=$((TOTAL_FREED + size_mb))
    echo "  🗑️  $backup_name (v$version, $size)"
done
echo ""

if [ ${#BACKUPS_TO_DELETE[@]} -eq 0 ]; then
    log_success "No backups to delete. All backups are >= $CURRENT_VERSION or already cleaned up."
    exit 0
fi

echo "Total space to free: ~${TOTAL_FREED} MB"
echo ""

# Ask for confirmation
read -p "⚠️  Delete ${#BACKUPS_TO_DELETE[@]} backup(s)? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_warning "Cleanup cancelled"
    exit 0
fi

# Delete backups
log_info "Deleting backups..."
DELETED_COUNT=0
FAILED_COUNT=0

for delete_backup in "${BACKUPS_TO_DELETE[@]}"; do
    backup_name=$(basename "$delete_backup")
    size=$(du -sh "$delete_backup" 2>/dev/null | cut -f1)
    
    echo "🗑️  Deleting: $backup_name ($size)..."
    if rm -rf "$delete_backup"; then
        echo "   ✅ Deleted successfully"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    else
        echo "   ❌ Failed to delete"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
if [ $FAILED_COUNT -eq 0 ]; then
    log_success "🎉 CLEANUP COMPLETE!"
    echo ""
    echo "Backups deleted: $DELETED_COUNT"
    echo "Space freed: ~${TOTAL_FREED} MB"
    echo "Backups remaining: ${#BACKUPS_TO_KEEP[@]}"
else
    log_warning "Cleanup completed with errors"
    echo ""
    echo "Backups deleted: $DELETED_COUNT"
    echo "Backups failed: $FAILED_COUNT"
    echo "Space freed: ~${TOTAL_FREED} MB"
fi
echo "═══════════════════════════════════════════════════════════"

