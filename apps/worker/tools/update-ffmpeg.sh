#!/bin/bash
# SuperSeller AI Worker: Automated FFmpeg Updater
set -e

echo "🔍 Starting FFmpeg Update Sequence based on NotebookLM ground truth..."

# Check OS to pull the appropriate statically linked build (Assuming Ubuntu/Linux for VPS)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  echo "📥 Pulling latest johnvansickle static build (amd64)..."
  wget -qO /tmp/ffmpeg-release-amd64-static.tar.xz https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz

  echo "📦 Extracting FFmpeg & ffprobe..."
  tar -xf /tmp/ffmpeg-release-amd64-static.tar.xz -C /tmp/
  
  # Find the extracted release folder dynamically
  FFMPEG_DIR=$(find /tmp -maxdepth 1 -type d -name "ffmpeg-*-amd64-static" | head -n 1)

  echo "🛡️ Installing to /usr/local/bin (requires sudo powers or root)"
  # Assuming execution as root or sudo permissions.
  cp "${FFMPEG_DIR}/ffmpeg" /usr/local/bin/ffmpeg
  cp "${FFMPEG_DIR}/ffprobe" /usr/local/bin/ffprobe
  
  chmod +x /usr/local/bin/ffmpeg
  chmod +x /usr/local/bin/ffprobe

  echo "🧹 Cleaning up tmp archives..."
  rm -rf /tmp/ffmpeg-release-amd64-static.tar.xz "$FFMPEG_DIR"

  VER=$(ffmpeg -version | head -n 1)
  echo "✅ Complete! $VER"
else
  echo "⚠️ This auto-updater is optimized for Linux VPS deployments. To update on macOS, please run 'brew upgrade ffmpeg'."
fi
