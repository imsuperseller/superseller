---
name: Monitoring
description: Service health monitoring, alert rules, cooldowns, uptime tracking, and the System Monitor admin tab
---

# Monitoring

SuperSeller AI monitors 11 services with automated health checks, alert rules, and uptime tracking.

## Monitored Services (11)

### Critical (immediate alert)
1. **Web API** — superseller.agency/api/health
2. **Worker API** — 172.245.56.50:3002/api/health
3. **PostgreSQL** — 172.245.56.50:5432
4. **Redis** — 172.245.56.50:6379

### Important (5-minute cooldown)
5. **FB Marketplace Bot** — 172.245.56.50:8082/health
6. **Telnyx Voice** — api.telnyx.com (webhook delivery)
7. **PayPal** — api-m.paypal.com (checkout flow)

### Non-critical (15-minute cooldown)
8. **Ollama** — 172.245.56.50:11434/api/tags
9. **n8n** — n8n.superseller.agency (backup automation)
10. **Kie.ai** — api.kie.ai (video/image generation)
11. **R2 CDN** — media.superseller.agency

## Alert Rules

| Severity | Condition | Cooldown | Action |
|----------|-----------|----------|--------|
| CRITICAL | Service unreachable | 0s | Immediate notification + auto-restart attempt |
| WARNING | Response >2s | 5min | Log + notify if persists 3 checks |
| INFO | Response >1s | 15min | Log only |
| ANOMALY | Cost >2x daily avg | 1hr | Notify with cost breakdown |

### Auto-Recovery Actions
- **PM2 service down**: `pm2 restart <service>` automatically
- **Docker container exited**: `docker restart <container>` automatically
- **Disk >90%**: Alert + list largest files for cleanup
- **Memory <512MB**: Alert + list top memory consumers

## Health Check Persistence

Health check results are stored in PostgreSQL for historical tracking:

```sql
-- Table: service_health_checks
CREATE TABLE IF NOT EXISTS service_health_checks (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(50) NOT NULL,
  status VARCHAR(10) NOT NULL,  -- 'ok', 'warn', 'error'
  response_time_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP DEFAULT NOW()
);
```

### Uptime Query
```sql
SELECT
  service_name,
  COUNT(*) FILTER (WHERE status = 'ok') * 100.0 / COUNT(*) as uptime_pct,
  ROUND(AVG(response_time_ms)) as avg_response_ms
FROM service_health_checks
WHERE checked_at >= NOW() - INTERVAL '24 hours'
GROUP BY service_name
ORDER BY uptime_pct ASC;
```

## System Monitor Admin Tab

The admin panel at `admin.superseller.agency` includes a System Monitor tab showing:

- Real-time service status (green/yellow/red indicators)
- Response time graphs (last 24 hours)
- PM2 process list with CPU/memory usage
- Docker container status
- Disk and memory usage bars
- Recent alerts and incidents
- Cost tracking (today/week/month)

### Admin Tab Route
- **Path**: `/admin/system-monitor`
- **Auth**: Admin-only (role check in middleware)
- **Data source**: Queries `service_health_checks` table + live health endpoints

## Monitoring Best Practices

1. **Run health checks before and after every deploy**
2. **Check PM2 restart count** — high restarts indicate instability
3. **Monitor disk usage weekly** — video files consume space quickly
4. **Track API costs daily** — catch runaway jobs early
5. **Verify Docker containers after VPS reboot** — not all auto-start
