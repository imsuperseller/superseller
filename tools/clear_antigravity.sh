#!/bin/bash

echo "🚀 Hunting for Antigravity zombie processes..."

# Kill the specific Language Servers that leak memory
# We use 'pkill -f' to match the full process path
pkill -9 -f "language_server_macos_arm"
pkill -9 -f "Antigravity Helper"

# Optional: Kill lingering node processes associated with the IDE
pkill -9 -f "antigravity.*node"

echo "✅ Memory cleared. Your M3 should feel snappy again!"
