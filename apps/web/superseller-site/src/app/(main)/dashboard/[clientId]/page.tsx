import { redirect, notFound } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import ClientDashboardClient, { ProjectData, Deliverable } from './ClientDashboardClient';
import type { UserEntitlements } from '@/types/entitlements';
import prisma from '@/lib/prisma';
import { AITableService } from '@/lib/services/AITableService';

// Fallback data
const DEFAULT_DELIVERABLES: Deliverable[] = [
    { id: '1', name: 'Discovery & Requirements', status: 'completed' },
    { id: '2', name: 'CRM Integration Setup', status: 'in_progress' },
    { id: '3', name: 'Lead Qualification Bot', status: 'pending' },
    { id: '4', name: 'Email Automation Flows', status: 'pending' },
    { id: '5', name: 'Dashboard & Analytics', status: 'pending' },
    { id: '6', name: 'Training & Handoff', status: 'pending' },
];

async function getUsageData(clientId: string): Promise<{
    tokensUsed: number;
    totalRuns: number;
    successRate: number;
    lastReset: string;
    metrics?: any;
}> {
    try {
        const [user, usageLogs] = await Promise.all([
            prisma.user.findUnique({ where: { id: clientId }, select: { metrics: true } }),
            prisma.usageLog.findMany({
                where: { clientId },
                orderBy: { startedAt: 'desc' },
                take: 500,
            }),
        ]);
        const metrics = (user?.metrics as any) || { totalLeads: 0, totalMessages: 0, totalBookings: 0 };
        let totalTokens = 0;
        let successCount = 0;
        usageLogs.forEach((log) => {
            const t = (log.tokens as any)?.total;
            if (t) totalTokens += t;
            if (log.status === 'completed') successCount++;
        });
        const totalRuns = usageLogs.length;
        const successRate = totalRuns > 0 ? (successCount / totalRuns) * 100 : 100;
        return {
            tokensUsed: totalTokens,
            totalRuns,
            successRate: Number(successRate.toFixed(1)),
            lastReset: new Date().toLocaleDateString(),
            metrics,
        };
    } catch (err) {
        console.error('Error fetching usage data:', err);
        return { tokensUsed: 0, totalRuns: 0, successRate: 100, lastReset: new Date().toLocaleDateString() };
    }
}

async function getClientData(clientId: string): Promise<{ project: ProjectData; entitlements: UserEntitlements } | null> {
    const user = await prisma.user.findUnique({ where: { id: clientId } });
    if (!user) return null;

    const ent = (user.entitlements as any) || {};
    const entitlements: UserEntitlements = {
        freeLeadsTrial: ent.freeLeadsTrial ?? false,
        pillars: ent.pillars || [],
        marketplaceProducts: ent.marketplaceProducts || [],
        engines: ent.engines || [],
        customSolution: ent.customSolution ?? null,
    };

    const usage = await getUsageData(clientId);

    const csc = await prisma.customSolutionsClient.findUnique({ where: { id: clientId } });
    const packageName = csc?.selectedTier
        ? `${csc.selectedTier.charAt(0).toUpperCase() + csc.selectedTier.slice(1)} Package`
        : csc
          ? 'Custom Solution'
          : 'Free Trial';

    const project: ProjectData = {
        id: clientId,
        clientName: user.name || user.businessName || user.email || 'Valued Client',
        packageName,
        startDate: (user.createdAt || new Date()).toLocaleDateString(),
        status: csc?.status || (csc?.contractStatus === 'signed' ? 'build' : 'discovery'),
        progress: Math.min((csc?.qualificationScore ?? 15), 100),
        deliverables: (csc as any)?.deliverables || DEFAULT_DELIVERABLES,
        invoices: (csc?.amountPaid ?? 0) > 0
            ? [
                  {
                      id: crypto.randomUUID(),
                      amount: csc!.amountPaid!,
                      status: 'paid',
                      date: (csc?.createdAt || new Date()).toLocaleDateString(),
                      description: 'Initial Payment',
                  },
              ]
            : [],
        llmUsage: {
            tokensUsed: usage.tokensUsed,
            tokensLimit: 500000,
            lastReset: usage.lastReset,
        },
    };

    return { project, entitlements };
}

async function getLeadsData(clientId: string) {
    try {
        const leads = await prisma.lead.findMany({
            where: { userId: clientId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return leads.map((l) => ({
            id: l.id,
            ...l,
            createdAt: l.createdAt.toISOString(),
            deliveredAt: l.deliveredAt?.toISOString(),
        }));
    } catch (err) {
        console.error('Error fetching leads:', err);
        return [];
    }
}

async function getOutreachData(clientId: string) {
    try {
        const campaigns = await prisma.outreachCampaign.findMany({
            where: { userId: clientId },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
        return {
            campaigns: campaigns.map((c) => ({
                id: c.id,
                ...c,
                stats: (c.metrics as any) || { sent: 0, delivered: 0, opened: 0, replied: 0 },
            })),
        };
    } catch (err) {
        console.error('Error fetching outreach data:', err);
        return { campaigns: [] };
    }
}

async function getSecretaryData(clientId: string) {
    try {
        const [callLogs, config, bookings] = await Promise.all([
            prisma.voiceCallLog.findMany({
                where: { userId: clientId },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    callerPhone: true,
                    callerName: true,
                    duration: true,
                    outcome: true,
                    summary: true,
                    startedAt: true,
                    createdAt: true,
                },
            }),
            prisma.secretaryConfig.findFirst({ where: { clientId } }),
            prisma.appointmentBooking.findMany({
                where: { userId: clientId },
                orderBy: { appointmentDate: 'desc' },
                take: 10,
            }),
        ]);
        const configData = config as any;
        return {
            callLogs: callLogs.map((c) => ({
                id: c.id,
                caller: c.callerName || 'Unknown Caller',
                callerPhone: c.callerPhone || '',
                duration: c.duration || 0,
                outcome: (c.outcome as 'answered' | 'voicemail' | 'missed' | 'transferred') || 'answered',
                timestamp: (c.startedAt || c.createdAt).toISOString(),
                summary: c.summary || undefined,
            })),
            whatsappThreads: [],
            bookings: bookings.map((b) => ({
                id: b.id,
                ...b,
                dateTime: b.appointmentDate?.toISOString(),
            })),
            config: configData
                ? {
                      agentName: configData.agentName,
                      voiceId: configData.voiceId,
                      greeting: configData.greeting,
                      availability: (configData.availability as { enabled: boolean; hours: string }) || { enabled: true, hours: '24/7' },
                      whatsappEnabled: configData.whatsappEnabled ?? false,
                      calendarEnabled: configData.calendarEnabled ?? false,
                      transferNumber: configData.transferNumber ?? '',
                      n8nWebhookId: configData.n8nWebhookId,
                  }
                : {
                      agentName: 'SuperSeller AI AI Assistant',
                      voiceId: 'eleven_monica',
                      greeting: 'Hi, you have reached SuperSeller AI support. How can I help you today?',
                      availability: { enabled: true, hours: '24/7' },
                      whatsappEnabled: false,
                      calendarEnabled: false,
                      transferNumber: '',
                  },
        };
    } catch (err) {
        console.error('Error fetching secretary data:', err);
        return { callLogs: [], whatsappThreads: [], bookings: [], config: undefined };
    }
}

async function getContentData(clientId: string) {
    try {
        const posts = await prisma.contentPost.findMany({
            where: { userId: clientId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return posts.map((p) => ({ id: p.id, ...p }));
    } catch (err) {
        console.error('Error fetching content data:', err);
        return [];
    }
}

async function getKnowledgeData(clientId: string) {
    try {
        const documents = await prisma.indexedDocument.findMany({
            where: { clientId },
            orderBy: { indexedAt: 'desc' },
            take: 50,
        });
        const totalChunks = documents.reduce((acc, d) => acc + ((d.metadata as any)?.chunksCount || 0), 0);
        const lastUpdated =
            documents.length > 0 && documents[0].indexedAt
                ? documents[0].indexedAt.toISOString()
                : new Date().toISOString();
        return {
            documents: documents.map((d) => ({ id: d.id, ...d })),
            stats: {
                totalDocuments: documents.length,
                totalChunks,
                lastUpdated,
                storageUsed: `${(documents.length * 0.2).toFixed(1)} MB`,
            },
        };
    } catch (err) {
        console.error('Error fetching knowledge data:', err);
        return { documents: [], stats: undefined };
    }
}

async function getPurchasedProducts(clientId: string, productIds: string[] = []) {
    if (!productIds.length) return [];

    try {
        const allProducts = await AITableService.getProducts();

        return productIds.map(pid => {
            // Match against Product ID or Record ID
            const product = allProducts.find((p: any) => (p['Product ID'] === pid) || (p.id === pid));
            if (!product) return null;

            return {
                id: `inst_${pid}`,
                productId: pid,
                name: product['Product Name'] || product.name || 'Unknown Product',
                status: 'active', // In real app, check 'purchases' collection
                purchaseDate: new Date().toISOString().split('T')[0],
                lastUsed: 'Recently'
            };
        }).filter((p): p is { id: string; productId: string; name: string; status: string; purchaseDate: string; lastUsed: string; } => p !== null);
    } catch (e) {
        console.error('[Dashboard] Error fetching product metadata:', e);
        return [];
    }
}

export default async function ClientDashboardPage({ params, searchParams }: { params: Promise<{ clientId: string }>, searchParams: Promise<{ token?: string }> }) {
    // 0. Resolve Params (Next.js 15+ / 16+)
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const clientId = resolvedParams.clientId;

    // 1. Enforce Authentication (Bypass for test client OR valid token)
    const session = await verifySession();
    const token = resolvedSearchParams.token;

    let isAuthorized = session.isValid;

    // 2. Token-based bypass for Free Trial users (Postgres)
    if (!isAuthorized && token) {
        const tokenUser = await prisma.user.findFirst({ where: { id: clientId, dashboardToken: token } });
        if (tokenUser) {
            isAuthorized = true;
            console.log(`[Dashboard] Authorized access via token for ${clientId}`);
        }
    }

    if (!isAuthorized) {
        redirect(`/login?redirect=/dashboard/${clientId}`);
    }

    // 2. Fetch Data
    const [clientResult, leads, outreachData, voiceData, contentItems, knowledgeData, usage] = await Promise.all([
        getClientData(clientId),
        getLeadsData(clientId),
        getOutreachData(clientId),
        getSecretaryData(clientId),
        getContentData(clientId),
        getKnowledgeData(clientId),
        getUsageData(clientId)
    ]);

    if (!clientResult) {
        notFound();
    }

    const purchasedProducts = await getPurchasedProducts(clientId, clientResult.entitlements.marketplaceProducts);

    return (
        <ClientDashboardClient
            project={clientResult.project}
            entitlements={clientResult.entitlements}
            leads={leads as any}
            outreachData={outreachData as any}
            voiceData={voiceData as any}
            contentItems={contentItems as any}
            knowledgeData={knowledgeData as any}
            clientId={clientId}
            usageData={{
                tokenUsage: {
                    used: usage.tokensUsed,
                    limit: clientResult.project.llmUsage.tokensLimit,
                    resetDate: usage.lastReset
                },
                volume: {
                    totalRuns: usage.totalRuns,
                    successRate: usage.successRate,
                    trend: '+0%' // Resetting trend for now
                },
                billing: {
                    estimatedCost: (usage.tokensUsed / 1000) * 0.03,
                    currency: 'USD',
                    nextInvoiceDate: 'Next Billing Cycle'
                },
                metrics: usage.metrics
            }}
            purchasedProducts={purchasedProducts}
        />
    );
}
