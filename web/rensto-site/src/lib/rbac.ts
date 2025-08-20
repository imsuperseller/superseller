/**
 * Role-Based Access Control (RBAC) System
 *
 * Implements comprehensive security controls for multi-tenant portal
 * Following BMAD methodology: BUILD phase of TASK 4
 */

import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Data source permissions
    canReadDataSources: () => hasPermission(userRole, { resource: 'datasources', action: 'read' }),
    canCreateDataSources: () => hasPermission(userRole, { resource: 'datasources', action: 'create' }),
    canUpdateDataSources: () => hasPermission(userRole, { resource: 'datasources', action: 'update' }),
    canDeleteDataSources: () => hasPermission(userRole, { resource: 'datasources', action: 'delete' }),

    // Analytics permissions
    canReadAnalytics: () => hasPermission(userRole, { resource: 'analytics', action: 'read' }),
    canExportAnalytics: () => hasPermission(userRole, { resource: 'analytics', action: 'export' }),
  };
}

// RBAC middleware wrapper
export function withRBAC(
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse>,
  requiredPermission: Permission
) {
  return async (req: NextRequest, context: unknown) => {
    try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user role (default to 'user' if not specified)
      const userRole = session.user.role || 'user';

      // Check permission
      if (!hasPermission(userRole, requiredPermission)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      // Add user context to the handler
      const enhancedContext = {
        ...context,
        user: session.user,
        userRole,
      };

      // Call the original handler
      return await handler(req, enhancedContext);
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Helper function to check multiple permissions
export function withMultiplePermissions(
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse>,
  requiredPermissions: Permission[]
) {
  return async (req: NextRequest, context: unknown) => {
    try {
      // Get user session
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user role
      const userRole = session.user.role || 'user';

      // Check all permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        hasPermission(userRole, permission)
      );

      if (!hasAllPermissions) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      // Add user context to the handler
      const enhancedContext = {
        ...context,
        user: session.user,
        userRole,
      };

      // Call the original handler
      return await handler(req, enhancedContext);
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Helper function for admin-only routes
export function withAdminOnly(
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse>
) {
  return withRBAC(handler, { resource: 'settings', action: 'update' });
}

// Helper function for read-only routes
export function withReadOnly(
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse>,
  resource: string
) {
  return withRBAC(handler, { resource, action: 'read' });
}
