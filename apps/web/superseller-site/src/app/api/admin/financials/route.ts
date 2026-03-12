import { NextRequest, NextResponse } from 'next/server';
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
        // Real MRR from active subscriptions
        let grossMRR = 0;
        try {
            const agg = await prisma.subscription.aggregate({
                _sum: { amount: true },
                where: { status: 'active' },
            });
            grossMRR = agg._sum.amount || 0;
        } catch {
            grossMRR = 0;
        }

        // Real API expenses from api_expenses table
        let monthExpenses = 0;
        let todayExpenses = 0;
        let totalExpenses = 0;
        let totalCalls = 0;
        try {
            const monthResult: any[] = await prisma.$queryRaw`
                SELECT COALESCE(SUM(cost), 0) as total, COUNT(*) as calls
                FROM api_expenses
                WHERE created_at >= date_trunc('month', CURRENT_DATE)
            `;
            monthExpenses = Number(monthResult[0]?.total || 0);

            const todayResult: any[] = await prisma.$queryRaw`
                SELECT COALESCE(SUM(cost), 0) as total
                FROM api_expenses WHERE created_at >= CURRENT_DATE
            `;
            todayExpenses = Number(todayResult[0]?.total || 0);

            const allTimeResult: any[] = await prisma.$queryRaw`
                SELECT COALESCE(SUM(cost), 0) as total, COUNT(*) as calls
                FROM api_expenses
            `;
            totalExpenses = Number(allTimeResult[0]?.total || 0);
            totalCalls = Number(allTimeResult[0]?.calls || 0);
        } catch { /* table may not be accessible via Prisma */ }

        // Fixed infrastructure costs (real, documented)
        const infraCosts = {
            racknerd: 47 / 12, // $47/yr = ~$3.92/mo
            vercel: 0,         // Hobby plan
        };
        const fixedMonthlyCost = infraCosts.racknerd + infraCosts.vercel;
        const totalMonthlyCost = fixedMonthlyCost + monthExpenses;
        const netProfit = grossMRR - totalMonthlyCost;
        const profitMargin = grossMRR > 0 ? (netProfit / grossMRR) * 100 : 0;

        // Payment history
        let recentPayments: any[] = [];
        try {
            recentPayments = await prisma.payment.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: { id: true, amount: true, status: true, createdAt: true },
            });
        } catch {}

        return NextResponse.json({
            success: true,
            metrics: [
                { label: 'Gross Revenue (MRR)', value: grossMRR, color: 'text-green-400' },
                { label: 'API Expenses (Month)', value: Number(monthExpenses.toFixed(2)), color: 'text-red-400' },
                { label: 'API Expenses (Today)', value: Number(todayExpenses.toFixed(2)), color: 'text-orange-400' },
                { label: 'Fixed Infra (Month)', value: Number(fixedMonthlyCost.toFixed(2)), color: 'text-slate-400' },
                { label: 'Net Profit Margin', value: grossMRR > 0 ? `${profitMargin.toFixed(1)}%` : 'N/A', color: 'text-cyan-400' },
            ],
            expenses: {
                apiToday: Number(todayExpenses.toFixed(2)),
                apiMonth: Number(monthExpenses.toFixed(2)),
                apiAllTime: Number(totalExpenses.toFixed(2)),
                apiCalls: totalCalls,
                infraMonthly: Number(fixedMonthlyCost.toFixed(2)),
            },
            recentPayments,
            projections: {
                yearEnd: grossMRR * 12,
                note: grossMRR === 0 ? 'No active subscriptions — $0 revenue' : undefined,
            },
        });
    } catch (error) {
        console.error('Financials fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
