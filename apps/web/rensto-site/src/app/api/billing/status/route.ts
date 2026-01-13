import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
    try {
        const session = await verifySession();
        if (!session.isValid || !session.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const db = getFirestoreAdmin();
        const email = session.email.toLowerCase();

        // 1. Fetch Subscription Data
        const subSnap = await db.collection(COLLECTIONS.SUBSCRIPTIONS)
            .where('userEmail', '==', email)
            .limit(1)
            .get();

        const subscription = !subSnap.empty ? subSnap.docs[0].data() : null;

        // 2. Fetch Recent Invoices (Payments)
        const paymentsSnap = await db.collection('payments')
            .where('customerEmail', '==', email)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        const invoices = paymentsSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id.slice(0, 8).toUpperCase(),
                date: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
                amount: (data.amountTotal || 0) / 100,
                status: 'paid',
                description: `${data.flowType || 'Service'} Payment`
            };
        });

        // 3. Fetch Usage Metrics
        const usageSnap = await db.collection(COLLECTIONS.USAGE_LOGS)
            .where('clientEmail', '==', email)
            .get();

        // Calculate service breakdown
        const serviceMap: Record<string, number> = {};
        usageSnap.docs.forEach(doc => {
            const data = doc.data();
            const service = data.serviceType || 'General AI';
            serviceMap[service] = (serviceMap[service] || 0) + (data.tokenCount || 100);
        });

        const usageBreakdown = Object.entries(serviceMap).map(([service, tokens]) => ({
            service,
            usage: (tokens / 1000).toFixed(2), // Mock $ cost for now
            percentage: Math.min(Math.round((tokens / 100000) * 100), 100)
        }));

        return NextResponse.json({
            success: true,
            billing: {
                currentPeriod: {
                    start: subscription?.currentPeriodStart?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
                    end: subscription?.currentPeriodEnd?.toDate?.()?.toISOString()?.split('T')[0] || 'N/A',
                    total: invoices[0]?.amount || 0,
                    usage: usageBreakdown.reduce((acc, curr) => acc + curr.percentage, 0) / (usageBreakdown.length || 1),
                    limit: 100
                },
                invoices,
                usageBreakdown,
                paymentMethod: {
                    type: subscription?.paymentMethodType || 'Card',
                    last4: subscription?.last4 || '****',
                    expiry: subscription?.expiry || 'N/A',
                    name: subscription?.userName || 'Valued Client'
                }
            }
        });

    } catch (error) {
        console.error('Billing API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch billing data' }, { status: 500 });
    }
}
