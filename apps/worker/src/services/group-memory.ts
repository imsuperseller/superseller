/**
 * group-memory.ts — 3-tier memory for ClaudeClaw group agent
 *
 * Tier 1: Short-term buffer — recent messages from group_messages table (last N)
 * Tier 2: Semantic memory — pgvector embeddings in tenant_memories
 * Tier 3: Structured profiles — named entities/facts in tenant_profiles
 *
 * Extraction: Every MEMORY_EXTRACT_INTERVAL messages, Claude Haiku extracts facts
 * and writes them into Tier 2 + 3.
 */

import { query, queryOne } from "../db/client";
import { logger } from "../utils/logger";
import { config } from "../config";
import { ingestDocument } from "./rag";

// ─── Constants ────────────────────────────────────────────────
const SHORT_TERM_LIMIT = 30;       // # recent messages to include in context
const MEMORY_EXTRACT_INTERVAL = 15; // Extract memories every N messages
const EMBEDDING_MODEL = "nomic-embed-text";

// ─── Types ────────────────────────────────────────────────────
export interface GroupMessage {
    id?: number;
    groupId: string;
    tenantId: string;
    senderPhone?: string;
    content: string;
    isAgent?: boolean;
    createdAt?: Date;
}

export interface TenantMemory {
    id: number;
    tenantId: string;
    groupId: string;
    memoryType: string; // 'fact' | 'preference' | 'decision' | 'entity'
    content: string;
    extractedFrom: string;
    createdAt: Date;
}

export interface TenantProfile {
    id: number;
    tenantId: string;
    entityType: string; // 'person' | 'project' | 'preference' | 'constraint'
    entityName: string;
    attributes: Record<string, unknown>;
    updatedAt: Date;
}

export interface GroupContext {
    recentMessages: GroupMessage[];
    semanticMemories: string[];
    profiles: TenantProfile[];
}

// ─── Table Init ───────────────────────────────────────────────

export async function initGroupMemoryTables(): Promise<void> {
    // Tier 1: message archive
    await query(`
        CREATE TABLE IF NOT EXISTS group_messages (
            id SERIAL PRIMARY KEY,
            group_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            sender_phone TEXT,
            content TEXT NOT NULL,
            is_agent BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_group_messages_tenant_id ON group_messages(tenant_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at DESC)`);

    // Tier 3: structured profiles
    await query(`
        CREATE TABLE IF NOT EXISTS tenant_profiles (
            id SERIAL PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_name TEXT NOT NULL,
            attributes JSONB NOT NULL DEFAULT '{}',
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(tenant_id, entity_type, entity_name)
        )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_tenant_profiles_tenant_id ON tenant_profiles(tenant_id)`);

    // Tier 2: tenant_memories uses the documents table with tenant_id isolation
    // No separate table needed — uses RAG ingestDocument() + search()

    logger.info({ msg: "Group memory tables initialized" });
}

// ─── Tier 1: Log Messages ─────────────────────────────────────

export async function logGroupMessage(msg: GroupMessage): Promise<void> {
    try {
        await query(
            `INSERT INTO group_messages (group_id, tenant_id, sender_phone, content, is_agent)
             VALUES ($1, $2, $3, $4, $5)`,
            [msg.groupId, msg.tenantId, msg.senderPhone || null, msg.content, msg.isAgent || false],
        );
    } catch (err) {
        logger.error({ msg: "Failed to log group message", error: (err as Error).message });
    }
}

export async function getRecentMessages(groupId: string, limit: number = SHORT_TERM_LIMIT): Promise<GroupMessage[]> {
    const rows = await query<any>(
        `SELECT id, group_id, tenant_id, sender_phone, content, is_agent, created_at
         FROM group_messages
         WHERE group_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [groupId, limit],
    );
    return rows.reverse().map((r: any) => ({
        id: r.id,
        groupId: r.group_id,
        tenantId: r.tenant_id,
        senderPhone: r.sender_phone,
        content: r.content,
        isAgent: r.is_agent,
        createdAt: r.created_at,
    }));
}

export async function getMessageCount(groupId: string): Promise<number> {
    const row = await queryOne<{ count: string }>(
        `SELECT COUNT(*) as count FROM group_messages WHERE group_id = $1`,
        [groupId],
    );
    return parseInt(row?.count || "0", 10);
}

// ─── Tier 2: Semantic Memory ──────────────────────────────────

async function searchSemanticMemory(tenantId: string, query_text: string, limit = 5): Promise<string[]> {
    try {
        const { hybridSearch, textSearch } = await import("./rag");
        let results;
        try {
            results = await hybridSearch(tenantId, query_text, limit);
        } catch {
            results = await textSearch(tenantId, query_text, limit);
        }
        return results.map((r) => r.content);
    } catch {
        return [];
    }
}

// ─── Tier 3: Structured Profiles ─────────────────────────────

export async function getProfiles(tenantId: string): Promise<TenantProfile[]> {
    const rows = await query<any>(
        `SELECT id, tenant_id, entity_type, entity_name, attributes, updated_at
         FROM tenant_profiles WHERE tenant_id = $1 ORDER BY updated_at DESC LIMIT 20`,
        [tenantId],
    );
    return rows.map((r: any) => ({
        id: r.id,
        tenantId: r.tenant_id,
        entityType: r.entity_type,
        entityName: r.entity_name,
        attributes: r.attributes || {},
        updatedAt: new Date(r.updated_at),
    }));
}

export async function upsertProfile(
    tenantId: string,
    entityType: string,
    entityName: string,
    attributes: Record<string, unknown>,
): Promise<void> {
    await query(
        `INSERT INTO tenant_profiles (tenant_id, entity_type, entity_name, attributes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tenant_id, entity_type, entity_name)
         DO UPDATE SET attributes = tenant_profiles.attributes || EXCLUDED.attributes, updated_at = NOW()`,
        [tenantId, entityType, entityName, JSON.stringify(attributes)],
    );
}

// ─── Context Assembly ─────────────────────────────────────────

/**
 * Assemble 3-tier memory context into a string for injection into system prompt.
 */
export async function assembleGroupContext(
    groupId: string,
    tenantId: string,
    currentMessage: string,
): Promise<string> {
    const [recentMessages, semanticMemories, profiles] = await Promise.all([
        getRecentMessages(groupId, SHORT_TERM_LIMIT),
        searchSemanticMemory(tenantId, currentMessage, 5),
        getProfiles(tenantId),
    ]);

    const parts: string[] = [];

    // Tier 1: Recent conversation
    if (recentMessages.length > 0) {
        const conversation = recentMessages.map((m) => {
            const who = m.isAgent ? "Agent" : (m.senderPhone ? `User(${m.senderPhone})` : "User");
            return `[${who}]: ${m.content}`;
        }).join("\n");
        parts.push(`=== RECENT CONVERSATION (last ${recentMessages.length} messages) ===\n${conversation}`);
    }

    // Tier 2: Semantic memories
    if (semanticMemories.length > 0) {
        const memBlock = semanticMemories.map((m, i) => `${i + 1}. ${m}`).join("\n");
        parts.push(`=== SEMANTIC MEMORY (relevant context) ===\n${memBlock}`);
    }

    // Tier 3: Structured profiles
    if (profiles.length > 0) {
        const profBlock = profiles.map((p) => {
            const attrs = JSON.stringify(p.attributes, null, 2);
            return `• ${p.entityType} — ${p.entityName}: ${attrs}`;
        }).join("\n");
        parts.push(`=== KNOWN ENTITIES & PROFILES ===\n${profBlock}`);
    }

    return parts.join("\n\n");
}

// ─── Memory Extraction ────────────────────────────────────────

/**
 * Every MEMORY_EXTRACT_INTERVAL messages, extract facts/entities from recent conversation
 * using Claude Haiku → write to Tier 2 (RAG) + Tier 3 (profiles).
 */
export async function maybeExtractMemories(groupId: string, tenantId: string): Promise<void> {
    try {
        const count = await getMessageCount(groupId);
        if (count % MEMORY_EXTRACT_INTERVAL !== 0 || count === 0) return;

        const recent = await getRecentMessages(groupId, MEMORY_EXTRACT_INTERVAL);
        if (recent.length < MEMORY_EXTRACT_INTERVAL) return;

        logger.info({ msg: "Extracting group memories", groupId, tenantId, messageCount: count });

        const conversation = recent.map((m) => {
            const who = m.isAgent ? "Agent" : (m.senderPhone ? `User(${m.senderPhone})` : "User");
            return `${who}: ${m.content}`;
        }).join("\n");

        const extractionPrompt = `Extract structured information from this WhatsApp conversation excerpt.
Return JSON with these fields:
{
  "facts": ["factual statements about the business, team, products, or decisions"],
  "preferences": ["communication style, formatting, or behavior preferences mentioned"],
  "decisions": ["specific decisions made in this conversation"],
  "entities": [{"type": "person|project|product|constraint", "name": "...", "attributes": {...}}]
}
Only include what is explicitly stated. Do not infer or fabricate.

CONVERSATION:
${conversation}

Return only valid JSON, no explanation.`;

        let extracted: any = null;
        try {
            const Anthropic = (await import("@anthropic-ai/sdk")).default;
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
            const response = await anthropic.messages.create({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 1024,
                messages: [{ role: "user", content: extractionPrompt }],
            });
            const textBlock = response.content.find((b: any) => b.type === "text") as { type: "text"; text: string } | undefined;
            const text = textBlock?.text || "";
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) extracted = JSON.parse(jsonMatch[0]);
        } catch (err) {
            logger.warn({ msg: "Memory extraction failed", error: (err as Error).message });
            return;
        }

        if (!extracted) return;

        // Ingest facts + decisions + preferences into Tier 2 (RAG)
        const allFacts = [
            ...(extracted.facts || []),
            ...(extracted.decisions || []),
            ...(extracted.preferences || []),
        ].filter(Boolean);

        for (const fact of allFacts) {
            await ingestDocument(
                tenantId,
                `group-memory:${groupId}`,
                `Extracted at msg ${count}`,
                fact,
                { groupId, extractedAt: new Date().toISOString() },
            );
        }

        // Upsert entities into Tier 3 (profiles)
        for (const entity of (extracted.entities || [])) {
            await upsertProfile(tenantId, entity.type, entity.name, entity.attributes || {});
        }

        logger.info({
            msg: "Memory extraction complete",
            groupId,
            facts: allFacts.length,
            entities: (extracted.entities || []).length,
        });
    } catch (err) {
        logger.error({ msg: "maybeExtractMemories error", error: (err as Error).message });
    }
}
