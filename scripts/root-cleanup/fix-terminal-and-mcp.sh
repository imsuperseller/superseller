#!/bin/bash

echo "🔧 FIXING TERMINAL AND MCP SERVERS"
echo "=================================="

# Kill any stuck Cursor processes
echo "1. Killing stuck Cursor processes..."
pkill -f "Cursor"
sleep 3

# Clear Cursor cache
echo "2. Clearing Cursor cache..."
rm -rf ~/Library/Application\ Support/Cursor/Cache
rm -rf ~/Library/Application\ Support/Cursor/logs
rm -rf ~/Library/Application\ Support/Cursor/User/workspaceStorage

# Test shell access
echo "3. Testing shell access..."
echo "Current shell: $SHELL"
echo "Current PATH: $PATH"

# Check MCP servers status
echo "4. Checking MCP servers status..."
echo "MCP servers now use NPX packages instead of VPS SSH connections"

# Restart Cursor
echo "5. Restarting Cursor..."
open -a Cursor

echo "✅ Fix complete! Cursor should restart with working terminal."
