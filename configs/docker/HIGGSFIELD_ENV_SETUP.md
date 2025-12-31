# Higgsfield Environment Variables Setup

**Date**: November 18, 2025  
**Purpose**: Add Higgsfield API credentials to n8n instance

---

## ✅ Changes Made

Added the following environment variables to `configs/docker/docker-compose.yml`:

```yaml
- HIGGSFIELD_KEY_ID=bdc79d46-f778-4bc3-8b82-beaf0ff9630c
- HIGGSFIELD_KEY_SECRET=b14902e34ffd4ca44fd409a8f64b3a23efe6d8711af8b4f8b739cdbadfdfa44b
```

---

## 🚀 Apply Changes to Production VPS

### **Step 1: SSH to RackNerd VPS**

```bash
ssh root@172.245.56.50
# Or use your SSH key/credentials
# Domain: n8n.rensto.com (resolves to 172.245.56.50)
```

### **Step 2: Navigate to Docker Compose Directory**

```bash
# Docker compose file is located at:
cd /opt/n8n

# Verify it exists:
ls -la docker-compose.yml
```

### **Step 3: Update docker-compose.yml**

```bash
# Edit the docker-compose.yml file
cd /opt/n8n
nano docker-compose.yml
# Or use vi/vim

# Find the n8n service section and add these two lines to the environment: section:
#   - HIGGSFIELD_KEY_ID=bdc79d46-f778-4bc3-8b82-beaf0ff9630c
#   - HIGGSFIELD_KEY_SECRET=b14902e34ffd4ca44fd409a8f64b3a23efe6d8711af8b4f8b739cdbadfdfa44b

# The environment section should look like:
#   environment:
#     - N8N_HOST=${N8N_HOST}
#     ... (other vars)
#     - HIGGSFIELD_KEY_ID=bdc79d46-f778-4bc3-8b82-beaf0ff9630c
#     - HIGGSFIELD_KEY_SECRET=b14902e34ffd4ca44fd409a8f64b3a23efe6d8711af8b4f8b739cdbadfdfa44b
```

### **Step 4: Restart n8n Container**

```bash
# Make sure you're in the right directory
cd /opt/n8n

# Restart n8n service (this will apply new environment variables)
docker compose restart n8n

# Or if using docker-compose (older version):
docker-compose restart n8n

# Verify the container restarted successfully
docker ps | grep n8n
docker logs n8n_rensto --tail 50
# Note: Container name might be "n8n_rensto" or "rensto-n8n" - check with docker ps
```

### **Step 5: Verify Environment Variables**

```bash
# Check if environment variables are set in the container
# First, find the exact container name:
docker ps | grep n8n

# Then check environment variables (container name might be "n8n_rensto" or "rensto-n8n"):
docker exec n8n_rensto env | grep HIGGSFIELD
# Or if different name:
docker exec rensto-n8n env | grep HIGGSFIELD

# Should output:
# HIGGSFIELD_KEY_ID=bdc79d46-f778-4bc3-8b82-beaf0ff9630c
# HIGGSFIELD_KEY_SECRET=b14902e34ffd4ca44fd409a8f64b3a23efe6d8711af8b4f8b739cdbadfdfa44b
```

---

## 🔄 Alternative: Recreate Container (If Restart Doesn't Work)

If restart doesn't apply the new environment variables, recreate the container:

```bash
cd /opt/n8n

# Stop and remove n8n container (data persists in volumes)
docker compose stop n8n
docker compose rm -f n8n

# Start n8n with new configuration
docker compose up -d n8n

# Verify
docker ps | grep n8n
docker logs n8n_rensto --tail 50
# Note: Container name might be different - check with docker ps
```

---

## ✅ Verification Checklist

- [ ] Environment variables added to docker-compose.yml
- [ ] n8n container restarted/recreated
- [ ] Environment variables visible in container (`docker exec n8n_rensto env | grep HIGGSFIELD` - check actual container name first)
- [ ] n8n is accessible at http://n8n.rensto.com or http://172.245.56.50:5678
- [ ] No errors in n8n logs (`docker logs rensto-n8n`)

---

## 📝 Notes

- **No downtime**: Restarting the n8n container should cause minimal downtime (< 30 seconds)
- **Data safety**: Workflows and data are stored in volumes, so they persist through restarts
- **Variables access**: These environment variables will be available to all n8n workflows via `$env.HIGGSFIELD_KEY_ID` and `$env.HIGGSFIELD_KEY_SECRET`
- **Plan limitation**: Since you don't have "Variables" in your n8n plan, environment variables are the correct approach

---

**Status**: ✅ Configuration updated locally  
**Next Step**: Apply to production VPS (172.245.56.50 / n8n.rensto.com) using steps above

**Current n8n Server**:
- **URL**: http://n8n.rensto.com
- **IP**: 172.245.56.50:5678
- **VPS**: RackNerd (new server)
- **Docker Compose Location**: `/opt/n8n/docker-compose.yml` (likely)

