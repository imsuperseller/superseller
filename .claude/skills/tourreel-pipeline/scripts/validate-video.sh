#!/bin/bash
# TourReel Video Validator
# Usage: ./validate-video.sh <video-url-or-path>
# Options:
#   --help     Show this help message
#   --preview  Show info without downloading (URL mode)

set -euo pipefail

show_help() {
    echo "Usage: $0 <video-url-or-path> [--preview]"
    echo ""
    echo "Validate a TourReel video file for quality and format."
    echo ""
    echo "Checks:"
    echo "  - Resolution (expect 1920x1080 for master)"
    echo "  - Duration (expect > 1s)"
    echo "  - Codec (expect H.264)"
    echo "  - File size"
    echo "  - Audio track presence"
    echo ""
    echo "Options:"
    echo "  --preview  For URLs: check headers only (no download)"
    echo "  --help     Show this help message"
}

if [ $# -eq 0 ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

INPUT="$1"
PREVIEW=false
if [ "${2:-}" = "--preview" ]; then
    PREVIEW=true
fi

TEMP_FILE=""

cleanup() {
    if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
        rm -f "$TEMP_FILE"
    fi
}
trap cleanup EXIT

# Download if URL
if [[ "$INPUT" == http* ]]; then
    if [ "$PREVIEW" = true ]; then
        echo "Preview mode — checking headers only..."
        curl -sI "$INPUT" | grep -iE "content-type|content-length|status"
        exit 0
    fi
    TEMP_FILE=$(mktemp /tmp/tourreel-validate-XXXXXX.mp4)
    echo "Downloading video..."
    curl -sf -o "$TEMP_FILE" "$INPUT" || {
        echo "FAIL: Could not download video from ${INPUT}"
        exit 1
    }
    VIDEO_PATH="$TEMP_FILE"
else
    VIDEO_PATH="$INPUT"
fi

if [ ! -f "$VIDEO_PATH" ]; then
    echo "FAIL: File not found: ${VIDEO_PATH}"
    exit 1
fi

echo "Validating: ${INPUT}"
echo "---"

# Get video info
INFO=$(ffprobe -v quiet -print_format json -show_format -show_streams "$VIDEO_PATH" 2>/dev/null) || {
    echo "FAIL: ffprobe could not read file"
    exit 1
}

# Extract details
WIDTH=$(echo "$INFO" | python3 -c "import sys,json; streams=json.load(sys.stdin)['streams']; print(next(s['width'] for s in streams if s['codec_type']=='video'))" 2>/dev/null || echo "?")
HEIGHT=$(echo "$INFO" | python3 -c "import sys,json; streams=json.load(sys.stdin)['streams']; print(next(s['height'] for s in streams if s['codec_type']=='video'))" 2>/dev/null || echo "?")
CODEC=$(echo "$INFO" | python3 -c "import sys,json; streams=json.load(sys.stdin)['streams']; print(next(s['codec_name'] for s in streams if s['codec_type']=='video'))" 2>/dev/null || echo "?")
DURATION=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['format']['duration'])" 2>/dev/null || echo "?")
SIZE=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['format']['size'])" 2>/dev/null || echo "?")
HAS_AUDIO=$(echo "$INFO" | python3 -c "import sys,json; print('yes' if any(s['codec_type']=='audio' for s in json.load(sys.stdin)['streams']) else 'no')" 2>/dev/null || echo "?")

PASS=true

# Resolution check
echo -n "Resolution: ${WIDTH}x${HEIGHT} "
if [ "$WIDTH" = "1920" ] && [ "$HEIGHT" = "1080" ]; then
    echo "[PASS]"
elif [ "$WIDTH" = "1080" ] && [ "$HEIGHT" = "1920" ]; then
    echo "[PASS - vertical]"
elif [ "$WIDTH" = "1080" ] && [ "$HEIGHT" = "1080" ]; then
    echo "[PASS - square]"
else
    echo "[WARN - unexpected]"
fi

# Codec check
echo -n "Codec: ${CODEC} "
if [ "$CODEC" = "h264" ]; then
    echo "[PASS]"
else
    echo "[WARN - expected h264]"
fi

# Duration check
echo -n "Duration: ${DURATION}s "
if python3 -c "exit(0 if float('${DURATION}') > 1 else 1)" 2>/dev/null; then
    echo "[PASS]"
else
    echo "[FAIL - too short]"
    PASS=false
fi

# Audio check
echo -n "Audio: ${HAS_AUDIO} "
if [ "$HAS_AUDIO" = "yes" ]; then
    echo "[PASS]"
else
    echo "[WARN - no audio track]"
fi

# File size
SIZE_MB=$(python3 -c "print(f'{int(${SIZE:-0})/1048576:.1f}')" 2>/dev/null || echo "?")
echo "File size: ${SIZE_MB} MB"

echo "---"
if [ "$PASS" = true ]; then
    echo "RESULT: PASS"
else
    echo "RESULT: FAIL"
    exit 1
fi
