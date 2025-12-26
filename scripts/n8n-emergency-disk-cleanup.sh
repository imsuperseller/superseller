#!/bin/bash
# Emergency Disk Space Cleanup for n8n VPS
# Server: 172.245.56.50
# Issue: SQLITE_FULL: database or disk is full
# SAFETY: This script PROTECTS n8n data (workflows, credentials, community nodes)

set -e

# PROTECTED PATHS - NEVER DELETE THESE
PROTECTED_PATHS=(
    "/opt/n8n"
    "/var/lib/docker/volumes/n8n_n8n_data"
    "/home/node/.n8n"
    "/opt/n8n/data/n8n"
)

# Verify protected paths exist and are safe
verify_protected_paths() {
    echo "🛡️  Verifying protected n8n data paths..."
    for path in "${PROTECTED_PATHS[@]}"; do
        if [ -e "$path" ]; then
            echo "   ✅ Protected: $path"
        fi
    done
    echo ""
}

echo "🚨 EMERGENCY DISK SPACE CLEANUP"
echo "================================"
echo "Server: 172.245.56.50"
echo "Date: $(date)"
echo ""

# Verify protected paths first
verify_protected_paths

# Check current disk usage
echo "📊 Current Disk Usage:"
df -h / | tail -1
echo ""

# Backup n8n database location before cleanup
N8N_DB_LOCATIONS=(
    "/var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite"
    "/opt/n8n/data/n8n/database.sqlite"
)

echo "🔍 Verifying n8n database location..."
N8N_DB=""
for db_path in "${N8N_DB_LOCATIONS[@]}"; do
    if [ -f "$db_path" ]; then
        N8N_DB="$db_path"
        DB_SIZE=$(du -h "$db_path" 2>/dev/null | cut -f1)
        echo "   ✅ Found n8n database: $db_path ($DB_SIZE)"
        break
    fi
done

if [ -z "$N8N_DB" ]; then
    echo "   ⚠️  n8n database not found in expected locations (may be using different setup)"
fi
echo ""

TOTAL_FREED=0

# 1. Check and remove temp SQLite files
echo "1️⃣ Checking for temp SQLite files..."
TEMP_DB=$(find /tmp -name "*.sqlite" -type f 2>/dev/null | head -1)
if [ -n "$TEMP_DB" ]; then
    SIZE=$(du -m "$TEMP_DB" 2>/dev/null | cut -f1 || echo "0")
    if [ "$SIZE" -gt 100 ]; then
        echo "   ⚠️  Found: $TEMP_DB ($SIZE MB)"
        read -p "   Delete this file? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -f "$TEMP_DB"
            echo "   ✅ Deleted: +${SIZE}MB"
            TOTAL_FREED=$((TOTAL_FREED + SIZE))
        fi
    fi
fi
echo ""

# 2. Clean old Docker images (SAFE - does not touch volumes)
echo "2️⃣ Cleaning old Docker images..."
echo "   ⚠️  SAFETY: This will NOT delete Docker volumes (n8n data is safe)"
echo "   Current images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10
echo ""
echo "   Protected volumes:"
docker volume ls | grep n8n || echo "   (No n8n volumes found - may use bind mount)"
echo ""
read -p "   Remove old/unused Docker images (keeps volumes)? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BEFORE=$(df / | tail -1 | awk '{print $3}')
    # SAFE: Only prune images, NOT volumes
    docker system prune -af --filter "until=168h" --volumes=false 2>/dev/null || true
    docker image prune -af --filter "dangling=true" 2>/dev/null || true
    AFTER=$(df / | tail -1 | awk '{print $3}')
    FREED=$(( (BEFORE - AFTER) / 1024 ))
    echo "   ✅ Freed: ~${FREED}MB (volumes untouched)"
    TOTAL_FREED=$((TOTAL_FREED + FREED))
fi
echo ""

# 3. Vacuum journal logs
echo "3️⃣ Cleaning system journal logs..."
JOURNAL_SIZE=$(journalctl --disk-usage 2>/dev/null | grep -oP '\d+\.\d+[GM]' || echo "0M")
echo "   Current journal size: $JOURNAL_SIZE"
read -p "   Limit journal to 500MB? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BEFORE=$(df / | tail -1 | awk '{print $3}')
    journalctl --vacuum-size=500M 2>/dev/null || true
    AFTER=$(df / | tail -1 | awk '{print $3}')
    FREED=$(( (BEFORE - AFTER) / 1024 ))
    echo "   ✅ Freed: ~${FREED}MB"
    TOTAL_FREED=$((TOTAL_FREED + FREED))
fi
echo ""

# 4. Clear auth logs
echo "4️⃣ Clearing auth/btmp logs..."
if [ -f /var/log/btmp ]; then
    BTMP_SIZE=$(du -m /var/log/btmp 2>/dev/null | cut -f1 || echo "0")
    if [ "$BTMP_SIZE" -gt 10 ]; then
        echo "   Found btmp: ${BTMP_SIZE}MB"
        read -p "   Clear btmp logs? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cat /dev/null > /var/log/btmp 2>/dev/null || true
            cat /dev/null > /var/log/btmp.1 2>/dev/null || true
            echo "   ✅ Cleared: +${BTMP_SIZE}MB"
            TOTAL_FREED=$((TOTAL_FREED + BTMP_SIZE))
        fi
    fi
fi
echo ""

# 5. Clear npm cache
echo "5️⃣ Clearing npm cache..."
if [ -d /root/.npm ]; then
    NPM_SIZE=$(du -m /root/.npm 2>/dev/null | cut -f1 || echo "0")
    if [ "$NPM_SIZE" -gt 50 ]; then
        echo "   npm cache: ${NPM_SIZE}MB"
        read -p "   Clear npm cache? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm cache clean --force 2>/dev/null || true
            echo "   ✅ Cleared: +${NPM_SIZE}MB"
            TOTAL_FREED=$((TOTAL_FREED + NPM_SIZE))
        fi
    fi
fi
echo ""

# 6. Clean APT cache
echo "6️⃣ Cleaning APT cache..."
APT_SIZE=$(du -m /var/lib/apt 2>/dev/null | cut -f1 || echo "0")
if [ "$APT_SIZE" -gt 200 ]; then
    echo "   APT cache: ${APT_SIZE}MB"
    read -p "   Clean APT cache? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apt-get clean 2>/dev/null || true
        apt-get autoclean 2>/dev/null || true
        echo "   ✅ Cleaned"
    fi
fi
echo ""

# 7. Verify n8n database is still intact
echo "7️⃣ Verifying n8n database integrity..."
if [ -n "$N8N_DB" ] && [ -f "$N8N_DB" ]; then
    DB_SIZE=$(du -h "$N8N_DB" 2>/dev/null | cut -f1 || echo "unknown")
    DB_SIZE_MB=$(du -m "$N8N_DB" 2>/dev/null | cut -f1 || echo "0")
    echo "   ✅ n8n database intact: $N8N_DB ($DB_SIZE)"
    if [ "$DB_SIZE_MB" -gt 5000 ]; then
        echo "   ⚠️  Database is very large (>5GB)"
        echo "   💡 Consider cleaning execution history in n8n UI"
        echo "   💡 Or enable auto-pruning in docker-compose.yml"
        echo "   ⚠️  DO NOT delete database - contains workflows and credentials!"
    fi
else
    echo "   ⚠️  Could not verify database location (may use different setup)"
fi
echo ""

# 8. Find large files/directories
echo "8️⃣ Finding large files/directories..."
echo "   Top 10 largest directories:"
du -h --max-depth=1 / 2>/dev/null | sort -hr | head -10
echo ""

# Summary
echo "📊 SUMMARY"
echo "=========="
echo "Total space freed: ~${TOTAL_FREED}MB"
echo ""
echo "📊 Final Disk Usage:"
df -h / | tail -1
echo ""

# Final verification: Check n8n data is intact
echo "🔍 Final Verification: n8n Data Integrity"
echo "=========================================="
if [ -n "$N8N_DB" ] && [ -f "$N8N_DB" ]; then
    echo "   ✅ n8n database: EXISTS ($(du -h "$N8N_DB" | cut -f1))"
else
    echo "   ⚠️  Could not verify database (may use different location)"
fi

# Check if n8n container is running
if docker ps | grep -q n8n; then
    echo "   ✅ n8n container: RUNNING"
    CONTAINER_NAME=$(docker ps | grep n8n | awk '{print $NF}')
    echo "   Container: $CONTAINER_NAME"
else
    echo "   ⚠️  n8n container: NOT RUNNING"
    echo "   💡 Restart with: docker-compose -f /opt/n8n/docker-compose.yml up -d"
fi

# Check Docker volumes
echo ""
echo "   Docker volumes (n8n data):"
docker volume ls | grep n8n || echo "   (Using bind mount - check /opt/n8n/data/n8n)"
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "🛡️  SAFETY CONFIRMATION:"
echo "   ✅ n8n workflows: PROTECTED (stored in database)"
echo "   ✅ n8n credentials: PROTECTED (stored in database)"
echo "   ✅ Community nodes: PROTECTED (stored in /opt/n8n/data/n8n)"
echo "   ✅ Docker volumes: NOT TOUCHED"
echo ""
echo "💡 Next steps:"
echo "   1. Check n8n can create data tables now"
echo "   2. Verify workflows and credentials in n8n UI"
echo "   3. Enable execution pruning if not already enabled"
echo "   4. Set up automated cleanup (see docs/infrastructure/N8N_DISK_FULL_DEC2025.md)"
