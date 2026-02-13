import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const [serviceInstances, whatsappInstances] = await Promise.all([
                prisma.serviceInstance.findMany({ orderBy: { createdAt: 'desc' } }),
                prisma.whatsAppInstance.findMany({ orderBy: { createdAt: 'desc' } }),
        ]);

        const allProjects = [
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
