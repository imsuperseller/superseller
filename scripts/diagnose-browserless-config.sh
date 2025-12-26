#!/bin/bash

###############################################################################
# Browserless Configuration Diagnostic Script
# Purpose: Find Browserless compose file and extract n8n credential values
# Usage: Run on the server that hosts Browserless
###############################################################################

set -e

echo "======================================================================"
echo "Browserless Configuration Diagnostic"
echo "======================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Find docker-compose files
echo -e "${BLUE}Step 1: Searching for docker-compose files...${NC}"
echo ""

COMPOSE_FILES=$(sudo find / -maxdepth 4 -name "docker-compose.yml" -o -name "compose.yml" 2>/dev/null | head -n 20)

if [ -z "$COMPOSE_FILES" ]; then
    echo -e "${RED}❌ No docker-compose.yml or compose.yml files found${NC}"
    echo ""
    echo "Trying alternative search (deeper)..."
    COMPOSE_FILES=$(sudo find / -maxdepth 6 -name "*.yml" -type f 2>/dev/null | grep -E "(compose|docker)" | head -n 20)
fi

if [ -z "$COMPOSE_FILES" ]; then
    echo -e "${RED}❌ No compose files found. Is Browserless running in Docker?${NC}"
    echo ""
    echo "Checking running containers..."
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}" | grep -i -E "browserless|chromium|puppeteer" || echo "No Browserless containers found"
    exit 1
fi

echo -e "${GREEN}Found compose files:${NC}"
echo "$COMPOSE_FILES"
echo ""

# Step 2: Search for Browserless service in each file
echo -e "${BLUE}Step 2: Searching for Browserless service in compose files...${NC}"
echo ""

BROWSERLESS_FOUND=false
BROWSERLESS_FILE=""
BROWSERLESS_SERVICE=""

for file in $COMPOSE_FILES; do
    if grep -qiE "browserless|chromium|puppeteer" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓ Found Browserless reference in: $file${NC}"
        BROWSERLESS_FOUND=true
        BROWSERLESS_FILE="$file"
        
        # Extract service name
        SERVICE_NAME=$(grep -B5 -iE "browserless|chromium|puppeteer" "$file" | grep -E "^[[:space:]]*[a-zA-Z0-9_-]+:" | head -1 | sed 's/[[:space:]]*\([^:]*\):.*/\1/' | xargs)
        
        if [ -z "$SERVICE_NAME" ]; then
            # Try to find service by looking at indentation
            SERVICE_NAME=$(awk '/browserless|chromium|puppeteer/i {for(i=1;i<=NR;i++){getline; if(/^[[:space:]]*[a-zA-Z0-9_-]+:/){print; exit}}}' "$file" | sed 's/[[:space:]]*\([^:]*\):.*/\1/' | xargs)
        fi
        
        echo "  Service name: ${SERVICE_NAME:-'unknown'}"
        echo ""
        break
    fi
done

if [ "$BROWSERLESS_FOUND" = false ]; then
    echo -e "${RED}❌ Browserless service not found in any compose file${NC}"
    echo ""
    echo "Checking if Browserless is running as a standalone container..."
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}" | grep -i -E "browserless|chromium|puppeteer" || echo "No Browserless containers found"
    exit 1
fi

# Step 3: Extract Browserless service block
echo -e "${BLUE}Step 3: Extracting Browserless service configuration...${NC}"
echo ""

# Find the service block
cd "$(dirname "$BROWSERLESS_FILE")"

# Extract service block using awk
SERVICE_START=$(grep -nE "^[[:space:]]*[a-zA-Z0-9_-]+:[[:space:]]*$" "$BROWSERLESS_FILE" | grep -B1 -iE "browserless|chromium|puppeteer" | head -1 | cut -d: -f1)

if [ -z "$SERVICE_START" ]; then
    # Alternative: find by content
    SERVICE_START=$(grep -n -iE "browserless|chromium|puppeteer" "$BROWSERLESS_FILE" | head -1 | cut -d: -f1)
    # Go back to find service name
    while [ "$SERVICE_START" -gt 0 ]; do
        LINE=$(sed -n "${SERVICE_START}p" "$BROWSERLESS_FILE")
        if echo "$LINE" | grep -qE "^[[:space:]]*[a-zA-Z0-9_-]+:[[:space:]]*$"; then
            break
        fi
        SERVICE_START=$((SERVICE_START - 1))
    done
fi

# Extract the service block (next 50 lines should be enough)
echo -e "${YELLOW}Browserless Service Configuration:${NC}"
echo "----------------------------------------"
sed -n "${SERVICE_START},$((SERVICE_START + 50))p" "$BROWSERLESS_FILE" | sed -n '/^[[:space:]]*[a-zA-Z0-9_-]\+:[[:space:]]*$/,/^[[:space:]]*[a-zA-Z0-9_-]\+:[[:space:]]*$/p' | head -n 60
echo "----------------------------------------"
echo ""

# Step 4: Extract key values
echo -e "${BLUE}Step 4: Extracting key configuration values...${NC}"
echo ""

# Extract image
IMAGE=$(grep -A50 -iE "browserless|chromium|puppeteer" "$BROWSERLESS_FILE" | grep -E "^[[:space:]]*image:" | head -1 | sed 's/.*image:[[:space:]]*\(.*\)/\1/' | xargs)
echo -e "${GREEN}Image:${NC} ${IMAGE:-'NOT FOUND'}"

# Extract ports
PORTS=$(grep -A50 -iE "browserless|chromium|puppeteer" "$BROWSERLESS_FILE" | grep -A5 "ports:" | grep -E "^\s*-\s*\"[0-9]+:[0-9]+\"" | head -1 | sed 's/.*"\([0-9]*\):\([0-9]*\)".*/\1:\2/')
HOST_PORT=$(echo "$PORTS" | cut -d: -f1)
CONTAINER_PORT=$(echo "$PORTS" | cut -d: -f2)
echo -e "${GREEN}Ports:${NC} ${PORTS:-'NOT FOUND'}"
echo "  Host port: ${HOST_PORT:-'NOT FOUND'}"
echo "  Container port: ${CONTAINER_PORT:-'3000 (default)'}"

# Extract environment variables (especially TOKEN)
echo ""
echo -e "${GREEN}Environment Variables:${NC}"
grep -A50 -iE "browserless|chromium|puppeteer" "$BROWSERLESS_FILE" | grep -A20 "environment:" | grep -E "^\s*-\s*[A-Z_]+" | head -10

TOKEN=$(grep -A50 -iE "browserless|chromium|puppeteer" "$BROWSERLESS_FILE" | grep -A20 "environment:" | grep -iE "TOKEN|AUTH" | head -1 | sed 's/.*TOKEN[=:][[:space:]]*\(.*\)/\1/' | sed 's/^["'\'']//;s/["'\'']$//' | xargs)
echo ""
echo -e "${GREEN}Token/Auth:${NC} ${TOKEN:-'NOT FOUND (check environment section above)'}"
echo ""

# Step 5: Check running containers
echo -e "${BLUE}Step 5: Checking running Browserless containers...${NC}"
echo ""

RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}\t{{.Image}}\t{{.Ports}}" | grep -i -E "browserless|chromium|puppeteer" || true)

if [ -z "$RUNNING_CONTAINERS" ]; then
    echo -e "${YELLOW}⚠ No Browserless containers currently running${NC}"
    echo ""
    echo "Checking all containers (including stopped)..."
    docker ps -a --format "{{.Names}}\t{{.Image}}\t{{.Status}}" | grep -i -E "browserless|chromium|puppeteer" || echo "No Browserless containers found"
else
    echo -e "${GREEN}Running Browserless containers:${NC}"
    echo "$RUNNING_CONTAINERS"
    echo ""
    
    # Get exact image and ports from running container
    CONTAINER_NAME=$(echo "$RUNNING_CONTAINERS" | head -1 | awk '{print $1}')
    RUNNING_IMAGE=$(docker inspect "$CONTAINER_NAME" --format='{{.Config.Image}}' 2>/dev/null || echo "unknown")
    RUNNING_PORTS=$(docker inspect "$CONTAINER_NAME" --format='{{range $p, $conf := .NetworkSettings.Ports}}{{$p}} {{end}}' 2>/dev/null || echo "unknown")
    
    echo -e "${GREEN}Container Details:${NC}"
    echo "  Name: $CONTAINER_NAME"
    echo "  Image: $RUNNING_IMAGE"
    echo "  Ports: $RUNNING_PORTS"
    echo ""
fi

# Step 6: Get server IP/Domain
echo -e "${BLUE}Step 6: Determining server access information...${NC}"
echo ""

SERVER_IP=$(hostname -I | awk '{print $1}' || echo "unknown")
SERVER_HOSTNAME=$(hostname || echo "unknown")
DOMAIN=$(hostname -f 2>/dev/null || echo "unknown")

echo -e "${GREEN}Server Information:${NC}"
echo "  IP: $SERVER_IP"
echo "  Hostname: $SERVER_HOSTNAME"
echo "  Domain: $DOMAIN"
echo ""

# Step 7: Generate n8n credential values
echo "======================================================================"
echo -e "${GREEN}n8n Browserless Credential Configuration${NC}"
echo "======================================================================"
echo ""

# Determine Base URL
if [ -n "$HOST_PORT" ]; then
    BASE_URL="http://${SERVER_IP}:${HOST_PORT}"
    BASE_URL_DOMAIN="http://${DOMAIN}:${HOST_PORT}"
else
    BASE_URL="http://${SERVER_IP}:3000"
    BASE_URL_DOMAIN="http://${DOMAIN}:3000"
fi

echo -e "${YELLOW}Base URL (use one of these):${NC}"
echo "  Primary: $BASE_URL"
if [ "$DOMAIN" != "unknown" ] && [ "$DOMAIN" != "$SERVER_HOSTNAME" ]; then
    echo "  Domain: $BASE_URL_DOMAIN"
fi
echo ""

if [ -n "$TOKEN" ] && [ "$TOKEN" != "NOT FOUND (check environment section above)" ]; then
    echo -e "${YELLOW}Token:${NC} $TOKEN"
else
    echo -e "${YELLOW}Token:${NC} ${RED}NOT FOUND - Check environment section above${NC}"
    echo ""
    echo "Common token variable names:"
    echo "  - TOKEN"
    echo "  - BROWSERLESS_TOKEN"
    echo "  - AUTH_TOKEN"
    echo "  - API_TOKEN"
    echo ""
    echo "If token is in .env file, check:"
    echo "  cat $(dirname "$BROWSERLESS_FILE")/.env | grep -i token"
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}Next Steps:${NC}"
echo "======================================================================"
echo ""
echo "1. Copy the Base URL and Token values above"
echo "2. In n8n, go to: Credentials → Add Credential → Browserless"
echo "3. Enter:"
echo "   - Base URL: $BASE_URL"
echo "   - Token: [value from above]"
echo ""
echo "4. Test the connection:"
echo "   - Create a test workflow"
echo "   - Add Browserless node"
echo "   - Action: Performance (or Content)"
echo "   - URL: https://example.com"
echo "   - Execute once"
echo ""
echo "5. If it fails, check:"
echo "   - Firewall allows port ${HOST_PORT:-3000}"
echo "   - Container is running: docker ps | grep browserless"
echo "   - Container logs: docker logs $CONTAINER_NAME"
echo ""
echo "======================================================================"
