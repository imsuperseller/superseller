#!/bin/bash
# Quick script to upload and run n8n update to 2.1.4
# Run this from your local machine

echo "🚀 N8N Update to 2.1.4 - Automated Runner"
echo "=========================================="
echo ""

# Configuration
SERVER="172.245.56.50"
SCRIPT_NAME="n8n-backup-and-update-2.1.4.sh"
LOCAL_SCRIPT="scripts/$SCRIPT_NAME"
REMOTE_PATH="/opt/n8n/$SCRIPT_NAME"

# Step 1: Upload script
echo "📤 Step 1: Uploading script to server..."
scp "$LOCAL_SCRIPT" root@$SERVER:$REMOTE_PATH

if [ $? -ne 0 ]; then
    echo "❌ Upload failed. Please check SSH access."
    echo ""
    echo "Manual steps:"
    echo "  1. scp $LOCAL_SCRIPT root@$SERVER:$REMOTE_PATH"
    echo "  2. ssh root@$SERVER"
    echo "  3. cd /opt/n8n && chmod +x $SCRIPT_NAME && bash $SCRIPT_NAME --yes"
    exit 1
fi

echo "✅ Script uploaded successfully"
echo ""

# Step 2: Run script on server
echo "🚀 Step 2: Running update script on server..."
echo "   (This will take 10-15 minutes)"
echo ""

ssh root@$SERVER "cd /opt/n8n && chmod +x $SCRIPT_NAME && bash $SCRIPT_NAME --yes"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Update completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Verify version: ssh root@$SERVER 'docker exec n8n_rensto n8n --version'"
    echo "  2. Test login at: https://n8n.rensto.com"
    echo "  3. Run cleanup: bash scripts/n8n-cleanup-backups-before-2.1.0.sh"
else
    echo ""
    echo "❌ Update failed. Check the output above for errors."
    echo "   Rollback instructions are in the script output."
fi

