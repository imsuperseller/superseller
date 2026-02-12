import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    let customersCount = 0;
    let paymentsCount = 0;
    let totalRevenue = 0;
    let scorecardsCount = 0;
    let consultationsCount = 0;
    let requirementsCount = 0;

    try {
      [customersCount, paymentsCount, scorecardsCount, consultationsCount, requirementsCount] =
        await Promise.all([
          prisma.user.count(),
          prisma.payment.count(),
          prisma.scorecard.count(),
          prisma.consultation.count(),
          prisma.requirement.count(),
        ]);

      const revenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'succeeded' },
      });
      totalRevenue = revenueAgg._sum.amount || 0;
    } catch (pgError) {
      // Fallback: Firestore
      console.info('[Migration] admin/dashboard/metrics: Postgres fail, falling back to Firestore');
      const db = getFirestoreAdmin();
      customersCount = (await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).count().get()).data().count;
      paymentsCount = (await db.collection(COLLECTIONS.PAYMENTS).count().get()).data().count;
      scorecardsCount = (await db.collection(COLLECTIONS.SCORECARDS).count().get()).data().count;
      consultationsCount = (await db.collection(COLLECTIONS.CONSULTATIONS).count().get()).data().count;
      requirementsCount = (await db.collection(COLLECTIONS.REQUIREMENTS).count().get()).data().count;

      const successfulPayments = await db.collection(COLLECTIONS.PAYMENTS)
        .where('status', '==', 'succeeded')
        .limit(100)
        .get();
      successfulPayments.forEach(doc => {
        totalRevenue += (doc.data().amount || 0);
      });
    }

    const metrics = {
      revenue: {
        mrr: (totalRevenue / 100) / 12,
        arr: totalRevenue / 100,
        growth: 15.2,
        churn: 2.1,
        breakdown: {
          starter: Math.floor(totalRevenue * 0.3 / 100),
          professional: Math.floor(totalRevenue * 0.5 / 100),
          enterprise: Math.floor(totalRevenue * 0.2 / 100),
        },
      },
      customers: {
        total: customersCount,
        active: Math.floor(customersCount * 0.8),
        trial: Math.floor(customersCount * 0.1),
        churned: Math.floor(customersCount * 0.1),
        newThisMonth: scorecardsCount,
        churnedThisMonth: 1,
        convertedThisMonth: consultationsCount,
      },
      usage: {
        totalInteractions: scorecardsCount + consultationsCount + requirementsCount,
        totalTemplates: 136,
        totalStorage: 12.5,
        averageUsagePerCustomer: (scorecardsCount + consultationsCount) / Math.max(customersCount, 1),
      },
      system: {
        uptime: 99.99,
        responseTime: 180,
        errorRate: 0.05,
        activeUsers: customersCount,
        services: {
          api: { status: 'up', responseTime: 180, lastCheck: new Date().toISOString(), uptime: 99.9 },
          database: { status: 'up', responseTime: 45, lastCheck: new Date().toISOString(), uptime: 99.99 },
          payments: { status: 'up', responseTime: 120, lastCheck: new Date().toISOString(), uptime: 99.9 },
          workflows: { status: 'up', responseTime: 300, lastCheck: new Date().toISOString(), uptime: 99.5 },
        },
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
