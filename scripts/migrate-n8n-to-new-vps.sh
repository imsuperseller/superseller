#!/bin/bash
# 🔄 Migrate n8n from Old VPS to New VPS
# Run this from LOCAL machine or OLD VPS

set -e

OLD_VPS="173.254.201.134"
NEW_VPS="172.245.56.50"
BACKUP_DIR="/root/n8n-backups/2025-12-05_195047"
BACKUP_FILE="2025-12-05_195047-compressed.tgz"

echo "🔄 N8N MIGRATION: OLD VPS → NEW VPS"
echo "===================================="
echo "Old VPS: $OLD_VPS"
echo "New VPS: $NEW_VPS"
echo ""

# Step 1: Transfer backup
echo "📤 Step 1: Transferring backup from old VPS to new VPS..."
echo "   This may take a few minutes (881M backup)..."
scp -o StrictHostKeyChecking=accept-new \
    root@$OLD_VPS:$BACKUP_DIR/$BACKUP_FILE \
    root@$NEW_VPS:/root/n8n-backups/

echo "✅ Backup transferred"
echo ""

# Step 2: Create docker-compose.yml on new VPS
echo "📝 Step 2: Creating docker-compose.yml on new VPS..."
ssh -o StrictHostKeyChecking=accept-new root@$NEW_VPS << 'EOF'
mkdir -p /opt/n8n
cat > /opt/n8n/docker-compose.yml << 'COMPOSE'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:1.122.5
    container_name: n8n_rensto
    restart: unless-stopped
    ports:
      - '5678:5678'
    environment:
      - RESTRICT_FILE_ACCESS_TO=/tmp/n8n-data
      - BLOCK_FILE_ACCESS_TO_N8N_FILES=false
      # Core n8n settings
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD:-changeme}
      - N8N_HOST=${N8N_HOST:-0.0.0.0}
      - N8N_PORT=5678
      - N8N_PROTOCOL=${N8N_PROTOCOL:-http}
      - WEBHOOK_URL=${WEBHOOK_URL:-http://172.245.56.50:5678}
      - N8N_EDITOR_BASE_URL=${N8N_EDITOR_BASE_URL:-http://172.245.56.50:5678}
      # Database
      - DB_TYPE=sqlite
      - DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite
      # Execution
      - EXECUTIONS_DATA_SAVE_ON_ERROR=all
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
      - EXECUTIONS_DATA_MAX_AGE=168  # 7 days
    volumes:
      - n8n_n8n_data:/home/node/.n8n
    networks:
      - n8n-network

volumes:
  n8n_n8n_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/n8n/data/n8n

networks:
  n8n-network:
    driver: bridge
COMPOSE
echo "✅ docker-compose.yml created"
EOF

echo "✅ docker-compose.yml created"
echo ""

# Step 3: Restore data volume
echo "📦 Step 3: Restoring data volume from backup..."
ssh -o StrictHostKeyChecking=accept-new root@$NEW_VPS << EOF
cd /opt/n8n
mkdir -p data/n8n

# Extract backup
echo "   Extracting backup (this may take a few minutes)..."
cd /root/n8n-backups
tar xzf $BACKUP_FILE -C /tmp/n8n-restore

# Restore data volume
echo "   Restoring data volume..."
if [ -f /tmp/n8n-restore/n8n-data-backup.tgz ]; then
    cd /opt/n8n/data/n8n
    tar xzf /tmp/n8n-restore/n8n-data-backup.tgz
    chown -R 1000:1000 /opt/n8n/data/n8n
    echo "✅ Data volume restored"
else
    echo "❌ Backup file not found!"
    exit 1
fi

# Cleanup
rm -rf /tmp/n8n-restore
EOF

echo "✅ Data volume restored"
echo ""

# Step 4: Start n8n
echo "🚀 Step 4: Starting n8n on new VPS..."
ssh -o StrictHostKeyChecking=accept-new root@$NEW_VPS << 'EOF'
cd /opt/n8n
docker-compose up -d n8n
sleep 10
docker exec n8n_rensto n8n --version 2>/dev/null | head -n1 || echo "Still starting..."
EOF

echo ""
echo "✅ MIGRATION COMPLETE!"
echo "===================="
echo "New VPS: http://172.245.56.50:5678"
echo ""
echo "Next steps:"
echo "1. Verify n8n is accessible: http://172.245.56.50:5678"
echo "2. Login with your credentials"
echo "3. Verify all workflows and credentials"
echo "4. Update DNS/Cloudflare if using n8n.rensto.com"
echo "5. Test workflow execution"
