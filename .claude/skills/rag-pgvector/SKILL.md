---
name: rag-pgvector
description: >-
  RAG stack architecture for 6GB Ubuntu VPS using pgvector, Ollama, and LiteLLM.
  Use when setting up vector search, embedding pipelines, pgvector indexes, RAG retrieval,
  Ollama configuration, or multi-tenant document stores. Not for video pipeline work, UI design,
  or general database migrations unrelated to vector search.
  Example: "Set up pgvector with HNSW indexing for client document RAG".
autoTrigger:
  - "RAG"
  - "pgvector"
  - "vector search"
  - "embedding"
  - "Ollama"
  - "LiteLLM"
  - "document store"
  - "semantic search"
  - "HNSW"
  - "hybrid search"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "n8n"
  - "stripe"
  - "schema migration"
---

# RAG + pgvector Stack

## Critical
- **Default embedding model**: `nomic-embed-text` via Ollama (~500MB RAM, 768 dims, 8K context)
- **HNSW over IVFFlat** for all RAG workloads — 15.5x higher QPS at same recall
- **Ollama KEEP_ALIVE=0** is mandatory on 6GB server — frees RAM immediately after embedding
- **Never mix embedding models** — ingestion and retrieval MUST use the same model
- **cosine distance (`<=>`)** is the default for text embeddings
- **Memory budget**: ~2.4-4.3GB for full stack, leaving headroom for spikes

## Architecture

```
Local Embeddings (Ollama)     Cloud Generation (LiteLLM → Claude/GPT/Gemini)
        ↓                              ↓
   pgvector HNSW              Antigravity Worker / API Routes
        ↓                              ↓
  PostgreSQL (shared)         Response to user/WhatsApp/SaaS products
```

Separation principle: embeddings local (free, private, fast), generation cloud (powerful, pay-per-use).

> **Note**: n8n can be used for prototyping RAG workflows but production RAG should be implemented
> programmatically via Antigravity (Node.js workers / Next.js API routes). n8n is backup only.

## Quick Start

### 1. Ollama Setup (Embedding Only)

```bash
# Install and configure for memory-constrained server
OLLAMA_KEEP_ALIVE=0           # Unload immediately after processing
OLLAMA_MAX_LOADED_MODELS=1    # One model at a time
OLLAMA_NUM_PARALLEL=1         # No parallel inference
OLLAMA_FLASH_ATTENTION=1      # Memory optimization
OLLAMA_KV_CACHE_TYPE=q8_0     # Quantized KV cache

ollama pull nomic-embed-text
```

### 2. pgvector Schema

```sql
CREATE EXTENSION vector;

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    metadata JSONB,
    content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- HNSW index (conservative for low memory)
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
    WITH (m = 12, ef_construction = 64);

-- Full-text search for hybrid retrieval
CREATE INDEX ON documents USING GIN (content_tsv);

-- Tenant isolation
CREATE INDEX ON documents (tenant_id);
```

### 3. Integration Patterns

**Production (Antigravity)**: Node.js service with direct pgvector queries + Ollama HTTP API.
- Ingestion: API route / BullMQ worker → chunk text → embed via Ollama → INSERT into documents table
- Retrieval: Query endpoint → embed query → pgvector similarity search → LiteLLM for generation

**Prototyping (n8n — backup only)**: n8n nodes for quick testing. Not for production.
- Ingestion: File Trigger → Text Splitter → PGVector Insert + Ollama Embeddings node
- Query: Chat Trigger → AI Agent (LiteLLM) + PGVector Retrieve (Ollama)

### 4. LiteLLM Proxy (Optional)

Point API calls at `http://localhost:4000`. Decouples model selection from application logic.

## References

| Topic | Source | When to Read |
|-------|--------|-------------|
| Ollama config & status | `docs/INFRA_SSOT.md` § Ollama | Connection details, systemd config, RAM usage |
| Embedding model (current) | nomic-embed-text (768-dim, 8K context) | Changing embedding model |
| pgvector tuning | HNSW params in schema above (m=12, ef_construction=64) | Index tuning |
| Memory budget | See table below | Production deployment |
| Architecture decisions | `findings.md` § RAG, `DECISIONS.md` | Past issues, constraints |

## Memory Budget (6GB Server)

| Service | RAM | Notes |
|---------|-----|-------|
| Ubuntu + Docker | ~1GB | OS baseline |
| PostgreSQL + pgvector | ~500MB-1.5GB | Conservative shared_buffers |
| n8n | ~300-500MB | Workflow automation |
| Ollama (when active) | ~500MB-1.2GB | Loads/unloads per KEEP_ALIVE=0 |
| LiteLLM | ~100MB | API routing |
| **Total** | **~2.4-4.3GB** | Headroom for spikes |

## Chunking Strategy

- **Default**: 256-512 tokens with 10-20% overlap (400 tokens, 50 overlap)
- **Fact-based Q&A**: 64-128 tokens (precision)
- **Summarization**: 512-1024 tokens (context completeness)
- Use recursive character text splitter
