'use client';

import dynamic from 'next/dynamic';

// Dynamically import dashboard with SSR disabled to avoid hydration mismatch
const DashboardContent = dynamic(() => import('./DashboardContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#110d28] text-white p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#fe3d51]">Rensto Workflow Dashboard</h1>
        <p className="text-gray-400 mt-2">Loading dashboard...</p>
      </div>
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#1a1438] rounded-xl p-6 h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1a1438] rounded-xl p-6 h-64" />
          <div className="bg-[#1a1438] rounded-xl p-6 h-64" />
        </div>
      </div>
    </div>
  ),
});

export default function WorkflowDashboardPage() {
  return <DashboardContent />;
}
