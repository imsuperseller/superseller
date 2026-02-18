# pgvector Tuning & Hybrid Search

## pgvector 0.8.x Features

- **halfvec**: Half-precision vectors for 50% memory savings
- **Iterative index scans**: Prevents "overfiltering" problem
- **Parallel HNSW builds**: Up to 30x faster index creation
- **Binary quantization**: Further compression option
- Supports PostgreSQL 13-18

## HNSW vs IVFFlat

| Metric | HNSW | IVFFlat |
|--------|------|---------|
| QPS at 0.998 recall | **15.5x higher** | Baseline |
| Index size | Larger (2.8x) | Smaller |
| Dynamic data | Handles inserts well | Centroids go stale |
| Empty table | Can create index | Cannot |
| Query scaling | Logarithmic | Linear within cluster |
| Memory | Higher | Lower |

**Always use HNSW** unless extreme memory constraint forces IVFFlat.

## Conservative HNSW Parameters (6GB Server)

```sql
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
    WITH (m = 12, ef_construction = 64);
```

- `m = 12` (default 16): Fewer connections per node = smaller index
- `ef_construction = 64` (default 64): Build quality — keep at 64 for good recall
- For <100K documents, these parameters provide excellent recall with minimal RAM

## halfvec for Memory Savings

Cast vectors at index creation for 50% storage reduction with minimal recall loss:

```sql
CREATE INDEX ON documents USING hnsw ((embedding::halfvec(768)) halfvec_cosine_ops);
```

## Distance Functions

| Function | Operator | Use When |
|----------|----------|----------|
| Cosine distance | `<=>` | **Default for text embeddings** |
| Inner product | `<#>` | Normalized vectors (marginally faster) |
| L2 distance | `<->` | Image/spatial embeddings |

## Hybrid Search (Vector + BM25)

Hybrid search yields **15-30% better retrieval** than vector alone.

### Simple Approach: tsvector + RRF

```sql
-- Vector results
WITH vector_results AS (
    SELECT id, content,
           ROW_NUMBER() OVER (ORDER BY embedding <=> $1) as vrank
    FROM documents
    WHERE tenant_id = $2
    ORDER BY embedding <=> $1
    LIMIT 20
),
-- Full-text results
text_results AS (
    SELECT id, content,
           ROW_NUMBER() OVER (ORDER BY ts_rank(content_tsv, query) DESC) as trank
    FROM documents, plainto_tsquery('english', $3) query
    WHERE tenant_id = $2 AND content_tsv @@ query
    LIMIT 20
)
-- Reciprocal Rank Fusion
SELECT COALESCE(v.id, t.id) as id,
       COALESCE(v.content, t.content) as content,
       COALESCE(1.0/(v.vrank + 50), 0) + COALESCE(1.0/(t.trank + 50), 0) as rrf_score
FROM vector_results v
FULL OUTER JOIN text_results t ON v.id = t.id
ORDER BY rrf_score DESC
LIMIT 10;
```

### Production BM25: ParadeDB pg_search

For proper BM25 scoring, install ParadeDB's `pg_search` extension (Rust/Tantivy engine). Complements pgvector without replacing it.

## PostgreSQL Configuration (6GB Server)

```ini
# postgresql.conf
shared_buffers = 384MB          # ~6% of total RAM (conservative)
work_mem = 16MB                 # Per-operation; keep low
maintenance_work_mem = 256MB    # Increase to 512MB-1GB for index builds
effective_cache_size = 2GB      # Advisory for query planner
max_connections = 20            # Each uses 5-10MB base, up to 170MB during vector queries
random_page_cost = 1.1          # SSD optimization
```

Keep HNSW index in shared_buffers — this is the single most impactful optimization.

## pgvector Alternatives (Watch List)

| Extension | Approach | When to Consider |
|-----------|----------|-----------------|
| **VectorChord** | IVF + RaBitQ quantization | Dataset > RAM capacity (26x cost efficiency) |
| **pgvectorscale** | StreamingDiskANN | Dataset > RAM, need low p95 latency |
| **pg_embedding** | Deprecated (2023) | **Never** |
| **Lantern** | Small community | Not recommended |

Start with pgvector. Evaluate VectorChord only if memory becomes the bottleneck.
