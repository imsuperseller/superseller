import { redirect } from 'next/navigation';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { AITableService } from '@/lib/services/AITableService';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Rensto Admin Dashboard',
};

// Helper to sanitize Firestore data for Next.js Client Components (serialization fix)
function serializeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data.toDate === 'function') return data.toDate().toISOString();
  if (Array.isArray(data)) return data.map(serializeData);
  if (typeof data === 'object') {
    const res: any = {};
    for (const key in data) res[key] = serializeData(data[key]);
    return res;
  }
  return data;
}

async function getDashboardStats() {
  const db = getFirestoreAdmin();

  // Parallel fetch for dual-identity model
  const [csClientsSnap, usersSnap, downloadsSnap] = await Promise.all([
    db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).get(),
    db.collection(COLLECTIONS.USERS).get(),
    db.collection(COLLECTIONS.DOWNLOADS).get()
  ]);

  const csClients = csClientsSnap.docs.map(doc => ({ ...doc.data(), source: 'cs' }));
  const users = usersSnap.docs.map(doc => ({ ...doc.data(), source: 'users' }));

  // UNIFIED CLIENT POOL (The "Bone" fix)
  // Ensure we don't double count if a user exists in both, though email is our primary key
  const emailMap = new Map();
  [...csClients, ...users].forEach((client: any) => {
    const email = client.email?.toLowerCase();
    if (email && !emailMap.has(email)) {
      emailMap.set(email, client);
    }
  });
  const allClients = Array.from(emailMap.values());

  // Calculate Revenue (Unified)
  const totalRevenue = allClients.reduce((sum, client) => sum + (client.amountPaid || 0), 0);

  // Calculate Active Projects
  const activeProjects = allClients.filter((c: any) => c.contractStatus === 'signed' || c.status === 'active').length;
  const completedProjects = allClients.filter((c: any) => c.status === 'completed').length;

  // Calculate New Clients (Merged)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newClientsCount = allClients.filter((c: any) => {
    if (!c.createdAt) return false;
    const created = c.createdAt.toDate ? c.createdAt.toDate() : new Date((c.createdAt._seconds || 0) * 1000);
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
        pending: allClients.length - activeProjects - completedProjects
      },
      clients: {
        total: allClients.length,
        new: newClientsCount,
        active: activeProjects
      },
      invoices: {
        pending: allClients.filter((c: any) => !c.amountPaid || c.amountPaid === 0).length,
        overdue: 0,
        total: totalRevenue
      }
    },
    products: await AITableService.getProducts()
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
    redirect('/login?redirect=/admin');
  }

  // Admin Check
  const ADMIN_EMAILS = ['admin@rensto.com', 'shaifriedman2010@gmail.com'];
  if (!ADMIN_EMAILS.includes(session.email)) {
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
