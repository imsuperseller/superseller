#!/bin/bash
# n8n-mcp Docker Wrapper Script
# Purpose: Fixes stdin closing issue with n8n-mcp Docker container
# Author: Claude AI (with Shai)
# Date: October 9, 2025
#
# Problem: Docker stdio MCP servers close when stdin closes
# Solution: Keep stdin open with a background sleep process
#
# Usage: This script is called by Claude Code's MCP system
# Configuration: Set in ~/.cursor/mcp.json

set -euo pipefail

# Get instance config from environment (set by MCP config)
N8N_API_URL="${N8N_API_URL:-}"
N8N_API_KEY="${N8N_API_KEY:-}"
LOG_LEVEL="${LOG_LEVEL:-error}"
MCP_MODE="${MCP_MODE:-stdio}"

# Validate required vars
if [[ -z "$N8N_API_URL" ]] || [[ -z "$N8N_API_KEY" ]]; then
    echo '{"error":"Missing N8N_API_URL or N8N_API_KEY"}' >&2
    exit 1
fi

# Create temporary named pipe for communication
PIPE_FILE="/tmp/n8n-mcp-pipe-$$"
mkfifo "$PIPE_FILE" 2>/dev/null || {
    echo '{"error":"Failed to create named pipe"}' >&2
    exit 1
}

# Cleanup function
cleanup() {
    rm -f "$PIPE_FILE"
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start background process to keep stdin open
# This cat will keep reading stdin and writing to pipe
# It adds a small delay after each message to give server time to respond
(
    while IFS= read -r line; do
        echo "$line" > "$PIPE_FILE"
        # Wait for response (MCP responses are typically < 5 seconds)
        sleep 0.5
    done
    # After stdin closes, keep pipe open for 5 more seconds
    sleep 5
) &
CAT_PID=$!

# Run Docker container with the pipe
# Using --init ensures proper signal handling
# Using --rm ensures container cleanup
docker run -i --rm --init \
    -e MCP_MODE="$MCP_MODE" \
    -e LOG_LEVEL="$LOG_LEVEL" \
    -e DISABLE_CONSOLE_OUTPUT=true \
    -e N8N_API_URL="$N8N_API_URL" \
    -e N8N_API_KEY="$N8N_API_KEY" \
    ghcr.io/czlonkowski/n8n-mcp:2.18.0 \
    < "$PIPE_FILE" 2>&1

# Wait for background process to finish
wait $CAT_PID 2>/dev/null || true

exit 0
