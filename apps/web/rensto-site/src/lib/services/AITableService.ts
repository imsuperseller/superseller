import { env } from '@/lib/env';

export interface AITableRecord<T> {
    id: string;
    fields: T;
}

// ── Rensto Aitable Datasheet IDs (space: spc4tjiuDMjfY) ──────────
export const AITABLE_DATASHEETS = {
    EXPENSES: 'dstHnMVPAdtXESlJSX',
    LLM_REGISTRY: 'dstsCAPquhDDaHTbnL',   // created 2026-02-19
    LEADS: 'dstbftVH9AdzDKcu70',
    CLIENTS: 'dst1zXPh3cf72vKpmR',
    CAMPAIGNS: 'dstt7Keh14AkVXF0Vl',
    KNOWLEDGE: 'dstxq3xnpvu7XY37bT',
    MASTER_REGISTRY: 'dstwsqbXSmK5wYMmeQ',
    MASTER_PRODUCTS: 'dstr7Y928QP9X6miB2',
    PAYMENTS: 'dstjnQPSkUBffmb5gM',
    SOLUTIONS: 'dstBYSsqrzrdrFJ1wP',
} as const;

type DatasheetId = typeof AITABLE_DATASHEETS[keyof typeof AITABLE_DATASHEETS];

// ── NotebookLM Notebooks (Knowledge Layer) ───────────────────────
export const NOTEBOOKLM_NOTEBOOKS = {
    BLAST_CANONICAL: '5811a372-2d18-4f46-b421-9d026a57205b',
    MARKET_INTELLIGENCE: '8df32896-d93b-4a32-961f-40c6fa3ccf7a',  // created 2026-02-19
    LEGAL_COMPLIANCE: '7630d154-341b-40a7-9a10-6f9e1f3ddc7d',  // created 2026-02-19
    PRODUCT_CHANGELOG: '12724368-e4af-488c-a8a3-ce04da043d60',  // created 2026-02-19
    AI_COST_PERFORMANCE: '02c3946b-c69b-423b-b188-9b79ecdd1629',  // created 2026-02-19
} as const;

export class AITableService {
    private static baseUrl = 'https://aitable.ai/fusion/v1';
    private static get token() {
        return env.AITABLE_API_TOKEN || process.env.AITABLE_API_KEY;
    }

    private static async apiFetch<T = unknown>(
        path: string,
        options: RequestInit = {}
    ): Promise<{ success: boolean; code: number; data: T; message: string }> {
        const token = this.token;
        if (!token) {
            console.warn('[AITableService] No API token configured');
            return { success: false, code: 401, data: null as T, message: 'No token' };
        }
        try {
            const res = await fetch(`${this.baseUrl}${path}`, {
                ...options,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...(options.headers || {}),
                },
            });
            return res.json();
        } catch (err) {
            console.error(`[AITableService] ${path} failed:`, err);
            return { success: false, code: 500, data: null as T, message: String(err) };
        }
    }

    // ── Generic record helpers ─────────────────────────────────────

    private static async fetchRecords<T>(datasheetId: string): Promise<T[]> {
        if (!datasheetId) {
            console.warn(`[AITableService] Missing Datasheet ID`);
            return [];
        }
        const result = await this.apiFetch<{ records: Array<{ recordId: string; fields: T }> }>(
            `/datasheets/${datasheetId}/records`,
            { next: { revalidate: 3600 } } as RequestInit
        );
        if (!result.success) return [];
        return result.data.records.map((r) => ({ id: r.recordId, ...r.fields } as T));
    }

    /** Add records to any datasheet */
    static async addRecords(
        datasheetId: DatasheetId,
        records: Array<{ fields: Record<string, unknown> }>
    ): Promise<Array<{ recordId: string; fields: Record<string, unknown> }>> {
        const res = await this.apiFetch<{ records: Array<{ recordId: string; fields: Record<string, unknown> }> }>(
            `/datasheets/${datasheetId}/records`,
            { method: 'POST', body: JSON.stringify({ records }) }
        );
        return res.data?.records ?? [];
    }

    /** Update records in any datasheet */
    static async updateRecords(
        datasheetId: DatasheetId,
        records: Array<{ recordId: string; fields: Record<string, unknown> }>
    ): Promise<void> {
        await this.apiFetch(
            `/datasheets/${datasheetId}/records`,
            { method: 'PATCH', body: JSON.stringify({ records }) }
        );
    }

    // ── Preset entity getters ──────────────────────────────────────

    static async getProducts() {
        return this.fetchRecords<any>(AITABLE_DATASHEETS.MASTER_PRODUCTS);
    }

    static async getTestimonials() {
        return this.fetchRecords<any>(env.AITABLE_TESTIMONIALS_DATASHEET_ID || '');
    }

    static async getClients() {
        return this.fetchRecords<any>(AITABLE_DATASHEETS.CLIENTS);
    }

    static async getSolutions() {
        return this.fetchRecords<any>(AITABLE_DATASHEETS.SOLUTIONS);
    }

    static async getCampaigns() {
        return this.fetchRecords<any>(AITABLE_DATASHEETS.CAMPAIGNS);
    }

    static async getLlmRegistry() {
        return this.fetchRecords<any>(AITABLE_DATASHEETS.LLM_REGISTRY);
    }

    // ── High-level domain helpers ─────────────────────────────────

    /**
     * Sync a new lead to Aitable Leads sheet.
     * Call after lead capture in inbound flows.
     */
    static async syncLead(lead: {
        name?: string;
        email?: string;
        phone?: string;
        source: string;
        status?: string;
    }) {
        return this.addRecords(AITABLE_DATASHEETS.LEADS, [{
            fields: {
                标题: lead.name || lead.email || 'Unknown',
                Email: lead.email || '',
                Phone: lead.phone || '',
                Source: lead.source,
                Status: lead.status || 'new',
            },
        }]);
    }
}
