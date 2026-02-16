'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table-enhanced';
import {
  Workflow,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Settings,
  Clock,
  Activity,
  Zap,
  FileText,
  Users,
  AlertTriangle,
} from 'lucide-react';
interface ServiceInstance { id: string; clientId: string; clientEmail: string; productId: string; productName: string; status: string; configuration: Record<string, any>; serviceId?: string; parameters?: Record<string, any>; createdAt: string; [key: string]: any; }

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [agents, setAgents] = useState<ServiceInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/app/agents')
      .then(res => {
        if (res.status === 401) { setLoading(false); return null; }
        return res.json();
      })
      .then(data => { if (data) setAgents(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = (agent.serviceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.status || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesType = typeFilter === 'all' || (agent.parameters?.type === typeFilter); // Assuming 'type' might be in parameters

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    // Normalize status to match design system expectations
    const s = status?.toLowerCase() || 'unknown';
    switch (s) {
      case 'active':
      case 'running':
        return <Badge variant="renstoSuccess">Active</Badge>;
      case 'paused':
      case 'stopped':
        return <Badge variant="renstoWarning">Paused</Badge>;
      case 'inactive':
      case 'error':
        return <Badge variant="renstoError">Inactive</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (serviceId: string) => {
    // Infer type from serviceId if explicit type isn't available
    if (serviceId.includes('content') || serviceId.includes('blog')) return <Badge variant="renstoPrimary">Content</Badge>;
    if (serviceId.includes('social') || serviceId.includes('linkedin')) return <Badge variant="renstoSecondary">Social</Badge>;
    if (serviceId.includes('automation') || serviceId.includes('scraper')) return <Badge variant="renstoNeon">Automation</Badge>;
    return <Badge variant="renstoSecondary">Custom</Badge>;
  };

  const getTypeIcon = (serviceId: string) => {
    if (serviceId.includes('content') || serviceId.includes('blog')) return <FileText className="h-4 w-4" />;
    if (serviceId.includes('social') || serviceId.includes('linkedin')) return <Users className="h-4 w-4" />;
    if (serviceId.includes('automation') || serviceId.includes('scraper')) return <Zap className="h-4 w-4" />;
    return <Workflow className="h-4 w-4" />;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rensto-text-primary">Agents</h1>
          <p className="text-rensto-text-secondary mt-1">Manage your active AI services</p>
        </div>
        <Button variant="renstoPrimary">
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rensto-text-secondary">Total Agents</CardTitle>
            <Workflow className="h-4 w-4 text-rensto-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rensto-text-primary">{agents.length}</div>
            <p className="text-xs text-rensto-text-tertiary">Deployed services</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rensto-text-secondary">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rensto-text-primary">
              {agents.filter(a => a.status === 'active' || a.status === 'running').length}
            </div>
            <p className="text-xs text-rensto-text-tertiary">Currently running</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rensto-text-secondary">Failures (7d)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rensto-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rensto-text-primary">0</div>
            <p className="text-xs text-rensto-text-tertiary">System stable</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rensto-text-secondary">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-rensto-text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rensto-text-primary">
              {agents.filter(a => a.parameters?.schedule).length}
            </div>
            <p className="text-xs text-rensto-text-tertiary">Auto-running</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-rensto-text-primary">
            <Filter className="h-5 w-5 text-rensto-cyan" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-rensto-text-tertiary" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-rensto-cyan focus:ring-rensto-cyan"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-rensto-cyan focus:border-transparent"
            >
              <option value="all" className="bg-slate-900">All Status</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="paused" className="bg-slate-900">Paused</option>
              <option value="inactive" className="bg-slate-900">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle className="text-rensto-text-primary">All Agents</CardTitle>
          <CardDescription className="text-rensto-text-secondary">Manage and monitor your deployed AI services</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rensto-cyan"></div>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12 text-rensto-text-secondary">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-white/5" />
              <p>No agents found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-rensto-text-secondary">Name</TableHead>
                  <TableHead className="text-rensto-text-secondary">Type</TableHead>
                  <TableHead className="text-rensto-text-secondary">Status</TableHead>
                  <TableHead className="text-rensto-text-secondary">Schedule</TableHead>
                  <TableHead className="text-rensto-text-secondary">Created</TableHead>
                  <TableHead className="text-rensto-text-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 text-rensto-cyan">
                          {getTypeIcon(agent.serviceId)}
                        </div>
                        <div>
                          <div className="font-medium text-rensto-text-primary capitalize">{agent.serviceId.replace(/-/g, ' ')}</div>
                          <div className="text-sm text-rensto-text-tertiary">ID: {agent.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(agent.serviceId)}</TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-rensto-text-secondary">
                        <Clock className="h-4 w-4 text-rensto-text-tertiary" />
                        <span className="text-sm">{agent.parameters?.schedule || 'Manual'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-rensto-text-secondary">
                        <Activity className="h-4 w-4 text-rensto-text-tertiary" />
                        <span className="text-sm">{formatDate(agent.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="renstoSecondary" size="sm" title="Configure">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="renstoSecondary" size="sm" title="Run now">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
