#!/bin/sh
# n8n Database Cleanup via SQL
# Safely removes old execution data to reduce database size

set -e

echo "🗄️  n8n Database Cleanup (SQL Method)"
echo "======================================"
echo ""

DB_PATH="/var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite"
CONTAINER="n8n_rensto"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database file not found: $DB_PATH"
    exit 1
fi

# Get current size
CURRENT_SIZE=$(du -m "$DB_PATH" 2>/dev/null | cut -f1 || echo "0")
echo "📊 Current database size: ${CURRENT_SIZE} MB"
echo ""

# Backup first (to /tmp if volume is full)
BACKUP_DIR="/tmp"
BACKUP_PATH="${BACKUP_DIR}/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)"
echo "💾 Creating backup to $BACKUP_DIR..."
if cp "$DB_PATH" "$BACKUP_PATH" 2>/dev/null; then
    echo "✅ Backup created: $(basename $BACKUP_PATH)"
    BACKUP_CREATED=true
else
    echo "⚠️  Backup to $BACKUP_DIR failed (disk full)"
    echo "💡 Attempting backup to /root..."
    BACKUP_PATH="/root/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)"
    if cp "$DB_PATH" "$BACKUP_PATH" 2>/dev/null; then
        echo "✅ Backup created: $(basename $BACKUP_PATH)"
        BACKUP_CREATED=true
    else
        echo "⚠️  Backup failed - disk is full (100%)"
        echo "💡 We'll clean the database first to free space, then backup the cleaned version"
        echo "⚠️  Proceeding without pre-cleanup backup (necessary due to disk full)"
        BACKUP_CREATED=false
    fi
fi
echo ""

# Check if sqlite3 is available in container
if docker exec "$CONTAINER" which sqlite3 >/dev/null 2>&1; then
    SQLITE_CMD="docker exec $CONTAINER sqlite3 /home/node/.n8n/database.sqlite"
else
    # Use host sqlite3 if available
    if command -v sqlite3 >/dev/null 2>&1; then
        SQLITE_CMD="sqlite3 $DB_PATH"
    else
        echo "❌ sqlite3 not found. Installing..."
        apt-get update && apt-get install -y sqlite3
        SQLITE_CMD="sqlite3 $DB_PATH"
    fi
fi

echo "🔍 Analyzing database..."
echo ""

# Get execution counts
TOTAL_EXECUTIONS=$($SQLITE_CMD "SELECT COUNT(*) FROM execution_entity;" 2>/dev/null || echo "0")
OLD_EXECUTIONS=$($SQLITE_CMD "SELECT COUNT(*) FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days');" 2>/dev/null || echo "0")

echo "📊 Execution Statistics:"
echo "   Total executions: $TOTAL_EXECUTIONS"
echo "   Executions older than 7 days: $OLD_EXECUTIONS"
echo ""

if [ "$OLD_EXECUTIONS" -eq 0 ] 2>/dev/null; then
    echo "✅ No executions older than 7 days to clean"
    echo "💡 Database size is likely due to execution data, not count"
    echo ""
    echo "💡 Alternative: Clean execution data (keeps metadata, removes full data)"
    echo "   This can significantly reduce size while keeping execution history"
    echo ""
    read -p "Clean execution data (keeps last 7 days)? (yes/no): " clean_data
    
    if [ "$clean_data" = "yes" ]; then
        echo ""
        echo "🧹 Cleaning execution data older than 7 days..."
        $SQLITE_CMD "DELETE FROM execution_data WHERE executionId IN (SELECT id FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days'));" 2>&1
        DELETED=$($SQLITE_CMD "SELECT changes();" 2>/dev/null || echo "0")
        echo "✅ Deleted $DELETED execution data records"
        
        echo ""
        echo "🧹 Cleaning execution entities older than 7 days..."
        $SQLITE_CMD "DELETE FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days');" 2>&1
        DELETED=$($SQLITE_CMD "SELECT changes();" 2>/dev/null || echo "0")
        echo "✅ Deleted $DELETED execution entities"
        
        echo ""
        echo "🔧 Vacuuming database to reclaim space..."
        $SQLITE_CMD "VACUUM;" 2>&1
        echo "✅ Database vacuumed"
    else
        echo "❌ Cleanup cancelled"
        exit 0
    fi
else
    echo "🧹 Cleaning executions older than 7 days..."
    echo ""
    
    # Delete execution data first (foreign key constraint)
    echo "   Step 1: Deleting execution data..."
    $SQLITE_CMD "DELETE FROM execution_data WHERE executionId IN (SELECT id FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days'));" 2>&1
    DATA_DELETED=$($SQLITE_CMD "SELECT changes();" 2>/dev/null || echo "0")
    echo "   ✅ Deleted $DATA_DELETED execution data records"
    
    # Delete execution entities
    echo "   Step 2: Deleting execution entities..."
    $SQLITE_CMD "DELETE FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days');" 2>&1
    ENTITY_DELETED=$($SQLITE_CMD "SELECT changes();" 2>/dev/null || echo "0")
    echo "   ✅ Deleted $ENTITY_DELETED execution entities"
    
    # Vacuum database
    echo ""
    echo "🔧 Vacuuming database to reclaim space..."
    $SQLITE_CMD "VACUUM;" 2>&1
    echo "✅ Database vacuumed"
fi

# Check new size
NEW_SIZE=$(du -m "$DB_PATH" 2>/dev/null | cut -f1 || echo "0")
FREED=$((CURRENT_SIZE - NEW_SIZE))

echo ""
echo "🎉 Cleanup Complete!"
echo "==================="
echo "Previous size: ${CURRENT_SIZE} MB"
echo "New size: ${NEW_SIZE} MB"
echo "Space freed: ${FREED} MB"
echo ""
echo "💾 Backup saved: $(basename $BACKUP_PATH)"
echo "💡 You can restore from backup if needed: cp $BACKUP_PATH $DB_PATH"

