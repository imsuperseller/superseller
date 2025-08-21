'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table-enhanced';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Eye,
} from 'lucide-react';

// Mock data - replace with real API calls
const mockApprovals = [
  {
    id: '1',
    type: 'content',
    title: 'WordPress Blog Post: Tax Deductions 2024',
    description: 'New blog post about tax deductions for small businesses',
    requestedBy: 'Ben Ginati',
    requestedAt: '2024-01-20T14:30:00Z',
    priority: 'high',
    status: 'pending',
    estimatedCost: 0.25,
  },
  {
    id: '2',
    type: 'social',
    title: 'LinkedIn Post: Tax Season Tips',
    description: 'Social media post with tax season preparation tips',
    requestedBy: 'Ben Ginati',
    requestedAt: '2024-01-20T12:15:00Z',
    priority: 'medium',
    status: 'pending',
    estimatedCost: 0.15,
  },
  {
    id: '3',
    type: 'automation',
    title: 'Facebook Group Scraper Configuration',
    description: 'New configuration for Facebook group lead generation',
    requestedBy: 'Ben Ginati',
    requestedAt: '2024-01-20T10:45:00Z',
    priority: 'low',
    status: 'approved',
    estimatedCost: 0.10,
  },
  {
    id: '4',
    type: 'content',
    title: 'Podcast Episode: Tax Planning Strategies',
    description: 'New podcast episode about tax planning for entrepreneurs',
    requestedBy: 'Ben Ginati',
    requestedAt: '2024-01-19T16:20:00Z',
    priority: 'high',
    status: 'rejected',
    estimatedCost: 0.50,
  },
];

export default function ApprovalsPage() {
  const [filter, setFilter] = useState('all');

  const filteredApprovals = mockApprovals.filter(approval => {
    if (filter === 'all') return true;
    return approval.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="renstoWarning">Pending</Badge>;
      case 'approved':
        return <Badge variant="renstoSuccess">Approved</Badge>;
      case 'rejected':
        return <Badge variant="renstoError">Rejected</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="renstoError">High</Badge>;
      case 'medium':
        return <Badge variant="renstoWarning">Medium</Badge>;
      case 'low':
        return <Badge variant="renstoSuccess">Low</Badge>;
      default:
        return <Badge variant="renstoSecondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'automation':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleApprove = async (id: string) => {
    try {
      console.log('Approving:', id);
      
      // Update local state immediately for optimistic UI
      setApprovals(prev => 
        prev.map(approval => 
          approval.id === id 
            ? { ...approval, status: 'approved', approvedAt: new Date().toISOString() }
            : approval
        )
      );

      // TODO: Send API request to backend
      // const response = await fetch(`/api/approvals/${id}/approve`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ approvedBy: 'current-user-id' })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to approve');
      // }

      // Show success notification
      alert('Approval successful!');
      
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed. Please try again.');
      
      // Revert optimistic update
      setApprovals(prev => 
        prev.map(approval => 
          approval.id === id 
            ? { ...approval, status: 'pending' }
            : approval
        )
      );
    }
  };

  const handleReject = async (id: string) => {
    try {
      console.log('Rejecting:', id);
      
      // Update local state immediately for optimistic UI
      setApprovals(prev => 
        prev.map(approval => 
          approval.id === id 
            ? { ...approval, status: 'rejected', rejectedAt: new Date().toISOString() }
            : approval
        )
      );

      // TODO: Send API request to backend
      // const response = await fetch(`/api/approvals/${id}/reject`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ rejectedBy: 'current-user-id', reason: 'User rejection' })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to reject');
      // }

      // Show success notification
      alert('Rejection successful!');
      
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('Rejection failed. Please try again.');
      
      // Revert optimistic update
      setApprovals(prev => 
        prev.map(approval => 
          approval.id === id 
            ? { ...approval, status: 'pending' }
            : approval
        )
      );
    }
  };

  const handleView = (id: string) => {
    console.log('Viewing:', id);
    
    // Find the approval to view
    const approval = approvals.find(a => a.id === id);
    if (!approval) {
      alert('Approval not found');
      return;
    }

    // TODO: Implement modal or navigation to detailed view
    // For now, show alert with details
    alert(`Viewing: ${approval.title}\nType: ${approval.type}\nStatus: ${approval.status}\nSubmitted: ${approval.submittedAt}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Approvals</h1>
          <p className="text-slate-600 mt-2">
            Review and manage pending content and automation requests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-slate-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-slate-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">This Week</p>
                <p className="text-2xl font-bold text-slate-900">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals Table */}
      <Card className="rensto-card">
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>
            Review and manage content and automation requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estimated Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(approval.type)}
                      <span className="capitalize">{approval.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{approval.title}</p>
                      <p className="text-sm text-slate-600">{approval.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{approval.requestedBy}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(approval.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(approval.priority)}</TableCell>
                  <TableCell>{getStatusBadge(approval.status)}</TableCell>
                  <TableCell>${approval.estimatedCost}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(approval.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {approval.status === 'pending' && (
                        <>
                          <Button
                            variant="renstoSuccess"
                            size="sm"
                            onClick={() => handleApprove(approval.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="renstoError"
                            size="sm"
                            onClick={() => handleReject(approval.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
