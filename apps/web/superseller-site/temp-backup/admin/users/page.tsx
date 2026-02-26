'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table-enhanced';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Shield,
  Mail,
  Clock,
  UserCheck,
  UserX,
  Key,
} from 'lucide-react';

// Mock data - replace with real API calls
const mockUsers = [
  {
    id: '1',
    email: 'shai@superseller.agency',
    name: 'Admin User',
    tenants: 3,
    role: 'admin',
    mfa: true,
    lastLogin: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    email: 'ortal@flanary.com',
    name: 'Ortal Flanary',
    tenants: 1,
    role: 'owner',
    mfa: false,
    lastLogin: '2024-01-19T14:20:00Z',
  },
  {
    id: '3',
    email: 'ben@ginati.com',
    name: 'Ben Ginati',
    tenants: 1,
    role: 'owner',
    mfa: true,
    lastLogin: '2024-01-18T09:15:00Z',
  },
  {
    id: '4',
    email: 'shelly@mizrahi.com',
    name: 'Customer B',
    tenants: 1,
    role: 'owner',
    mfa: false,
    lastLogin: '2024-01-17T16:45:00Z',
  },
  {
    id: '5',
    email: 'tech@techcorp.com',
    name: 'Tech Admin',
    tenants: 1,
    role: 'admin',
    mfa: true,
    lastLogin: '2024-01-16T11:30:00Z',
  },
  {
    id: '6',
    email: 'user@startupxyz.com',
    name: 'Startup User',
    tenants: 1,
    role: 'user',
    mfa: false,
    lastLogin: '2024-01-15T08:20:00Z',
  },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [mfaFilter, setMfaFilter] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesMfa = mfaFilter === 'all' ||
      (mfaFilter === 'enabled' && user.mfa) ||
      (mfaFilter === 'disabled' && !user.mfa);

    return matchesSearch && matchesRole && matchesMfa;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="supersellerPrimary">Owner</Badge>;
      case 'admin':
        return <Badge variant="supersellerSecondary">Admin</Badge>;
      case 'user':
        return <Badge variant="supersellerNeon">User</Badge>;
      case 'viewer':
        return <Badge variant="supersellerWarning">Viewer</Badge>;
      default:
        return <Badge variant="supersellerSecondary">{role}</Badge>;
    }
  };

  const getMfaBadge = (mfa: boolean) => {
    return mfa ? (
      <Badge variant="supersellerSuccess">Enabled</Badge>
    ) : (
      <Badge variant="supersellerError">Disabled</Badge>
    );
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        <Button variant="supersellerPrimary">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockUsers.length}</div>
            <p className="text-xs text-slate-500">+1 this week</p>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockUsers.filter(u => {
                const lastLogin = new Date(u.lastLogin);
                const now = new Date();
                const diffInDays = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
                return diffInDays <= 30;
              }).length}
            </div>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">MFA Enabled</CardTitle>
            <Shield className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockUsers.filter(u => u.mfa).length}
            </div>
            <p className="text-xs text-slate-500">
              {Math.round((mockUsers.filter(u => u.mfa).length / mockUsers.length) * 100)}% of users
            </p>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockUsers.filter(u => u.role === 'admin' || u.role === 'owner').length}
            </div>
            <p className="text-xs text-slate-500">With admin privileges</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="supersellerNeon" className="superseller-card-neon">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
            <select
              value={mfaFilter}
              onChange={(e) => setMfaFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All MFA Status</option>
              <option value="enabled">MFA Enabled</option>
              <option value="disabled">MFA Disabled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card variant="supersellerNeon" className="superseller-card-neon">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenants</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{user.tenants}</span>
                      <span className="text-slate-500">tenant{user.tenants !== 1 ? 's' : ''}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getMfaBadge(user.mfa)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{formatLastLogin(user.lastLogin)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="supersellerSecondary" size="sm" title="Send magic link">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={user.mfa ? "supersellerError" : "supersellerSuccess"}
                        size="sm"
                        title={user.mfa ? "Disable MFA" : "Enable MFA"}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="supersellerSecondary" size="sm" title="Revoke sessions">
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button variant="supersellerSecondary" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
