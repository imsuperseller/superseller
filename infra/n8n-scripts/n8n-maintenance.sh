#!/bin/bash
# 🧹 n8n Auto-Janitor (RackNerd maintenance script)
# =============================================================================
# Purpose: Reclaim disk space, optimize n8n database, and ensure long-term stability.
# Frequency: Recommended to run weekly via cron.

LOG_FILE="/var/log/n8n-maintenance.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting Weekly Maintenance..."

# 1. Check disk space before
DISK_BEFORE=$(df -h / | awk 'NR==2 {print $4}')
log "📊 Free space before: $DISK_BEFORE"

# 2. Docker Cleanup (The "Clog" Clearance)
log "🐳 Pruning Docker images, volumes, and networks..."
docker system prune -a -f --volumes >> "$LOG_FILE" 2>&1
log "✅ Docker cleanup complete."

# 3. SQLite Database Optimization (Vacuum)
# This reclaims space from deleted executions in the sqlite file.
DB_PATH="/var/lib/docker/volumes/n8n_n8n_n8n_data/_data/database.sqlite"
if [ -f "$DB_PATH" ]; then
    log "🗄️  Optimizing n8n SQLite database (VACUUM)..."
    # Ensure n8n is not mid-heavy write, though VACUUM is generally safe.
    sqlite3 "$DB_PATH" "VACUUM;" >> "$LOG_FILE" 2>&1
    log "✅ Database optimized."
else
    log "⚠️  n8n database not found at $DB_PATH, skipping VACUUM."
fi

# 4. Check disk space after
DISK_AFTER=$(df -h / | awk 'NR==2 {print $4}')
log "📊 Free space after: $DISK_AFTER"

log "🏁 Maintenance finished successfully."
echo "--------------------------------------------------" >> "$LOG_FILE"
