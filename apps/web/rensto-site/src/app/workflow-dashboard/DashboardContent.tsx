'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

export interface Template {
  id: string;
  name: string;
  category: string;
  tier: string;
  status: string;
  complexity: string;
  nodeCount: number;
  client: string;
  isPublic: boolean;
  isActive: boolean;
  pricingTemplate: number;
  pricingInstallation: number;
}

export interface Client {
  id: string;
  name: string;
  contactName: string;
  industry: string;
  status: string;
  tier: string;
  totalRevenue: number;
  activeWorkflows: number;
}

interface DashboardContentProps {
  initialTemplates: Template[];
  initialClients: Client[];
  lastUpdated: string;
}

export default function DashboardContent({ initialTemplates, initialClients, lastUpdated }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'clients'>('overview');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const templates = initialTemplates;
  const clients = initialClients;

  // Calculate stats
  const categories = Array.from(new Set(templates.map(t => t.category))).filter(Boolean);
  const templatesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = templates.filter(t => t.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const filteredTemplates = categoryFilter === 'all'
    ? templates
    : templates.filter(t => t.category === categoryFilter);

  const activeClients = clients.filter(c => c.status === 'active');
  const prospects = clients.filter(c => c.status === 'prospect');
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);

  return (
    <div className="min-h-screen bg-[#110d28] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#fe3d51]">Rensto Workflow Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Real-time view of templates, clients, and analytics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        {(['overview', 'templates', 'clients'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${activeTab === tab
              ? 'text-[#1eaef7] border-b-2 border-[#1eaef7]'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Templates" value={templates.length} subtitle={`${templates.filter(t => t.isActive).length} active`} color="#fe3d51" />
            <StatCard title="Total Clients" value={clients.length} subtitle={`${activeClients.length} active, ${prospects.length} prospects`} color="#1eaef7" />
            <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} subtitle="From all clients" color="#5ffbfd" />
            <StatCard title="Total Nodes" value={templates.reduce((sum, t) => sum + t.nodeCount, 0).toLocaleString()} subtitle={`~${Math.round(templates.reduce((sum, t) => sum + t.nodeCount, 0) / (templates.length || 1))} avg per template`} color="#bf5700" />
          </div>

          {/* AI Opportunity Radar & Hot Picks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#1a1438] to-[#110d28] rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-24 h-24 text-[#fe3d51]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="p-2 bg-[#fe3d51]/20 rounded-lg"><svg className="w-5 h-5 text-[#fe3d51]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
                AI Opportunity Radar
              </h3>
              <div className="space-y-4 relative z-10">
                <p className="text-gray-400 text-sm">Targeted upgrades to maximize your automation ROI.</p>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-[#fe3d51]/30 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Customer Support AI</span>
                    <span className="text-xs text-[#5ffbfd] font-bold">+85% Efficiency</span>
                  </div>
                  <Progress value={85} className="h-1.5" />
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-[#1eaef7]/30 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Automated Outreach</span>
                    <span className="text-xs text-[#1eaef7] font-bold">+300% Leads</span>
                  </div>
                  <Progress value={70} className="h-1.5" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1438] to-[#110d28] rounded-2xl p-6 border border-white/5 group">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="p-2 bg-[#1eaef7]/20 rounded-lg"><svg className="w-5 h-5 text-[#1eaef7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></span>
                Marketplace Hot Picks
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {templates.slice(0, 4).map(template => (
                  <div key={template.id} className="bg-black/20 rounded-xl p-3 border border-white/5 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="text-[10px] text-[#5ffbfd] font-bold uppercase mb-1">{template.category}</div>
                    <div className="text-xs font-bold line-clamp-1">{template.name}</div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium">Starting at ${template.pricingTemplate}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1a1438] rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Templates by Category</h3>
              <div className="space-y-3">
                {Object.entries(templatesByCategory).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([category, count]) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-400 truncate">{category}</div>
                    <div className="flex-1 h-6 bg-[#2a2448] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#fe3d51] to-[#1eaef7] rounded-full" style={{ width: `${(count / templates.length) * 100}%` }} />
                    </div>
                    <div className="w-12 text-right text-sm font-medium">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1438] rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Clients by Industry</h3>
              <div className="grid grid-cols-2 gap-3">
                {Array.from(new Set(clients.map(c => c.industry))).filter(Boolean).map(industry => {
                  const count = clients.filter(c => c.industry === industry).length;
                  return (
                    <div key={industry} className="bg-[#2a2448] rounded-lg p-3">
                      <div className="text-sm text-gray-400 capitalize">{industry}</div>
                      <div className="text-2xl font-bold text-[#5ffbfd]">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Clients */}
          <div className="bg-[#1a1438] rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Active Clients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeClients.map(client => (
                <div key={client.id} className="bg-[#2a2448] rounded-lg p-4">
                  <div className="font-medium text-white">{client.name}</div>
                  <div className="text-sm text-gray-400">{client.contactName}</div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-xs text-[#1eaef7] capitalize">{client.industry}</span>
                    <span className="text-xs text-[#5ffbfd]">${client.totalRevenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <label className="text-gray-400">Filter by category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-[#1a1438] border border-gray-700 rounded-lg px-4 py-2 text-white">
              <option value="all">All Categories</option>
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            <span className="text-gray-400 ml-4">Showing {filteredTemplates.length} of {templates.length} templates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.slice(0, 30).map(template => (
              <div key={template.id} className="bg-[#1a1438] rounded-xl p-4 border border-gray-800 hover:border-[#1eaef7] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white text-sm line-clamp-2">{template.name}</h4>
                  <StatusBadge status={template.status} />
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 bg-[#2a2448] rounded text-xs text-[#1eaef7]">{template.category}</span>
                  <span className="px-2 py-0.5 bg-[#2a2448] rounded text-xs text-[#bf5700]">{template.tier}</span>
                  <span className="px-2 py-0.5 bg-[#2a2448] rounded text-xs text-gray-400">{template.nodeCount} nodes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Template: ${template.pricingTemplate}</span>
                  <span className="text-gray-400">Install: ${template.pricingInstallation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Active Clients" value={activeClients.length} color="#5ffbfd" />
            <StatCard title="Prospects" value={prospects.length} color="#1eaef7" />
            <StatCard title="Lead Gen Tests" value={clients.filter(c => c.status === 'lead-gen-test').length} color="#bf5700" />
          </div>

          <div className="bg-[#1a1438] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#2a2448]">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Contact</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Industry</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Tier</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="border-t border-gray-800 hover:bg-[#2a2448]">
                    <td className="p-4 font-medium">{client.name}</td>
                    <td className="p-4 text-gray-400">{client.contactName}</td>
                    <td className="p-4 text-gray-400 capitalize">{client.industry}</td>
                    <td className="p-4"><ClientStatusBadge status={client.status} /></td>
                    <td className="p-4 text-gray-400 capitalize">{client.tier}</td>
                    <td className="p-4 text-right text-[#5ffbfd]">${client.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        Data synced from Firebase Firestore • Last updated: {lastUpdated}
      </div>
    </div>
  );
}

// Components
function StatCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color: string }) {
  return (
    <div className="bg-[#1a1438] rounded-xl p-6 border-l-4" style={{ borderColor: color }}>
      <div className="text-gray-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      {subtitle && <div className="text-gray-500 text-sm mt-1">{subtitle}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    production: 'bg-green-500/20 text-green-400',
    template: 'bg-blue-500/20 text-blue-400',
    development: 'bg-yellow-500/20 text-yellow-400',
    'needs-fix': 'bg-red-500/20 text-red-400',
    testing: 'bg-purple-500/20 text-purple-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}

function ClientStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    prospect: 'bg-blue-500/20 text-blue-400',
    'lead-gen-test': 'bg-purple-500/20 text-purple-400',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}
