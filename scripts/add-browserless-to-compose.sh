#!/bin/bash
# Script to add Browserless service to docker-compose.yml
# This script is executed on the server

COMPOSE_FILE="/opt/n8n/docker-compose.yml"
TOKEN="${1:-browserless-rensto-$(openssl rand -hex 16 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)}"

echo "Adding Browserless service with token: $TOKEN"

# Browserless service configuration
BROWSERLESS_SERVICE="  browserless:
    image: browserless/chromium:latest
    container_name: browserless_rensto
    restart: unless-stopped
    ports:
      - \"3000:3000\"
    environment:
      - TOKEN=${TOKEN}
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
      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:3000/health\"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s"

# Find the line number where to insert (before networks: section)
NETWORKS_LINE=$(grep -n "^networks:" "$COMPOSE_FILE" | head -1 | cut -d: -f1)

if [ -z "$NETWORKS_LINE" ]; then
    echo "Error: Could not find 'networks:' section in compose file"
    exit 1
fi

# Insert Browserless service before networks section
sed -i "${NETWORKS_LINE}i\\${BROWSERLESS_SERVICE}" "$COMPOSE_FILE"

echo "Browserless service added successfully to $COMPOSE_FILE"
echo "Token: $TOKEN"
