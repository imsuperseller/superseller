'use client';

// import { useSession } from 'next-auth/react';
import { usePermissions, UserRole } from '@/lib/rbac-client';

export default function RBACDemo() {
  // const { data: session } = useSession();
  const session = { user: { name: 'Admin User', email: 'admin@rensto.com' } };
  const userRole = session?.user?.role as UserRole || UserRole.VIEWER;
  const permissions = usePermissions(userRole);

  if (!session) {
    return (
      <div className="p-6 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold style={{ color: 'var(--rensto-red)' }}">Authentication Required</h3>
        <p className="style={{ color: 'var(--rensto-red)' }}">Please log in to view this demo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">RBAC Demo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">User Information</h3>
            <p><strong>Name:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Role:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{userRole}</span></p>
            <p><strong>Organization:</strong> {session.user.orgId}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Role Description</h3>
            <p className="text-sm text-gray-600">
              {userRole === UserRole.OWNER && "Full access to all features including billing and organization management"}
              {userRole === UserRole.ADMIN && "Full access except billing and organization deletion"}
              {userRole === UserRole.MEMBER && "Can view and run agents, limited management capabilities"}
              {userRole === UserRole.VIEWER && "Read-only access to all resources"}
            </p>
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Permission Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Organization Permissions */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">Organization</h4>
            <div className="space-y-1">
              <PermissionItem label="Read" hasPermission={permissions.canReadOrganization()} />
              <PermissionItem label="Update" hasPermission={permissions.canUpdateOrganization()} />
              <PermissionItem label="Delete" hasPermission={permissions.canDeleteOrganization()} />
              <PermissionItem label="Billing" hasPermission={permissions.canManageBilling()} />
            </div>
          </div>

          {/* User Management */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">User Management</h4>
            <div className="space-y-1">
              <PermissionItem label="Read Users" hasPermission={permissions.canReadUsers()} />
              <PermissionItem label="Create Users" hasPermission={permissions.canCreateUsers()} />
              <PermissionItem label="Update Users" hasPermission={permissions.canUpdateUsers()} />
              <PermissionItem label="Delete Users" hasPermission={permissions.canDeleteUsers()} />
              <PermissionItem label="Invite Users" hasPermission={permissions.canInviteUsers()} />
            </div>
          </div>

          {/* Agent Management */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">Agent Management</h4>
            <div className="space-y-1">
              <PermissionItem label="Read Agents" hasPermission={permissions.canReadAgents()} />
              <PermissionItem label="Create Agents" hasPermission={permissions.canCreateAgents()} />
              <PermissionItem label="Update Agents" hasPermission={permissions.canUpdateAgents()} />
              <PermissionItem label="Delete Agents" hasPermission={permissions.canDeleteAgents()} />
              <PermissionItem label="Run Agents" hasPermission={permissions.canRunAgents()} />
            </div>
          </div>

          {/* Data Sources */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">Data Sources</h4>
            <div className="space-y-1">
              <PermissionItem label="Read" hasPermission={permissions.canReadDataSources()} />
              <PermissionItem label="Create" hasPermission={permissions.canCreateDataSources()} />
              <PermissionItem label="Update" hasPermission={permissions.canUpdateDataSources()} />
              <PermissionItem label="Delete" hasPermission={permissions.canDeleteDataSources()} />
            </div>
          </div>

          {/* Analytics */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">Analytics</h4>
            <div className="space-y-1">
              <PermissionItem label="Read" hasPermission={permissions.canReadAnalytics()} />
              <PermissionItem label="Export" hasPermission={permissions.canExportAnalytics()} />
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">Marketplace</h4>
            <div className="space-y-1">
              <PermissionItem label="Read" hasPermission={permissions.canReadAnalytics()} />
                              <PermissionItem label="Purchase" hasPermission={permissions.canManageBilling()} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Available Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionButton 
            label="Create New Agent" 
            enabled={permissions.canCreateAgents()}
            onClick={() => alert('Create Agent action triggered')}
          />
          <ActionButton 
            label="Invite Team Member" 
            enabled={permissions.canInviteUsers()}
            onClick={() => alert('Invite User action triggered')}
          />
          <ActionButton 
            label="Manage Billing" 
            enabled={permissions.canManageBilling()}
            onClick={() => alert('Billing action triggered')}
          />
          <ActionButton 
            label="Export Analytics" 
            enabled={permissions.canExportAnalytics()}
            onClick={() => alert('Export Analytics action triggered')}
          />
          <ActionButton 
            label="Purchase Template" 
                            enabled={permissions.canManageBilling()}
            onClick={() => alert('Purchase action triggered')}
          />
          <ActionButton 
            label="Delete Organization" 
            enabled={permissions.canDeleteOrganization()}
            onClick={() => alert('Delete Organization action triggered')}
            danger
          />
        </div>
      </div>

      {/* Test Different Roles */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Test Different Roles</h3>
        <p className="text-sm text-gray-600 mb-4">
          Log out and log in with different demo accounts to see how permissions change:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium style={{ color: 'var(--rensto-blue)' }}">Owner</h4>
            <p><strong>Email:</strong> admin@rensto.com</p>
            <p><strong>Password:</strong> admin123</p>
            <p className="style={{ color: 'var(--rensto-blue)' }}">Full access to everything</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">Admin</h4>
            <p><strong>Email:</strong> admin@demo.com</p>
            <p><strong>Password:</strong> admin123</p>
            <p className="text-green-600">Full access except billing</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800">Member</h4>
            <p><strong>Email:</strong> member@demo.com</p>
            <p><strong>Password:</strong> member123</p>
            <p className="text-yellow-600">Limited management capabilities</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800">Viewer</h4>
            <p><strong>Email:</strong> viewer@demo.com</p>
            <p><strong>Password:</strong> viewer123</p>
            <p className="text-gray-600">Read-only access</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionItem({ label, hasPermission }: { label: string; hasPermission: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        hasPermission 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-600'
      }`}>
        {hasPermission ? '✓' : '✗'}
      </span>
    </div>
  );
}

function ActionButton({ 
  label, 
  enabled, 
  onClick, 
  danger = false 
}: { 
  label: string; 
  enabled: boolean; 
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        enabled
          ? danger
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
      }`}
    >
      {label}
    </button>
  );
}
