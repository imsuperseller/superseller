#!/bin/bash
# Quick VPS Health Check - Run this manually in your terminal

VPS_IP="173.254.201.134"
VPS_USER="root"

echo "🔍 Quick VPS Health Check"
echo "========================"
echo ""

echo "1️⃣ Testing ping..."
if ping -c 2 -W 1 $VPS_IP > /dev/null 2>&1; then
    echo "✅ Ping successful"
else
    echo "❌ Ping failed"
fi
echo ""

echo "2️⃣ Testing SSH..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes $VPS_USER@$VPS_IP "echo OK" > /dev/null 2>&1; then
    echo "✅ SSH connection works"
    
    echo ""
    echo "3️⃣ Checking Docker..."
    ssh $VPS_USER@$VPS_IP "docker ps --format 'table {{.Names}}\t{{.Status}}' | head -5"
    
    echo ""
    echo "4️⃣ Checking n8n container..."
    ssh $VPS_USER@$VPS_IP "docker exec n8n_rensto n8n --version 2>&1 || echo 'Container not running'"
else
    echo "❌ SSH connection failed"
    echo "   Run manually: ssh $VPS_USER@$VPS_IP"
fi

echo ""
echo "🏁 Check complete"

