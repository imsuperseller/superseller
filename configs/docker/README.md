# Docker Configuration

**Generated**: October 6, 2025
**Purpose**: Centralized Docker Compose configuration for Rensto infrastructure
**Related**: Phase 2.5 Audit Report - Priority 2 Task 9

---

## Docker Compose Files

### ✅ **PRIMARY: configs/docker/docker-compose.yml**
**Location**: `/configs/docker/docker-compose.yml`
**Status**: ✅ Production configuration (single source of truth)
**Services**: 3 containers

**Services**:
1. **PostgreSQL 15-alpine** (`rensto-postgres`)
   - Port: Internal only (via Docker network)
   - Volume: `./data/postgres`
   - Health check: `pg_isready`
   - Purpose: Primary database for n8n, logging, RGID system

2. **Redis 7-alpine** (`rensto-redis`)
   - Port: 6379 (exposed)
   - Volume: `./data/redis`
   - Memory: 256MB max with LRU eviction
   - Purpose: Caching, session storage, queue management

3. **n8n:latest** (`rensto-n8n`)
   - Port: 5678 (exposed)
   - Volume: `./data/n8n`, `./data/n8n/custom`
   - Database: PostgreSQL (not SQLite)
   - Redis: Enabled for queue mode
   - Purpose: Workflow automation engine

**Network**: `rensto-network` (172.20.0.0/16 bridge)

**Environment Variables Required**:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `N8N_HOST`, `N8N_BASIC_AUTH_USER`, `N8N_BASIC_AUTH_PASSWORD`, `N8N_ENCRYPTION_KEY`
- `TZ` (timezone, default: America/Chicago)

**Usage**:
```bash
cd /path/to/configs/docker
docker compose up -d
docker compose logs -f
docker compose down
```

**Data Persistence**:
- PostgreSQL: `./data/postgres` (584K runtime data, gitignored)
- Redis: `./data/redis` (AOF persistence)
- n8n: `./data/n8n` (workflows, credentials, executions)

---

### ⚠️ **FEATURE: live-systems/hyperise-replacement/docker-compose.yml**
**Location**: `/live-systems/hyperise-replacement/docker-compose.yml`
**Status**: ❌ Built but NOT DEPLOYED
**Services**: 5 containers
**Cost Savings**: $50-200/month (if deployed to replace Hyperise subscription)

**Services**:
1. **API** (Express.js custom build)
   - Port: 3000
   - Purpose: Short links, personalized landing pages, analytics
   - Tech: Node.js, Sharp (image processing), OpenAI integration

2. **PostgreSQL 15-alpine** (separate database)
   - Port: 5432 (exposed for development)
   - Database: `hyperise_replacement`

3. **Redis 7-alpine** (separate cache)
   - Port: 6380 (mapped to avoid conflict with main Redis)

4. **Adminer** (database management UI)
   - Port: 8080
   - Purpose: Development database admin

5. **Redis Commander** (Redis management UI)
   - Port: 8082
   - Purpose: Development Redis monitoring

**Network**: `hyperise-network` (isolated from main Rensto network)

**Development vs Production**:
- **Current**: Development mode, development secrets
- **To Deploy**: Update environment variables, remove admin tools, deploy to VPS

**Deployment Checklist** (When Ready):
- [ ] Change `NODE_ENV=production`
- [ ] Update `JWT_SECRET` to secure production secret
- [ ] Update database credentials
- [ ] Remove Adminer and Redis Commander (dev tools only)
- [ ] Configure SSL/TLS (Cloudflare Tunnel or Nginx reverse proxy)
- [ ] Deploy to RackNerd VPS or separate VPS
- [ ] Connect n8n workflows to new API endpoints
- [ ] Cancel Hyperise subscription (save $50-200/month)

**Related Files**:
- `/live-systems/hyperise-replacement/README.md` - Full feature documentation
- `/live-systems/hyperise-replacement/database/schema.sql` - Database schema
- `/live-systems/hyperise-replacement/src/` - API source code

---

## Removed Docker Compose Files

### ❌ **DELETED: live-systems/admin-scripts/config/docker/docker-compose.yml**
**Reason**: Duplicate of primary config
**Deleted**: October 6, 2025
**Details**: Identical to `/configs/docker/docker-compose.yml` with minor differences (missing N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE)

**Single Source of Truth**: All Docker infrastructure should reference `/configs/docker/docker-compose.yml`

---

## Production Deployment

### **n8n Production**
**URL**: http://172.245.56.50:5678
**VPS**: RackNerd (172.245.56.50)
**Version**: Community Edition v1.113.3
**Deployment Method**: Direct Docker Compose on VPS (not using local config)

**⚠️ Important**: The local `/configs/docker/docker-compose.yml` is for:
- Local development and testing
- Reference configuration for VPS deployment
- Documentation of production setup

**Actual Production**: n8n runs on RackNerd VPS with Docker Compose deployed there

### **MongoDB Production**
**URL**: mongodb://172.245.56.50:27017
**Status**: Running on RackNerd VPS (not via Docker Compose)
**Purpose**: Optional database for customer projects requiring >50K records

**Note**: MongoDB is NOT included in Docker Compose (comment on line 89-90 explains this)

---

## Docker Compose Management

### **Commands**:
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f n8n

# Stop all services
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (⚠️ DELETES DATA)
docker compose down -v

# Rebuild and restart
docker compose up -d --build

# View service status
docker compose ps

# Execute command in container
docker compose exec n8n sh
docker compose exec postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}
```

### **Health Checks**:
```bash
# Check PostgreSQL health
docker compose exec postgres pg_isready -U ${POSTGRES_USER}

# Check Redis health
docker compose exec redis redis-cli ping

# Check n8n health
curl http://localhost:5678/healthz
```

### **Data Backup**:
```bash
# Backup PostgreSQL
docker compose exec postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup.sql

# Backup Redis
docker compose exec redis redis-cli save

# Backup n8n data
tar -czf n8n-backup.tar.gz ./data/n8n/
```

---

## Security Notes

**✅ Properly Secured**:
- `.env` file gitignored (contains secrets)
- `data/` directory gitignored (contains runtime data, credentials, logs)
- Health checks enabled for all services
- Restart policy: `unless-stopped` (automatic recovery)
- Internal Docker network (services isolated)

**⚠️ Security Considerations**:
- Ports 5678 (n8n) and 6379 (Redis) exposed - Should be behind firewall or Cloudflare Tunnel
- Basic auth for n8n - Consider OAuth2 or SSO for production
- Redis has no auth - Only accessible within Docker network
- PostgreSQL has no SSL - Only accessible within Docker network

**Recommended Improvements**:
1. Add Redis password authentication
2. Enable PostgreSQL SSL
3. Use Cloudflare Tunnel for n8n (no direct port exposure)
4. Implement OAuth2 for n8n authentication

---

## Troubleshooting

### **Service Won't Start**:
```bash
# Check logs
docker compose logs [service-name]

# Check health
docker compose ps

# Restart service
docker compose restart [service-name]
```

### **Data Persistence Issues**:
- Verify `./data/` directory exists and has correct permissions
- Check volume mounts in `docker-compose.yml`
- Verify `.gitignore` includes `configs/docker/data/`

### **Port Conflicts**:
- Check if ports 5678, 6379, 5432 are already in use
- Use `lsof -i :5678` to check port usage
- Modify port mappings in `docker-compose.yml` if needed

### **Network Issues**:
- Verify `rensto-network` exists: `docker network ls`
- Check network connectivity: `docker compose exec n8n ping postgres`
- Restart Docker daemon if network issues persist

---

## Related Documentation

- **CLAUDE.md Section 4**: Active Systems - n8n Workflows
- **CLAUDE.md Section 14**: Tech Stack - Infrastructure
- **configs/README.md**: Configuration management overview
- **live-systems/hyperise-replacement/README.md**: Hyperise replacement feature

---

**Document Status**: ✅ Complete
**Next Review**: November 6, 2025 (monthly)
**Owner**: Shai Friedman
**Maintained By**: Claude AI
