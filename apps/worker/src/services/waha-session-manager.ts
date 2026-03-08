/**
 * WAHA Pro Multi-Session Manager.
 *
 * Manages multiple WAHA sessions for different purposes:
 * - personal: Owner ClaudeClaw (full system access)
 * - superseller-whatsapp: Business assistant (customer-facing)
 * - customer-{slug}: Per-customer delivery (future)
 */

import { config } from "../config";
import { query } from "../db/client";
import { logger } from "../utils/logger";

export interface SessionConfig {
    name: string;
    purpose: string;
    webhookUrl: string;
    tenantSlug?: string;
}

interface WahaSessionResponse {
    name: string;
    status: string;  // STOPPED, STARTING, SCAN_QR_CODE, WORKING, FAILED
    me?: { id: string; pushName?: string };
}

function wahaUrl(path: string): string {
    return `${config.waha.url}${path}`;
}

function headers(): HeadersInit {
    return {
        "Content-Type": "application/json",
        "X-Api-Key": config.waha.apiKey,
    };
}

// ─── WAHA API Operations ───

export async function listSessions(): Promise<WahaSessionResponse[]> {
    const res = await fetch(wahaUrl("/api/sessions"), { headers: headers() });
    if (!res.ok) throw new Error(`WAHA listSessions failed: ${res.status}`);
    return res.json() as Promise<WahaSessionResponse[]>;
}

export async function getSessionStatus(name: string): Promise<string> {
    try {
        const res = await fetch(wahaUrl(`/api/sessions/${name}`), { headers: headers() });
        if (!res.ok) return "NOT_FOUND";
        const data = await res.json() as WahaSessionResponse;
        return data.status || "UNKNOWN";
    } catch {
        return "ERROR";
    }
}

export async function createSession(name: string, webhookUrl: string): Promise<boolean> {
    const res = await fetch(wahaUrl("/api/sessions"), {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
            name,
            start: true,
            config: {
                webhooks: [{
                    url: webhookUrl,
                    events: ["message"],
                }],
            },
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        if (body.includes("already exists")) {
            logger.info({ msg: "WAHA session already exists", name });
            return true;
        }
        logger.error({ msg: "WAHA createSession failed", name, status: res.status, body });
        return false;
    }

    logger.info({ msg: "WAHA session created", name, webhookUrl });
    return true;
}

export async function deleteSession(name: string): Promise<boolean> {
    const res = await fetch(wahaUrl(`/api/sessions/${name}`), {
        method: "DELETE",
        headers: headers(),
    });
    return res.ok;
}

export async function restartSession(name: string): Promise<boolean> {
    const res = await fetch(wahaUrl(`/api/sessions/${name}/restart`), {
        method: "POST",
        headers: headers(),
    });
    return res.ok;
}

export async function ensureSession(name: string, webhookUrl: string): Promise<string> {
    const status = await getSessionStatus(name);

    if (status === "WORKING") return "WORKING";

    if (status === "NOT_FOUND") {
        const created = await createSession(name, webhookUrl);
        if (!created) return "ERROR";
        await new Promise((r) => setTimeout(r, 2000));
        return getSessionStatus(name);
    }

    if (status === "STOPPED" || status === "FAILED") {
        await restartSession(name);
        await new Promise((r) => setTimeout(r, 2000));
        return getSessionStatus(name);
    }

    return status;
}

export async function checkAllSessions(): Promise<Record<string, string>> {
    const rows = await query<{ name: string }>(
        "SELECT name FROM waha_sessions"
    );

    const results: Record<string, string> = {};
    for (const row of rows) {
        results[row.name] = await getSessionStatus(row.name);
    }
    return results;
}

// ─── DB Sync ───

async function upsertSessionDb(cfg: SessionConfig, status: string): Promise<void> {
    await query(
        `INSERT INTO waha_sessions (name, purpose, webhook_url, tenant_slug, status, last_checked_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (name) DO UPDATE SET
            purpose = $2, webhook_url = $3, tenant_slug = $4, status = $5,
            last_checked_at = NOW(), updated_at = NOW()`,
        [cfg.name, cfg.purpose, cfg.webhookUrl, cfg.tenantSlug || null,
         status === "WORKING" ? "active" : status === "SCAN_QR_CODE" ? "qr-needed" : status === "ERROR" ? "error" : "inactive"]
    );
}

// ─── Bootstrap ───

export async function initWahaSessions(): Promise<void> {
    if (!config.waha.url || !config.waha.apiKey) {
        logger.warn({ msg: "WAHA not configured — skipping session bootstrap" });
        return;
    }

    await query(`
        CREATE TABLE IF NOT EXISTS waha_sessions (
            name TEXT PRIMARY KEY,
            purpose TEXT NOT NULL,
            webhook_url TEXT NOT NULL,
            tenant_slug TEXT,
            status TEXT NOT NULL DEFAULT 'inactive',
            last_checked_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    const webhookBase = config.wahaSessions.webhookBase;
    const sessions: SessionConfig[] = [
        {
            name: config.wahaSessions.personal,
            purpose: "Owner ClaudeClaw — full system access, Claude Agent SDK",
            webhookUrl: `${webhookBase}/claude?waha_session=${config.wahaSessions.personal}`,
        },
        {
            name: "superseller-whatsapp",
            purpose: "Business assistant — customer-facing (RAG + Claude)",
            webhookUrl: `${webhookBase}/claude/superseller?waha_session=superseller-whatsapp`,
        },
    ];

    for (const session of sessions) {
        try {
            const status = await ensureSession(session.name, session.webhookUrl);
            await upsertSessionDb(session, status);
            logger.info({ msg: "WAHA session ensured", name: session.name, status });
        } catch (err: any) {
            logger.error({ msg: "WAHA session bootstrap failed", name: session.name, error: err.message });
            await upsertSessionDb(session, "ERROR");
        }
    }

    logger.info({ msg: "WAHA multi-session bootstrap complete", sessions: sessions.length });
}
