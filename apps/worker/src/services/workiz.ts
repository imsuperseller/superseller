import { logger } from "../utils/logger";

// ─── TYPES ───

export interface WorkizLeadPayload {
    FirstName: string;
    LastName: string;
    Phone?: string;
    Email?: string;
    Address?: string;
    JobType?: string;
    JobSource?: string;
    Comment?: string;
}

export interface WorkizConfig {
    apiUrl: string;     // e.g. "https://api.workiz.com/api/v1/api_xxx/lead/create/"
    authSecret: string; // e.g. "sec_xxx"
}

// ─── API ───

export async function createWorkizLead(
    cfg: WorkizConfig,
    lead: WorkizLeadPayload
): Promise<boolean> {
    if (!cfg.apiUrl || !cfg.authSecret) {
        logger.warn({ msg: "Workiz not configured, skipping lead creation" });
        return false;
    }

    try {
        const response = await fetch(cfg.apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                auth_secret: cfg.authSecret,
                ...lead,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            logger.error({ msg: "Workiz API error", status: response.status, body });
            return false;
        }

        logger.info({ msg: "Workiz lead created", name: `${lead.FirstName} ${lead.LastName}`, phone: lead.Phone });
        return true;
    } catch (err: any) {
        logger.error({ msg: "Workiz lead creation failed", error: err.message });
        return false;
    }
}
