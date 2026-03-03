---
name: Health Check
description: Check the status of all 11 SuperSeller services and report their health
---

# Health Check

Run a comprehensive health check across all 11 SuperSeller services. Report status for each with response time and any errors.

## Usage

```
/health-check         — Check all 11 services
/health-check web     — Check web services only
/health-check worker  — Check worker/RackNerd services only
```

## Services to Check

### Web / Frontend (Vercel)
1. **SuperSeller Website**: `curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://superseller.agency/api/health`
2. **Admin Panel**: `curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://admin.superseller.agency/api/health`

### Worker / RackNerd (172.245.56.50)
3. **Worker API**: `curl -s -o /dev/null -w "%{http_code} %{time_total}s" http://172.245.56.50:3002/api/health`
4. **Ollama**: `curl -s http://172.245.56.50:11434/api/tags | jq '.models | length'` (expect number of loaded models)
5. **FB Marketplace Bot**: `curl -s -o /dev/null -w "%{http_code} %{time_total}s" http://172.245.56.50:8082/health`
6. **Redis**: `redis-cli -h 172.245.56.50 -a ${REDIS_PASSWORD} ping` (expect PONG)
7. **PostgreSQL**: `pg_isready -h 172.245.56.50 -p 5432 -U superseller -d app_db` or query via MCP

### External Services
8. **n8n**: `curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://n8n.superseller.agency`
9. **Telnyx**: `curl -s -H "Authorization: Bearer ${TELNYX_API_KEY}" https://api.telnyx.com/v2/available_phone_numbers?filter[country_code]=US&filter[limit]=1` (expect 200)
10. **PayPal**: `curl -s -o /dev/null -w "%{http_code}" https://api-m.paypal.com/v1/oauth2/token -d "grant_type=client_credentials" -u "${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}"` (expect 200)
11. **Kie.ai**: `curl -s -o /dev/null -w "%{http_code}" https://api.kie.ai/v1/models` (expect 200)

### Additional Checks (via SSH)
- **PM2 status**: `ssh root@172.245.56.50 'pm2 jlist'` — parse for each service status and restart count
- **Docker containers**: `ssh root@172.245.56.50 'docker ps --format "{{.Names}}: {{.Status}}"'` — expect 6 containers running
- **Disk usage**: `ssh root@172.245.56.50 'df -h / | tail -1'` — alert if >85%
- **Memory**: `ssh root@172.245.56.50 'free -h | head -2'` — report available RAM

## Output Format

```
SERVICE HEALTH REPORT — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 [OK]  Web API          200  0.34s
 [OK]  Worker API       200  0.12s
 [OK]  Ollama           7 models  0.08s
 [OK]  Redis            PONG  0.02s
 [OK]  PostgreSQL       accepting  0.03s
 [OK]  FB Bot           200  0.15s
 [WARN] n8n             503  —  (non-critical, backup system)
 [OK]  Telnyx           200  0.45s
 [OK]  PayPal           200  0.38s
 [OK]  Kie.ai           200  0.22s
 [OK]  R2/CDN           200  0.18s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM2: 5/5 online | Docker: 6/6 running
 Disk: 76% | RAM: 2.1GB free
 Overall: HEALTHY (10/11)
```

## Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Response time | >2s | >5s |
| Disk usage | >80% | >90% |
| RAM free | <1GB | <512MB |
| PM2 restarts (24h) | >5 | >20 |
| Service down | 1 non-critical | Any critical service |

Critical services: Web API, Worker API, PostgreSQL, Redis.
Non-critical: n8n (backup system), Ollama (can restart).
