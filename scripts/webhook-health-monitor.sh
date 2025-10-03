#!/bin/bash
# 🚀 WEBHOOK HEALTH MONITOR
# Automated monitoring for all webhooks in the Rensto system

# Configuration
LOG_DIR="/Users/shaifriedman/New Rensto/rensto/logs/webhook-monitoring"
LOG_FILE="$LOG_DIR/webhook-health-$(date +%Y%m%d).log"
ALERT_LOG="$LOG_DIR/webhook-alerts.log"
WEBHOOKS_CONFIG="/Users/shaifriedman/New Rensto/rensto/scripts/webhook-config.json"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send alert
send_alert() {
    local webhook_url="$1"
    local status="$2"
    local message="$3"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 ALERT: $webhook_url - $status - $message" | tee -a "$ALERT_LOG"
    
    # You can add email/Slack notifications here
    # curl -X POST "YOUR_SLACK_WEBHOOK" -d "{\"text\":\"🚨 Webhook Alert: $webhook_url is $status\"}"
}

# Function to test webhook
test_webhook() {
    local webhook_url="$1"
    local event_type="$2"
    local webhook_name="$3"
    local timeout="${4:-10}"
    
    log "🔍 Testing webhook: $webhook_name ($webhook_url)"
    
    # Prepare test data
    local test_data='{
        "eventType": "'$event_type'",
        "data": {
            "test": true,
            "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
            "source": "health-monitor",
            "webhookName": "'$webhook_name'"
        }
    }'
    
    # Test webhook with timeout
    local response
    response=$(timeout "$timeout" curl -s -w "%{http_code}|%{time_total}|%{size_download}" \
        -X POST "$webhook_url" \
        -H "Content-Type: application/json" \
        -d "$test_data" 2>/dev/null)
    
    local exit_code=$?
    
    if [ $exit_code -eq 124 ]; then
        log "❌ $webhook_name - TIMEOUT (${timeout}s)"
        send_alert "$webhook_url" "TIMEOUT" "Webhook timed out after ${timeout}s"
        return 1
    elif [ $exit_code -ne 0 ]; then
        log "❌ $webhook_name - CONNECTION ERROR (exit code: $exit_code)"
        send_alert "$webhook_url" "CONNECTION_ERROR" "Failed to connect to webhook"
        return 1
    fi
    
    # Parse response
    local http_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    local response_size=$(echo "$response" | cut -d'|' -f3)
    local response_body="${response%|*|*|*}"
    
    # Check response
    if [ "$http_code" = "200" ]; then
        log "✅ $webhook_name - HEALTHY (HTTP $http_code, ${response_time}s, ${response_size} bytes)"
        return 0
    else
        log "❌ $webhook_name - UNHEALTHY (HTTP $http_code, ${response_time}s)"
        log "Response: $response_body"
        send_alert "$webhook_url" "HTTP_$http_code" "Webhook returned HTTP $http_code"
        return 1
    fi
}

# Function to generate webhook configuration
generate_config() {
    cat > "$WEBHOOKS_CONFIG" << 'EOF'
{
  "webhooks": [
    {
      "name": "Shelly Insurance Analysis",
      "url": "https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis",
      "eventType": "HarbDataLoaded",
      "timeout": 15,
      "critical": true,
      "owner": "Shelly"
    },
    {
      "name": "SaaS Lead Enrichment",
      "url": "http://173.254.201.134:5678/webhook/lead-enrichment-saas",
      "eventType": "lead.created",
      "timeout": 10,
      "critical": true,
      "owner": "SaaS System"
    }
  ],
  "settings": {
    "retryAttempts": 3,
    "retryDelay": 5,
    "alertThreshold": 2,
    "healthCheckInterval": 300
  }
}
EOF
    log "📝 Generated webhook configuration: $WEBHOOKS_CONFIG"
}

# Function to load webhook configuration
load_config() {
    if [ ! -f "$WEBHOOKS_CONFIG" ]; then
        log "⚠️  Webhook configuration not found, generating default..."
        generate_config
    fi
    
    # Parse JSON and extract webhook info
    local webhooks
    webhooks=$(jq -r '.webhooks[] | "\(.name)|\(.url)|\(.eventType)|\(.timeout)|\(.critical)|\(.owner)"' "$WEBHOOKS_CONFIG" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        log "❌ Failed to parse webhook configuration"
        return 1
    fi
    
    echo "$webhooks"
}

# Function to run health check
run_health_check() {
    local webhooks
    webhooks=$(load_config)
    
    if [ $? -ne 0 ]; then
        log "❌ Failed to load webhook configuration"
        exit 1
    fi
    
    log "🚀 Starting webhook health check..."
    log "📊 Testing $(echo "$webhooks" | wc -l) webhooks"
    
    local healthy_count=0
    local total_count=0
    local critical_failures=0
    
    while IFS='|' read -r name url event_type timeout critical owner; do
        total_count=$((total_count + 1))
        
        if test_webhook "$url" "$event_type" "$name" "$timeout"; then
            healthy_count=$((healthy_count + 1))
        else
            if [ "$critical" = "true" ]; then
                critical_failures=$((critical_failures + 1))
            fi
        fi
        
        # Small delay between tests
        sleep 1
        
    done <<< "$webhooks"
    
    # Summary
    local unhealthy_count=$((total_count - healthy_count))
    log "📊 Health Check Summary:"
    log "   Total Webhooks: $total_count"
    log "   Healthy: $healthy_count"
    log "   Unhealthy: $unhealthy_count"
    log "   Critical Failures: $critical_failures"
    
    if [ $critical_failures -gt 0 ]; then
        log "🚨 CRITICAL: $critical_failures critical webhooks are down!"
        send_alert "SYSTEM" "CRITICAL_FAILURE" "$critical_failures critical webhooks are down"
        exit 1
    elif [ $unhealthy_count -gt 0 ]; then
        log "⚠️  WARNING: $unhealthy_count webhooks are unhealthy"
        exit 2
    else
        log "✅ All webhooks are healthy!"
        exit 0
    fi
}

# Function to show status dashboard
show_dashboard() {
    echo -e "${BLUE}🔍 WEBHOOK STATUS DASHBOARD${NC}"
    echo -e "${BLUE}==========================${NC}"
    echo ""
    
    local webhooks
    webhooks=$(load_config)
    
    while IFS='|' read -r name url event_type timeout critical owner; do
        echo -e "${YELLOW}📡 $name${NC} ($owner)"
        echo -e "   URL: $url"
        echo -e "   Event: $event_type"
        echo -e "   Critical: $critical"
        
        # Quick status check
        local status_code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d '{"eventType": "'$event_type'", "test": true}' \
            --max-time 5 2>/dev/null)
        
        if [ "$status_code" = "200" ]; then
            echo -e "   Status: ${GREEN}✅ HEALTHY${NC}"
        else
            echo -e "   Status: ${RED}❌ UNHEALTHY (HTTP $status_code)${NC}"
        fi
        echo ""
        
    done <<< "$webhooks"
    
    echo -e "${BLUE}📊 Recent Activity:${NC}"
    if [ -f "$LOG_FILE" ]; then
        tail -5 "$LOG_FILE"
    else
        echo "No recent activity logged"
    fi
}

# Function to show help
show_help() {
    echo "🚀 Webhook Health Monitor"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  check     Run health check on all webhooks"
    echo "  dashboard Show status dashboard"
    echo "  config    Generate webhook configuration"
    echo "  logs      Show recent logs"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 check              # Run health check"
    echo "  $0 dashboard          # Show status dashboard"
    echo "  $0 logs               # Show recent logs"
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Recent Webhook Health Logs${NC}"
    echo -e "${BLUE}=============================${NC}"
    echo ""
    
    if [ -f "$LOG_FILE" ]; then
        tail -20 "$LOG_FILE"
    else
        echo "No logs found"
    fi
    
    echo ""
    echo -e "${BLUE}🚨 Recent Alerts${NC}"
    echo -e "${BLUE}================${NC}"
    
    if [ -f "$ALERT_LOG" ]; then
        tail -10 "$ALERT_LOG"
    else
        echo "No alerts found"
    fi
}

# Main script logic
case "${1:-check}" in
    "check")
        run_health_check
        ;;
    "dashboard")
        show_dashboard
        ;;
    "config")
        generate_config
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
