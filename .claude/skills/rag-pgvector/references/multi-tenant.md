# Multi-Tenant RAG Architecture

## Starting Architecture: Shared Table + RLS

Use Row-Level Security for strong tenant isolation without separate databases:

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON documents
    USING (tenant_id = current_setting('app.current_tenant')::bigint);

-- At request time:
SET LOCAL app.current_tenant = '42';
-- All queries now filter to tenant 42 automatically
```

Scales to dozens of clients with up to ~50K vectors each.

## Upgrade: Partition-by-Tenant

When any single tenant exceeds 50K vectors:

```sql
CREATE TABLE documents (
    id SERIAL,
    tenant_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    metadata JSONB
) PARTITION BY LIST (tenant_id);

-- Per-tenant partitions
CREATE TABLE documents_tenant_42 PARTITION OF documents FOR VALUES IN (42);
CREATE TABLE documents_tenant_43 PARTITION OF documents FOR VALUES IN (43);

-- Each partition gets its own HNSW index (faster: smaller search space)
CREATE INDEX ON documents_tenant_42 USING hnsw (embedding vector_cosine_ops)
    WITH (m = 12, ef_construction = 64);
```

Benefits:
- Similarity search scans only that tenant's vectors
- Actually faster than shared-table search
- Can drop entire partition for tenant offboarding

## Rate Limiting (Without Redis)

PostgreSQL-based rate limiter to avoid Redis overhead (100-500MB RAM):

```sql
CREATE TABLE rate_limits (
    tenant_id BIGINT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INT DEFAULT 0,
    PRIMARY KEY (tenant_id, window_start)
);

-- Check and increment
INSERT INTO rate_limits (tenant_id, window_start, request_count)
VALUES ($1, date_trunc('minute', now()), 1)
ON CONFLICT (tenant_id, window_start)
DO UPDATE SET request_count = rate_limits.request_count + 1
RETURNING request_count;

-- Reject if over limit
-- e.g., 60 requests per minute per tenant
```

## Embedding Model Versioning

Track per-tenant to handle upgrades independently:

```sql
-- In document metadata
INSERT INTO documents (tenant_id, content, embedding, metadata)
VALUES ($1, $2, $3, jsonb_build_object(
    'embedding_model', 'nomic-embed-text',
    'embedding_version', '1.5',
    'embedded_at', now()
));

-- Query: filter by model version
SELECT * FROM documents
WHERE tenant_id = $1
  AND metadata->>'embedding_model' = 'nomic-embed-text'
ORDER BY embedding <=> $2
LIMIT 10;
```

## LiteLLM Per-Tenant Cost Tracking

```yaml
# litellm config
litellm_settings:
  success_callback: ["langfuse"]  # or custom webhook

general_settings:
  master_key: sk-...
  database_url: postgresql://...  # Store spend tracking in PostgreSQL
```

Set budget caps per tenant API key to prevent cost overruns.
