import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

interface Recommendation {
    id: string;
    type: 'optimization' | 'growth' | 'risk' | 'revenue';
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    action: string;
    tenantSlug?: string;
}

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const recommendations: Recommendation[] = [];

        // 1. Check for tenants with no active subscriptions (revenue opportunity)
        const tenants = await prisma.tenant.findMany({
            include: { brand: true },
        });
        for (const t of tenants) {
            const settings = (t.settings as Record<string, any>) || {};
            const contract = settings.contract;
            if (contract?.monthlyRate && contract.monthlyRate > 0) {
                // Has a contract — check if subscription exists
                const activeSub = await prisma.subscription.findFirst({
                    where: { status: 'active' },
                });
                if (!activeSub) {
                    recommendations.push({
                        id: `rev-${t.slug}`,
                        type: 'revenue',
                        priority: 'high',
                        title: `${t.name} — $${contract.monthlyRate}/mo not billing`,
                        message: `${t.name} has a $${contract.monthlyRate}/mo contract but no active PayPal subscription. Send the contract and activate billing.`,
                        action: 'Activate Billing',
                        tenantSlug: t.slug,
                    });
                }
            }
        }

        // 2. Check for stale leads (no activity in 7+ days)
        const staleLeadCount = await prisma.lead.count({
            where: {
                status: { in: ['new', 'contacted'] },
                createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
        });
        if (staleLeadCount > 0) {
            recommendations.push({
                id: 'stale-leads',
                type: 'growth',
                priority: 'medium',
                title: `${staleLeadCount} leads aging (7+ days)`,
                message: `${staleLeadCount} leads have been in "new" or "contacted" status for over 7 days. Follow up or close them.`,
                action: 'Review Leads',
            });
        }

        // 3. Check API expense anomalies (today > $10)
        try {
            const todayExpenses: any[] = await prisma.$queryRaw`
                SELECT COALESCE(SUM(cost), 0) as total FROM api_expenses
                WHERE created_at >= CURRENT_DATE
            `;
            const todaySpend = Number(todayExpenses[0]?.total || 0);
            if (todaySpend > 10) {
                recommendations.push({
                    id: 'expense-spike',
                    type: 'risk',
                    priority: 'high',
                    title: `API spend spike: $${todaySpend.toFixed(2)} today`,
                    message: `Today's API costs ($${todaySpend.toFixed(2)}) exceed $10 threshold. Check for runaway jobs or unnecessary generations.`,
                    action: 'Check Expenses',
                });
            }
        } catch { /* api_expenses table may not exist in Prisma */ }

        // 4. If no recommendations, say so honestly
        if (recommendations.length === 0) {
            recommendations.push({
                id: 'all-clear',
                type: 'optimization',
                priority: 'low',
                title: 'No actionable recommendations',
                message: 'All systems nominal. No stale leads, no billing gaps, no expense anomalies detected.',
                action: 'Dismiss',
            });
        }

        return NextResponse.json({ success: true, recommendations });
    } catch (error) {
        console.error('Intelligence fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
