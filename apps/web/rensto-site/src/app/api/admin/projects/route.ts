import { NextResponse } from 'next/server';
// [MIGRATION] Phase 4: Firestore kept as fallback
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // [MIGRATION] Phase 4: Read from Postgres first
        let allProjects: any[] = [];

        try {
            const [serviceInstances, whatsappInstances] = await Promise.all([
                prisma.serviceInstance.findMany({ orderBy: { createdAt: 'desc' } }),
                prisma.whatsAppInstance.findMany({ orderBy: { createdAt: 'desc' } }),
            ]);

            allProjects = [
                ...serviceInstances.map(s => ({
                    id: s.id,
                    name: s.productName || 'Unnamed Engine',
                    clientName: s.clientEmail || 'Unknown Client',
                    status: mapStatus(s.status),
                    progress: calculateProgress(s.status),
                    dueDate: s.createdAt ? s.createdAt.toISOString().split('T')[0] : 'No Date',
                    pillar: 'Marketplace',
                })),
                ...whatsappInstances.map(w => ({
                    id: w.id,
                    name: w.bundle === 'full_ai_sales_rep' ? 'Sales AI Rep' : 'WhatsApp Agent',
                    clientName: w.userEmail || 'Unknown Client',
                    status: mapStatus(w.status),
                    progress: calculateProgress(w.status),
                    dueDate: w.createdAt ? w.createdAt.toISOString().split('T')[0] : 'No Date',
                    pillar: 'WhatsApp',
                })),
            ];

            if (allProjects.length > 0) {
                return NextResponse.json({ success: true, projects: allProjects });
            }
            throw new Error('No projects in Postgres');
        } catch (pgError) {
            // Fallback: Firestore
            console.info('[Migration] admin/projects: Postgres fail, falling back to Firestore');
            const db = getFirestoreAdmin();

            const [serviceInstancesSnap, whatsappInstancesSnap, legacySnap] = await Promise.all([
                db.collection(COLLECTIONS.SERVICE_INSTANCES).get(),
                db.collection(COLLECTIONS.WHATSAPP_INSTANCES).get(),
                db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).get(),
            ]);

            const serviceInstances = serviceInstancesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Builder' }));
            const whatsappInstances = whatsappInstancesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Bundle' }));
            const legacyProjects = legacySnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Custom' }));

            allProjects = [
                ...serviceInstances.map((s: any) => ({
                    id: s.id,
                    name: s.productName || 'Unnamed Engine',
                    clientName: s.clientEmail || 'Unknown Client',
                    status: mapStatus(s.status),
                    progress: calculateProgress(s.status),
                    dueDate: formatDate(s.createdAt),
                    pillar: 'Marketplace',
                })),
                ...whatsappInstances.map((w: any) => ({
                    id: w.id,
                    name: w.bundle === 'full_ai_sales_rep' ? 'Sales AI Rep' : 'WhatsApp Agent',
                    clientName: w.userEmail || 'Unknown Client',
                    status: mapStatus(w.status),
                    progress: calculateProgress(w.status),
                    dueDate: formatDate(w.createdAt),
                    pillar: 'WhatsApp',
                })),
                ...legacyProjects.map((l: any) => ({
                    id: l.id,
                    name: 'Custom Implementation',
                    clientName: l.name || l.email,
                    status: mapStatus(l.status),
                    progress: calculateProgress(l.status),
                    dueDate: formatDate(l.createdAt),
                    pillar: l.type,
                })),
            ];

            return NextResponse.json({ success: true, projects: allProjects });
        }
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
