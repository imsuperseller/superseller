#!/bin/bash
# VideoForge Job Status Checker
# Usage: ./check-job-status.sh <job-id> [--watch]
# Options:
#   --watch    Poll every 30s until job completes
#   --help     Show this help message

set -euo pipefail

WORKER_URL="${WORKER_URL:-http://172.245.56.50:3002}"

show_help() {
    echo "Usage: $0 <job-id> [--watch]"
    echo ""
    echo "Check VideoForge video job status."
    echo ""
    echo "Arguments:"
    echo "  job-id    The UUID of the video job"
    echo ""
    echo "Options:"
    echo "  --watch   Poll every 30s until complete/failed"
    echo "  --help    Show this help message"
    echo ""
    echo "Environment:"
    echo "  WORKER_URL  Worker base URL (default: http://172.245.56.50:3002)"
}

if [ $# -eq 0 ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

JOB_ID="$1"
WATCH=false

if [ "${2:-}" = "--watch" ]; then
    WATCH=true
fi

check_status() {
    local response
    response=$(curl -sf "${WORKER_URL}/api/jobs/${JOB_ID}" 2>/dev/null) || {
        echo "ERROR: Could not reach worker at ${WORKER_URL}"
        return 1
    }

    local status progress step error master_url
    status=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['job']['status'])" 2>/dev/null || echo "unknown")
    progress=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['job']['progress_percent'])" 2>/dev/null || echo "?")
    step=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['job']['current_step'])" 2>/dev/null || echo "?")
    error=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['job'].get('error_message') or 'none')" 2>/dev/null || echo "?")
    master_url=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['job'].get('master_video_url') or 'none')" 2>/dev/null || echo "none")

    echo "[$(date '+%H:%M:%S')] Status: ${status} | Progress: ${progress}% | Step: ${step}"

    if [ "$error" != "none" ] && [ "$error" != "?" ]; then
        echo "  Error: ${error}"
    fi

    if [ "$master_url" != "none" ]; then
        echo "  Master: ${master_url}"
    fi

    if [ "$status" = "complete" ] || [ "$status" = "failed" ]; then
        return 2  # Signal done
    fi

    return 0
}

if [ "$WATCH" = true ]; then
    echo "Watching job ${JOB_ID} (Ctrl+C to stop)..."
    while true; do
        check_status || true
        status_code=$?
        if [ $status_code -eq 2 ]; then
            echo "Job finished."
            exit 0
        fi
        sleep 30
    done
else
    check_status
fi
