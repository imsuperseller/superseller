#!/bin/sh
# Safe execution wrapper - uses /bin/sh to bypass zsh initialization
# This prevents terminal hangs caused by direnv/nvm initialization

# Usage: safe-exec.sh "command to run"
# Example: safe-exec.sh "ssh root@173.254.201.134 'docker ps'"

if [ -z "$1" ]; then
    echo "Usage: $0 'command to run'"
    exit 1
fi

# Execute command with timeout
timeout 30 /bin/sh -c "$1" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "ERROR: Command timed out after 30 seconds"
    exit 124
fi

exit $EXIT_CODE

