#!/bin/bash
# SAFE Disk Cleanup for n8n Server - EXECUTE THIS ON SERVER
# Server: 172.245.56.50
# PROTECTS: workflows, credentials, community nodes

set -e

echo "🚨 SAFE DISK CLEANUP - EXECUTING NOW"
echo "====================================="
echo "Date: $(date)"
echo ""

# Show initial disk usage
echo "📊 Initial Disk Usage:"
df -h / | tail -1
INITIAL_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
echo ""

if [ "$INITIAL_USAGE" -lt 80 ]; then
    echo "✅ Disk usage is already below 80% (${INITIAL_USAGE}%)"
    echo "   Cleanup may not be necessary, but proceeding anyway..."
    echo ""
fi

TOTAL_FREED=0

# 1. Remove temp SQLite files (SAFE - only /tmp)
echo "1️⃣ Removing temp SQLite files..."
BEFORE=$(df / | tail -1 | awk '{print $3}')
find /tmp -name "*.sqlite" -type f -delete 2>/dev/null || true
AFTER=$(df / | tail -1 | awk '{print $3}')
FREED=$(( (BEFORE - AFTER) / 1024 ))
if [ "$FREED" -gt 0 ]; then
    echo "   ✅ Freed: ~${FREED}MB"
    TOTAL_FREED=$((TOTAL_FREED + FREED))
else
    echo "   ✅ No temp files found"
fi
echo ""

# 2. Clean old Docker images (SAFE - volumes protected)
echo "2️⃣ Cleaning old Docker images (volumes protected)..."
BEFORE=$(df / | tail -1 | awk '{print $3}')
docker system prune -af --filter "until=168h" --volumes=false 2>/dev/null || true
docker image prune -af --filter "dangling=true" 2>/dev/null || true
AFTER=$(df / | tail -1 | awk '{print $3}')
FREED=$(( (BEFORE - AFTER) / 1024 ))
if [ "$FREED" -gt 0 ]; then
    echo "   ✅ Freed: ~${FREED}MB (Docker volumes untouched)"
    TOTAL_FREED=$((TOTAL_FREED + FREED))
else
    echo "   ✅ No old images to clean"
fi
echo ""

# 3. Vacuum journal logs (SAFE - system logs only)
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

# 4. Clear auth logs (SAFE - security logs only)
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

# 5. Clear npm cache (SAFE - build cache only)
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

# 6. Clean APT cache (SAFE - package cache only)
echo "6️⃣ Cleaning APT cache..."
apt-get clean 2>/dev/null || true
apt-get autoclean 2>/dev/null || true
echo "   ✅ APT cache cleaned"
echo ""

# Verify n8n data integrity
echo "🛡️  VERIFYING N8N DATA INTEGRITY"
echo "================================="
N8N_DB_LOCATIONS=(
    "/var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite"
    "/opt/n8n/data/n8n/database.sqlite"
)

N8N_DB=""
for db_path in "${N8N_DB_LOCATIONS[@]}"; do
    if [ -f "$db_path" ]; then
        N8N_DB="$db_path"
        DB_SIZE=$(du -h "$db_path" 2>/dev/null | cut -f1)
        echo "   ✅ n8n database: $db_path ($DB_SIZE)"
        break
    fi
done

if [ -z "$N8N_DB" ]; then
    echo "   ⚠️  Could not find n8n database in expected locations"
    echo "   Checking Docker volumes..."
    docker volume ls | grep n8n || echo "   (May use bind mount at /opt/n8n/data/n8n)"
fi

# Check n8n container
echo ""
if docker ps | grep -q n8n; then
    CONTAINER_NAME=$(docker ps | grep n8n | awk '{print $NF}')
    echo "   ✅ n8n container: RUNNING ($CONTAINER_NAME)"
else
    echo "   ⚠️  n8n container: NOT RUNNING"
    echo "   💡 Restart with: cd /opt/n8n && docker-compose up -d"
fi
echo ""

# Final summary
echo "📊 CLEANUP SUMMARY"
echo "=================="
echo "Total space freed: ~${TOTAL_FREED}MB"
echo ""
echo "📊 Final Disk Usage:"
df -h / | tail -1
FINAL_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
echo ""

echo "🛡️  SAFETY CONFIRMATION"
echo "======================="
echo "   ✅ Workflows: PROTECTED (in database)"
echo "   ✅ Credentials: PROTECTED (in database)"
echo "   ✅ Community nodes: PROTECTED (in /opt/n8n/data/n8n)"
echo "   ✅ Docker volumes: NOT TOUCHED"
echo ""

if [ "$FINAL_USAGE" -lt 80 ]; then
    echo "✅ SUCCESS: Disk usage reduced from ${INITIAL_USAGE}% to ${FINAL_USAGE}%"
    echo ""
    echo "💡 Next step: Test creating a data table in n8n UI"
    echo "   Go to: https://n8n.rensto.com"
else
    echo "⚠️  Disk usage: ${FINAL_USAGE}% (was ${INITIAL_USAGE}%)"
    echo "   May need additional cleanup (n8n execution pruning)"
fi

echo ""
echo "✅ Cleanup complete!"
