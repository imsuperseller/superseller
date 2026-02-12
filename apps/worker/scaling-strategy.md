# Scaling & Infrastructure Strategy

This document outlines the current concurrency rules, resource management strategy, and future scaling recommendations for the Zillow2Video pipeline.

## 1. Current Concurrency Rules (Safety Rails)

To prevent the local server from crashing due to resource exhaustion (database connections, network sockets, or memory), we have implemented the following limits in the [Worker](file:///Users/shaifriedman/zillow-to-video/apps/worker/src/index.ts):

| Job Type | Current Concurrency | Reasoning |
| :--- | :--- | :--- |
| `job.scrape` | 1 | High CPU/RAM requirement (Puppeteer/Browser). |
| `job.plan` | 5 | Moderate API load (Kie.ai Planning). |
| `job.generate-clip` | 10 | **Current Bottleneck**. Primarily waiting/polling Kie.ai. |
| `job.generate-music` | 2 | Sequential or low-volume task. |
| `job.stitch` | 20 | Low CPU (External HTTP Call to 172.245.x). |

> [!IMPORTANT]
> Because Kie.ai handles the actual GPU-heavy video generation, our local worker is mostly "waiting." This allows us to handle many more jobs at once than if we were generating locally.

## 2. Monitoring & Alerting Plan

### Current Warning Signs
You should consider optimizing or enlarging the server if you see:
1. **Queue Depth > 100**: Jobs stay in "Queued" for more than 5 minutes without being picked up.
2. **High Memory Usage**: `node` processes exceeding 4GB RAM.
3. **Database Connection Errors**: "Too many clients" errors in the logs.

### Recommended Alerts (To Be Implemented)
- [ ] **Queue Monitor**: A script that sends a Slack/Email alert if the `pgboss.job` table has > 50 "created" jobs for more than 10 minutes.
- [ ] **Health API**: A `/health` endpoint on the API that returns current memory usage and queue stats.

## 3. Scaling Roadmap

When you move from developer testing to high-volume production, follow this upgrade path:

### Phase 1: Vertical Scaling (Bigger Server)
- **Current (Local Laptop)**: Good for ~10 simultaneous productions.
- **Recommended Cloud VM (Staging)**: 4 vCPU / 8GB RAM (e.g., DigitalOcean Droplet or AWS t3.large).
  - Increase `job.generate-clip` concurrency to **25**.
  - Move Database to a Managed Service (e.g., Supabase or Neon) to handle connection pooling.

### Phase 2: Horizontal Scaling (Multiple Workers)
- Deploy multiple instances of the `worker` app across different servers.
- PgBoss will automatically handle load balancing naturally.
- **Recommended Hardware**: 8 vCPU / 16GB RAM instances.
  - Increase `job.generate-clip` concurrency to **50+**.

## 4. Optimization Recommendations

1. **R2 Signed URLs**: Move from local file handling to R2 storage for everything.
2. **Kie.ai Webhooks**: Instead of constant polling (every 5s), move to webhooks (if supported by Kie.ai) to reduce network overhead.
3. **Connection Pooling**: Implement `PgBouncer` if the worker count exceeds 5.
