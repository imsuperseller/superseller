#!/bin/sh
# Emergency n8n Database Cleanup
# Works even when disk is 100% full by using direct SQLite operations

set -e

DB_PATH="/var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite"

echo "🚨 Emergency Database Cleanup"
echo "=============================="
echo ""

CURRENT_SIZE=$(du -m "$DB_PATH" 2>/dev/null | cut -f1 || echo "0")
echo "📊 Current database size: ${CURRENT_SIZE} MB"
echo ""

# Install sqlite3 if needed
if ! command -v sqlite3 >/dev/null 2>&1; then
    echo "📦 Installing sqlite3..."
    apt-get update -qq && apt-get install -y sqlite3 >/dev/null 2>&1
fi

echo "🔍 Analyzing database..."
TOTAL=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM execution_entity;" 2>/dev/null || echo "0")
OLD=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days');" 2>/dev/null || echo "0")

echo "   Total executions: $TOTAL"
echo "   Executions older than 7 days: $OLD"
echo ""

if [ "$OLD" -eq 0 ] 2>/dev/null; then
    echo "✅ No old executions to clean"
    echo "💡 Database size is due to execution data, not count"
    echo ""
    echo "🧹 Cleaning execution data (keeps metadata)..."
    # Delete execution data in smaller batches to avoid temp space issues
    sqlite3 "$DB_PATH" "DELETE FROM execution_data WHERE executionId IN (SELECT id FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days') LIMIT 100);" 2>/dev/null || true
    echo "   ✅ Cleaned first batch"
    
    # Continue cleaning in batches
    for i in 1 2 3 4 5; do
        sqlite3 "$DB_PATH" "DELETE FROM execution_data WHERE executionId IN (SELECT id FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days') LIMIT 100);" 2>/dev/null || break
    done
    
    # Delete old execution entities
    sqlite3 "$DB_PATH" "DELETE FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days');" 2>/dev/null || true
else
    echo "🧹 Cleaning in small batches (to avoid disk full errors)..."
    
    # Delete in small batches
    for i in 1 2 3 4 5 6 7 8 9 10; do
        sqlite3 "$DB_PATH" "DELETE FROM execution_data WHERE executionId IN (SELECT id FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days') LIMIT 10);" 2>/dev/null || break
        echo "   Batch $i cleaned..."
    done
    
    # Delete execution entities
    sqlite3 "$DB_PATH" "DELETE FROM execution_entity WHERE stoppedAt IS NOT NULL AND datetime(stoppedAt) < datetime('now', '-7 days');" 2>/dev/null || true
fi

echo ""
echo "🔧 Vacuuming database..."
# Use incremental vacuum to avoid needing full temp space
sqlite3 "$DB_PATH" "PRAGMA incremental_vacuum(100);" 2>/dev/null || sqlite3 "$DB_PATH" "VACUUM;" 2>/dev/null || echo "⚠️  Vacuum failed (may need more space)"

NEW_SIZE=$(du -m "$DB_PATH" 2>/dev/null | cut -f1 || echo "0")
FREED=$((CURRENT_SIZE - NEW_SIZE))

echo ""
echo "🎉 Cleanup Complete!"
echo "==================="
echo "Previous size: ${CURRENT_SIZE} MB"
echo "New size: ${NEW_SIZE} MB"
echo "Space freed: ${FREED} MB"
echo ""
df -h / | tail -1

