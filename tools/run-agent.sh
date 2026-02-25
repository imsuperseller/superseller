#!/bin/bash
# run-agent.sh - Launch Claude Code with Ollama

# Directory for the bridge
BRIDGE_DIR="/Users/shaifriedman/claude-ollama-bridge"
BRIDGE_LOG="$BRIDGE_DIR/bridge.log"

# Start the bridge in the background
node "$BRIDGE_DIR/bridge.mjs" > "$BRIDGE_LOG" 2>&1 &
BRIDGE_PID=$!

# Ensure the bridge is killed when this script exits
on_exit() {
  kill $BRIDGE_PID 2>/dev/null
}
trap on_exit EXIT

# Wait for bridge to be ready
for i in {1..5}; do
  if grep -q "Bridge running" "$BRIDGE_LOG"; then
    break
  fi
  sleep 0.5
done

# Launching Claude Code with the local bridge endpoint
export ANTHROPIC_BASE_URL="http://localhost:8080/v1"
export ANTHROPIC_API_KEY="sk-ant-local"

echo "Starting Claude Code with Ollama bridge..."
claude "$@"
