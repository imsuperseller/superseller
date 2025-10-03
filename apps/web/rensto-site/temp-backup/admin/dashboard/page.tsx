import { Metadata } from 'next';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { RevenueMetrics } from '@/components/admin/RevenueMetrics';
import { CustomerMetrics } from '@/components/admin/CustomerMetrics';
import { SystemHealth } from '@/components/admin/SystemHealth';

export const metadata: Metadata = {
  title: 'Dashboard Overview | Admin | Rensto',
  description: 'Admin dashboard overview with key metrics and analytics',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <DashboardOverview />

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueMetrics />
        <CustomerMetrics />
      </div>

      {/* System Health */}
      <SystemHealth />
    </div>
  );
}
