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
  Play,
  Pause,
  X,
  Calendar,
  CreditCard,
  Activity,
} from 'lucide-react';

// Mock data - replace with real API calls
const mockTenants = [
  {
    id: '1',
    name: 'Ortal Flanary',
    slug: 'ortal-flanary',
    status: 'active',
    plan: { name: 'Professional', price: 299 },
    agents: 3,
    seats: 5,
    created: '2024-01-15',
    lastActivity: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'Ben Ginati',
    slug: 'ben-ginati',
    status: 'active',
    plan: { name: 'Starter', price: 99 },
    agents: 2,
    seats: 3,
    created: '2024-01-10',
    lastActivity: '2024-01-19T14:20:00Z',
  },
  {
    id: '3',
    name: 'Customer B',
    slug: 'customer-b',
    status: 'paused',
    plan: { name: 'Professional', price: 299 },
    agents: 1,
    seats: 2,
    created: '2024-01-05',
    lastActivity: '2024-01-18T09:15:00Z',
  },
  {
    id: '4',
    name: 'TechCorp Inc',
    slug: 'techcorp-inc',
    status: 'active',
    plan: { name: 'Enterprise', price: 599 },
    agents: 5,
    seats: 10,
    created: '2024-01-12',
    lastActivity: '2024-01-20T16:45:00Z',
  },
  {
    id: '5',
    name: 'StartupXYZ',
    slug: 'startupxyz',
    status: 'closed',
    plan: { name: 'Starter', price: 99 },
    agents: 0,
    seats: 1,
    created: '2024-01-08',
    lastActivity: '2024-01-15T11:30:00Z',
  },
];

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const filteredTenants = mockTenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.plan.name === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="renstoSuccess">Active</Badge>;
      case 'paused':
        return <Badge variant="renstoWarning">Paused</Badge>;
      case 'closed':
        return <Badge variant="renstoError">Closed</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: { name: string; price: number }) => {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{plan.name}</span>
        <span className="text-xs text-slate-500">${plan.price}/mo</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tenant Management</h1>
          <p className="text-slate-600 mt-1">Manage customer organizations and their subscriptions</p>
        </div>
        <Button variant="renstoPrimary">
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockTenants.length}</div>
            <p className="text-xs text-slate-500">+2 this month</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Tenants</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockTenants.filter(t => t.status === 'active').length}
            </div>
            <p className="text-xs text-slate-500">80% of total</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockTenants.reduce((sum, t) => sum + t.agents, 0)}
            </div>
            <p className="text-xs text-slate-500">Across all tenants</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${mockTenants.reduce((sum, t) => sum + t.plan.price, 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="renstoNeon" className="rensto-card-neon">
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
                  placeholder="Search tenants by name or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle>Tenants ({filteredTenants.length})</CardTitle>
          <CardDescription>Manage customer organizations and their settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900">{tenant.name}</div>
                      <div className="text-sm text-slate-500">@{tenant.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{tenant.agents}</span>
                      <span className="text-slate-500">active</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{tenant.seats}</span>
                      <span className="text-slate-500">users</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{formatDate(tenant.created)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4 text-slate-400" />
                      <span>{formatLastActivity(tenant.lastActivity)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="renstoSecondary" size="sm">
                        Open
                      </Button>
                      <Button variant="renstoSecondary" size="sm">
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
