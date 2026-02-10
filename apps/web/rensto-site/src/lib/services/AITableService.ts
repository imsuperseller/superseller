import { env } from '@/lib/env';

export interface AITableRecord<T> {
    id: string;
    fields: T;
}

export class AITableService {
    private static baseUrl = 'https://aitable.ai/fusion/v1';
    private static token = env.AITABLE_API_TOKEN;

    private static async fetch<T>(datasheetId: string): Promise<T[]> {
        if (!this.token || !datasheetId) {
            console.warn(`[AITableService] Missing Token or Datasheet ID: ${datasheetId}`);
            return [];
        }

        try {
            const response = await fetch(`${this.baseUrl}/datasheets/${datasheetId}/records`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message);
            }

            return result.data.records.map((r: any) => ({
                id: r.recordId,
                ...r.fields
            }));
        } catch (error) {
            console.error(`[AITableService] Fetch failed for ${datasheetId}:`, error);
            return [];
        }
    }

    static async getProducts() {
        return this.fetch<any>(env.AITABLE_RENSTO_MASTER_REGISTRY_ID || '');
    }

    static async getTestimonials() {
        return this.fetch<any>(env.AITABLE_TESTIMONIALS_DATASHEET_ID || '');
    }

    static async getClients() {
        return this.fetch<any>(env.AITABLE_CLIENTS_DATASHEET_ID || '');
    }

    static async getSolutions() {
        return this.fetch<any>(env.AITABLE_SOLUTIONS_DATASHEET_ID || '');
    }

    static async getCampaigns() {
        return this.fetch<any>(env.AITABLE_CAMPAIGNS_DATASHEET_ID || '');
    }
}
