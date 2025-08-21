'use client';

import React, { useState } from 'react';
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

// Mock data - replace with real API calls
const mockAgents = [
  {
    id: '1',
    name: 'WordPress Content Agent',
    type: 'content',
    status: 'active',
    lastRun: '2024-01-20T16:30:00Z',
    nextRun: '2024-01-21T09:00:00Z',
    failures7d: 0,
    schedule: 'Daily at 9:00 AM',
    description: 'Generates WordPress content including pages and posts',
  },
  {
    id: '2',
    name: 'Social Media Posts',
    type: 'social',
    status: 'active',
    lastRun: '2024-01-20T14:15:00Z',
    nextRun: '2024-01-21T14:30:00Z',
    failures7d: 1,
    schedule: 'Daily at 2:30 PM',
    description: 'Facebook and LinkedIn social media content',
  },
  {
    id: '3',
    name: 'Facebook Group Scraper',
    type: 'automation',
    status: 'paused',
    lastRun: '2024-01-19T12:00:00Z',
    nextRun: '2024-01-22T08:00:00Z',
    failures7d: 2,
    schedule: 'Every 3 days at 8:00 AM',
    description: 'Scrapes Facebook groups for lead generation',
  },
  {
    id: '4',
    name: 'Podcast Creator',
    type: 'content',
    status: 'active',
    lastRun: '2024-01-18T10:00:00Z',
    nextRun: '2024-01-25T10:00:00Z',
    failures7d: 0,
    schedule: 'Weekly on Thursday at 10:00 AM',
    description: 'Complete podcast creation for Apple and Spotify',
  },
  {
    id: '5',
    name: 'Insurance Profile Generator',
    type: 'custom',
    status: 'inactive',
    lastRun: '2024-01-15T16:00:00Z',
    nextRun: null,
    failures7d: 0,
    schedule: 'Manual only',
    description: 'Generates combined family insurance profiles',
  },
];

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="renstoSuccess">Active</Badge>;
      case 'paused':
        return <Badge variant="renstoWarning">Paused</Badge>;
      case 'inactive':
        return <Badge variant="renstoError">Inactive</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'content':
        return <Badge variant="renstoPrimary">Content</Badge>;
      case 'social':
        return <Badge variant="renstoSecondary">Social</Badge>;
      case 'automation':
        return <Badge variant="renstoNeon">Automation</Badge>;
      case 'custom':
        return <Badge variant="renstoWarning">Custom</Badge>;
      default:
        return <Badge variant="renstoSecondary">{type}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'automation':
        return <Zap className="h-4 w-4" />;
      case 'custom':
        return <Settings className="h-4 w-4" />;
      default:
        return <Workflow className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNextRun = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'In minutes';
    if (diffInHours < 24) return `In ${diffInHours}h`;
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
          <h1 className="text-3xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-600 mt-1">Manage your AI agents and automation</p>
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
            <CardTitle className="text-sm font-medium text-slate-600">Total Agents</CardTitle>
            <Workflow className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockAgents.length}</div>
            <p className="text-xs text-slate-500">+1 this month</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockAgents.filter(a => a.status === 'active').length}
            </div>
            <p className="text-xs text-slate-500">Currently running</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Failed Runs (7d)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockAgents.reduce((sum, a) => sum + a.failures7d, 0)}
            </div>
            <p className="text-xs text-slate-500">Across all agents</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockAgents.filter(a => a.nextRun).length}
            </div>
            <p className="text-xs text-slate-500">With scheduled runs</p>
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
                  placeholder="Search agents by name or description..."
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
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="content">Content</option>
              <option value="social">Social</option>
              <option value="automation">Automation</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle>Agents ({filteredAgents.length})</CardTitle>
          <CardDescription>Manage your AI agents and their settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Failures (7d)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getTypeIcon(agent.type)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{agent.name}</div>
                        <div className="text-sm text-slate-500">{agent.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(agent.type)}</TableCell>
                  <TableCell>{getStatusBadge(agent.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{agent.schedule}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{formatTime(agent.lastRun)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{formatNextRun(agent.nextRun)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {agent.failures7d > 0 ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`text-sm ${agent.failures7d > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {agent.failures7d}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="renstoSecondary" size="sm" title="Open agent">
                        <Settings className="h-4 w-4" />
                      </Button>
                      {agent.status === 'active' ? (
                        <Button variant="renstoWarning" size="sm" title="Pause agent">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="renstoSuccess" size="sm" title="Activate agent">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="renstoSecondary" size="sm" title="Run now">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="renstoSecondary" size="sm" title="Duplicate agent">
                        <Copy className="h-4 w-4" />
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
