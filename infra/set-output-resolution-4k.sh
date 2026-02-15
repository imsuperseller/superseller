#!/usr/bin/env bash
# Set OUTPUT_RESOLUTION=4k on RackNerd video worker
# Run: VPS_PASSWORD=your-password ./infra/set-output-resolution-4k.sh

set -e
PASS="${VPS_PASSWORD:-$RACKNERD_SSH_PASSWORD}"
if [ -z "$PASS" ]; then
  echo "Error: Set VPS_PASSWORD or RACKNERD_SSH_PASSWORD"
  exit 1
fi

echo "Setting OUTPUT_RESOLUTION=4k on RackNerd worker..."

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no root@172.245.56.50 'bash -s' << 'REMOTE'
WORKER_DIR="/opt/tourreel-worker"
ENV_FILE="$WORKER_DIR/apps/worker/.env"
ROOT_ENV="$WORKER_DIR/.env"

for f in "$ENV_FILE" "$ROOT_ENV"; do
  if [ -f "$f" ]; then
    if grep -q "^OUTPUT_RESOLUTION=" "$f" 2>/dev/null; then
      sed -i.bak "s/^OUTPUT_RESOLUTION=.*/OUTPUT_RESOLUTION=4k/" "$f"
      echo "Updated OUTPUT_RESOLUTION in $f"
    else
      echo "OUTPUT_RESOLUTION=4k" >> "$f"
      echo "Added OUTPUT_RESOLUTION=4k to $f"
    fi
    break
  fi
done

# If neither existed, create in worker dir
if [ ! -f "$ENV_FILE" ] && [ ! -f "$ROOT_ENV" ]; then
  mkdir -p "$(dirname "$ENV_FILE")"
  echo "OUTPUT_RESOLUTION=4k" >> "$ENV_FILE"
  echo "Created $ENV_FILE with OUTPUT_RESOLUTION=4k"
fi

pm2 restart tourreel-worker --update-env
echo "Restarted pm2 tourreel-worker"
REMOTE

echo "Done. Verify: curl -s http://172.245.56.50:3002/api/health"
