#!/usr/bin/env bash
# Deploy apps/worker to RackNerd.
# Uses: VPS_PASSWORD or RACKNERD_SSH_PASSWORD from env, or .env.racknerd (copy from racknerd-credentials.example)
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
[ -f "$REPO_ROOT/.env.racknerd" ] && set -a && . "$REPO_ROOT/.env.racknerd" && set +a
PASS="${VPS_PASSWORD:-$RACKNERD_SSH_PASSWORD}"
if [ -z "$PASS" ]; then
  echo "Error: Set VPS_PASSWORD or RACKNERD_SSH_PASSWORD"
  exit 1
fi
HOST="172.245.56.50"
REMOTE_DIR="/opt/tourreel-worker"

echo "Deploying worker from $REPO_ROOT to root@$HOST:$REMOTE_DIR..."
sshpass -p "$PASS" rsync -avz --delete \
  --exclude node_modules \
  --exclude .env \
  --exclude "*.log" \
  "$REPO_ROOT/apps/worker/" "root@$HOST:$REMOTE_DIR/apps/worker/"

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no root@$HOST "cd $REMOTE_DIR/apps/worker && npm install --production && pm2 restart tourreel-worker --update-env"

echo "Configuring FFmpeg Auto-Updater Cron Job..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no root@$HOST "chmod +x $REMOTE_DIR/apps/worker/tools/update-ffmpeg.sh && (crontab -l | grep -v 'update-ffmpeg.sh' ; echo '0 0 * * * $REMOTE_DIR/apps/worker/tools/update-ffmpeg.sh >> /var/log/ffmpeg-update.log 2>&1') | crontab -"

echo "Verifying deployment..."
for i in $(seq 1 10); do
  HEALTH=$(sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no root@$HOST "curl -sf http://localhost:3002/api/health 2>/dev/null" || true)
  if echo "$HEALTH" | grep -q '"status"'; then
    echo "Deploy OK: $HEALTH"
    exit 0
  fi
  echo "  Waiting for worker to start ($i/10)..."
  sleep 3
done
echo "WARNING: Worker health check failed after 30s. Check: ssh root@$HOST 'pm2 logs tourreel-worker --lines 20'"
exit 1
