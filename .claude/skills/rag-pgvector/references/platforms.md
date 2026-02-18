# RAG Platform Comparison

## Recommended (fits 6GB server)

### AnythingLLM (Top Pick)

- **RAM**: ~1-2GB
- **pgvector**: Native (`:pg` Docker image uses PostgreSQL as both app DB and vector store)
- **Ollama**: Supported for embeddings + generation
- **Multi-user**: Admin, Manager, Default roles
- **API**: REST API for n8n integration
- **Widget**: Embeddable chat for client deployments
- **Limitation**: No reranking, basic chunking strategies

Best for: rapid client deployments, turnkey RAG.

### Open WebUI

- **RAM**: ~1-2GB
- **pgvector**: One of 9 supported vector stores
- **Ollama**: Best integration — manage models from UI
- **Extraction**: 5 engines (Tika, Docling, Document Intelligence, Mistral OCR, external)
- **Hybrid search**: Built-in BM25 + CrossEncoder reranking
- **Stars**: 70K+ GitHub (most active)

Best for: internal knowledge management, Ollama-centric workflows.

### LibreChat

- **RAM**: ~1-2GB
- **pgvector**: Primary (not optional) vector store
- **RAG API**: LangChain + PostgreSQL + FastAPI
- **UI**: Most polished ChatGPT-like interface
- **Auth**: LDAP, SSO, OAuth (enterprise-ready)
- **Features**: Conversation forking

Best for: document chat for internal teams and clients.

### Flowise

- **RAM**: ~1-2GB
- **pgvector**: Native via LangChain nodes
- **Drag-and-drop**: Visual RAG builder
- **Export**: Workflows exportable to n8n or code

Best for: prototyping, client demos (visual communicates architecture to non-technical stakeholders).

## Avoid

| Platform | Why |
|----------|-----|
| **RAGFlow** | No pgvector, needs Elasticsearch, 8GB+ RAM |
| **Dify** | pgvector only via community plugin, 4-8GB+ RAM |
| **PrivateGPT** | Development slowing, no multi-tenant |

## n8n as RAG Orchestrator

n8n's native PGVector Vector Store node supports 4 modes:
- Insert Documents
- Get Many
- Retrieve Documents (as Chain)
- Retrieve Documents (as Tool for Agent)

**Limitations**:
- No native hybrid search (implement BM25+vector fusion via Code node)
- No Ollama reranker node (only Cohere built-in)
- Known bug: embedding dimensions can be truncated (GitHub #21601)

**Templates**:
- #3762: Gmail → vector embeddings with PGVector + Ollama
- #2845: Complete WhatsApp RAG chatbot
- n8n Self-hosted AI Starter Kit (Docker Compose: Ollama + PostgreSQL + n8n)

## LiteLLM (Generation Routing)

- **RAM**: ~100MB
- **Purpose**: Unified OpenAI-compatible API to 100+ providers
- **Features**: Cost tracking per tenant, auto retry/fallback, budget caps
- **n8n integration**: Point OpenAI node at `http://localhost:4000`

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: sk-ant-...
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-...
  - model_name: gemini-flash
    litellm_params:
      model: vertex_ai/gemini-2.0-flash
```

Tiered routing: cheap models (Gemini Flash, DeepSeek) for simple queries, premium (Claude Sonnet, GPT-4o) for complex reasoning.

**OpenRouter** alternative: 290+ models, 5.5% fee, but no local Ollama fallback.
