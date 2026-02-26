import { getStripeAdmin } from '../stripe';
import prisma from '@/lib/prisma';

export type ServiceType = 'firebase' | 'stripe' | 'esignatures' | 'quickbooks' | 'n8n' | 'openai' | 'marketplace' | 'provisioning' | 'whatsapp' | 'other';

export interface AuditLog {
    service: ServiceType;
    action: string;
    status: 'success' | 'error' | 'warning';
    details: any;
    errorMessage?: string;
    timestamp: any;
    metadata?: Record<string, any>;
}

export class ServiceAuditAgent {
    private static instance: ServiceAuditAgent;

    private constructor() { }

    public static getInstance(): ServiceAuditAgent {
        if (!ServiceAuditAgent.instance) {
            ServiceAuditAgent.instance = new ServiceAuditAgent();
        }
        return ServiceAuditAgent.instance;
    }

    /**
     * Log a service interaction to Postgres Audit table
     */
    async log(log: Partial<AuditLog>) {
        try {
            const logEntry = {
                service: log.service || 'other',
                action: log.action || 'unknown',
                status: log.status || 'success',
                details: { ...(log.details || {}), ...(log.metadata || {}) },
                errorMessage: log.errorMessage,
            };

            await prisma.audit.create({ data: logEntry });

            if (logEntry.status === 'error') {
                console.error(`[AUDIT ERROR] ${logEntry.service}: ${logEntry.action} - ${logEntry.errorMessage}`);
            } else {
                console.log(`[AUDIT] ${logEntry.service}: ${logEntry.action}`);
            }
        } catch (error) {
            console.error('CRITICAL: ServiceAuditAgent failed to log:', error);
        }
    }

    /**
     * Perform a health check on all configured services
     */
    async runHealthCheck() {
        const results: any[] = [];

        // 1. Stripe
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        results.push({
            service: 'stripe',
            status: stripeKey ? 'configured' : 'missing',
            keyPresent: !!stripeKey,
        });

        // 2. Postgres
        try {
            await prisma.audit.findFirst({ take: 1 });
            results.push({ service: 'postgres', status: 'connected' });
        } catch (error: any) {
            results.push({ service: 'postgres', status: 'error', error: error.message });
        }

        await this.log({
            service: 'other',
            action: 'system_health_check',
            status: results.some((r) => r.status === 'error' || r.status === 'missing') ? 'warning' : 'success',
            details: { results },
        });

        return results;
    }

    async runFullHealthCheck() {
        const results: Record<string, any> = {
            timestamp: new Date().toISOString(),
            services: {},
        };

        // 1. Postgres
        try {
            await prisma.audit.findFirst({ take: 1 });
            results.services.postgres = { status: 'healthy' };
        } catch (e: any) {
            results.services.postgres = { status: 'unhealthy', error: e.message };
        }

        // 2. Stripe Check
        try {
            const stripe = getStripeAdmin();
            await stripe.paymentIntents.list({ limit: 1 });
            results.services.stripe = { status: 'healthy' };
        } catch (e: any) {
            results.services.stripe = { status: 'unhealthy', error: e.message };
        }

        // 3. OpenAI Check
        try {
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
            });
            if (res.ok) {
                results.services.openai = { status: 'healthy' };
            } else {
                results.services.openai = { status: 'unhealthy', error: await res.text() };
            }
        } catch (e: any) {
            results.services.openai = { status: 'unhealthy', error: e.message };
        }

        // Alert if any service is down
        const unhealthy = Object.entries(results.services).filter(([_, v]: any) => v.status === 'unhealthy');
        if (unhealthy.length > 0) {
            const n8nWebhook = process.env.N8N_OPTIMIZER_WEBHOOK;
            if (n8nWebhook) {
                try {
                    await fetch(n8nWebhook, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'health_alert',
                            level: 'critical',
                            message: `System Health Alert: ${unhealthy.map(([k]) => k).join(', ')} is/are down!`,
                            details: results.services
                        })
                    });
                } catch (err) {
                    console.error('Failed to send health alert to n8n:', err);
                }
            }
        }

        return results;
    }
}

export const auditAgent = ServiceAuditAgent.getInstance();
