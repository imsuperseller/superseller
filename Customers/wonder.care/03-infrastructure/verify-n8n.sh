#!/bin/bash
###############################################################################
# n8n Installation Verification Script
# Customer: Wonder.Care (Ortal Flanary)
# Purpose: Verify n8n installation is working correctly
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_IP="192.227.249.73"
N8N_PORT="5678"
INSTALL_DIR="/home/ubuntu/n8n"

###############################################################################
# Test Functions
###############################################################################

print_test() {
    echo -e "${BLUE}[TEST] $1${NC}"
}

print_pass() {
    echo -e "${GREEN}  ✓ PASS: $1${NC}"
}

print_fail() {
    echo -e "${RED}  ✗ FAIL: $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}  ⚠ WARN: $1${NC}"
}

print_header() {
    echo ""
    echo "======================================================================"
    echo "$1"
    echo "======================================================================"
}

###############################################################################
# Verification Tests
###############################################################################

test_docker_installed() {
    print_test "Checking if Docker is installed"
    
    if command -v docker &> /dev/null; then
        VERSION=$(docker --version)
        print_pass "Docker installed: $VERSION"
        return 0
    else
        print_fail "Docker not installed"
        return 1
    fi
}

test_docker_compose_installed() {
    print_test "Checking if Docker Compose is installed"
    
    if command -v docker-compose &> /dev/null; then
        VERSION=$(docker-compose --version)
        print_pass "Docker Compose installed: $VERSION"
        return 0
    else
        print_fail "Docker Compose not installed"
        return 1
    fi
}

test_directory_structure() {
    print_test "Checking directory structure"
    
    ERRORS=0
    
    if [ -d "$INSTALL_DIR" ]; then
        print_pass "Installation directory exists: $INSTALL_DIR"
    else
        print_fail "Installation directory missing: $INSTALL_DIR"
        ERRORS=$((ERRORS + 1))
    fi
    
    for dir in data backups logs; do
        if [ -d "$INSTALL_DIR/$dir" ]; then
            print_pass "Directory exists: $dir"
        else
            print_fail "Directory missing: $dir"
            ERRORS=$((ERRORS + 1))
        fi
    done
    
    if [ -f "$INSTALL_DIR/docker-compose.yml" ]; then
        print_pass "docker-compose.yml exists"
    else
        print_fail "docker-compose.yml missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ -f "$INSTALL_DIR/backup.sh" ]; then
        print_pass "backup.sh exists"
    else
        print_fail "backup.sh missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    return $ERRORS
}

test_container_running() {
    print_test "Checking if n8n container is running"
    
    if docker ps | grep -q "n8n-wondercare"; then
        print_pass "Container is running"
        
        # Show container details
        echo ""
        docker ps --filter "name=n8n-wondercare" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
        return 0
    else
        print_fail "Container is not running"
        
        # Check if container exists but is stopped
        if docker ps -a | grep -q "n8n-wondercare"; then
            print_warn "Container exists but is stopped"
            echo "  Start it with: cd $INSTALL_DIR && docker-compose start"
        else
            print_warn "Container does not exist"
            echo "  Create it with: cd $INSTALL_DIR && docker-compose up -d"
        fi
        
        return 1
    fi
}

test_port_listening() {
    print_test "Checking if n8n port is listening"
    
    if netstat -tuln 2>/dev/null | grep -q ":$N8N_PORT " || ss -tuln 2>/dev/null | grep -q ":$N8N_PORT "; then
        print_pass "Port $N8N_PORT is listening"
        return 0
    else
        print_fail "Port $N8N_PORT is not listening"
        return 1
    fi
}

test_http_response() {
    print_test "Checking if n8n responds to HTTP requests"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$N8N_PORT 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "302" ]; then
        print_pass "n8n responds with HTTP $HTTP_CODE"
        return 0
    elif [ "$HTTP_CODE" == "000" ]; then
        print_fail "Cannot connect to n8n"
        return 1
    else
        print_warn "n8n responds with HTTP $HTTP_CODE (expected 200 or 302)"
        return 0
    fi
}

test_health_endpoint() {
    print_test "Checking n8n health endpoint"
    
    HEALTH=$(curl -s http://localhost:$N8N_PORT/healthz 2>/dev/null || echo "ERROR")
    
    if [ "$HEALTH" == '{"status":"ok"}' ]; then
        print_pass "Health endpoint returns OK"
        return 0
    else
        print_warn "Health endpoint response: $HEALTH"
        return 0
    fi
}

test_resource_usage() {
    print_test "Checking resource usage"
    
    if docker ps | grep -q "n8n-wondercare"; then
        echo ""
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" n8n-wondercare
        echo ""
        print_pass "Resource usage displayed above"
        return 0
    else
        print_fail "Cannot check resource usage (container not running)"
        return 1
    fi
}

test_disk_space() {
    print_test "Checking disk space"
    
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -lt 80 ]; then
        print_pass "Disk usage: ${DISK_USAGE}%"
        return 0
    elif [ "$DISK_USAGE" -lt 90 ]; then
        print_warn "Disk usage: ${DISK_USAGE}% (consider cleanup)"
        return 0
    else
        print_fail "Disk usage: ${DISK_USAGE}% (critically high)"
        return 1
    fi
}

test_firewall() {
    print_test "Checking firewall rules"
    
    if command -v ufw &> /dev/null; then
        if sudo ufw status | grep -q "$N8N_PORT"; then
            print_pass "Firewall allows port $N8N_PORT"
            return 0
        else
            print_warn "Firewall rule for port $N8N_PORT not found"
            echo "  Add with: sudo ufw allow $N8N_PORT/tcp"
            return 0
        fi
    else
        print_warn "UFW not installed (firewall check skipped)"
        return 0
    fi
}

test_backup_cron() {
    print_test "Checking backup cron job"
    
    if crontab -l 2>/dev/null | grep -q "n8n/backup.sh"; then
        print_pass "Backup cron job is configured"
        echo "  Cron entry:"
        crontab -l | grep "n8n/backup.sh"
        return 0
    else
        print_warn "Backup cron job not found"
        echo "  Add with: (crontab -l 2>/dev/null; echo '0 3 * * * $INSTALL_DIR/backup.sh') | crontab -"
        return 0
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "n8n Installation Verification"
    echo "Customer: Wonder.Care (Ortal Flanary)"
    echo "Server: $SERVER_IP"
    echo "Test Date: $(date)"
    echo ""
    
    TOTAL_TESTS=0
    PASSED_TESTS=0
    FAILED_TESTS=0
    
    # Run all tests
    run_test() {
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        if $1; then
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        echo ""
    }
    
    run_test test_docker_installed
    run_test test_docker_compose_installed
    run_test test_directory_structure
    run_test test_container_running
    run_test test_port_listening
    run_test test_http_response
    run_test test_health_endpoint
    run_test test_resource_usage
    run_test test_disk_space
    run_test test_firewall
    run_test test_backup_cron
    
    # Summary
    print_header "Verification Summary"
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed! n8n is ready to use.${NC}"
        echo ""
        echo "Access n8n at: http://$SERVER_IP:$N8N_PORT"
        echo ""
        exit 0
    else
        echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
        echo ""
        echo "Common fixes:"
        echo "  - Start n8n: cd $INSTALL_DIR && docker-compose up -d"
        echo "  - View logs: cd $INSTALL_DIR && docker-compose logs -f n8n"
        echo "  - Restart: cd $INSTALL_DIR && docker-compose restart"
        echo ""
        exit 1
    fi
}

# Run main function
main

