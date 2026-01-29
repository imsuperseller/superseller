import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const db = getFirestoreAdmin();

        // Fetch Service Instances (Marketplace Implementation)
        const serviceInstancesSnap = await db.collection(COLLECTIONS.SERVICE_INSTANCES).get();
        const serviceInstances = serviceInstancesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'Builder'
        }));

        // Fetch WhatsApp Instances (Bundles)
        const whatsappInstancesSnap = await db.collection(COLLECTIONS.WHATSAPP_INSTANCES).get();
        const whatsappInstances = whatsappInstancesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'Bundle'
        }));

        // Fetch Legacy Custom Solutions
        const legacySnap = await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).get();
        const legacyProjects = legacySnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'Custom'
        }));

        // Transform into a unified Project interface for the UI
        const allProjects = [
            ...serviceInstances.map((s: any) => ({
                id: s.id,
                name: s.productName || 'Unnamed Engine',
                clientName: s.clientEmail || 'Unknown Client',
                status: mapStatus(s.status),
                progress: calculateProgress(s.status),
                dueDate: formatDate(s.createdAt),
                pillar: 'Marketplace',
                outlookEventId: s.outlookEventId
            })),
            ...whatsappInstances.map((w: any) => ({
                id: w.id,
                name: w.bundle === 'full_ai_sales_rep' ? 'Sales AI Rep' : 'WhatsApp Agent',
                clientName: w.userEmail || 'Unknown Client',
                status: mapStatus(w.status),
                progress: calculateProgress(w.status),
                dueDate: formatDate(w.createdAt),
                pillar: 'WhatsApp',
                outlookEventId: w.outlookEventId
            })),
            ...legacyProjects.map((l: any) => ({
                id: l.id,
                name: 'Custom Implementation',
                clientName: l.name || l.email,
                status: mapStatus(l.status),
                progress: calculateProgress(l.status),
                dueDate: formatDate(l.createdAt),
                pillar: l.type,
                outlookEventId: l.outlookEventId
            }))
        ];

        return NextResponse.json({ success: true, projects: allProjects });
    } catch (error: any) {
        console.error('Failed to fetch admin projects:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

function mapStatus(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'completed';
    if (s === 'provisioning' || s === 'configuring' || s === 'build') return 'in_progress';
    if (s === 'pending_setup' || s === 'discovery' || s === 'planning') return 'planning';
    if (s === 'suspended' || s === 'blocked') return 'blocked';
    return 'planning';
}

function calculateProgress(status: string): number {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 100;
    if (s === 'provisioning') return 80;
    if (s === 'configuring') return 50;
    if (s === 'pending_setup') return 15;
    if (s === 'qualified') return 5;
    return 10;
}

function formatDate(timestamp: any): string {
    if (!timestamp) return 'No Date';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toISOString().split('T')[0];
    } catch (e) {
        return 'Invalid Date';
    }
}
