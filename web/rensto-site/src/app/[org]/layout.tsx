import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { org } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      redirect('/login');
    }

    await dbConnect();
    
    // Find organization by slug
    const organization = await Organization.findOne({ slug: org });
    if (!organization) {
      redirect('/404');
    }

    // Check if user has access to this organization
    // TODO: Implement proper RBAC check
    
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {organization.name.charAt(0)}
                </div>
                <div>
                  <h1 className="font-semibold text-slate-900">{organization.name}</h1>
                  <p className="text-sm text-slate-500">@{org}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <a href={`/${org}`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>📊</span>
                  <span>Overview</span>
                </a>
                <a href={`/${org}/agents`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>🤖</span>
                  <span>Agents</span>
                </a>
                <a href={`/${org}/runs`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>📈</span>
                  <span>Runs & Logs</span>
                </a>
                <a href={`/${org}/datasources`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>🔗</span>
                  <span>Data Sources</span>
                </a>
                <a href={`/${org}/insights`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>🧠</span>
                  <span>AI Insights</span>
                </a>
                <a href={`/${org}/analytics`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>📊</span>
                  <span>Analytics</span>
                </a>
                <a href={`/${org}/marketplace`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>🛒</span>
                  <span>Marketplace</span>
                </a>
                <a href={`/${org}/billing`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>💳</span>
                  <span>Billing</span>
                </a>
                <a href={`/${org}/settings`} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                  <span>⚙️</span>
                  <span>Settings</span>
                </a>
              </nav>
            </div>
          </aside>
          
          {/* Main content */}
          <main className="flex-1">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in org layout:', error);
    redirect('/login');
  }
}
