/**
 * Client-Side Role-Based Access Control (RBAC) System
 *
 * Client-side permissions without server dependencies
 */

// User roles enum
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

// RBAC permissions interface
interface Permission {
  resource: string;
  action: string;
}

// User roles and permissions mapping
const ROLE_PERMISSIONS = {
  owner: {
    agents: ['read', 'create', 'update', 'delete', 'execute'],
    workflows: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
    settings: ['read', 'update'],
    organization: ['read', 'update', 'delete'],
    billing: ['read', 'update'],
  },
  admin: {
    agents: ['read', 'create', 'update', 'delete', 'execute'],
    workflows: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
    settings: ['read', 'update'],
    organization: ['read', 'update'],
    billing: ['read'],
  },
  member: {
    agents: ['read', 'execute'],
    workflows: ['read'],
    users: ['read'],
    settings: ['read'],
    organization: ['read'],
    billing: ['read'],
  },
  viewer: {
    agents: ['read'],
    workflows: ['read'],
    users: ['read'],
    settings: ['read'],
    organization: ['read'],
    billing: ['read'],
  },
};

// Check if user has permission
function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions =
    ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];

  if (!rolePermissions) {
    return false;
  }

  const resourcePermissions =
    rolePermissions[permission.resource as keyof typeof rolePermissions];

  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes(permission.action);
}

// Client-side permissions hook
export function usePermissions(userRole: UserRole) {
  return {
    // Organization permissions
    canReadOrganization: () => hasPermission(userRole, { resource: 'organization', action: 'read' }),
    canUpdateOrganization: () => hasPermission(userRole, { resource: 'organization', action: 'update' }),
    canDeleteOrganization: () => hasPermission(userRole, { resource: 'organization', action: 'delete' }),
    canManageBilling: () => hasPermission(userRole, { resource: 'billing', action: 'update' }),

    // User management permissions
    canReadUsers: () => hasPermission(userRole, { resource: 'users', action: 'read' }),
    canCreateUsers: () => hasPermission(userRole, { resource: 'users', action: 'create' }),
    canUpdateUsers: () => hasPermission(userRole, { resource: 'users', action: 'update' }),
    canDeleteUsers: () => hasPermission(userRole, { resource: 'users', action: 'delete' }),
    canInviteUsers: () => hasPermission(userRole, { resource: 'users', action: 'create' }),

    // Agent permissions
    canReadAgents: () => hasPermission(userRole, { resource: 'agents', action: 'read' }),
    canCreateAgents: () => hasPermission(userRole, { resource: 'agents', action: 'create' }),
    canUpdateAgents: () => hasPermission(userRole, { resource: 'agents', action: 'update' }),
    canDeleteAgents: () => hasPermission(userRole, { resource: 'agents', action: 'delete' }),
    canRunAgents: () => hasPermission(userRole, { resource: 'agents', action: 'execute' }),

    // Workflow permissions
    canReadWorkflows: () => hasPermission(userRole, { resource: 'workflows', action: 'read' }),
    canCreateWorkflows: () => hasPermission(userRole, { resource: 'workflows', action: 'create' }),
    canUpdateWorkflows: () => hasPermission(userRole, { resource: 'workflows', action: 'update' }),
    canDeleteWorkflows: () => hasPermission(userRole, { resource: 'workflows', action: 'delete' }),

    // Data source permissions
    canReadDataSources: () => hasPermission(userRole, { resource: 'agents', action: 'read' }),
    canCreateDataSources: () => hasPermission(userRole, { resource: 'agents', action: 'create' }),
    canUpdateDataSources: () => hasPermission(userRole, { resource: 'agents', action: 'update' }),
    canDeleteDataSources: () => hasPermission(userRole, { resource: 'agents', action: 'delete' }),

    // Analytics permissions
    canReadAnalytics: () => hasPermission(userRole, { resource: 'agents', action: 'read' }),
    canExportAnalytics: () => hasPermission(userRole, { resource: 'agents', action: 'read' }),

    // Settings permissions
    canReadSettings: () => hasPermission(userRole, { resource: 'settings', action: 'read' }),
    canUpdateSettings: () => hasPermission(userRole, { resource: 'settings', action: 'update' }),
  };
}
