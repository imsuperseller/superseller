#!/usr/bin/env bash
# Deploy apps/worker to RackNerd. Run: VPS_PASSWORD=xxx ./apps/worker/deploy-to-racknerd.sh
# Or: RACKNERD_SSH_PASSWORD=xxx ./apps/worker/deploy-to-racknerd.sh
set -e
PASS="${VPS_PASSWORD:-$RACKNERD_SSH_PASSWORD}"
if [ -z "$PASS" ]; then
  echo "Error: Set VPS_PASSWORD or RACKNERD_SSH_PASSWORD"
  exit 1
fi
HOST="172.245.56.50"
REMOTE_DIR="/opt/tourreel-worker"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Deploying worker from $REPO_ROOT to root@$HOST:$REMOTE_DIR..."
sshpass -p "$PASS" rsync -avz --delete \
  --exclude node_modules \
  --exclude .env \
  --exclude "*.log" \
  "$REPO_ROOT/apps/worker/" "root@$HOST:$REMOTE_DIR/apps/worker/"

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no root@$HOST "cd $REMOTE_DIR/apps/worker && npm install --production && pm2 restart tourreel-worker --update-env"
echo "Done. Verify: curl -s http://$HOST:3002/api/health"
