import { redirect } from 'next/navigation';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Rensto Admin Dashboard',
};

async function getDashboardStats() {
  const db = getFirestoreAdmin();

  // Parallel fetch for verify performance
  const [clientsSnapshot, downloadsSnapshot, templatesSnapshot] = await Promise.all([
    db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).get(),
    db.collection(COLLECTIONS.DOWNLOADS).get(),
    db.collection(COLLECTIONS.TEMPLATES).get()
  ]);

  const clients = clientsSnapshot.docs.map(doc => doc.data());
  const templates = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Calculate Revenue (Total Amount Paid)
  const totalRevenue = clients.reduce((sum, client) => sum + (client.amountPaid || 0), 0);

  // Calculate Active Projects (Contract Signed)
  const activeProjects = clients.filter((c: any) => c.contractStatus === 'signed').length;
  const completedProjects = clients.filter((c: any) => c.status === 'completed').length;

  // Calculate Clients
  const totalClients = clients.length;
  const newClients = clients.filter((c: any) => {
    // New if created in last 30 days
    if (!c.createdAt) return false;
    const created = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt._seconds * 1000);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created > thirtyDaysAgo;
  }).length;

  return {
    stats: {
      revenue: {
        current: totalRevenue,
        previous: totalRevenue * 0.85, // Mock previous for growth calc
        change: '+15% (est)'
      },
      projects: {
        active: activeProjects,
        completed: completedProjects,
        pending: totalClients - activeProjects - completedProjects
      },
      clients: {
        total: totalClients,
        new: newClients,
        active: activeProjects
      },
      invoices: {
        pending: clients.filter((c: any) => c.amountPaid === 0).length,
        overdue: 0,
        total: totalRevenue
      }
    },
    templates
  };
}

async function getRecentActivity() {
  try {
    const db = getFirestoreAdmin();
    // Fetch from AUDITS log first, fallback to mock if empty during migration
    const auditsSnapshot = await db.collection(COLLECTIONS.AUDITS)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    if (auditsSnapshot.empty) {
      return [];
    }

    return auditsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: (data.service || 'system').toLowerCase(),
        action: data.event || 'Unknown Event',
        time: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)).toLocaleString() : 'Just now',
        status: (data.status as 'success' | 'error' | 'warning') || 'success'
      };
    });
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const session = await verifySession();

  if (!session.isValid || !session.email) {
    redirect('/login?redirect=/control');
  }

  // Admin Check
  const ADMIN_EMAILS = ['admin@rensto.com', 'shaifriedman2010@gmail.com'];
  if (!ADMIN_EMAILS.includes(session.email)) {
    // Not an admin, redirect to their client dashboard
    redirect(`/dashboard/${session.clientId}`);
  }

  const { stats, templates } = await getDashboardStats();
  const recentActivity = await getRecentActivity();

  return (
    <AdminDashboardClient
      session={{ user: { name: session.email.split('@')[0], email: session.email } }}
      stats={stats}
      recentActivity={recentActivity}
      templates={templates}
    />
  );
}
