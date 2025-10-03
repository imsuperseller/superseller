'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table-enhanced';
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Code,
  FileText,
  Calendar,
  Tag,
  Eye,
  Edit,
  Download,
} from 'lucide-react';

// Mock data - replace with real API calls
const mockAgentDefinitions = [
  {
    key: 'wordpress-content',
    name: 'WordPress Content Agent',
    version: '1.2.0',
    description: 'Generates WordPress content including pages and posts',
    category: 'content',
    tags: ['wordpress', 'content', 'blog'],
    inputs: { title: 'string', topic: 'string', tone: 'string' },
    outputs: { content: 'string', seo_meta: 'object' },
    lastUpdated: '2024-01-20T10:30:00Z',
    isDeprecated: false,
    instances: 12,
  },
  {
    key: 'wordpress-blog-posts',
    name: 'WordPress Blog & Posts Agent',
    version: '1.1.5',
    description: 'Specialized agent for blog posts and articles',
    category: 'content',
    tags: ['wordpress', 'blog', 'posts'],
    inputs: { topic: 'string', keywords: 'array', length: 'number' },
    outputs: { post: 'string', images: 'array' },
    lastUpdated: '2024-01-18T14:20:00Z',
    isDeprecated: false,
    instances: 8,
  },
  {
    key: 'podcast-agent',
    name: 'Podcast Agent',
    version: '2.0.1',
    description: 'Complete podcast creation for Apple and Spotify',
    category: 'content',
    tags: ['podcast', 'audio', 'apple', 'spotify'],
    inputs: { topic: 'string', duration: 'number', platform: 'string' },
    outputs: { audio_file: 'string', transcript: 'string', metadata: 'object' },
    lastUpdated: '2024-01-15T09:15:00Z',
    isDeprecated: false,
    instances: 5,
  },
  {
    key: 'social-media-agent',
    name: 'Social Media Agent',
    version: '1.3.2',
    description: 'Facebook and LinkedIn social media content',
    category: 'social',
    tags: ['facebook', 'linkedin', 'social'],
    inputs: { platform: 'string', message: 'string', image: 'string' },
    outputs: { post: 'string', scheduled_time: 'datetime' },
    lastUpdated: '2024-01-12T16:45:00Z',
    isDeprecated: false,
    instances: 15,
  },
  {
    key: 'facebook-scraper',
    name: 'Facebook Group Scraper',
    version: '1.0.8',
    description: 'Scrapes Facebook groups for lead generation',
    category: 'automation',
    tags: ['facebook', 'scraping', 'leads'],
    inputs: { group_url: 'string', keywords: 'array', limit: 'number' },
    outputs: { leads: 'array', custom_audience: 'object' },
    lastUpdated: '2024-01-10T11:30:00Z',
    isDeprecated: false,
    instances: 3,
  },
  {
    key: 'insurance-profile',
    name: 'Insurance Profile Agent',
    version: '1.0.0',
    description: 'Generates combined family insurance profiles',
    category: 'custom',
    tags: ['insurance', 'profile', 'family'],
    inputs: { family_data: 'object', insurance_type: 'string' },
    outputs: { profile: 'object', recommendations: 'array' },
    lastUpdated: '2024-01-08T08:20:00Z',
    isDeprecated: false,
    instances: 2,
  },
  {
    key: 'legacy-content-agent',
    name: 'Legacy Content Agent',
    version: '0.9.5',
    description: 'Old content generation agent (deprecated)',
    category: 'content',
    tags: ['legacy', 'content'],
    inputs: { text: 'string' },
    outputs: { content: 'string' },
    lastUpdated: '2024-01-05T12:00:00Z',
    isDeprecated: true,
    instances: 0,
  },
];

export default function AgentCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deprecatedFilter, setDeprecatedFilter] = useState('all');

  const filteredAgents = mockAgentDefinitions.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter;
    const matchesDeprecated = deprecatedFilter === 'all' || 
                             (deprecatedFilter === 'active' && !agent.isDeprecated) ||
                             (deprecatedFilter === 'deprecated' && agent.isDeprecated);
    
    return matchesSearch && matchesCategory && matchesDeprecated;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'content':
        return <Badge variant="renstoPrimary">Content</Badge>;
      case 'social':
        return <Badge variant="renstoSecondary">Social</Badge>;
      case 'automation':
        return <Badge variant="renstoNeon">Automation</Badge>;
      case 'analytics':
        return <Badge variant="renstoSuccess">Analytics</Badge>;
      case 'custom':
        return <Badge variant="renstoWarning">Custom</Badge>;
      default:
        return <Badge variant="renstoSecondary">{category}</Badge>;
    }
  };

  const getDeprecatedBadge = (isDeprecated: boolean) => {
    return isDeprecated ? (
      <Badge variant="renstoError">Deprecated</Badge>
    ) : (
      <Badge variant="renstoSuccess">Active</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSchema = (schema: Record<string, unknown> | null | undefined) => {
    if (typeof schema === 'object') {
      return Object.keys(schema).length + ' fields';
    }
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Catalog</h1>
          <p className="text-slate-600 mt-1">Manage agent definitions and versions</p>
        </div>
        <Button variant="renstoPrimary">
          <Plus className="h-4 w-4 mr-2" />
          New Definition
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Definitions</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockAgentDefinitions.length}</div>
            <p className="text-xs text-slate-500">+2 this month</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Definitions</CardTitle>
            <Code className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockAgentDefinitions.filter(a => !a.isDeprecated).length}
            </div>
            <p className="text-xs text-slate-500">Not deprecated</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Instances</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mockAgentDefinitions.reduce((sum, a) => sum + a.instances, 0)}
            </div>
            <p className="text-xs text-slate-500">Across all definitions</p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
            <Tag className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {new Set(mockAgentDefinitions.map(a => a.category)).size}
            </div>
            <p className="text-xs text-slate-500">Different types</p>
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
                  placeholder="Search agents by name, key, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="content">Content</option>
              <option value="social">Social</option>
              <option value="automation">Automation</option>
              <option value="analytics">Analytics</option>
              <option value="custom">Custom</option>
            </select>
            <select
              value={deprecatedFilter}
              onChange={(e) => setDeprecatedFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="deprecated">Deprecated Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Agent Definitions Table */}
      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle>Agent Definitions ({filteredAgents.length})</CardTitle>
          <CardDescription>Manage agent definitions and their versions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Inputs</TableHead>
                <TableHead>Outputs</TableHead>
                <TableHead>Instances</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.key}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900">{agent.name}</div>
                      <div className="text-sm text-slate-500">{agent.key}</div>
                      <div className="text-xs text-slate-400 mt-1">{agent.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-slate-400" />
                      <span className="font-mono text-sm">{agent.version}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(agent.category)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{formatSchema(agent.inputs)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{formatSchema(agent.outputs)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{agent.instances}</span>
                      <span className="text-slate-500">active</span>
                    </div>
                  </TableCell>
                  <TableCell>{getDeprecatedBadge(agent.isDeprecated)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{formatDate(agent.lastUpdated)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="renstoSecondary" size="sm" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="renstoSecondary" size="sm" title="Edit definition">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="renstoSecondary" size="sm" title="Bump version">
                        <Download className="h-4 w-4" />
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
