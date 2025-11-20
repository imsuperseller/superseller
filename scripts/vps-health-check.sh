#!/bin/sh
# VPS Health Check - Uses /bin/sh to bypass zsh initialization issues
# This prevents terminal hangs caused by direnv/nvm initialization

set -e

VPS_IP="173.254.201.134"
VPS_USER="root"
TIMEOUT_SECONDS=10

echo "🔍 VPS Health Check - $(date)"
echo "================================"
echo ""

# Function to run command with timeout using background process
run_with_timeout() {
    local timeout=$1
    shift
    local cmd="$@"
    
    # Run command in background
    eval "$cmd" &
    local pid=$!
    
    # Wait for timeout or completion
    local count=0
    while kill -0 $pid 2>/dev/null; do
        sleep 1
        count=$((count + 1))
        if [ $count -ge $timeout ]; then
            echo "⏱️  Timeout after ${timeout}s - killing process"
            kill -9 $pid 2>/dev/null || true
            wait $pid 2>/dev/null || true
            return 124
        fi
    done
    
    # Wait for process to finish and get exit code
    wait $pid
    return $?
}

# Test 1: Ping check
echo "1️⃣ Testing ping connectivity..."
if run_with_timeout 5 "ping -c 2 -W 1 $VPS_IP > /dev/null 2>&1"; then
    echo "✅ Ping successful"
else
    echo "❌ Ping failed or timed out"
fi
echo ""

# Test 2: SSH connection test (quick)
echo "2️⃣ Testing SSH connection..."
SSH_TEST=$(run_with_timeout 8 "ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -o BatchMode=yes $VPS_USER@$VPS_IP 'echo OK' 2>&1" 2>&1)
SSH_EXIT=$?

if [ $SSH_EXIT -eq 0 ]; then
    echo "✅ SSH connection successful"
    echo "   Response: $SSH_TEST"
elif [ $SSH_EXIT -eq 124 ]; then
    echo "⏱️  SSH connection timed out"
else
    echo "❌ SSH connection failed"
    echo "   Error: $SSH_TEST"
fi
echo ""

# Test 3: Docker check (if SSH works)
if [ $SSH_EXIT -eq 0 ]; then
    echo "3️⃣ Checking Docker status..."
    DOCKER_CHECK=$(run_with_timeout 10 "ssh -o ConnectTimeout=3 $VPS_USER@$VPS_IP 'docker ps --format \"table {{.Names}}\\t{{.Status}}\" | head -5' 2>&1" 2>&1)
    DOCKER_EXIT=$?
    
    if [ $DOCKER_EXIT -eq 0 ]; then
        echo "✅ Docker accessible"
        echo "$DOCKER_CHECK"
    else
        echo "❌ Docker check failed or timed out"
        echo "   Output: $DOCKER_CHECK"
    fi
    echo ""
    
    # Test 4: n8n container check
    echo "4️⃣ Checking n8n container..."
    N8N_CHECK=$(run_with_timeout 8 "ssh -o ConnectTimeout=3 $VPS_USER@$VPS_IP 'docker exec n8n_rensto n8n --version 2>&1 || echo \"CONTAINER_NOT_RUNNING\"' 2>&1" 2>&1)
    N8N_EXIT=$?
    
    if [ $N8N_EXIT -eq 0 ]; then
        echo "✅ n8n container accessible"
        echo "   Version: $N8N_CHECK"
    else
        echo "❌ n8n container check failed"
        echo "   Output: $N8N_CHECK"
    fi
else
    echo "⏭️  Skipping Docker checks (SSH not available)"
fi

echo ""
echo "🏁 Health check complete - $(date)"

