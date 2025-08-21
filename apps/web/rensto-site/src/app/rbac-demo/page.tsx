import RBACDemo from '@/components/RBACDemo';

export default function RBACDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">RBAC Security System Demo</h1>
          <p className="mt-2 text-gray-600">
            This page demonstrates the Role-Based Access Control (RBAC) system implementation.
            Test different user roles to see how permissions change.
          </p>
        </div>
        
        <RBACDemo />
      </div>
    </div>
  );
}
