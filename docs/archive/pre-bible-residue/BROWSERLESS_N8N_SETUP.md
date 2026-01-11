# Browserless n8n Configuration Guide

**Purpose**: Connect n8n to Browserless service running on Docker
**Last Updated**: January 2025

---

## Quick Diagnostic Script

Run this script on the server that hosts Browserless:

```bash
# Copy script to server
scp scripts/diagnose-browserless-config.sh root@172.245.56.50:/tmp/

# SSH to server
ssh root@172.245.56.50

# Run diagnostic
bash /tmp/diagnose-browserless-config.sh
```

The script will:
1. ✅ Find all docker-compose files
2. ✅ Locate Browserless service
3. ✅ Extract image, ports, and environment variables
4. ✅ Show running containers
5. ✅ Generate n8n credential values

---

## Manual Steps (If Script Doesn't Work)

### Step 1: SSH to Server

```bash
ssh root@172.245.56.50
# Or for Wonder.Care server:
# ssh root@192.227.249.73
```

### Step 2: Find Compose File

```bash
# Search for compose files
sudo find / -maxdepth 4 -name "docker-compose.yml" 2>/dev/null | head -n 50
sudo find / -maxdepth 4 -name "compose.yml" 2>/dev/null | head -n 50
```

### Step 3: Locate Browserless Service

```bash
# Navigate to compose file directory
cd /path/to/compose/file

# Search for Browserless
grep -nE "browserless|chromium|puppeteer" docker-compose.yml
```

### Step 4: Extract Service Block

```bash
# View entire service block
awk 'BEGIN{p=0} /^services:/{p=1} p{print}' docker-compose.yml | sed -n '1,260p'

# Or extract specific service (replace 'browserless' with actual service name)
sed -n '/^[[:space:]]*browserless:[[:space:]]*$/,/^[[:space:]]*[a-zA-Z0-9_-]\+:[[:space:]]*$/p' docker-compose.yml
```

### Step 5: Extract Key Values

From the service block, note:

1. **Image**: 
   ```yaml
   image: browserless/chromium:latest
   # or
   image: ghcr.io/browserless/chromium:latest
   ```

2. **Ports**:
   ```yaml
   ports:
     - "8080:3000"  # Host:Container
   ```
   - Host port: `8080` (what you'll use in n8n)
   - Container port: `3000` (Browserless default)

3. **Environment Variables**:
   ```yaml
   environment:
     - TOKEN=your-secret-token-here
   ```
   - Look for: `TOKEN`, `BROWSERLESS_TOKEN`, `AUTH_TOKEN`, or `API_TOKEN`

### Step 6: Verify Running Container

```bash
# Check running containers
docker compose ps

# Or if using docker-compose (older syntax)
docker-compose ps

# Get exact image and ports
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}" | grep -i browserless
```

### Step 7: Get Server IP/Domain

```bash
# Get server IP
hostname -I | awk '{print $1}'

# Get hostname
hostname

# Get domain (if configured)
hostname -f
```

---

## n8n Credential Configuration

### Base URL Format

```
http://<SERVER_IP>:<HOST_PORT>
```

**Examples**:
- `http://172.245.56.50:8080` (if compose has `8080:3000`)
- `http://172.245.56.50:3000` (if compose has `3000:3000`)
- `http://n8n.rensto.com:8080` (if using domain)

### Token

Use the value from the `TOKEN` environment variable in your compose file.

**If token is in .env file**:
```bash
cd /path/to/compose/file
cat .env | grep -i token
```

---

## Testing the Connection

### In n8n:

1. **Create Test Workflow**:
   - Manual Trigger
   - Browserless node
   - Action: `Performance` (or `Content`)
   - URL: `https://example.com`

2. **Execute**:
   - Click "Execute Node"
   - Check for errors

### If It Fails:

1. **Check Container Status**:
   ```bash
   docker ps | grep browserless
   docker logs <container-name>
   ```

2. **Check Firewall**:
   ```bash
   # Check if port is open
   sudo netstat -tlnp | grep <HOST_PORT>
   
   # Or check firewall rules
   sudo ufw status
   sudo iptables -L -n | grep <HOST_PORT>
   ```

3. **Test from Server**:
   ```bash
   # Test if Browserless responds
   curl http://localhost:<HOST_PORT>/health
   
   # Test with token (if required)
   curl -H "Authorization: Bearer <TOKEN>" http://localhost:<HOST_PORT>/health
   ```

4. **Check n8n Logs**:
   - In n8n UI: Settings → Logs
   - Or: `docker logs <n8n-container-name>`

---

## Common Issues

### Issue: "Connection refused"

**Solution**:
- Container not running: `docker compose up -d browserless`
- Wrong port: Check compose file ports mapping
- Firewall blocking: Open port in firewall

### Issue: "Unauthorized" or "Invalid token"

**Solution**:
- Token mismatch: Verify token in compose file matches n8n credential
- Token in .env: Check `.env` file, not just compose file
- Token format: Some versions use `Bearer <token>`, others just `<token>`

### Issue: "Container not found"

**Solution**:
- Wrong server: Verify you're on the correct server
- Different compose file: Browserless might be in a different location
- Not deployed: Browserless might not be running yet

---

## Example Compose File

Here's what a typical Browserless service looks like:

```yaml
services:
  browserless:
    image: browserless/chromium:latest
    container_name: browserless
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - TOKEN=your-secret-token-here
      - CONCURRENT=10
      - MAX_CONCURRENT=50
      - QUEUE_LENGTH=100
      - PREBOOT_CHROME=true
    volumes:
      - browserless_data:/app/data
```

**n8n Configuration**:
- Base URL: `http://172.245.56.50:3000`
- Token: `your-secret-token-here`

---

## Quick Reference

| Item | Location | Command |
|------|----------|---------|
| Compose files | Server | `sudo find / -name "docker-compose.yml"` |
| Running containers | Server | `docker ps \| grep browserless` |
| Container logs | Server | `docker logs <container-name>` |
| Server IP | Server | `hostname -I` |
| Port mapping | Compose file | `grep -A5 "ports:" docker-compose.yml` |
| Token | Compose/.env | `grep -i token docker-compose.yml` |

---

## Related Documentation

- [n8n Browserless Node Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.browserless/)
- [Browserless Docker Hub](https://hub.docker.com/r/browserless/chromium)
- [Browserless Documentation](https://www.browserless.io/docs/)

---

**Need Help?** Run the diagnostic script first, then share the output.
