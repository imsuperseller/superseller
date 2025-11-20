#!/bin/sh
# n8n Database Cleanup Script
# Cleans execution history to reduce database size

set -e

echo "🗄️  n8n Database Cleanup"
echo "========================"
echo ""

# Check current database size
DB_PATH="/var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite"
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database file not found: $DB_PATH"
    exit 1
fi

CURRENT_SIZE=$(du -m "$DB_PATH" 2>/dev/null | cut -f1 || echo "0")
echo "📊 Current database size: ${CURRENT_SIZE} MB"
echo ""

if [ "$CURRENT_SIZE" -lt 1000 ] 2>/dev/null; then
    echo "✅ Database size is reasonable (<1GB), no cleanup needed"
    exit 0
fi

echo "⚠️  Database is large (${CURRENT_SIZE} MB)"
echo ""
echo "💡 Options to reduce size:"
echo ""
echo "1. Clean execution history via n8n UI:"
echo "   - Go to: http://173.254.201.134:5678"
echo "   - Settings → Data Management → Delete Execution Data"
echo "   - Choose retention period (e.g., keep last 7 days)"
echo ""
echo "2. Clean via SQL (advanced - backup first!):"
echo "   - Backup database first!"
echo "   - Run SQL commands to delete old executions"
echo ""
echo "3. Database vacuum (reclaim space after deletion):"
echo "   - After cleaning executions, run VACUUM"
echo ""

# Check if we can access n8n container
if docker exec n8n_rensto n8n --version >/dev/null 2>&1; then
    echo "✅ n8n container is accessible"
    echo ""
    echo "📋 To clean execution history:"
    echo "   1. Access n8n UI: http://173.254.201.134:5678"
    echo "   2. Go to Settings → Data Management"
    echo "   3. Set execution data retention (e.g., 7 days)"
    echo "   4. Save settings - n8n will clean automatically"
else
    echo "⚠️  Cannot access n8n container"
fi

echo ""
echo "💾 Current disk usage:"
df -h / | tail -1

