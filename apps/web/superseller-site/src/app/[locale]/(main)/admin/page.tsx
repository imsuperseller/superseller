import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { AITableService } from '@/lib/services/AITableService';
import AdminDashboardClient from './AdminDashboardClient';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'SuperSeller AI Admin Dashboard',
};

// Helper to sanitize data for Next.js Client Components (serialization)
function serializeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map(serializeData);
  if (typeof data === 'object' && data instanceof Date) return data.toISOString();
  if (typeof data === 'object') {
    const res: any = {};
    for (const key in data) res[key] = serializeData(data[key]);
    return res;
  }
  return data;
}

async function getDashboardStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    userCount,
    paymentsCompleted,
    serviceInstances,
    newUsersCount,
    completedPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    }),
    prisma.serviceInstance.findMany({ where: { status: { in: ['active', 'pending_setup', 'configuring', 'provisioning'] } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.payment.findMany({ where: { status: 'completed' }, orderBy: { createdAt: 'desc' }, take: 500 }),
  ]);

  const totalRevenueCents = paymentsCompleted._sum.amount ?? 0;
  const totalRevenue = totalRevenueCents / 100;
  const activeProjects = serviceInstances.filter(s => s.status === 'active').length;
  const pendingProjects = serviceInstances.filter(s => s.status !== 'active' && s.status !== 'cancelled').length;

  return {
    stats: {
      revenue: {
        current: totalRevenue,
        previous: totalRevenue * 0.85,
        change: '+15% (est)',
      },
      projects: {
        active: activeProjects,
        completed: Math.max(0, serviceInstances.length - activeProjects - pendingProjects),
        pending: pendingProjects,
      },
      clients: {
        total: userCount,
        new: newUsersCount,
        active: activeProjects,
      },
      invoices: {
        pending: await prisma.payment.count({ where: { status: 'pending' } }),
        overdue: 0,
        total: totalRevenue,
      },
    },
    products: await AITableService.getProducts(),
  };
}

async function getRecentActivity() {
  try {
    const audits = await prisma.audit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return audits.map((a) => ({
      id: a.id,
      type: (a.service || 'system').toLowerCase(),
      action: a.action || 'Unknown Event',
      time: a.createdAt.toLocaleString(),
      status: (a.status as 'success' | 'error' | 'warning') || 'success',
    }));
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const session = await verifySession();

  if (!session.isValid || !session.email) {
    redirect('/login?redirect=/admin');
  }

  // Admin Check
  if (session.role !== 'admin') {
    // Not an admin, redirect to their client dashboard
    redirect(`/dashboard/${session.clientId}`);
  }

  const { stats, products } = await getDashboardStats();
  const recentActivity = await getRecentActivity();

  return (
    <AdminDashboardClient
      session={{ user: { name: session.email.split('@')[0], email: session.email } }}
      stats={stats}
      recentActivity={serializeData(recentActivity)}
      products={serializeData(products)}
    />
  );
}
