#!/usr/bin/env python3
"""
Add Browserless service to docker-compose.yml
"""
import sys
import re

COMPOSE_FILE = "/opt/n8n/docker-compose.yml"
TOKEN = sys.argv[1] if len(sys.argv) > 1 else "browserless-rensto-default"

# Read the compose file
with open(COMPOSE_FILE, 'r') as f:
    content = f.read()

# Browserless service configuration
browserless_service = f"""  browserless:
    image: ghcr.io/browserless/chromium:latest
    container_name: browserless_rensto
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - TOKEN={TOKEN}
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
"""

# Find the networks: section and insert before it
# Look for the pattern: ^networks: (at start of line)
pattern = r'^networks:'
match = re.search(pattern, content, re.MULTILINE)

if not match:
    print("Error: Could not find 'networks:' section in compose file", file=sys.stderr)
    sys.exit(1)

# Insert the service before networks
insert_pos = match.start()
new_content = content[:insert_pos] + browserless_service + "\n" + content[insert_pos:]

# Write back to file
with open(COMPOSE_FILE, 'w') as f:
    f.write(new_content)

print(f"Browserless service added successfully to {COMPOSE_FILE}")
print(f"Token: {TOKEN}")
