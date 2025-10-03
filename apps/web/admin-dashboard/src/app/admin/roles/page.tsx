'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Users, Settings, Eye, Edit, Trash2, Plus,
  CheckCircle, XCircle, AlertTriangle, Lock, Unlock,
  UserCheck, UserX, Key, Database, BarChart3, Workflow
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  level: 'admin' | 'manager' | 'analyst' | 'support' | 'viewer';
  permissions: {
    dashboard: boolean;
    customers: boolean;
    revenue: boolean;
    analytics: boolean;
    system: boolean;
    workflows: boolean;
    settings: boolean;
    users: boolean;
  };
  users: number;
  createdAt: string;
  lastModified: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  permissions: string[];
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roles');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Generate comprehensive mock data for demonstration
        const mockRoles: Role[] = [
          {
            id: 'role_001',
            name: 'Super Admin',
            description: 'Full system access with all permissions and administrative capabilities',
            level: 'admin',
            permissions: {
              dashboard: true,
              customers: true,
              revenue: true,
              analytics: true,
              system: true,
              workflows: true,
              settings: true,
              users: true
            },
            users: 2,
            createdAt: '2023-01-01T00:00:00Z',
            lastModified: '2024-12-15T10:30:00Z'
          },
          {
            id: 'role_002',
            name: 'Business Manager',
            description: 'Access to business metrics, customer management, and revenue analytics',
            level: 'manager',
            permissions: {
              dashboard: true,
              customers: true,
              revenue: true,
              analytics: true,
              system: false,
              workflows: true,
              settings: false,
              users: false
            },
            users: 3,
            createdAt: '2023-03-15T00:00:00Z',
            lastModified: '2024-11-20T14:15:00Z'
          },
          {
            id: 'role_003',
            name: 'Data Analyst',
            description: 'Read-only access to analytics, revenue data, and reporting features',
            level: 'analyst',
            permissions: {
              dashboard: true,
              customers: false,
              revenue: true,
              analytics: true,
              system: false,
              workflows: false,
              settings: false,
              users: false
            },
            users: 4,
            createdAt: '2023-06-01T00:00:00Z',
            lastModified: '2024-10-05T09:45:00Z'
          },
          {
            id: 'role_004',
            name: 'Support Agent',
            description: 'Customer support access with limited system and workflow permissions',
            level: 'support',
            permissions: {
              dashboard: true,
              customers: true,
              revenue: false,
              analytics: false,
              system: false,
              workflows: true,
              settings: false,
              users: false
            },
            users: 6,
            createdAt: '2023-08-15T00:00:00Z',
            lastModified: '2024-09-12T16:20:00Z'
          },
          {
            id: 'role_005',
            name: 'Viewer',
            description: 'Read-only access to dashboard and basic customer information',
            level: 'viewer',
            permissions: {
              dashboard: true,
              customers: false,
              revenue: false,
              analytics: false,
              system: false,
              workflows: false,
              settings: false,
              users: false
            },
            users: 8,
            createdAt: '2023-10-01T00:00:00Z',
            lastModified: '2024-08-30T11:10:00Z'
          }
        ];

        const mockUsers: User[] = [
          {
            id: 'user_001',
            name: 'Shai Friedman',
            email: 'shai@rensto.com',
            role: 'Super Admin',
            status: 'active',
            lastLogin: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            permissions: ['All Permissions']
          },
          {
            id: 'user_002',
            name: 'Sarah Johnson',
            email: 'sarah@rensto.com',
            role: 'Business Manager',
            status: 'active',
            lastLogin: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            permissions: ['Dashboard', 'Customers', 'Revenue', 'Analytics', 'Workflows']
          },
          {
            id: 'user_003',
            name: 'David Lee',
            email: 'david@rensto.com',
            role: 'Data Analyst',
            status: 'active',
            lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            permissions: ['Dashboard', 'Revenue', 'Analytics']
          },
          {
            id: 'user_004',
            name: 'Emily Chen',
            email: 'emily@rensto.com',
            role: 'Support Agent',
            status: 'active',
            lastLogin: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            permissions: ['Dashboard', 'Customers', 'Workflows']
          },
          {
            id: 'user_005',
            name: 'Michael Brown',
            email: 'michael@rensto.com',
            role: 'Viewer',
            status: 'inactive',
            lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            permissions: ['Dashboard']
          }
        ];

        setRoles(mockRoles);
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching role data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'admin':
        return <Badge className="bg-red-500 text-white">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-500 text-white">Manager</Badge>;
      case 'analyst':
        return <Badge className="bg-green-500 text-white">Analyst</Badge>;
      case 'support':
        return <Badge className="bg-yellow-500 text-white">Support</Badge>;
      case 'viewer':
        return <Badge variant="secondary">Viewer</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPermissionIcon = (permission: boolean) => {
    return permission ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role & Access Management</h1>
          <p className="text-muted-foreground">Manage user roles, permissions, and access control</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading role data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role & Access Management</h1>
          <p className="text-muted-foreground">Manage user roles, permissions, and access control</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'roles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('roles')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </Button>
          <Button 
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
        </div>
      </div>

      {activeTab === 'roles' && (
        <>
          {/* Role Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.length}</div>
                <p className="text-xs text-muted-foreground">
                  {roles.filter(r => r.level === 'admin').length} admin roles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {users.filter(u => u.status === 'active').length} active users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.role === 'Super Admin').length}</div>
                <p className="text-xs text-muted-foreground">
                  Full system access
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Role List */}
          <div className="grid grid-cols-1 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getLevelBadge(role.level)}
                      <Badge variant="outline">{role.users} users</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Permissions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Dashboard
                          </span>
                          {getPermissionIcon(role.permissions.dashboard)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Customers
                          </span>
                          {getPermissionIcon(role.permissions.customers)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <Database className="h-4 w-4 mr-1" />
                            Revenue
                          </span>
                          {getPermissionIcon(role.permissions.revenue)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </span>
                          {getPermissionIcon(role.permissions.analytics)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">System Access</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <Settings className="h-4 w-4 mr-1" />
                            System
                          </span>
                          {getPermissionIcon(role.permissions.system)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <Workflow className="h-4 w-4 mr-1" />
                            Workflows
                          </span>
                          {getPermissionIcon(role.permissions.workflows)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <Settings className="h-4 w-4 mr-1" />
                            Settings
                          </span>
                          {getPermissionIcon(role.permissions.settings)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Users
                          </span>
                          {getPermissionIcon(role.permissions.users)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Role Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Level:</span>
                          <span className="font-medium">{role.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Users:</span>
                          <span className="font-medium">{role.users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span className="font-medium">{new Date(role.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Modified:</span>
                          <span className="font-medium">{new Date(role.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Actions</h4>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Role
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Users className="h-4 w-4 mr-1" />
                          Manage Users
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Key className="h-4 w-4 mr-1" />
                          Permissions
                        </Button>
                        {role.level !== 'admin' && (
                          <Button size="sm" variant="outline" className="w-full text-red-600">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          {/* User List */}
          <div className="grid grid-cols-1 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getLevelBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">User Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Role:</span>
                          <span className="font-medium">{user.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-medium">{user.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Login:</span>
                          <span className="font-medium">{new Date(user.lastLogin).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Permissions</h4>
                      <div className="space-y-1">
                        {user.permissions.map((permission, index) => (
                          <div key={index} className="text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              {permission}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Actions</h4>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit User
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Key className="h-4 w-4 mr-1" />
                          Change Role
                        </Button>
                        {user.status === 'active' ? (
                          <Button size="sm" variant="outline" className="w-full">
                            <Lock className="h-4 w-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full">
                            <Unlock className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="w-full text-red-600">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
