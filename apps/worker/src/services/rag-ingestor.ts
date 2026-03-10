/**
 * rag-ingestor.ts — Scheduled RAG ingestion jobs
 *
 * Jobs (called by scheduler.ts):
 * - ingestHealthContext(): Hourly — captures current system health snapshot into RAG
 * - runFullIngestion(): Daily — re-ingests all system docs, config, and status data
 *
 * All documents go into tenant_id = config.rag.systemTenant (default: "system")
 * to power ClaudeClaw's /rag search + context assembly.
 */

import { logger } from "../utils/logger";
import { config } from "../config";
import { ingestDocument, deleteBySource } from "./rag";
import { query } from "../db/client";

const SYSTEM_TENANT = (config as any).rag?.systemTenant || "system";

// ─── Health Context Ingest ────────────────────────────────────

/**
 * Capture current health snapshot and store in RAG for context-aware responses.
 * Called hourly. Replaces previous health snapshot (source key: "health-snapshot").
 */
export async function ingestHealthContext(): Promise<void> {
    try {
        const { getHealthSnapshot, formatHealthSummary } = await import("./health-monitor");
        const snapshot = await getHealthSnapshot();
        const summary = formatHealthSummary(snapshot);

        // Replace previous health context
        await deleteBySource(SYSTEM_TENANT, "health-snapshot");

        await ingestDocument(
            SYSTEM_TENANT,
            "health-snapshot",
            `System Health — ${new Date().toISOString()}`,
            summary,
            { capturedAt: new Date().toISOString(), type: "health" },
        );

        logger.info({ msg: "RAG: health context ingested", tenant: SYSTEM_TENANT });
    } catch (err) {
        logger.warn({ msg: "RAG: health context ingest failed", error: (err as Error).message });
    }
}

// ─── Full Ingestion ───────────────────────────────────────────

interface IngestionResult {
    sources: number;
    documents: number;
    errors: number;
}

/**
 * Daily full re-ingestion.
 * Sources: pending jobs summary, recent error log, group configs, system state,
 * product knowledge, customer data, and business context.
 */
export async function runFullIngestion(): Promise<IngestionResult> {
    let sources = 0;
    let documents = 0;
    let errors = 0;

    const jobs: Array<{ source: string; fn: () => Promise<number> }> = [
        {
            source: "job-queue-summary",
            fn: async () => {
                const content = await buildJobQueueSummary();
                if (!content) return 0;
                await deleteBySource(SYSTEM_TENANT, "job-queue-summary");
                const result = await ingestDocument(SYSTEM_TENANT, "job-queue-summary", "BullMQ Job Queue State", content, { type: "queue" });
                return result.documentCount;
            },
        },
        {
            source: "group-config-summary",
            fn: async () => {
                const content = await buildGroupConfigSummary();
                if (!content) return 0;
                await deleteBySource(SYSTEM_TENANT, "group-config-summary");
                const result = await ingestDocument(SYSTEM_TENANT, "group-config-summary", "Registered Groups & Tenants", content, { type: "config" });
                return result.documentCount;
            },
        },
        {
            source: "recent-errors",
            fn: async () => {
                const content = await buildRecentErrorSummary();
                if (!content) return 0;
                await deleteBySource(SYSTEM_TENANT, "recent-errors");
                const result = await ingestDocument(SYSTEM_TENANT, "recent-errors", "Recent System Errors (24h)", content, { type: "errors" });
                return result.documentCount;
            },
        },
        {
            source: "health-snapshot",
            fn: async () => {
                await ingestHealthContext();
                return 1;
            },
        },
        {
            source: "product-knowledge",
            fn: async () => {
                const content = buildProductKnowledge();
                await deleteBySource(SYSTEM_TENANT, "product-knowledge");
                const result = await ingestDocument(SYSTEM_TENANT, "product-knowledge", "SuperSeller AI Products & Services", content, { type: "knowledge" });
                return result.documentCount;
            },
        },
        {
            source: "customer-summary",
            fn: async () => {
                const content = await buildCustomerSummary();
                if (!content) return 0;
                await deleteBySource(SYSTEM_TENANT, "customer-summary");
                const result = await ingestDocument(SYSTEM_TENANT, "customer-summary", "Customer & Prospect Summary", content, { type: "customer" });
                return result.documentCount;
            },
        },
        {
            source: "business-context",
            fn: async () => {
                const content = await buildBusinessContext();
                if (!content) return 0;
                await deleteBySource(SYSTEM_TENANT, "business-context");
                const result = await ingestDocument(SYSTEM_TENANT, "business-context", "Business Context & Operations", content, { type: "business" });
                return result.documentCount;
            },
        },
    ];

    for (const job of jobs) {
        try {
            const count = await job.fn();
            documents += count;
            sources++;
        } catch (err) {
            errors++;
            logger.warn({ msg: `RAG: ${job.source} ingestion failed`, error: (err as Error).message });
        }
    }

    logger.info({ msg: "RAG full ingestion complete", sources, documents, errors });
    return { sources, documents, errors };
}

// ─── Data Builders ────────────────────────────────────────────

async function buildJobQueueSummary(): Promise<string | null> {
    try {
        const rows = await query<any>(
            `SELECT status, COUNT(*) as count
             FROM jobs
             GROUP BY status
             ORDER BY count DESC`,
        );
        if (!rows.length) return null;

        const lines = rows.map((r: any) => `• ${r.status}: ${r.count} jobs`);
        const total = rows.reduce((sum: number, r: any) => sum + parseInt(r.count, 10), 0);

        const recentFailed = await query<any>(
            `SELECT id, product, status, error_message, created_at
             FROM jobs
             WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours'
             ORDER BY created_at DESC LIMIT 10`,
        );

        const parts = [
            `Job Queue Summary — ${new Date().toISOString()}`,
            `Total jobs: ${total}`,
            lines.join("\n"),
        ];

        if (recentFailed.length > 0) {
            parts.push(
                "",
                "Recent failures (24h):",
                ...recentFailed.map((j: any) => `• [${j.id}] ${j.product || "unknown"}: ${j.error_message || "no error"}`),
            );
        }

        return parts.join("\n");
    } catch {
        return null;
    }
}

async function buildGroupConfigSummary(): Promise<string | null> {
    try {
        const rows = await query<any>(
            `SELECT group_id, tenant_id, agent_name, agent_role, registered_at
             FROM group_agent_config ORDER BY registered_at`,
        );
        if (!rows.length) return "No groups registered.";

        const lines = rows.map((r: any) =>
            `• Group ${r.group_id}\n  Tenant: ${r.tenant_id}\n  Agent: ${r.agent_name} (${r.agent_role})`,
        );

        return `Registered WhatsApp Groups — ${new Date().toISOString()}\n\n${lines.join("\n\n")}`;
    } catch {
        return null;
    }
}

async function buildRecentErrorSummary(): Promise<string | null> {
    try {
        const rows = await query<any>(
            `SELECT service, status, details, checked_at
             FROM health_checks
             WHERE status IN ('degraded', 'unhealthy', 'down', 'critical', 'warning') AND checked_at > NOW() - INTERVAL '24 hours'
             ORDER BY checked_at DESC LIMIT 20`,
        );

        if (!rows.length) return null;

        const lines = rows.map((r: any) =>
            `• [${r.service}] ${r.status.toUpperCase()} at ${r.checked_at}`,
        );

        return `System Errors / Degradations — Last 24h — ${new Date().toISOString()}\n\n${lines.join("\n")}`;
    } catch {
        return null;
    }
}

// ─── Product Knowledge (static, refreshed daily) ─────────────

function buildProductKnowledge(): string {
    return `SuperSeller AI — Product & Service Knowledge Base

== Products ==

1. VideoForge — AI real estate video pipeline
   - Dual path: Kling 3.0 AI clips + FFmpeg assembly, OR Remotion photo composition (Ken Burns, transitions)
   - Input: Zillow/property listing URL → Output: Branded property video
   - Pricing: Pro clips $0.10/each, Standard $0.03/each
   - Status: Live, 25+ videos produced

2. FB Marketplace Bot — Automated Facebook listing system
   - Multi-tenant: UAD (furniture), MissParty (party supplies)
   - Daily automated posting via GoLogin + Puppeteer
   - AI-generated product descriptions via Gemini
   - Status: Live, posting daily

3. Winner Studio — AI avatar video for construction (Mivnim/Yossi)
   - Gemini brain routing, Kie.ai avatar-pro/infinitalk
   - WhatsApp delivery via WAHA
   - Status: Built, not actively used

4. Lead Landing Pages — Dynamic customer landing pages
   - /lp/[slug] with per-customer branding
   - Lead capture → WhatsApp notification
   - Status: Ready for sale

5. FrontDesk Voice AI — Telnyx-powered AI receptionist
   - Voice assistant, call transfer, conversation polling
   - Status: Partial

6. ClaudeClaw — WhatsApp AI bridge (this system)
   - Personal assistant mode + business group agent
   - 3-tier memory, RAG context, guardrails
   - Status: Active

7. AgentForge — Multi-stage AI research pipeline
   - Business discovery, design analysis, market research
   - Status: Spec only

8. SocialHub — Multi-platform social media management
   - Content generation + multi-platform publishing
   - Status: Spec only

== Infrastructure ==
- Server: RackNerd VPS (172.245.56.50), Ubuntu 24.04, 6GB RAM, 100GB disk
- Web: Next.js 14+ on Vercel (superseller.agency, admin.superseller.agency)
- Worker: Node.js + BullMQ + PM2 on RackNerd (port 3002)
- Database: PostgreSQL + pgvector (Prisma web, Drizzle worker)
- Cache: Redis in Docker (BullMQ queues, sessions)
- AI: Ollama (nomic-embed-text for RAG), Kie.ai (Kling 3.0), Claude, Gemini
- WhatsApp: WAHA Pro (4 sessions, 2 working)
- Storage: Cloudflare R2

== Pricing ==
- Kling Pro clip: $0.10, Standard: $0.03
- Suno music: $0.06
- Nano Banana upscale: $0.02
- Gemini: $0.001/call
- Recraft image: $0.04`;
}

async function buildCustomerSummary(): Promise<string | null> {
    try {
        const users = await query<any>(
            `SELECT id, name, email, phone, plan, created_at FROM "User" ORDER BY created_at DESC LIMIT 20`,
        );
        if (!users.length) return null;
        const lines = users.map((u: any) =>
            `• ${u.name || "Unknown"} (${u.email || "no email"}) — plan: ${u.plan || "free"}, since: ${new Date(u.created_at).toLocaleDateString()}`
        );

        return `Customer & Prospect Summary — ${new Date().toISOString()}\n\n` +
            `Active Customers:\n${lines.join("\n")}\n\n` +
            `Key Accounts:\n` +
            `• Elite Pro Remodeling (Saar) — $2,000/mo, construction before/after content, IG automation\n` +
            `• UAD — FB Marketplace furniture listings, daily posting\n` +
            `• Miss Party — FB Marketplace party supplies, daily posting\n` +
            `• Yoram Friedman — Insurance landing page pending\n` +
            `• Avi Construction — Construction marketing, landing page live\n` +
            `• Kedem Developments — Real estate marketing prospect\n` +
            `• Mivnim/Yossi — Construction video studio (Winner Studio)`;
    } catch {
        return null;
    }
}

async function buildBusinessContext(): Promise<string | null> {
    try {
        const videoCount = await query<any>(`SELECT count(*) as c FROM video_jobs`);
        const listingCount = await query<any>(`SELECT count(*) as c FROM marketplace_listings WHERE status = 'posted'`);

        return `Business Context — ${new Date().toISOString()}\n\n` +
            `SuperSeller AI is a SaaS platform providing AI-powered marketing tools for small businesses.\n` +
            `Owner: Shai Friedman. Solo LLC.\n\n` +
            `Current Era: Self-Serving SaaS (Programmatic Stack)\n` +
            `Main Engine: Antigravity (Node.js/Postgres/R2)\n\n` +
            `Stats:\n` +
            `• Total video jobs: ${videoCount[0]?.c || 0}\n` +
            `• Total marketplace listings: ${listingCount[0]?.c || 0}\n\n` +
            `Payment: PayPal (migrated from Stripe Feb 2026)\n` +
            `Credits system: prepaid credits for API-consuming operations\n\n` +
            `Key Decisions:\n` +
            `• n8n is backup, Antigravity is primary automation\n` +
            `• Firestore retired, PostgreSQL is the only DB truth\n` +
            `• Airtable.com retired, Aitable.ai for dashboards only\n` +
            `• QuickBooks cancelled Mar 2026\n` +
            `• Rensto and SuperSeller are separate businesses — never mix`;
    } catch {
        return null;
    }
}
