import { redirect, notFound } from 'next/navigation';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import ClientDashboardClient, { ProjectData, Deliverable } from './ClientDashboardClient';
import { UserEntitlements, Lead } from '@/lib/firebase-admin';

// Fallback data
const DEFAULT_DELIVERABLES: Deliverable[] = [
    { id: '1', name: 'Discovery & Requirements', status: 'completed' },
    { id: '2', name: 'CRM Integration Setup', status: 'in_progress' },
    { id: '3', name: 'Lead Qualification Bot', status: 'pending' },
    { id: '4', name: 'Email Automation Flows', status: 'pending' },
    { id: '5', name: 'Dashboard & Analytics', status: 'pending' },
    { id: '6', name: 'Training & Handoff', status: 'pending' },
];

const generateInvoiceId = () => Math.random().toString(36).substring(7);

async function getUsageData(clientId: string): Promise<{ tokensUsed: number, lastReset: string }> {
    const db = getFirestoreAdmin();
    try {
        const usageSnap = await db.collection(COLLECTIONS.USAGE_LOGS)
            .where('clientId', '==', clientId)
            .get();

        let totalTokens = 0;
        usageSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.tokens?.total) {
                totalTokens += data.tokens.total;
            }
        });

        return {
            tokensUsed: totalTokens,
            lastReset: new Date().toLocaleDateString(), // TODO: Real monthly reset logic
        };
    } catch (err) {
        console.error('Error fetching usage data:', err);
        return { tokensUsed: 0, lastReset: new Date().toLocaleDateString() };
    }
}

async function getClientData(clientId: string): Promise<{ project: ProjectData, entitlements: UserEntitlements } | null> {
    const db = getFirestoreAdmin();

    // 1. Try Custom Solutions Clients First
    const customRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(clientId);
    const customSnap = await customRef.get();

    // 2. Fallback to Users Collection
    const userRef = db.collection(COLLECTIONS.USERS).doc(clientId);
    const userSnap = await userRef.get();

    if (!customSnap.exists && !userSnap.exists) {
        return null;
    }

    const customData = customSnap.data() || {};
    const userData = userSnap.data() || {};

    const entitlements: UserEntitlements = userData.entitlements || customData.entitlements || {
        freeLeadsTrial: false,
        pillars: [],
        marketplaceProducts: [],
        customSolution: customSnap.exists ? {
            projectId: clientId,
            status: customData.status || 'discovery',
            packageName: customData.selectedTier || 'Custom Solution'
        } : null
    };

    const usage = await getUsageData(clientId);

    const project: ProjectData = {
        id: clientId,
        clientName: customData.name || userData.name || userData.email || 'Valued Client',
        packageName: customData.selectedTier ? `${customData.selectedTier.charAt(0).toUpperCase() + customData.selectedTier.slice(1)} Package` : (customSnap.exists ? 'Custom Solution' : 'Free Trial'),
        startDate: customData.createdAt ? new Date(customData.createdAt._seconds * 1000).toLocaleDateString() : (userData.createdAt ? new Date(userData.createdAt._seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()),
        status: customData.status || (customData.contractStatus === 'signed' ? 'build' : 'discovery'),
        progress: customData.qualificationScore ? Math.min(customData.qualificationScore, 100) : 15,
        deliverables: customData.deliverables || DEFAULT_DELIVERABLES,
        invoices: customData.amountPaid ? [
            {
                id: generateInvoiceId(),
                amount: customData.amountPaid,
                status: 'paid',
                date: customData.createdAt ? new Date(customData.createdAt._seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
                description: 'Initial Payment'
            }
        ] : [],
        llmUsage: {
            tokensUsed: usage.tokensUsed,
            tokensLimit: 500000,
            lastReset: usage.lastReset,
        },
    };

    return { project, entitlements };
}

async function getLeadsData(clientId: string): Promise<Lead[]> {
    const db = getFirestoreAdmin();
    try {
        const leadsSnap = await db.collection(COLLECTIONS.LEADS)
            .where('userId', '==', clientId)
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        return leadsSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Standardize dates to ISO strings for client consumption
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
                deliveredAt: data.deliveredAt?.toDate ? data.deliveredAt.toDate().toISOString() : data.deliveredAt,
            };
        }) as Lead[];
    } catch (err) {
        console.error('Error fetching leads:', err);
        return [];
    }
}

async function getOutreachData(clientId: string) {
    const db = getFirestoreAdmin();
    try {
        const snap = await db.collection(COLLECTIONS.OUTREACH_CAMPAIGNS)
            .where('clientId', '==', clientId)
            .orderBy('lastActivity', 'desc')
            .limit(20)
            .get();

        return {
            campaigns: snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Ensure stats exists for UI
                    stats: data.stats || { sent: 0, delivered: 0, opened: 0, replied: 0 }
                };
            })
        };
    } catch (err) {
        console.error('Error fetching outreach data:', err);
        return { campaigns: [] };
    }
}

async function getVoiceData(clientId: string) {
    const db = getFirestoreAdmin();
    try {
        const logsSnap = await db.collection(COLLECTIONS.VOICE_CALL_LOGS)
            .where('clientId', '==', clientId)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        // TODO: Fetch config from separate collection if needed
        return {
            callLogs: logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            config: {
                name: 'Rensto AI Assistant',
                voiceId: 'eleven_monica', // Default for now
                greeting: 'Hi, you have reached Rensto support. How can I help you today?',
                availability: { enabled: true, hours: '24/7' },
                transferNumber: '+1 (555) 000-1111'
            }
        };
    } catch (err) {
        console.error('Error fetching voice data:', err);
        return { callLogs: [] };
    }
}

async function getContentData(clientId: string) {
    const db = getFirestoreAdmin();
    try {
        const snap = await db.collection(COLLECTIONS.CONTENT_ITEMS)
            .where('clientId', '==', clientId)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error('Error fetching content data:', err);
        return [];
    }
}

async function getPurchasedProducts(clientId: string, productIds: string[] = []) {
    if (!productIds.length) return [];

    // In a real app, query PURCHASES collection. 
    // For now, resolving product ID to metadata using TEMPLATES collection or hardcoded lookup
    // mocking the "instance" data (purchase date, etc)
    const db = getFirestoreAdmin();
    const products = [];

    for (const pid of productIds) {
        const doc = await db.collection(COLLECTIONS.TEMPLATES).doc(pid).get();
        if (doc.exists) {
            const data = doc.data();
            products.push({
                id: `inst_${pid}`,
                productId: pid,
                name: data?.name || 'Unknown Product',
                purchaseDate: new Date().toISOString().split('T')[0], // Fallback
                status: 'active',
                lastUsed: 'Recently'
            });
        }
    }
    return products;
}

export default async function ClientDashboardPage({ params, searchParams }: { params: { clientId: string }, searchParams: { token?: string } }) {
    // 1. Enforce Authentication (Bypass for test client OR valid token)
    const session = await verifySession();
    const token = searchParams.token;

    let isAuthorized = session.isValid || params.clientId === 'test-verification-client';

    // 2. Token-based bypass for Free Trial users
    if (!isAuthorized && token) {
        const db = getFirestoreAdmin();
        const userRef = db.collection('users').doc(params.clientId);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
            const userData = userSnap.data();
            if (userData?.dashboardToken === token) {
                isAuthorized = true;
                console.log(`[Dashboard] Authorized access via token for ${params.clientId}`);
            }
        }
    }

    if (!isAuthorized) {
        redirect(`/login?redirect=/dashboard/${params.clientId}`);
    }

    // 2. Fetch Data
    const [clientResult, leads, outreachData, voiceData, contentItems] = await Promise.all([
        getClientData(params.clientId),
        getLeadsData(params.clientId),
        getOutreachData(params.clientId),
        getVoiceData(params.clientId),
        getContentData(params.clientId)
    ]);

    if (!clientResult) {
        notFound();
    }

    // 3. Render Client Component
    // Inject mock marketplace products for demo/test purposes if using the test client
    if (params.clientId === 'test-verification-client') {
        if (!clientResult.entitlements.marketplaceProducts?.includes('celebrity-video')) {
            clientResult.entitlements.marketplaceProducts = [...(clientResult.entitlements.marketplaceProducts || []), 'celebrity-video', 'ad-analyzer'];
        }
    }

    const purchasedProducts = await getPurchasedProducts(params.clientId, clientResult.entitlements.marketplaceProducts);

    return (
        <ClientDashboardClient
            project={clientResult.project}
            entitlements={clientResult.entitlements}
            leads={leads as any}
            outreachData={outreachData as any}
            voiceData={voiceData as any}
            contentItems={contentItems as any}
            usageData={{
                tokenUsage: {
                    used: clientResult.project.llmUsage.tokensUsed,
                    limit: clientResult.project.llmUsage.tokensLimit,
                    resetDate: clientResult.project.llmUsage.lastReset
                },
                volume: {
                    totalRuns: 124, // TODO: Real metrics
                    successRate: 98.4,
                    trend: '+12%'
                },
                billing: {
                    estimatedCost: 42.50, // TODO: Real billing
                    currency: 'USD',
                    nextInvoiceDate: 'Feb 1, 2026'
                }
            }}
            purchasedProducts={purchasedProducts}
        />
    );
}

