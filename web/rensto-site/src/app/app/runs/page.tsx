'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Download,
} from 'lucide-react';

const mockRuns = [
  {
    id: '1',
    agentName: 'WordPress Content Agent',
    status: 'completed',
    startedAt: '2024-01-20T16:30:00Z',
    completedAt: '2024-01-20T16:32:34Z',
    duration: '2m 34s',
    cost: 0.25,
    output: 'Blog post published successfully',
  },
  {
    id: '2',
    agentName: 'Social Media Posts',
    status: 'completed',
    startedAt: '2024-01-20T14:15:00Z',
    completedAt: '2024-01-20T14:16:12Z',
    duration: '1m 12s',
    cost: 0.15,
    output: 'LinkedIn post created and scheduled',
  },
  {
    id: '3',
    agentName: 'Facebook Group Scraper',
    status: 'failed',
    startedAt: '2024-01-20T12:00:00Z',
    completedAt: '2024-01-20T12:00:45Z',
    duration: '0m 45s',
    cost: 0.10,
    output: 'API rate limit exceeded',
  },
];

export default function RunsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="renstoSuccess">Completed</Badge>;
      case 'failed':
        return <Badge variant="renstoError">Failed</Badge>;
      case 'running':
        return <Badge variant="renstoWarning">Running</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Runs</h1>
          <p className="text-slate-600 mt-2">
            View execution history and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search runs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
        </div>
      </div>

      <Card className="rensto-card">
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            Recent agent executions and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Output</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.agentName}</TableCell>
                  <TableCell>{getStatusBadge(run.status)}</TableCell>
                  <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                  <TableCell>{run.duration}</TableCell>
                  <TableCell>${run.cost}</TableCell>
                  <TableCell className="max-w-xs truncate">{run.output}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
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
