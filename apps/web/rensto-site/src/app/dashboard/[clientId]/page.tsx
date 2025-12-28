import { redirect, notFound } from 'next/navigation';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import ClientDashboardClient, { ProjectData, Deliverable } from './ClientDashboardClient';

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

async function getClientData(clientId: string): Promise<ProjectData | null> {
    const db = getFirestoreAdmin();
    const docRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(clientId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        return null;
    }

    const client = docSnap.data();
    if (!client) return null;

    return {
        id: client.id || clientId,
        clientName: client.name || 'Valued Client',
        packageName: client.selectedTier ? `${client.selectedTier.charAt(0).toUpperCase() + client.selectedTier.slice(1)} Package` : 'Custom Solution',
        startDate: client.createdAt ? new Date(client.createdAt._seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
        status: client.status || (client.contractStatus === 'signed' ? 'build' : 'discovery'),
        progress: client.qualificationScore ? Math.min(client.qualificationScore, 100) : 15,
        deliverables: client.deliverables || DEFAULT_DELIVERABLES,
        invoices: client.amountPaid ? [
            {
                id: generateInvoiceId(),
                amount: client.amountPaid,
                status: 'paid',
                date: client.createdAt ? new Date(client.createdAt._seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
                description: 'Initial Payment'
            }
        ] : [],
        llmUsage: {
            tokensUsed: 0, // Placeholder until we have real usage tracking
            tokensLimit: 500000,
            lastReset: new Date().toLocaleDateString(),
        },
    };
}

export default async function ClientDashboardPage({ params }: { params: { clientId: string } }) {
    // 1. Enforce Authentication
    const session = await verifySession();
    if (!session.isValid) {
        redirect(`/login?redirect=/dashboard/${params.clientId}`);
    }

    // 2. Fetch Client Data
    const projectData = await getClientData(params.clientId);

    if (!projectData) {
        notFound();
    }

    // 3. Render Client Component
    return <ClientDashboardClient project={projectData} />;
}
