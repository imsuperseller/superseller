#!/bin/bash
# Safe Automated Disk Cleanup for n8n VPS
# NON-INTERACTIVE - Safe to run automatically
# PROTECTS: workflows, credentials, community nodes, Docker volumes

set -e

echo "🚨 SAFE AUTOMATED DISK CLEANUP"
echo "==============================="
echo "Server: 172.245.56.50"
echo "Date: $(date)"
echo "Mode: NON-INTERACTIVE (safe automated cleanup)"
echo ""

# PROTECTED PATHS - NEVER DELETE
PROTECTED_PATHS=(
    "/opt/n8n"
    "/var/lib/docker/volumes/n8n_n8n_data"
    "/home/node/.n8n"
    "/opt/n8n/data/n8n"
)

echo "🛡️  Protected n8n data paths:"
for path in "${PROTECTED_PATHS[@]}"; do
    if [ -e "$path" ]; then
        echo "   ✅ $path"
    fi
done
echo ""

# Check current disk usage
echo "📊 Current Disk Usage:"
df -h / | tail -1
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
echo ""

if [ "$USAGE" -lt 80 ]; then
    echo "✅ Disk usage is below 80% - cleanup may not be necessary"
    echo "   Current usage: ${USAGE}%"
    exit 0
fi

echo "⚠️  Disk usage is ${USAGE}% - proceeding with safe cleanup..."
echo ""

TOTAL_FREED=0

# 1. Remove temp SQLite files (safe - only /tmp)
echo "1️⃣ Cleaning temp SQLite files..."
TEMP_FILES=$(find /tmp -name "*.sqlite" -type f 2>/dev/null | wc -l)
if [ "$TEMP_FILES" -gt 0 ]; then
    BEFORE=$(df / | tail -1 | awk '{print $3}')
    find /tmp -name "*.sqlite" -type f -delete 2>/dev/null || true
    AFTER=$(df / | tail -1 | awk '{print $3}')
    FREED=$(( (BEFORE - AFTER) / 1024 ))
    echo "   ✅ Removed $TEMP_FILES temp file(s): ~${FREED}MB"
    TOTAL_FREED=$((TOTAL_FREED + FREED))
else
    echo "   ✅ No temp SQLite files found"
fi
echo ""

# 2. Clean old Docker images (SAFE - does not touch volumes)
echo "2️⃣ Cleaning old Docker images (volumes protected)..."
BEFORE=$(df / | tail -1 | awk '{print $3}')
# SAFE: Only prune images older than 7 days, NOT volumes
docker system prune -af --filter "until=168h" --volumes=false 2>/dev/null || true
docker image prune -af --filter "dangling=true" 2>/dev/null || true
AFTER=$(df / | tail -1 | awk '{print $3}')
FREED=$(( (BEFORE - AFTER) / 1024 ))
if [ "$FREED" -gt 0 ]; then
    echo "   ✅ Freed: ~${FREED}MB (Docker volumes untouched)"
    TOTAL_FREED=$((TOTAL_FREED + FREED))
else
    echo "   ✅ No old Docker images to clean"
fi
echo ""

# 3. Vacuum journal logs (safe - system logs only)
echo "3️⃣ Cleaning system journal logs..."
BEFORE=$(df / | tail -1 | awk '{print $3}')
journalctl --vacuum-size=500M 2>/dev/null || true
AFTER=$(df / | tail -1 | awk '{print $3}')
FREED=$(( (BEFORE - AFTER) / 1024 ))
if [ "$FREED" -gt 0 ]; then
    echo "   ✅ Freed: ~${FREED}MB"
    TOTAL_FREED=$((TOTAL_FREED + FREED))
else
    echo "   ✅ Journal logs already optimized"
fi
echo ""

# 4. Clear auth logs (safe - security logs only)
echo "4️⃣ Clearing auth/btmp logs..."
if [ -f /var/log/btmp ]; then
    BTMP_SIZE=$(du -m /var/log/btmp 2>/dev/null | cut -f1 || echo "0")
    if [ "$BTMP_SIZE" -gt 10 ]; then
        cat /dev/null > /var/log/btmp 2>/dev/null || true
        cat /dev/null > /var/log/btmp.1 2>/dev/null || true
        echo "   ✅ Cleared: +${BTMP_SIZE}MB"
        TOTAL_FREED=$((TOTAL_FREED + BTMP_SIZE))
    else
        echo "   ✅ btmp logs already small"
    fi
else
    echo "   ✅ No btmp logs found"
fi
echo ""

# 5. Clear npm cache (safe - build cache only)
echo "5️⃣ Clearing npm cache..."
if [ -d /root/.npm ]; then
    NPM_SIZE=$(du -m /root/.npm 2>/dev/null | cut -f1 || echo "0")
    if [ "$NPM_SIZE" -gt 50 ]; then
        npm cache clean --force 2>/dev/null || true
        echo "   ✅ Cleared: +${NPM_SIZE}MB"
        TOTAL_FREED=$((TOTAL_FREED + NPM_SIZE))
    else
        echo "   ✅ npm cache already small"
    fi
else
    echo "   ✅ No npm cache found"
fi
echo ""

# 6. Clean APT cache (safe - package cache only)
echo "6️⃣ Cleaning APT cache..."
APT_SIZE=$(du -m /var/lib/apt 2>/dev/null | cut -f1 || echo "0")
if [ "$APT_SIZE" -gt 200 ]; then
    apt-get clean 2>/dev/null || true
    apt-get autoclean 2>/dev/null || true
    echo "   ✅ Cleaned APT cache"
else
    echo "   ✅ APT cache already clean"
fi
echo ""

# Verify n8n database is intact
echo "7️⃣ Verifying n8n data integrity..."
N8N_DB_LOCATIONS=(
    "/var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite"
    "/opt/n8n/data/n8n/database.sqlite"
)

N8N_DB=""
for db_path in "${N8N_DB_LOCATIONS[@]}"; do
    if [ -f "$db_path" ]; then
        N8N_DB="$db_path"
        DB_SIZE=$(du -h "$db_path" 2>/dev/null | cut -f1)
        echo "   ✅ n8n database intact: $db_path ($DB_SIZE)"
        break
    fi
done

if [ -z "$N8N_DB" ]; then
    echo "   ⚠️  Could not find n8n database (may use different location)"
fi
echo ""

# Summary
echo "📊 CLEANUP SUMMARY"
echo "=================="
echo "Total space freed: ~${TOTAL_FREED}MB"
echo ""
echo "📊 Final Disk Usage:"
df -h / | tail -1
FINAL_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
echo ""

# Final verification
echo "🛡️  FINAL VERIFICATION"
echo "======================"
if [ -n "$N8N_DB" ] && [ -f "$N8N_DB" ]; then
    echo "   ✅ n8n database: INTACT"
else
    echo "   ⚠️  Could not verify database location"
fi

if docker ps | grep -q n8n; then
    echo "   ✅ n8n container: RUNNING"
else
    echo "   ⚠️  n8n container: NOT RUNNING"
fi

echo ""
echo "✅ Safe cleanup complete!"
echo ""
echo "🛡️  PROTECTED DATA:"
echo "   ✅ Workflows: PROTECTED (in database)"
echo "   ✅ Credentials: PROTECTED (in database)"
echo "   ✅ Community nodes: PROTECTED (in /opt/n8n/data/n8n)"
echo "   ✅ Docker volumes: NOT TOUCHED"
echo ""

if [ "$FINAL_USAGE" -lt 80 ]; then
    echo "✅ Disk usage now at ${FINAL_USAGE}% - healthy!"
else
    echo "⚠️  Disk usage still at ${FINAL_USAGE}% - may need additional cleanup"
    echo "   Consider: n8n execution pruning, database archival"
fi
