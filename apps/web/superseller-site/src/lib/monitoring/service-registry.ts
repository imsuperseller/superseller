// Service Registry — Central config for ALL monitored services
// Categories: infrastructure, api, database, backup

import { prisma } from '@/lib/prisma';

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latencyMs: number;
  message?: string;
  details?: Record<string, any>;
}

export interface MonitoredService {
  id: string;
  name: string;
  category: 'infrastructure' | 'api' | 'database' | 'backup';
  healthCheck: () => Promise<ServiceStatus>;
  alertThreshold: { latencyMs: number; consecutiveFailures: number };
}

const WORKER_URL = process.env.VIDEO_WORKER_URL || 'http://172.245.56.50:3002';
const N8N_URL = process.env.N8N_URL || 'https://n8n.superseller.agency';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://172.245.56.50:11434';

async function checkHttp(url: string, timeoutMs = 5000): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;

    if (res.ok) {
      return { status: 'healthy', latencyMs };
    }
    return { status: 'degraded', latencyMs, message: `HTTP ${res.status}` };
  } catch (err: any) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      message: err.name === 'AbortError' ? 'Timeout' : err.message,
    };
  }
}

export const SERVICE_REGISTRY: MonitoredService[] = [
  // --- Infrastructure ---
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'infrastructure',
    alertThreshold: { latencyMs: 2000, consecutiveFailures: 2 },
    healthCheck: async () => {
      const start = Date.now();
      try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'healthy', latencyMs: Date.now() - start };
      } catch (err: any) {
        return { status: 'down', latencyMs: Date.now() - start, message: err.message };
      }
    },
  },
  {
    id: 'worker',
    name: 'Video Worker (RackNerd)',
    category: 'infrastructure',
    alertThreshold: { latencyMs: 5000, consecutiveFailures: 2 },
    healthCheck: () => checkHttp(`${WORKER_URL}/api/health`),
  },
  {
    id: 'vercel',
    name: 'Vercel (Self)',
    category: 'infrastructure',
    alertThreshold: { latencyMs: 3000, consecutiveFailures: 3 },
    healthCheck: () => checkHttp('https://superseller.agency/api/health/check'),
  },
  {
    id: 'ollama',
    name: 'Ollama Embeddings',
    category: 'infrastructure',
    alertThreshold: { latencyMs: 5000, consecutiveFailures: 3 },
    healthCheck: () => checkHttp(`${OLLAMA_URL}/api/tags`),
  },

  // --- APIs ---
  {
    id: 'kie',
    name: 'Kie.ai (Kling 3.0)',
    category: 'api',
    alertThreshold: { latencyMs: 10000, consecutiveFailures: 3 },
    healthCheck: async () => {
      const start = Date.now();
      try {
        const key = process.env.KIE_API_KEY;
        if (!key) return { status: 'unknown', latencyMs: 0, message: 'KIE_API_KEY not set' };
        const res = await fetch('https://api.kie.ai/api/v1/user/balance', {
          headers: { Authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(8000),
        });
        const latencyMs = Date.now() - start;
        if (res.ok) {
          const data = await res.json();
          return { status: 'healthy', latencyMs, details: { balance: data } };
        }
        return { status: 'degraded', latencyMs, message: `HTTP ${res.status}` };
      } catch (err: any) {
        return { status: 'down', latencyMs: Date.now() - start, message: err.message };
      }
    },
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'api',
    alertThreshold: { latencyMs: 5000, consecutiveFailures: 3 },
    healthCheck: async () => {
      const start = Date.now();
      const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!key) return { status: 'unknown', latencyMs: 0, message: 'GOOGLE_GENERATIVE_AI_API_KEY not set' };
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
          { signal: AbortSignal.timeout(5000) }
        );
        return { status: res.ok ? 'healthy' : 'degraded', latencyMs: Date.now() - start };
      } catch (err: any) {
        return { status: 'down', latencyMs: Date.now() - start, message: err.message };
      }
    },
  },
  {
    id: 'resend',
    name: 'Resend Email',
    category: 'api',
    alertThreshold: { latencyMs: 5000, consecutiveFailures: 3 },
    healthCheck: async () => {
      const start = Date.now();
      const key = process.env.RESEND_API_KEY;
      if (!key) return { status: 'unknown', latencyMs: 0, message: 'RESEND_API_KEY not set' };
      try {
        const res = await fetch('https://api.resend.com/domains', {
          headers: { Authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(5000),
        });
        return { status: res.ok ? 'healthy' : 'degraded', latencyMs: Date.now() - start };
      } catch (err: any) {
        return { status: 'down', latencyMs: Date.now() - start, message: err.message };
      }
    },
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'api',
    alertThreshold: { latencyMs: 5000, consecutiveFailures: 2 },
    healthCheck: async () => {
      const start = Date.now();
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      if (!clientId || !clientSecret) return { status: 'unknown', latencyMs: 0, message: 'PAYPAL_CLIENT_ID not set' };
      try {
        const base = process.env.PAYPAL_MODE === 'live'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com';
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const res = await fetch(`${base}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
          signal: AbortSignal.timeout(5000),
        });
        return { status: res.ok ? 'healthy' : 'degraded', latencyMs: Date.now() - start };
      } catch (err: any) {
        return { status: 'down', latencyMs: Date.now() - start, message: err.message };
      }
    },
  },

  // --- Database ---
  {
    id: 'prisma_migration',
    name: 'Prisma Migration Status',
    category: 'database',
    alertThreshold: { latencyMs: 3000, consecutiveFailures: 2 },
    healthCheck: async () => {
      const start = Date.now();
      try {
        const result: any[] = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM "_prisma_migrations" WHERE rolled_back_at IS NOT NULL
        `;
        const rolledBack = Number(result[0]?.count || 0);
        return {
          status: rolledBack === 0 ? 'healthy' : 'degraded',
          latencyMs: Date.now() - start,
          message: rolledBack > 0 ? `${rolledBack} rolled-back migrations` : undefined,
        };
      } catch (err: any) {
        return { status: 'down', latencyMs: Date.now() - start, message: err.message };
      }
    },
  },

  // --- Data Sync ---
  {
    id: 'aitable',
    name: 'Aitable.ai Sync',
    category: 'api',
    alertThreshold: { latencyMs: 10000, consecutiveFailures: 3 },
    healthCheck: async () => {
      const start = Date.now();
      const token = process.env.AITABLE_API_TOKEN || process.env.AITABLE_API_KEY;
      if (!token) return { status: 'unknown', latencyMs: 0, message: 'AITABLE_API_TOKEN not set' };
      try {
        // Check API connectivity + count unsynced leads
        const [apiRes, unsyncedResult] = await Promise.all([
          fetch('https://aitable.ai/fusion/v1/spaces', {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(8000),
          }),
          prisma.lead.count({ where: { syncedToAITable: false } }),
        ]);
        const latencyMs = Date.now() - start;
        if (!apiRes.ok) {
          return { status: 'degraded', latencyMs, message: `Aitable API: HTTP ${apiRes.status}` };
        }
        if (unsyncedResult > 50) {
          return {
            status: 'degraded',
            latencyMs,
            message: `${unsyncedResult} leads pending sync to Aitable`,
            details: { unsyncedLeads: unsyncedResult },
          };
        }
        return {
          status: 'healthy',
          latencyMs,
          details: { unsyncedLeads: unsyncedResult },
        };
      } catch (err: any) {
        return { status: 'down', latencyMs: Date.now() - start, message: err.message };
      }
    },
  },

  // --- Backup (n8n is backup only, NOT primary) ---
  {
    id: 'n8n',
    name: 'n8n (Backup/Reference)',
    category: 'backup',
    alertThreshold: { latencyMs: 10000, consecutiveFailures: 5 },
    healthCheck: () => checkHttp(`${N8N_URL}/healthz`),
  },
];

export function getServiceById(id: string): MonitoredService | undefined {
  return SERVICE_REGISTRY.find(s => s.id === id);
}

export function getServicesByCategory(category: MonitoredService['category']): MonitoredService[] {
  return SERVICE_REGISTRY.filter(s => s.category === category);
}
