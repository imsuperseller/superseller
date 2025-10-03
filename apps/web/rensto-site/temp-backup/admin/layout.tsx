import { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminProvider } from '@/providers/AdminProvider';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Rensto',
  description: 'Universal automation platform admin dashboard',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminProvider>
    </ErrorBoundary>
  );
}