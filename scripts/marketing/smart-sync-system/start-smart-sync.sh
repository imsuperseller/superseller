#!/bin/bash

# 🧠 SMART SYNC SYSTEM STARTUP SCRIPT
# 
# Starts the Smart Sync System with all components:
# - Smart Sync Engine (real-time monitoring)
# - Project Delivery Automation
# - Admin Dashboard Integration

echo "🧠 Starting Smart Sync System..."

# Set environment variables
export NODE_ENV=production
export LOG_LEVEL=info

# Create logs directory
mkdir -p logs/smart-sync

# Function to start a service
start_service() {
    local service_name=$1
    local script_path=$2
    local log_file="logs/smart-sync/${service_name}.log"
    
    echo "🚀 Starting $service_name..."
    
    # Start service in background
    nohup node "$script_path" > "$log_file" 2>&1 &
    local pid=$!
    
    # Save PID
    echo $pid > "logs/smart-sync/${service_name}.pid"
    
    echo "✅ $service_name started with PID: $pid"
    echo "📋 Logs: $log_file"
}

# Check if services are already running
check_service() {
    local service_name=$1
    local pid_file="logs/smart-sync/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "⚠️  $service_name is already running with PID: $pid"
            return 1
        else
            echo "🧹 Cleaning up stale PID file for $service_name"
            rm -f "$pid_file"
        fi
    fi
    return 0
}

# Start Smart Sync Engine
if check_service "smart-sync-engine"; then
    start_service "smart-sync-engine" "scripts/smart-sync-system/smart-sync-engine.js"
fi

# Start Project Delivery Automation
if check_service "project-delivery-automation"; then
    start_service "project-delivery-automation" "scripts/smart-sync-system/project-delivery-automation.js"
fi

# Wait a moment for services to initialize
sleep 3

# Check service health
check_health() {
    local service_name=$1
    local pid_file="logs/smart-sync/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "✅ $service_name is healthy (PID: $pid)"
            return 0
        else
            echo "❌ $service_name is not running"
            return 1
        fi
    else
        echo "❌ $service_name PID file not found"
        return 1
    fi
}

echo ""
echo "🏥 Checking service health..."

# Check all services
smart_sync_healthy=false
project_automation_healthy=false

if check_health "smart-sync-engine"; then
    smart_sync_healthy=true
fi

if check_health "project-delivery-automation"; then
    project_automation_healthy=true
fi

echo ""
echo "📊 Smart Sync System Status:"
echo "================================"

if [ "$smart_sync_healthy" = true ] && [ "$project_automation_healthy" = true ]; then
    echo "🎉 All services are running successfully!"
    echo ""
    echo "🔗 Access Points:"
    echo "  • Admin Dashboard: https://admin.superseller.agency/admin/sync"
    echo "  • Smart Sync API: https://admin.superseller.agency/api/sync-health"
    echo ""
    echo "📋 Service Management:"
    echo "  • View logs: tail -f logs/smart-sync/*.log"
    echo "  • Stop services: ./scripts/smart-sync-system/stop-smart-sync.sh"
    echo "  • Restart services: ./scripts/smart-sync-system/restart-smart-sync.sh"
    echo ""
    echo "🎯 Features Active:"
    echo "  ✅ Real-time data synchronization monitoring"
    echo "  ✅ Automated conflict detection and resolution"
    echo "  ✅ Project milestone tracking and billing"
    echo "  ✅ Client notification automation"
    echo "  ✅ Admin dashboard integration"
    echo ""
    echo "🚀 Smart Sync System is ready for production!"
    
else
    echo "❌ Some services failed to start:"
    [ "$smart_sync_healthy" = false ] && echo "  • Smart Sync Engine"
    [ "$project_automation_healthy" = false ] && echo "  • Project Delivery Automation"
    echo ""
    echo "🔍 Check logs for details:"
    echo "  • Smart Sync Engine: tail -f logs/smart-sync/smart-sync-engine.log"
    echo "  • Project Automation: tail -f logs/smart-sync/project-delivery-automation.log"
    echo ""
    echo "🛠️  Troubleshooting:"
    echo "  • Ensure all environment variables are set"
    echo "  • Check API credentials and permissions"
    echo "  • Verify network connectivity to external services"
    exit 1
fi

echo ""
echo "⏰ Smart Sync System started at: $(date)"
echo "🔄 Monitoring will begin automatically..."