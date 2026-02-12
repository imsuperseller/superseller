'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table-enhanced';
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Search,
  Eye,
  Terminal
} from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { ApprovalRequest } from '@/types/firestore';
import { Input } from '@/components/ui/input-enhanced';

export default function ApprovalsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchApprovals() {
      if (!userId) return;
      const db = getFirestore(app);
      try {
        setLoading(true);
        const ref = collection(db, 'approvals');
        // Fetch meaningful amount, ideally paginated
        const q = query(ref, where('clientId', '==', userId), orderBy('requestedAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApprovalRequest));
        setApprovals(fetched);
      } catch (error: any) {
        console.error("Error fetching approvals:", error);
        if (error.code === 'failed-precondition') {
          console.warn("Index missing for approvals.");
          // Fallback
          const ref = collection(db, 'approvals');
          const q = query(ref, where('clientId', '==', userId));
          const snapshot = await getDocs(q);
          const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApprovalRequest));
          fetched.sort((a, b) => (b.requestedAt?.seconds || 0) - (a.requestedAt?.seconds || 0));
          setApprovals(fetched);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchApprovals();
  }, [userId]);

  const handleApprove = async (id: string) => {
    try {
      const db = getFirestore(app);
      // Optimistic update
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));

      const approvalRef = doc(db, 'approvals', id);
      await updateDoc(approvalRef, {
        status: 'approved',
        respondedAt: new Date()
      });
      console.log('Approved:', id);
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve. Please try again.');
      // Revert if needed, but for now simple alert
      window.location.reload();
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      const db = getFirestore(app);
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));

      const approvalRef = doc(db, 'approvals', id);
      await updateDoc(approvalRef, {
        status: 'rejected',
        respondedAt: new Date()
      });
      console.log('Rejected:', id);
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('Failed to reject.');
      window.location.reload();
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesFilter = filter === 'all' || approval.status === filter;
    const matchesSearch = (approval.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (approval.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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

  const getTypeIcon = (serviceId: string) => {
    if (serviceId.includes('writer') || serviceId.includes('blog')) return <FileText className="h-4 w-4 text-rensto-cyan" />;
    if (serviceId.includes('social') || serviceId.includes('linkedin')) return <Users className="h-4 w-4 text-purple-400" />;
    return <Terminal className="h-4 w-4 text-slate-400" />;
  };

  // Stats
  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rensto-text-primary">Approvals</h1>
          <p className="text-rensto-text-secondary mt-2">
            Review and manage pending content and automation requests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 bg-white/5 border-white/10 text-white focus:border-rensto-cyan focus:ring-rensto-cyan"
          />
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-rensto-text-secondary">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-rensto-cyan focus:border-transparent"
            >
              <option value="all" className="bg-slate-900">All</option>
              <option value="pending" className="bg-slate-900">Pending</option>
              <option value="approved" className="bg-slate-900">Approved</option>
              <option value="rejected" className="bg-slate-900">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-rensto-text-secondary">Pending</p>
                <p className="text-2xl font-bold text-rensto-text-primary">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-rensto-text-secondary">Approved</p>
                <p className="text-2xl font-bold text-rensto-text-primary">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-rensto-text-secondary">Rejected</p>
                <p className="text-2xl font-bold text-rensto-text-primary">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals Table */}
      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle className="text-rensto-text-primary">Approval Requests</CardTitle>
          <CardDescription className="text-rensto-text-secondary">
            Review and manage content and automation requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rensto-cyan"></div>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-12 text-rensto-text-secondary">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-white/5" />
              <p>No approval requests found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-rensto-text-secondary">Type</TableHead>
                  <TableHead className="text-rensto-text-secondary">Details</TableHead>
                  <TableHead className="text-rensto-text-secondary">Requested</TableHead>
                  <TableHead className="text-rensto-text-secondary">Status</TableHead>
                  <TableHead className="text-rensto-text-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((approval) => (
                  <TableRow key={approval.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(approval.serviceId || '')}
                        <span className="capitalize text-rensto-text-primary hidden md:inline-block">
                          {(approval.serviceId || 'Generic').split('-')[0]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-rensto-text-primary">{approval.title}</p>
                        <p className="text-sm text-rensto-text-tertiary truncate max-w-xs">{approval.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-rensto-text-secondary text-sm">
                        {approval.requestedAt?.toDate
                          ? approval.requestedAt.toDate().toLocaleDateString()
                          : new Date(approval.requestedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(approval.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="renstoSecondary"
                          size="sm"
                          onClick={() => alert('View Details: ' + JSON.stringify(approval.content, null, 2))}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
