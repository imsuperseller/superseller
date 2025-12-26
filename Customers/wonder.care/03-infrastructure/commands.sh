#!/bin/bash
###############################################################################
# Quick Command Reference - n8n Wonder.Care
# Save time with these common commands
###############################################################################

cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║           n8n Quick Command Reference - Wonder.Care             ║
║                  Server: 192.227.249.73                         ║
╚══════════════════════════════════════════════════════════════════╝

🔗 ACCESS
─────────────────────────────────────────────────────────────────
SSH to server:
  ssh ubuntu@192.227.249.73

n8n Web UI:
  http://192.227.249.73:5678

🐳 DOCKER COMMANDS
─────────────────────────────────────────────────────────────────
View logs (follow):
  cd /home/ubuntu/n8n && docker-compose logs -f n8n

View last 100 lines:
  cd /home/ubuntu/n8n && docker-compose logs --tail=100 n8n

Restart n8n:
  cd /home/ubuntu/n8n && docker-compose restart

Stop n8n:
  cd /home/ubuntu/n8n && docker-compose stop

Start n8n:
  cd /home/ubuntu/n8n && docker-compose start

Full restart (recreate):
  cd /home/ubuntu/n8n && docker-compose down && docker-compose up -d

Check container status:
  docker ps | grep n8n

Check all containers (including stopped):
  docker ps -a | grep n8n

📊 MONITORING
─────────────────────────────────────────────────────────────────
Resource usage (live):
  docker stats n8n-wondercare

Resource usage (snapshot):
  docker stats --no-stream n8n-wondercare

Check if n8n is responding:
  curl -I http://localhost:5678

Check health endpoint:
  curl http://localhost:5678/healthz

Disk space:
  df -h
  du -sh /home/ubuntu/n8n/*

Memory usage:
  free -h

🔧 MAINTENANCE
─────────────────────────────────────────────────────────────────
Manual backup:
  cd /home/ubuntu/n8n && ./backup.sh

List backups:
  ls -lh /home/ubuntu/n8n/backups/

Restore from backup:
  cd /home/ubuntu/n8n
  docker-compose stop
  tar -xzf backups/n8n_backup_YYYYMMDD_HHMMSS.tar.gz
  docker-compose start

Update n8n to latest:
  cd /home/ubuntu/n8n
  docker-compose pull
  docker-compose up -d

Clean old Docker images:
  docker image prune -a

Clean Docker system (careful!):
  docker system prune -a

🔍 TROUBLESHOOTING
─────────────────────────────────────────────────────────────────
Check if port 5678 is in use:
  sudo lsof -i :5678
  ss -tuln | grep 5678

Check firewall status:
  sudo ufw status

View cron jobs:
  crontab -l

Check backup logs:
  tail -f /home/ubuntu/n8n/logs/backup.log

View system logs:
  journalctl -u docker -f

🔐 CREDENTIALS
─────────────────────────────────────────────────────────────────
Reset n8n owner password:
  docker exec -it n8n-wondercare n8n user:password --email=ortal@wonder.care

List n8n users:
  docker exec -it n8n-wondercare n8n user:list

🗄️ DATABASE
─────────────────────────────────────────────────────────────────
Enter n8n container:
  docker exec -it n8n-wondercare /bin/sh

View data directory:
  ls -lh /home/ubuntu/n8n/data/

Check database size:
  du -sh /home/ubuntu/n8n/data/database.sqlite

📁 FILES & DIRECTORIES
─────────────────────────────────────────────────────────────────
n8n working directory:
  cd /home/ubuntu/n8n

Configuration file:
  /home/ubuntu/n8n/docker-compose.yml

Data directory:
  /home/ubuntu/n8n/data/

Backup directory:
  /home/ubuntu/n8n/backups/

Log directory:
  /home/ubuntu/n8n/logs/

Backup script:
  /home/ubuntu/n8n/backup.sh

🚀 QUICK FIXES
─────────────────────────────────────────────────────────────────
n8n won't start:
  cd /home/ubuntu/n8n
  docker-compose down
  docker-compose up -d
  docker-compose logs -f n8n

High disk usage:
  # Clean old executions (via UI: Settings → Executions)
  # Clean old backups
  find /home/ubuntu/n8n/backups -name "*.tar.gz" -mtime +7 -delete
  # Clean Docker
  docker system prune -a

Port already in use:
  sudo lsof -i :5678
  # Kill process: sudo kill -9 <PID>

Container keeps restarting:
  docker-compose logs --tail=100 n8n
  # Check for error messages

📞 SUPPORT
─────────────────────────────────────────────────────────────────
Rensto (Technical):
  Contact: Shai Friedman

RackNerd (Server):
  API Key: KPRVI-ZWX76-X7GEF

═══════════════════════════════════════════════════════════════════

💡 TIP: Bookmark this reference or save to /home/ubuntu/commands.txt

EOF

