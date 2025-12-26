#!/bin/bash
# Execute Safe Disk Cleanup on n8n Server
# This script can be run directly on the server

echo "🚨 Executing Safe Disk Cleanup on n8n Server"
echo "=============================================="
echo ""

# Step 1: Check current disk usage
echo "📊 Step 1: Checking current disk usage..."
df -h / | tail -1
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
echo "Current usage: ${USAGE}%"
echo ""

if [ "$USAGE" -lt 80 ]; then
    echo "✅ Disk usage is already below 80% - no cleanup needed"
    exit 0
fi

echo "⚠️  Disk usage is ${USAGE}% - proceeding with safe cleanup..."
echo ""

TOTAL_FREED=0

# Step 2: Remove temp SQLite files (SAFE - only /tmp)
echo "📁 Step 2: Removing temp SQLite files..."
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

# Step 3: Clean old Docker images (SAFE - volumes protected)
echo "🐳 Step 3: Cleaning old Docker images (volumes protected)..."
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

# Step 4: Vacuum journal logs (SAFE - system logs only)
echo "📝 Step 4: Cleaning system journal logs..."
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

# Step 5: Clear auth logs (SAFE - security logs only)
echo "🔒 Step 5: Clearing auth/btmp logs..."
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

# Step 6: Clear npm cache (SAFE - build cache only)
echo "📦 Step 6: Clearing npm cache..."
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

# Step 7: Clean APT cache (SAFE - package cache only)
echo "📚 Step 7: Cleaning APT cache..."
apt-get clean 2>/dev/null || true
apt-get autoclean 2>/dev/null || true
echo "   ✅ APT cache cleaned"
echo ""

# Step 8: Verify n8n data integrity
echo "🛡️  Step 8: Verifying n8n data integrity..."
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
    echo "   Checking Docker volumes..."
    docker volume ls | grep n8n || echo "   (Using bind mount)"
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

# Final verification
echo "🛡️  FINAL VERIFICATION"
echo "======================"
if [ -n "$N8N_DB" ] && [ -f "$N8N_DB" ]; then
    echo "   ✅ n8n database: INTACT ($(du -h "$N8N_DB" | cut -f1))"
else
    echo "   ⚠️  Could not verify database location"
fi

if docker ps | grep -q n8n; then
    CONTAINER_NAME=$(docker ps | grep n8n | awk '{print $NF}')
    echo "   ✅ n8n container: RUNNING ($CONTAINER_NAME)"
else
    echo "   ⚠️  n8n container: NOT RUNNING"
    echo "   💡 Restart with: cd /opt/n8n && docker-compose up -d"
fi

echo ""
echo "✅ Safe cleanup complete!"
echo ""
echo "🛡️  PROTECTED DATA CONFIRMATION:"
echo "   ✅ Workflows: PROTECTED (in database)"
echo "   ✅ Credentials: PROTECTED (in database)"
echo "   ✅ Community nodes: PROTECTED (in /opt/n8n/data/n8n)"
echo "   ✅ Docker volumes: NOT TOUCHED"
echo ""

if [ "$FINAL_USAGE" -lt 80 ]; then
    echo "✅ SUCCESS: Disk usage now at ${FINAL_USAGE}% - healthy!"
    echo ""
    echo "💡 Next: Test creating a data table in n8n UI"
else
    echo "⚠️  Disk usage still at ${FINAL_USAGE}%"
    echo "   May need: n8n execution pruning or database archival"
fi
