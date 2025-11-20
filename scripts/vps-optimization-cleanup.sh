#!/bin/sh
# VPS Optimization & Cleanup Script
# Cleans up Docker images, logs, temp files, and other unnecessary data

set -e

echo "🧹 VPS Optimization & Cleanup"
echo "=============================="
echo ""

TOTAL_FREED=0

# 1. Clean up old Docker images
echo "1️⃣ Cleaning up old Docker images..."
OLD_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "n8nio/n8n:1.118.2" || true)
if [ ! -z "$OLD_IMAGES" ]; then
    echo "   Found old n8n image: n8nio/n8n:1.118.2"
    docker rmi n8nio/n8n:1.118.2 2>/dev/null && echo "   ✅ Deleted old n8n image (~972MB)" || echo "   ⚠️  Could not delete (may be in use)"
    TOTAL_FREED=$((TOTAL_FREED + 972))
else
    echo "   ✅ No old Docker images to clean"
fi
echo ""

# 2. Clean up Docker system (prune unused)
echo "2️⃣ Pruning Docker system..."
DOCKER_PRUNE=$(docker system prune -f --volumes 2>&1 | grep "Total reclaimed space" || echo "")
if [ ! -z "$DOCKER_PRUNE" ]; then
    echo "   $DOCKER_PRUNE"
else
    echo "   ✅ Docker system already clean"
fi
echo ""

# 3. Clean up old log files
echo "3️⃣ Cleaning up old log files..."

# Journal logs (keep last 7 days)
journalctl --vacuum-time=7d >/dev/null 2>&1 && echo "   ✅ Cleaned journal logs (kept last 7 days)" || echo "   ⚠️  Could not clean journal"

# Old log files
find /var/log -name "*.log.*" -type f -mtime +30 -delete 2>/dev/null && echo "   ✅ Deleted old rotated logs (>30 days)" || echo "   ⚠️  No old logs to delete"

# btmp (failed login attempts - can be large)
if [ -f /var/log/btmp ]; then
    SIZE=$(du -m /var/log/btmp 2>/dev/null | cut -f1 || echo "0")
    if [ "$SIZE" -gt 10 ] 2>/dev/null; then
        > /var/log/btmp && echo "   ✅ Cleared btmp log ($SIZE MB)" || echo "   ⚠️  Could not clear btmp"
        TOTAL_FREED=$((TOTAL_FREED + SIZE))
    fi
fi

# btmp.1 (rotated)
if [ -f /var/log/btmp.1 ]; then
    SIZE=$(du -m /var/log/btmp.1 2>/dev/null | cut -f1 || echo "0")
    if [ "$SIZE" -gt 0 ] 2>/dev/null; then
        rm -f /var/log/btmp.1 && echo "   ✅ Deleted btmp.1 ($SIZE MB)" || echo "   ⚠️  Could not delete btmp.1"
        TOTAL_FREED=$((TOTAL_FREED + SIZE))
    fi
fi

echo ""

# 4. Clean up temporary files
echo "4️⃣ Cleaning up temporary files..."
TMP_COUNT=$(find /tmp -type f -mtime +7 -delete 2>/dev/null | wc -l || echo "0")
if [ "$TMP_COUNT" -gt 0 ]; then
    echo "   ✅ Deleted $TMP_COUNT old temp files"
else
    echo "   ✅ No old temp files to clean"
fi

VAR_TMP_COUNT=$(find /var/tmp -type f -mtime +7 -delete 2>/dev/null | wc -l || echo "0")
if [ "$VAR_TMP_COUNT" -gt 0 ]; then
    echo "   ✅ Deleted $VAR_TMP_COUNT old var/tmp files"
fi
echo ""

# 5. Clean up APT cache
echo "5️⃣ Cleaning up APT cache..."
apt-get clean >/dev/null 2>&1 && echo "   ✅ Cleaned APT cache" || echo "   ⚠️  Could not clean APT cache"
echo ""

# 6. Check for large files in /root
echo "6️⃣ Checking /root directory..."
if [ -d "/root/rensto" ]; then
    SIZE=$(du -m /root/rensto 2>/dev/null | cut -f1 || echo "0")
    if [ "$SIZE" -gt 50 ] 2>/dev/null; then
        echo "   ⚠️  /root/rensto is $SIZE MB - consider cleaning if not needed"
    fi
fi

if [ -d "/root/node_modules" ]; then
    SIZE=$(du -m /root/node_modules 2>/dev/null | cut -f1 || echo "0")
    if [ "$SIZE" -gt 5 ] 2>/dev/null; then
        echo "   ⚠️  /root/node_modules is $SIZE MB - consider removing if not needed"
    fi
fi
echo ""

# 7. Show disk usage
echo "7️⃣ Current disk usage:"
df -h / | tail -1
echo ""

# Summary
echo "🎉 Cleanup Complete!"
echo "==================="
echo "Estimated space freed: ~${TOTAL_FREED} MB"
echo ""
echo "📊 Current status:"
docker system df
echo ""
echo "💡 Recommendations:"
echo "   - Run this script weekly to maintain optimal disk usage"
echo "   - Monitor disk usage: df -h /"
echo "   - Keep only 2 n8n backups (use n8n-backup-cleanup.sh)"

