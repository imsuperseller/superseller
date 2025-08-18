#!/bin/bash

# Rensto Backup Script
# Backs up n8n workflows, PostgreSQL, MongoDB, and uploads to Icedrive

set -e

# Load environment variables
source .env

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "${BACKUP_PATH}"

log_info "Starting backup: ${BACKUP_NAME}"

# 1. Export n8n workflows and credentials
log_info "Backing up n8n workflows..."
if [ -d "./data/n8n" ]; then
    # Copy n8n data directory
    cp -r ./data/n8n "${BACKUP_PATH}/n8n-data"

    # Export workflows via API if n8n is running
    if docker ps | grep -q rensto-n8n; then
        docker exec rensto-n8n n8n export:workflow --all --output=/home/node/workflows-export.json 2>/dev/null || true
        docker cp rensto-n8n:/home/node/workflows-export.json "${BACKUP_PATH}/workflows.json" 2>/dev/null || true

        docker exec rensto-n8n n8n export:credentials --all --output=/home/node/credentials-export.json 2>/dev/null || true
        docker cp rensto-n8n:/home/node/credentials-export.json "${BACKUP_PATH}/credentials.json" 2>/dev/null || true
    fi
    log_info "n8n backup completed"
else
    log_warn "n8n data directory not found"
fi

# 2. Backup PostgreSQL
log_info "Backing up PostgreSQL database..."
if docker ps | grep -q rensto-postgres; then
    docker exec rensto-postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > "${BACKUP_PATH}/postgres_backup.sql"

    # Compress SQL dump
    gzip "${BACKUP_PATH}/postgres_backup.sql"
    log_info "PostgreSQL backup completed"
else
    log_warn "PostgreSQL container not running"
fi

# 3. Backup MongoDB (from Racknerd server)
log_info "Backing up MongoDB from Racknerd..."
if command -v mongodump &> /dev/null; then
    # Backup from Racknerd MongoDB
    mongodump \
        --host=173.254.201.134 \
        --port=27017 \
        --db=rensto \
        --out="${BACKUP_PATH}/mongodb"

    log_info "MongoDB backup completed from Racknerd"
else
    log_warn "mongodump not available - MongoDB backup skipped"
fi

# 4. Backup Docker volumes info
log_info "Saving Docker volumes information..."
docker volume ls > "${BACKUP_PATH}/docker-volumes.txt"
docker-compose ps > "${BACKUP_PATH}/docker-status.txt"

# 5. Backup environment file (without sensitive data)
log_info "Backing up configuration..."
if [ -f ".env" ]; then
    # Remove passwords but keep structure
    sed 's/PASSWORD=.*/PASSWORD=REDACTED/g; s/KEY=.*/KEY=REDACTED/g' .env > "${BACKUP_PATH}/env-structure.txt"
fi

# 6. Create compressed archive
log_info "Creating compressed archive..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
ARCHIVE_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
log_info "Archive created: ${BACKUP_NAME}.tar.gz (${ARCHIVE_SIZE})"

# 7. Upload to Icedrive via rclone
if command -v rclone &> /dev/null; then
    log_info "Uploading to Icedrive..."
    if rclone ls icedrive: &> /dev/null; then
        rclone copy "${BACKUP_NAME}.tar.gz" icedrive:backups/rensto/ --progress
        log_info "Upload to Icedrive completed"
    else
        log_warn "Icedrive not configured in rclone"
        log_warn "Run: rclone config"
    fi
else
    log_warn "rclone not installed - skipping cloud upload"
    log_warn "Install with: sudo apt install rclone"
fi

# 8. Clean up old local backups
log_info "Cleaning up old backups..."
find "${BACKUP_DIR}" -name "backup-*.tar.gz" -mtime +${RETENTION_DAYS} -delete
REMOVED_COUNT=$(find "${BACKUP_DIR}" -name "backup-*" -type d -mtime +${RETENTION_DAYS} | wc -l)
find "${BACKUP_DIR}" -name "backup-*" -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \; 2>/dev/null || true

if [ ${REMOVED_COUNT} -gt 0 ]; then
    log_info "Removed ${REMOVED_COUNT} old backup(s)"
fi

# 9. Clean up temporary directory
rm -rf "${BACKUP_PATH}"

# 10. Verify backup
if [ -f "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" ]; then
    log_info "Backup completed successfully!"
    log_info "Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

    # Send notification to Slack if configured
    if [ ! -z "${SLACK_WEBHOOK_URL}" ]; then
        curl -X POST "${SLACK_WEBHOOK_URL}" \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"✅ Rensto backup completed: ${BACKUP_NAME}.tar.gz (${ARCHIVE_SIZE})\"}" \
            2>/dev/null || log_warn "Failed to send Slack notification"
    fi
else
    log_error "Backup failed - archive not created"
    exit 1
fi

# 11. Generate backup report
cat > "${BACKUP_DIR}/last-backup.txt" << EOF
Last Backup: ${TIMESTAMP}
Archive: ${BACKUP_NAME}.tar.gz
Size: ${ARCHIVE_SIZE}
PostgreSQL: $([ -f "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" ] && echo "✓" || echo "✗")
MongoDB: $([ -f "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" ] && echo "✓" || echo "✗")
n8n: $([ -f "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" ] && echo "✓" || echo "✗")
Uploaded: $(rclone ls icedrive:backups/rensto/${BACKUP_NAME}.tar.gz 2>/dev/null && echo "✓" || echo "✗")
EOF

log_info "Backup report saved to ${BACKUP_DIR}/last-backup.txt"

exit 0
