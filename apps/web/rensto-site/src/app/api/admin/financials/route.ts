import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        let grossMRR = 0;

        try {
            const result = await prisma.subscription.aggregate({
                _sum: { amount: true },
                where: { status: 'active' },
            });
            grossMRR = result._sum.amount || 0;
        } catch (pgError) {
            // Fallback: Firestore
            console.info('[Migration] admin/financials: Postgres fail, falling back to Firestore');
            const db = getFirestoreAdmin();
            const subsSnap = await db.collection(COLLECTIONS.SUBSCRIPTIONS).get();
            grossMRR = subsSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
        }

        const platformExpenses = 1840;
        const partnerRevShare = 3690;
        const netProfit = grossMRR - platformExpenses - partnerRevShare;
        const profitMargin = grossMRR > 0 ? (netProfit / grossMRR) * 100 : 0;

        return NextResponse.json({
            success: true,
            metrics: [
                { label: 'Gross Revenue (MRR)', value: grossMRR, change: 12.5, trend: 'up', color: 'text-green-400' },
                { label: 'Platform Expenses', value: platformExpenses, change: 4.2, trend: 'up', color: 'text-red-400' },
                { label: 'Partner Rev Share', value: partnerRevShare, change: 14.8, trend: 'up', color: 'text-orange-400' },
                { label: 'Net Profit Margin', value: profitMargin.toFixed(1), change: 2.1, trend: 'up', color: 'text-cyan-400' },
            ],
            projections: {
                yearEnd: grossMRR * 12,
                growthRate: '8.2%',
            },
        });
    } catch (error) {
        console.error('Financials fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
