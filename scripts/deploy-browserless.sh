#!/bin/bash

###############################################################################
# Deploy Browserless Service to n8n Server
# Adds Browserless to existing docker-compose.yml and deploys it
###############################################################################

set -e

SERVER_IP="172.245.56.50"
SERVER_USER="root"
PASSWORD="y0JEu4uI0hAQ606Mfr"
COMPOSE_FILE="/opt/n8n/docker-compose.yml"
BACKUP_FILE="/opt/n8n/docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "======================================================================"
echo "Browserless Deployment Script"
echo "======================================================================"
echo ""

# Generate secure token
TOKEN="browserless-rensto-$(openssl rand -hex 16 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)"

echo -e "${YELLOW}Generated Token:${NC} $TOKEN"
echo ""

# Create Browserless service block
BROWSERLESS_SERVICE=$(cat <<EOF
  browserless:
    image: browserless/chromium:latest
    container_name: browserless_rensto
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - TOKEN=$TOKEN
      - CONCURRENT=10
      - MAX_CONCURRENT=50
      - QUEUE_LENGTH=100
      - PREBOOT_CHROME=true
      - TZ=America/Chicago
      - KEEP_ALIVE=true
      - MAX_CONCURRENT_SESSIONS=10
      - CHROME_REFRESH_TIME=3600000
      - MAX_CPU_PERCENT=80
      - MAX_MEMORY_PERCENT=80
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF
)

echo -e "${GREEN}Step 1: Backing up existing compose file...${NC}"

expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "cp ${COMPOSE_FILE} ${BACKUP_FILE} && echo 'Backup created: ${BACKUP_FILE}'"
expect {
    "password:" {
        send "${PASSWORD}\r"
        expect eof
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "${PASSWORD}\r"
        expect eof
    }
    eof
}
wait
EOF

echo ""
echo -e "${GREEN}Step 2: Adding Browserless service to compose file...${NC}"

# Transfer the Python script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="${SCRIPT_DIR}/add-browserless-python.py"

expect << EOF
set timeout 30
spawn scp -o StrictHostKeyChecking=no "$PYTHON_SCRIPT" ${SERVER_USER}@${SERVER_IP}:/tmp/add-browserless.py
expect {
    "password:" {
        send "${PASSWORD}\r"
        expect eof
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "${PASSWORD}\r"
        expect eof
    }
    eof
}
wait
EOF

# Execute the Python script with token
expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "python3 /tmp/add-browserless.py ${TOKEN}"
expect {
    "password:" {
        send "${PASSWORD}\r"
        expect eof
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "${PASSWORD}\r"
        expect eof
    }
    eof
}
wait
EOF

echo ""
echo -e "${GREEN}Step 3: Deploying Browserless container...${NC}"

expect << EOF
set timeout 60
spawn ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "cd /opt/n8n && docker compose up -d browserless"
expect {
    "password:" {
        send "${PASSWORD}\r"
        expect eof
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "${PASSWORD}\r"
        expect eof
    }
    eof
}
wait
EOF

echo ""
echo -e "${GREEN}Step 4: Verifying deployment...${NC}"

expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "docker ps | grep browserless && echo '' && docker logs browserless_rensto --tail 20"
expect {
    "password:" {
        send "${PASSWORD}\r"
        expect eof
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "${PASSWORD}\r"
        expect eof
    }
    eof
}
wait
EOF

echo ""
echo "======================================================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "======================================================================"
echo ""
echo -e "${YELLOW}n8n Browserless Credential Configuration:${NC}"
echo ""
echo "Base URL: http://${SERVER_IP}:3000"
echo "Token: $TOKEN"
echo ""
echo "Next steps:"
echo "1. In n8n, go to: Credentials → Add Credential → Browserless"
echo "2. Enter:"
echo "   - Base URL: http://${SERVER_IP}:3000"
echo "   - Token: $TOKEN"
echo "3. Test with a simple workflow"
echo ""
echo "======================================================================"
