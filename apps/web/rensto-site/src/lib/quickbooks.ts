import axios from 'axios';

export class QuickBooksApi {
    private accessToken: string | null = null;
    private realmId: string | null = null;
    private baseUrl: string;

    constructor() {
        // In production, these should be handled via OAuth2 and stored in a DB/Vault
        this.realmId = process.env.QUICKBOOKS_REALM_ID || '';
        this.baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://quickbooks.api.intuit.com/v3/company'
            : 'https://sandbox-quickbooks.api.intuit.com/v3/company';
    }

    private async getAccessToken() {
        // Simplified: in a real app, you'd refresh this token if expired
        // For now, we assume it's provided via env for internal ops or fetched from DB
        return process.env.QUICKBOOKS_ACCESS_TOKEN;
    }

    private async getHeaders() {
        const token = await this.getAccessToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    }

    async getCustomer(email: string) {
        try {
            const headers = await this.getHeaders();
            const query = `SELECT * FROM Customer WHERE PrimaryEmailAddr = '${email}'`;
            const response = await axios.get(`${this.baseUrl}/${this.realmId}/query`, {
                headers,
                params: { query }
            });

            return {
                success: true,
                customer: response.data.QueryResponse.Customer?.[0] || null
            };
        } catch (error: any) {
            console.error('QuickBooks getCustomer error:', error.response?.data || error.message);
            return { success: false, error: 'Failed to fetch customer' };
        }
    }

    async createInvoice(invoiceData: any) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseUrl}/${this.realmId}/invoice`, invoiceData, {
                headers
            });

            return {
                success: true,
                invoice: response.data.Invoice,
                invoiceId: response.data.Invoice.Id
            };
        } catch (error: any) {
            console.error('QuickBooks createInvoice error:', error.response?.data || error.message);
            return { success: false, error: 'Failed to create invoice' };
        }
    }

    async getFinancialSummary() {
        try {
            const headers = await this.getHeaders();
            // Mocking real aggregate calls for the dashboard
            // In reality, you'd run multiple queries for ProfitAndLoss, BalanceSheet, etc.
            return {
                success: true,
                totalRevenue: 15450.50, // Mocked for now, but ready for real data
                activeCustomers: 12,
                outstandingInvoices: 4200.00
            };
        } catch (error: any) {
            console.error('QuickBooks getFinancialSummary error:', error);
            return { success: false, error: 'Failed to fetch financial summary' };
        }
    }
}
