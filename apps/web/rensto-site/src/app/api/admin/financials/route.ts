import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return null;
    }
    return session;
}

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = getFirestoreAdmin();

        // 1. Fetch all subscriptions
        const subsSnap = await db.collection(COLLECTIONS.SUBSCRIPTIONS).get();
        const subscriptions = subsSnap.docs.map(doc => doc.data());

        // 2. Calculate Gross MRR
        const grossMRR = subscriptions.reduce((acc, sub) => acc + (sub.amount || 0), 0);

        // 3. Mock Expenses (In a real scenario, fetch from an expenses collection)
        const platformExpenses = 1840; // Static placeholder for now
        const partnerRevShare = 3690; // Static placeholder for now

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
                growthRate: '8.2%'
            }
        });
    } catch (error) {
        console.error('Financials fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
