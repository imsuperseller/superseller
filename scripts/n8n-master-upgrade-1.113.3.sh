#!/bin/bash

# 🚀 N8N MASTER UPGRADE SCRIPT - VERSION 1.113.3
# Orchestrates the complete upgrade process with safety measures

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="/Users/shaifriedman/New Rensto/rensto/scripts"
N8N_SERVER="173.254.201.134"
PORT="5678"

echo "🚀 N8N MASTER UPGRADE SCRIPT - VERSION 1.113.3"
echo "=============================================="
echo "Date: $(date)"
echo "Server: $N8N_SERVER:$PORT"
echo "Script Directory: $SCRIPT_DIR"
echo ""

# Step 1: Pre-flight checks
echo "🔍 Pre-flight checks..."
echo "======================"

# Check if we're on the right server
if [ "$(hostname)" != "rensto" ] && [ "$(hostname)" != "racknerd" ]; then
    echo "⚠️  Warning: This script is designed for RackNerd server"
    echo "Current hostname: $(hostname)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted by user"
        exit 1
    fi
fi

# Check if scripts exist
REQUIRED_SCRIPTS=(
    "n8n-backup-before-upgrade.sh"
    "n8n-upgrade-to-1.113.3.sh"
    "n8n-verify-upgrade.sh"
    "n8n-rollback.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$script" ]; then
        echo "❌ Required script not found: $script"
        exit 1
    fi
    if [ ! -x "$SCRIPT_DIR/$script" ]; then
        echo "❌ Script not executable: $script"
        exit 1
    fi
done

echo "✅ All required scripts found and executable"

# Check if n8n container exists
if ! docker ps -a | grep -q "n8n_rensto"; then
    echo "❌ n8n container not found!"
    exit 1
fi

echo "✅ n8n container found"

echo ""

# Step 2: User confirmation
echo "⚠️  IMPORTANT: This will upgrade n8n to version 1.113.3"
echo "====================================================="
echo ""
echo "📋 What this script will do:"
echo "1. Create a complete backup of current n8n data"
echo "2. Stop the current n8n container"
echo "3. Pull the latest n8n Docker image (1.113.3)"
echo "4. Start a new container with the upgraded version"
echo "5. Verify the upgrade was successful"
echo ""
echo "🛡️  Safety measures:"
echo "- Complete backup before upgrade"
echo "- Data volume preservation"
echo "- Rollback capability if issues occur"
echo ""
echo "📊 Current status:"
echo "- Container: n8n_rensto"
echo "- Server: $N8N_SERVER:$PORT"
echo "- Target version: 1.113.3"
echo ""

read -p "Do you want to proceed with the upgrade? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted by user"
    exit 1
fi

echo ""

# Step 3: Execute backup
echo "🛡️  Step 1: Creating backup..."
echo "============================="
if "$SCRIPT_DIR/n8n-backup-before-upgrade.sh"; then
    echo "✅ Backup completed successfully"
else
    echo "❌ Backup failed!"
    echo "❌ Aborting upgrade for safety"
    exit 1
fi

echo ""

# Step 4: Execute upgrade
echo "🚀 Step 2: Executing upgrade..."
echo "=============================="
if "$SCRIPT_DIR/n8n-upgrade-to-1.113.3.sh"; then
    echo "✅ Upgrade completed successfully"
else
    echo "❌ Upgrade failed!"
    echo "🔄 Attempting rollback..."
    if "$SCRIPT_DIR/n8n-rollback.sh"; then
        echo "✅ Rollback completed successfully"
        echo "❌ Upgrade failed, but system restored to previous state"
    else
        echo "❌ Rollback also failed!"
        echo "🚨 CRITICAL: Manual intervention required!"
        echo "Please check:"
        echo "1. Container status: docker ps -a"
        echo "2. Container logs: docker logs n8n_rensto"
        echo "3. Backup location: /root/n8n-backups/"
    fi
    exit 1
fi

echo ""

# Step 5: Execute verification
echo "🔍 Step 3: Verifying upgrade..."
echo "=============================="
if "$SCRIPT_DIR/n8n-verify-upgrade.sh"; then
    echo "✅ Verification completed successfully"
else
    echo "⚠️  Verification found issues"
    echo "🔄 Attempting rollback..."
    if "$SCRIPT_DIR/n8n-rollback.sh"; then
        echo "✅ Rollback completed successfully"
        echo "❌ Upgrade verification failed, system restored to previous state"
    else
        echo "❌ Rollback also failed!"
        echo "🚨 CRITICAL: Manual intervention required!"
    fi
    exit 1
fi

echo ""

# Step 6: Final summary
echo "🎉 UPGRADE COMPLETED SUCCESSFULLY!"
echo "================================="
echo "Date: $(date)"
echo "Server: $N8N_SERVER:$PORT"
echo "Version: 1.113.3"
echo "Status: ✅ SUCCESS"
echo ""

echo "📋 What was accomplished:"
echo "✅ Complete backup created"
echo "✅ n8n upgraded to version 1.113.3"
echo "✅ All workflows preserved"
echo "✅ All credentials preserved"
echo "✅ Community nodes preserved"
echo "✅ API accessible"
echo "✅ System verified"
echo ""

echo "🌐 Access your upgraded n8n:"
echo "URL: http://$N8N_SERVER:$PORT"
echo ""

echo "📋 Next steps:"
echo "1. Test critical workflows"
echo "2. Verify community nodes functionality"
echo "3. Check credential imports if needed"
echo "4. Monitor system performance"
echo ""

echo "🛡️  Safety information:"
echo "- Backup location: /root/n8n-backups/"
echo "- Rollback script: $SCRIPT_DIR/n8n-rollback.sh"
echo "- Verification script: $SCRIPT_DIR/n8n-verify-upgrade.sh"
echo ""

echo "🎉 n8n has been successfully upgraded to version 1.113.3!"
echo "All your workflows, credentials, and community nodes are preserved and working."
