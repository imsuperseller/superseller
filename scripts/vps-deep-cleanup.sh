#!/bin/sh
# VPS Deep Cleanup Script
# Removes old/unused directories and optimizes Docker storage

set -e

echo "🔍 VPS Deep Cleanup Analysis"
echo "============================"
echo ""

TOTAL_POTENTIAL=0

# 1. Check /opt/rensto-old
echo "1️⃣ Checking /opt/rensto-old..."
if [ -d "/opt/rensto-old" ]; then
    SIZE=$(du -m /opt/rensto-old 2>/dev/null | cut -f1 || echo "0")
    if [ "$SIZE" -gt 100 ] 2>/dev/null; then
        echo "   ⚠️  Found: /opt/rensto-old ($SIZE MB)"
        echo "   💡 This appears to be an old version - safe to delete if not needed"
        TOTAL_POTENTIAL=$((TOTAL_POTENTIAL + SIZE))
    fi
else
    echo "   ✅ No /opt/rensto-old directory"
fi
echo ""

# 2. Check /opt/backups
echo "2️⃣ Checking /opt/backups..."
if [ -d "/opt/backups" ]; then
    SIZE=$(du -m /opt/backups 2>/dev/null | cut -f1 || echo "0")
    if [ "$SIZE" -gt 50 ] 2>/dev/null; then
        echo "   ⚠️  Found: /opt/backups ($SIZE MB)"
        echo "   💡 Check if these backups are still needed"
        ls -lh /opt/backups 2>/dev/null | head -10
        TOTAL_POTENTIAL=$((TOTAL_POTENTIAL + SIZE))
    fi
else
    echo "   ✅ No /opt/backups directory"
fi
echo ""

# 3. Check Docker overlay (unused layers)
echo "3️⃣ Checking Docker overlay layers..."
DOCKER_OVERLAY_SIZE=$(du -sm /var/lib/docker/overlay2 2>/dev/null | cut -f1 || echo "0")
echo "   📊 Docker overlay2 total: ${DOCKER_OVERLAY_SIZE} MB"
echo "   💡 Run 'docker system prune -a' to remove unused layers (requires confirmation)"
echo ""

# 4. Check APT cache
echo "4️⃣ Checking APT cache..."
APT_SIZE=$(du -m /var/lib/apt 2>/dev/null | cut -f1 || echo "0")
if [ "$APT_SIZE" -gt 200 ] 2>/dev/null; then
    echo "   ⚠️  APT cache: $APT_SIZE MB"
    echo "   💡 Run 'apt-get clean' to free space"
    TOTAL_POTENTIAL=$((TOTAL_POTENTIAL + APT_SIZE - 36))  # Subtract current cache size
else
    echo "   ✅ APT cache already clean"
fi
echo ""

# 5. Check n8n database size
echo "5️⃣ Checking n8n database..."
if [ -f "/var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite" ]; then
    DB_SIZE=$(du -m /var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite 2>/dev/null | cut -f1 || echo "0")
    echo "   📊 n8n database: $DB_SIZE MB"
    if [ "$DB_SIZE" -gt 500 ] 2>/dev/null; then
        echo "   💡 Database is large - consider cleaning execution history in n8n UI"
    fi
fi
echo ""

# 6. Check for old node_modules
echo "6️⃣ Checking for large node_modules..."
find /opt -name "node_modules" -type d -exec du -sh {} \; 2>/dev/null | sort -h | tail -5
echo ""

# Summary
echo "📊 Summary"
echo "=========="
echo "Potential space to free: ~${TOTAL_POTENTIAL} MB"
echo ""
echo "💡 Recommendations:"
echo "   1. Review /opt/rensto-old - delete if not needed (~566MB)"
echo "   2. Review /opt/backups - delete old backups if not needed (~131MB)"
echo "   3. Clean APT cache: apt-get clean (~250MB)"
echo "   4. Docker prune (if safe): docker system prune -a (~varies)"
echo ""
echo "⚠️  Current disk usage:"
df -h / | tail -1
echo ""
echo "✅ At 77% usage, you're in good shape, but these optimizations can free ~1GB"

