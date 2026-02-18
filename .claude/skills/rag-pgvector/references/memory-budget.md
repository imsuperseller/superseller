# Memory Budget & Production Hardening

## 6GB Server Allocation

| Service | RAM | Notes |
|---------|-----|-------|
| Ubuntu 24.04 + Docker | ~1GB | OS baseline |
| PostgreSQL + pgvector | ~500MB-1.5GB | Conservative shared_buffers=384MB |
| n8n | ~300-500MB | Workflow automation |
| Ollama (when active) | ~500MB-1.2GB | Loads/unloads per KEEP_ALIVE=0 |
| LiteLLM proxy | ~100MB | API routing |
| **Total** | **~2.4-4.3GB** | Headroom for spikes |

## Swap Configuration

```bash
# Add 6-8GB swap
fallocate -l 8G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Low swappiness — prefer RAM, swap as safety net only
sysctl vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf
```

Ollama's `mmap()` model loading naturally pages to disk, making swap less critical for model weights but valuable for protecting PostgreSQL during memory spikes.

## Docker Memory Limits

Prevent any single service from OOM-killing others:

```yaml
services:
  postgres:
    mem_limit: 1536m
    memswap_limit: 2g
  n8n:
    mem_limit: 512m
  ollama:
    mem_limit: 1536m
  litellm:
    mem_limit: 256m
```

## Monitoring

```bash
# Container resource usage
docker stats

# Ollama model status
ollama ps

# PostgreSQL connections and activity
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Memory overview
free -h

# Alert when free < 500MB
FREE_MB=$(free -m | awk '/^Mem:/{print $7}')
if [ "$FREE_MB" -lt 500 ]; then echo "LOW MEMORY: ${FREE_MB}MB free"; fi
```

## Backup Strategy

```bash
# Daily compressed backup (HNSW indexes NOT included — they rebuild on restore)
pg_dump -Fc -d mydb > /backups/$(date +%Y%m%d).dump

# Restore (budget time for HNSW index rebuild)
pg_restore -d mydb /backups/20260216.dump
# Then manually: CREATE INDEX CONCURRENTLY ...
```

HNSW indexes must be rebuilt after restore — for 100K documents this takes minutes, not hours.

## Blue-Green Re-Embedding

When changing embedding models:

1. `ALTER TABLE documents ADD COLUMN embedding_v2 vector(1024);`
2. Re-embed in batches of 50-100 (avoid memory spikes)
3. `CREATE INDEX CONCURRENTLY ON documents USING hnsw (embedding_v2 vector_cosine_ops);`
4. Switch application queries to new column
5. `ALTER TABLE documents DROP COLUMN embedding;`
6. `ALTER TABLE documents RENAME COLUMN embedding_v2 TO embedding;`

## Production Checklist

- [ ] Ollama KEEP_ALIVE=0 configured
- [ ] Docker memory limits on all containers
- [ ] Swap 6-8GB with swappiness=10
- [ ] PostgreSQL shared_buffers=384MB
- [ ] HNSW index with m=12, ef_construction=64
- [ ] Daily pg_dump backup scheduled
- [ ] Monitoring for free memory < 500MB
- [ ] Rate limiting per tenant configured
- [ ] Embedding model version tracked in metadata
