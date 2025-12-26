import axios from 'axios';

export interface Signer {
    name: string;
    email: string;
    role?: string;
    order?: number;
}

export interface ContractOptions {
    template_id?: string | null;
    title: string;
    metadata?: Record<string, any>;
    signers: Signer[];
    content?: string;
    custom_fields?: { name: string; value: string }[];
    redirect_url?: string;
    webhook_url?: string;
    expires_in_days?: number;
    send_email?: boolean;
    email_subject?: string;
    email_message?: string;
    test?: 'yes' | 'no';
}

export class ESignaturesApi {
    private apiKey: string;
    private baseUrl: string = 'https://esignatures.com/api';

    constructor() {
        this.apiKey = process.env.ESIGNATURES_API_KEY || '';
    }

    private getHeaders() {
        return {
            'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
            'Content-Type': 'application/json'
        };
    }

    async createContract(options: ContractOptions) {
        try {
            if (!this.apiKey) {
                return { success: false, error: 'ESIGNATURES_API_KEY not configured' };
            }

            const response = await axios.post(`${this.baseUrl}/contracts/`, options, {
                headers: this.getHeaders()
            });

            return {
                success: true,
                contractId: response.data?.contract?.id || response.data?.id,
                signingUrl: response.data?.signing_url,
                data: response.data
            };
        } catch (error: any) {
            console.error('eSignatures createContract error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create contract',
                details: error.response?.data
            };
        }
    }

    async getContract(contractId: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/contracts/${contractId}`, {
                headers: this.getHeaders()
            });

            return {
                success: true,
                contract: response.data
            };
        } catch (error: any) {
            console.error('eSignatures getContract error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to retrieve contract'
            };
        }
    }

    async cancelContract(contractId: string) {
        try {
            const response = await axios.post(`${this.baseUrl}/contracts/${contractId}/cancel`, {}, {
                headers: this.getHeaders()
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('eSignatures cancelContract error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to cancel contract'
            };
        }
    }

    verifyWebhook(payload: any) {
        // eSignatures typically doesn't use a HMAC signature by default, 
        // but we can add basic validation here if needed in the future.
        return !!payload.event;
    }
}
