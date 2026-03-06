import { config } from "../config";
import { query, queryOne } from "../db/client";
import { logger } from "../utils/logger";

// ─── Types ───

export interface ChunkOptions {
    chunkSize?: number;    // tokens (approx chars / 4)
    chunkOverlap?: number; // overlap in chars
}

export interface Document {
    id: number;
    tenant_id: string;
    source: string;
    title: string | null;
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface SearchResult extends Document {
    similarity: number;
}

export interface HybridResult extends Document {
    similarity: number;
    text_rank: number;
    combined_score: number;
}

export interface IngestResult {
    documentCount: number;
    source: string;
    tenantId: string;
}

// ─── Ollama Embedding ───

async function embed(text: string): Promise<number[]> {
    const response = await fetch(`${config.ollama.url}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: config.ollama.model,
            prompt: text,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Ollama embedding failed (${response.status}): ${err}`);
    }

    const data = await response.json() as { embedding: number[] };
    if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error("Ollama returned invalid embedding response");
    }
    return data.embedding;
}

// ─── Text Chunking ───

export function chunkText(text: string, opts?: ChunkOptions): string[] {
    const chunkSize = (opts?.chunkSize ?? 400) * 4; // approx tokens to chars
    const overlap = opts?.chunkOverlap ?? Math.floor(chunkSize * 0.12);

    if (text.length <= chunkSize) return [text];

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        let end = start + chunkSize;

        // Try to break at paragraph, then sentence, then word boundary
        if (end < text.length) {
            const slice = text.slice(start, end + 200);
            const parBreak = slice.lastIndexOf("\n\n");
            const sentBreak = Math.max(
                slice.lastIndexOf(". "),
                slice.lastIndexOf("? "),
                slice.lastIndexOf("! "),
            );
            const wordBreak = slice.lastIndexOf(" ");

            if (parBreak > chunkSize * 0.5) end = start + parBreak + 2;
            else if (sentBreak > chunkSize * 0.5) end = start + sentBreak + 2;
            else if (wordBreak > chunkSize * 0.5) end = start + wordBreak + 1;
        }

        end = Math.min(end, text.length);
        const chunk = text.slice(start, end).trim();
        if (chunk.length > 0) chunks.push(chunk);

        start = end - overlap;
        if (start >= text.length) break;
    }

    return chunks;
}

// ─── Ingest ───

export async function ingestDocument(
    tenantId: string,
    source: string,
    title: string | null,
    content: string,
    metadata?: Record<string, unknown>,
    chunkOpts?: ChunkOptions,
): Promise<IngestResult> {
    const chunks = chunkText(content, chunkOpts);
    const meta = metadata ?? {};

    logger.info({ msg: "RAG ingest starting", tenantId, source, chunks: chunks.length });

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await embed(chunk);
        const embeddingStr = `[${embedding.join(",")}]`;

        await query(
            `INSERT INTO documents (tenant_id, source, title, content, embedding, metadata)
             VALUES ($1, $2, $3, $4, $5::vector, $6)`,
            [
                tenantId,
                source,
                title ? `${title} (${i + 1}/${chunks.length})` : null,
                chunk,
                embeddingStr,
                JSON.stringify({ ...meta, chunk_index: i, total_chunks: chunks.length }),
            ],
        );
    }

    logger.info({ msg: "RAG ingest complete", tenantId, source, chunks: chunks.length });
    return { documentCount: chunks.length, source, tenantId };
}

// ─── Vector Search ───

export async function search(
    tenantId: string,
    queryText: string,
    limit: number = 5,
): Promise<SearchResult[]> {
    const queryEmbedding = await embed(queryText);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    const rows = await query<SearchResult>(
        `SELECT id, tenant_id, source, title, content, metadata, created_at,
                1 - (embedding <=> $1::vector) as similarity
         FROM documents
         WHERE tenant_id = $2
         ORDER BY embedding <=> $1::vector
         LIMIT $3`,
        [embeddingStr, tenantId, limit],
    );

    return rows;
}

// ─── Hybrid Search (vector + full-text) ───

export async function hybridSearch(
    tenantId: string,
    queryText: string,
    limit: number = 5,
    vectorWeight: number = 0.7,
): Promise<HybridResult[]> {
    const queryEmbedding = await embed(queryText);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    const rows = await query<HybridResult>(
        `SELECT id, tenant_id, source, title, content, metadata, created_at,
                1 - (embedding <=> $1::vector) as similarity,
                ts_rank(content_tsv, plainto_tsquery('english', $3)) as text_rank,
                ($4 * (1 - (embedding <=> $1::vector))) + ((1 - $4) * ts_rank(content_tsv, plainto_tsquery('english', $3))) as combined_score
         FROM documents
         WHERE tenant_id = $2
           AND (embedding <=> $1::vector) < 0.8
         ORDER BY combined_score DESC
         LIMIT $5`,
        [embeddingStr, tenantId, queryText, vectorWeight, limit],
    );

    return rows;
}

// ─── List Documents ───

export async function listDocuments(
    tenantId: string,
    source?: string,
): Promise<Pick<Document, "id" | "tenant_id" | "source" | "title" | "created_at">[]> {
    if (source) {
        return query(
            `SELECT id, tenant_id, source, title, created_at FROM documents WHERE tenant_id = $1 AND source = $2 ORDER BY created_at DESC`,
            [tenantId, source],
        );
    }
    return query(
        `SELECT id, tenant_id, source, title, created_at FROM documents WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 100`,
        [tenantId],
    );
}

// ─── Text-Only Search (fallback when embeddings unavailable) ───

export async function textSearch(
    tenantId: string,
    queryText: string,
    limit: number = 5,
): Promise<HybridResult[]> {
    const rows = await query<HybridResult>(
        `SELECT id, tenant_id, source, title, content, metadata, created_at,
                0 as similarity,
                ts_rank(content_tsv, plainto_tsquery('english', $2)) as text_rank,
                ts_rank(content_tsv, plainto_tsquery('english', $2)) as combined_score
         FROM documents
         WHERE tenant_id = $1
           AND content_tsv @@ plainto_tsquery('english', $2)
         ORDER BY text_rank DESC
         LIMIT $3`,
        [tenantId, queryText, limit],
    );
    return rows;
}

// ─── Convenience: Search for ClaudeClaw context ───

/**
 * Search system docs and return formatted markdown string for prompt injection.
 * Uses hybrid search (vector + text) when embeddings available, falls back to text-only.
 */
export async function searchForContext(queryText: string, tenantId: string = "system", limit: number = 5): Promise<string> {
    let results: HybridResult[];
    try {
        results = await hybridSearch(tenantId, queryText, limit);
    } catch {
        // Embedding failed (Ollama down, model not loaded, etc.) — use text-only search
        results = await textSearch(tenantId, queryText, limit);
    }

    if (results.length === 0) {
        // Last resort: text-only search even if hybrid returned empty
        if (results.length === 0) {
            results = await textSearch(tenantId, queryText, limit);
        }
    }

    if (results.length === 0) return "";

    const sections = results.map((r, i) => {
        const source = r.source || "unknown";
        const title = r.title || "";
        const score = (r.combined_score ?? r.similarity ?? 0).toFixed(3);
        return `[${i + 1}] (${source}${title ? ` — ${title}` : ""}, score: ${score})\n${r.content}`;
    });

    return sections.join("\n\n---\n\n");
}

// ─── Delete ───

export async function deleteDocument(id: number): Promise<boolean> {
    const rows = await query("DELETE FROM documents WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
}

export async function deleteBySource(tenantId: string, source: string): Promise<number> {
    const rows = await query(
        "DELETE FROM documents WHERE tenant_id = $1 AND source = $2 RETURNING id",
        [tenantId, source],
    );
    return rows.length;
}
