# Embedding Models for 6GB Server

## Model Comparison

| Model | RAM | Dimensions | Quality | Context | Best For |
|-------|-----|-----------|---------|---------|----------|
| `nomic-embed-text` | ~500MB | 768 | 89-90% retrieval | 8,192 tokens | **Default** — best balance |
| `mxbai-embed-large` | ~1.2GB | 1,024 | 64.68 BEIR (beats OpenAI) | 512 tokens | Maximum quality |
| `all-minilm:33m` | ~250MB | 384 | 87.9% retrieval | 512 tokens | Minimum footprint |
| `nomic-embed-text-v2-moe` | ~800MB | 768 | Competitive with 2x models | 8K tokens | Multilingual (100+ langs) |
| `qwen3-embedding:0.6b` | ~1-1.5GB | Variable | Strong multilingual | 32K tokens | Newest, multilingual |

## Ollama Memory Configuration (Mandatory)

```bash
# Add to /etc/environment or Docker env
OLLAMA_KEEP_ALIVE=0           # Immediate unload after processing
OLLAMA_MAX_LOADED_MODELS=1    # Only one model loaded at a time
OLLAMA_NUM_PARALLEL=1         # No parallel inference
OLLAMA_FLASH_ATTENTION=1      # Memory optimization
OLLAMA_KV_CACHE_TYPE=q8_0     # Quantized KV cache
```

With these settings, the embedding model loads ONLY during active processing and frees RAM immediately. This allows Ollama and PostgreSQL to timeshare the same 3-4GB.

## nomic-embed-text (Default Choice)

- 53.7M Ollama pulls — most popular embedding model
- 768 dimensions, 8,192-token context window
- ~15-50ms per embedding on CPU
- Confirmed working on 4GB RAM CPU-only systems
- Long context handles larger chunks without truncation

## mxbai-embed-large (Quality Upgrade)

- 1,024 dimensions — 33% larger vectors in pgvector
- 64.68 BEIR score — outperforms OpenAI text-embedding-3-large (64.59)
- ~1.2GB RAM — uses ~700MB more than nomic
- 512-token context — needs smaller chunks
- Use when retrieval quality is the top priority

## all-minilm:33m (Lightweight)

- Only ~250MB RAM
- 384 dimensions — smallest vectors, lowest storage
- 87.9% retrieval accuracy despite tiny size
- Ideal during high-concurrency or alongside local LLM

## Free Embedding APIs (Hybrid Approach)

Use local for production, free APIs for benchmarking/demos:

| Provider | Dimensions | Free Tier | Best For |
|----------|-----------|-----------|----------|
| Google `gemini-embedding-001` | 3,072 | 100 RPM (free) | Highest quality, rate limited |
| Voyage AI | Variable | 200M tokens (one-time) | Top-ranked retrieval |
| Jina AI v3/v4 | Variable | 100 RPM, 100K TPM | Multilingual |

**Rule**: Client-sensitive data (contracts, HR, financial) → always local embeddings. POCs and demos → free APIs deliver higher quality that helps close deals.

## Changing Embedding Models (Blue-Green)

Never swap models in-place — vectors from different models are incompatible.

1. Add new embedding column: `ALTER TABLE documents ADD COLUMN embedding_v2 vector(1024);`
2. Re-embed in batches of 50-100 (avoid memory spikes)
3. Build HNSW index concurrently: `CREATE INDEX CONCURRENTLY ...`
4. Swap application to new column
5. Drop old column and index
6. Track model version in metadata: `metadata->>'embedding_model'`
