import { redirect } from 'next/navigation';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import DashboardContent, { type Template, type Client } from './DashboardContent';

export const metadata = {
  title: 'Rensto Workflow Dashboard',
};

// Admin Check Constants
const ADMIN_EMAILS = ['admin@rensto.com', 'shaifriedman2010@gmail.com'];

async function getDashboardData() {
  const db = getFirestoreAdmin();

  // Parallel fetch
  const [templatesSnapshot, clientsSnapshot] = await Promise.all([
    db.collection(COLLECTIONS.TEMPLATES).get(),
    db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).get()
  ]);

  const templates = templatesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Template[];

  const clients = clientsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Client[];

  return { templates, clients };
}

export default async function WorkflowDashboardPage() {
  const session = await verifySession();

  if (!session.isValid || !session.email) {
    redirect('/login?redirect=/workflow-dashboard');
  }

  // Admin Check
  if (!ADMIN_EMAILS.includes(session.email)) {
    // If not admin, this dashboard (which shows ALL data) is restricted.
    // Redirect to their specific client dashboard.
    redirect(`/dashboard/${session.clientId}`);
  }

  const { templates, clients } = await getDashboardData();
  const lastUpdated = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <DashboardContent
      initialTemplates={templates}
      initialClients={clients}
      lastUpdated={lastUpdated}
    />
  );
}
