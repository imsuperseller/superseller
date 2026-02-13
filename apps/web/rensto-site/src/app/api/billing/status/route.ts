import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await verifySession();
        if (!session.isValid || !session.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const email = session.email.toLowerCase();
        const userId = email.replace(/[^a-z0-9]/g, '_');
        let subscription: any = null;
        let invoices: any[] = [];
        let usageBreakdown: any[] = [];

        try {
            // 1. Fetch Subscription Data from Postgres
            const pgSub = await prisma.subscription.findFirst({
                where: { userEmail: email },
                orderBy: { createdAt: 'desc' },
            });
            subscription = pgSub;

            // 2. Fetch Recent Payments from Postgres
            const pgPayments = await prisma.payment.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
            });
            invoices = pgPayments.map(p => ({
                id: p.id.slice(0, 8).toUpperCase(),
                date: p.createdAt,
                amount: (p.amountTotal || 0) / 100,
                status: 'paid',
                description: `${p.flowType || 'Service'} Payment`,
            }));

            // 3. Fetch Usage Metrics from Postgres
            const pgUsage = await prisma.usageLog.findMany({
                where: { clientId: userId },
            });
            const serviceMap: Record<string, number> = {};
            pgUsage.forEach(log => {
                const service = log.serviceType || 'General AI';
                serviceMap[service] = (serviceMap[service] || 0) + (log.tokenCount || 100);
            });
            usageBreakdown = Object.entries(serviceMap).map(([service, tokens]) => ({
                service,
                usage: (tokens / 1000).toFixed(2),
                percentage: Math.min(Math.round((tokens / 100000) * 100), 100),
            }));
        } catch (pgError) {
            console.warn('[billing/status] Postgres error:', pgError);
        }

        return NextResponse.json({
            success: true,
            billing: {
                currentPeriod: {
                    start: subscription?.currentPeriodStart
                        ? (subscription.currentPeriodStart instanceof Date
                            ? subscription.currentPeriodStart.toISOString().split('T')[0]
                            : subscription.currentPeriodStart?.toDate?.()?.toISOString?.()?.split('T')[0])
                        || new Date().toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0],
                    end: subscription?.currentPeriodEnd
                        ? (subscription.currentPeriodEnd instanceof Date
                            ? subscription.currentPeriodEnd.toISOString().split('T')[0]
                            : subscription.currentPeriodEnd?.toDate?.()?.toISOString?.()?.split('T')[0])
                        || 'N/A'
                        : 'N/A',
                    total: invoices[0]?.amount || 0,
                    usage: usageBreakdown.reduce((acc, curr) => acc + curr.percentage, 0) / (usageBreakdown.length || 1),
                    limit: 100,
                },
                invoices,
                usageBreakdown,
                paymentMethod: {
                    type: subscription?.paymentMethodType || 'Card',
                    last4: subscription?.last4 || '****',
                    expiry: subscription?.expiry || 'N/A',
                    name: subscription?.userName || 'Valued Client',
                },
            },
        });

    } catch (error) {
        console.error('Billing API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch billing data' }, { status: 500 });
    }
}
