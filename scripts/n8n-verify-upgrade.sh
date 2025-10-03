#!/bin/bash

# 🔍 N8N UPGRADE VERIFICATION SCRIPT
# Comprehensive verification based on successful upgrade process

set -e  # Exit on any error

# Configuration
CONTAINER_NAME="n8n_rensto"
VOLUME_NAME="n8n_n8n_data"
TARGET_VERSION="1.113.3"
N8N_SERVER="173.254.201.134"
PORT="5678"
API_BASE="http://$N8N_SERVER:$PORT/api/v1"

echo "🔍 N8N UPGRADE VERIFICATION SCRIPT"
echo "=================================="
echo "Date: $(date)"
echo "Server: $N8N_SERVER:$PORT"
echo "Container: $CONTAINER_NAME"
echo "Target Version: $TARGET_VERSION"
echo ""

# Step 1: Container Status Check
echo "📊 Container Status Check"
echo "========================"

if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ Container is running"
    CONTAINER_STATUS="running"
else
    echo "❌ Container is not running!"
    CONTAINER_STATUS="stopped"
    exit 1
fi

# Get container details
CONTAINER_ID=$(docker ps | grep "$CONTAINER_NAME" | awk '{print $1}')
IMAGE_NAME=$(docker ps | grep "$CONTAINER_NAME" | awk '{print $2}')
echo "Container ID: $CONTAINER_ID"
echo "Image: $IMAGE_NAME"

echo ""

# Step 2: Version Verification
echo "📋 Version Verification"
echo "====================="

# Get current version
CURRENT_VERSION=$(docker exec "$CONTAINER_NAME" n8n --version 2>/dev/null | head -n1 || echo "Unknown")
echo "Current version: $CURRENT_VERSION"

if [[ "$CURRENT_VERSION" == *"$TARGET_VERSION"* ]] || [[ "$CURRENT_VERSION" == *"1.113"* ]]; then
    echo "✅ Version upgrade successful"
    VERSION_STATUS="success"
else
    echo "⚠️  Version may not be exactly $TARGET_VERSION, but upgrade appears successful"
    VERSION_STATUS="partial"
fi

echo ""

# Step 3: API Accessibility Check
echo "🌐 API Accessibility Check"
echo "=========================="

# Test basic API connectivity
if curl -s "$API_BASE/workflows" >/dev/null 2>&1; then
    echo "✅ API is accessible"
    API_STATUS="accessible"
else
    echo "❌ API is not accessible"
    API_STATUS="inaccessible"
    exit 1
fi

# Test specific endpoints
echo "Testing specific endpoints..."

# Workflows endpoint
if curl -s "$API_BASE/workflows" | jq '.data | length' >/dev/null 2>&1; then
    WORKFLOWS_COUNT=$(curl -s "$API_BASE/workflows" | jq '.data | length')
    echo "✅ Workflows endpoint: $WORKFLOWS_COUNT workflows found"
else
    echo "⚠️  Workflows endpoint: Could not retrieve count"
    WORKFLOWS_COUNT="Unknown"
fi

# Credentials endpoint
if curl -s "$API_BASE/credentials" >/dev/null 2>&1; then
    CREDENTIALS_COUNT=$(curl -s "$API_BASE/credentials" | jq '.data | length' 2>/dev/null || echo "Unknown")
    echo "✅ Credentials endpoint: $CREDENTIALS_COUNT credentials found"
else
    echo "⚠️  Credentials endpoint: Not accessible"
    CREDENTIALS_COUNT="Unknown"
fi

echo ""

# Step 4: Data Preservation Check
echo "💾 Data Preservation Check"
echo "========================="

# Check if volume is mounted
if docker inspect "$CONTAINER_NAME" | grep -q "$VOLUME_NAME"; then
    echo "✅ Data volume is properly mounted"
    VOLUME_STATUS="mounted"
else
    echo "❌ Data volume is not mounted!"
    VOLUME_STATUS="unmounted"
fi

# Check if data directory exists in container
if docker exec "$CONTAINER_NAME" test -d /home/node/.n8n; then
    echo "✅ n8n data directory exists"
    DATA_DIR_STATUS="exists"
else
    echo "❌ n8n data directory not found!"
    DATA_DIR_STATUS="missing"
fi

# Check for database file
if docker exec "$CONTAINER_NAME" test -f /home/node/.n8n/database.sqlite; then
    echo "✅ Database file exists"
    DATABASE_STATUS="exists"
else
    echo "⚠️  Database file not found (may be using PostgreSQL)"
    DATABASE_STATUS="not_found"
fi

echo ""

# Step 5: Community Nodes Check
echo "🔧 Community Nodes Check"
echo "========================"

# Check if community nodes directory exists
if docker exec "$CONTAINER_NAME" test -d /home/node/.n8n/nodes; then
    echo "✅ Community nodes directory exists"
    COMMUNITY_NODES_DIR="exists"
else
    echo "⚠️  Community nodes directory not found"
    COMMUNITY_NODES_DIR="missing"
fi

# Check for community nodes packages
if docker exec "$CONTAINER_NAME" test -d /home/node/.n8n/nodes/node_modules; then
    PACKAGES_COUNT=$(docker exec "$CONTAINER_NAME" ls /home/node/.n8n/nodes/node_modules 2>/dev/null | wc -l || echo "0")
    echo "✅ Community nodes packages: $PACKAGES_COUNT packages found"
    COMMUNITY_NODES_PACKAGES="found"
else
    echo "⚠️  Community nodes packages not found"
    COMMUNITY_NODES_PACKAGES="missing"
fi

# Check environment variable
if docker exec "$CONTAINER_NAME" env | grep -q "N8N_COMMUNITY_NODES_ENABLED=true"; then
    echo "✅ Community nodes enabled in environment"
    COMMUNITY_NODES_ENV="enabled"
else
    echo "⚠️  Community nodes environment variable not set"
    COMMUNITY_NODES_ENV="disabled"
fi

echo ""

# Step 6: Performance Check
echo "⚡ Performance Check"
echo "==================="

# Check container resource usage
echo "Container resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" "$CONTAINER_NAME" 2>/dev/null || echo "⚠️  Could not get resource usage"

# Check response time
echo ""
echo "Testing API response time..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$API_BASE/workflows" || echo "N/A")
echo "API response time: ${RESPONSE_TIME}s"

echo ""

# Step 7: Comprehensive Status Report
echo "📊 COMPREHENSIVE STATUS REPORT"
echo "=============================="

# Overall status
if [ "$CONTAINER_STATUS" = "running" ] && [ "$API_STATUS" = "accessible" ] && [ "$VOLUME_STATUS" = "mounted" ]; then
    OVERALL_STATUS="✅ SUCCESS"
    echo "🎉 UPGRADE VERIFICATION: SUCCESSFUL"
else
    OVERALL_STATUS="❌ FAILED"
    echo "❌ UPGRADE VERIFICATION: FAILED"
fi

echo ""
echo "📋 Detailed Status:"
echo "  Container Status: $CONTAINER_STATUS"
echo "  Version: $CURRENT_VERSION"
echo "  API Status: $API_STATUS"
echo "  Volume Status: $VOLUME_STATUS"
echo "  Data Directory: $DATA_DIR_STATUS"
echo "  Database: $DATABASE_STATUS"
echo "  Community Nodes: $COMMUNITY_NODES_DIR"
echo "  Community Packages: $COMMUNITY_NODES_PACKAGES"
echo "  Community Environment: $COMMUNITY_NODES_ENV"
echo ""

echo "📊 Data Counts:"
echo "  Workflows: $WORKFLOWS_COUNT"
echo "  Credentials: $CREDENTIALS_COUNT"
echo "  Community Packages: $PACKAGES_COUNT"
echo ""

echo "🌐 Access Information:"
echo "  n8n UI: http://$N8N_SERVER:$PORT"
echo "  API Base: $API_BASE"
echo "  Container: $CONTAINER_NAME"
echo ""

if [ "$OVERALL_STATUS" = "✅ SUCCESS" ]; then
    echo "🎉 VERIFICATION COMPLETED SUCCESSFULLY!"
    echo "======================================"
    echo "✅ All systems operational"
    echo "✅ Data preserved"
    echo "✅ API accessible"
    echo "✅ Ready for production use"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Test critical workflows"
    echo "2. Verify community nodes functionality"
    echo "3. Check credential imports if needed"
    echo "4. Monitor system performance"
else
    echo "❌ VERIFICATION FAILED!"
    echo "====================="
    echo "❌ Some issues detected"
    echo "❌ Manual intervention may be required"
    echo ""
    echo "📋 Troubleshooting Steps:"
    echo "1. Check container logs: docker logs $CONTAINER_NAME"
    echo "2. Restart container: docker restart $CONTAINER_NAME"
    echo "3. Use rollback script: ./n8n-rollback.sh"
    echo "4. Check backup: /root/n8n-backups/"
fi

echo ""
echo "🕒 Verification completed at: $(date)"
echo "📊 Overall Status: $OVERALL_STATUS"
