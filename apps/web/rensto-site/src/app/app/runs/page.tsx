'use client';

import React, { useState, useEffect } from 'react';
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
  Terminal
} from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { UsageLog } from '@/types/firestore';

export default function RunsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [runs, setRuns] = useState<UsageLog[]>([]);
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
    async function fetchData() {
      if (!userId) return;
      const db = getFirestore(app);
      try {
        setLoading(true);
        const logsRef = collection(db, 'usage_logs');
        // Fetch last 50 runs for this client
        const qLogs = query(
          logsRef,
          where('clientId', '==', userId),
          orderBy('startedAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(qLogs);
        const fetchedRuns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UsageLog));
        setRuns(fetchedRuns);
      } catch (error: any) {
        // If index is missing, it might error. Fallback or log.
        console.error("Error fetching runs:", error);
        // Fallback for dev: try without orderBy if it fails, or just client side sort
        if (error.code === 'failed-precondition') {
          console.warn("Index missing. Fetching without sort.");
          const qLogsNoSort = query(logsRef, where('clientId', '==', userId), limit(50));
          const snapshot2 = await getDocs(qLogsNoSort);
          const fetchedRuns2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as UsageLog));
          // Manual sort
          fetchedRuns2.sort((a, b) => {
            const tA = a.startedAt?.toMillis ? a.startedAt.toMillis() : 0;
            const tB = b.startedAt?.toMillis ? b.startedAt.toMillis() : 0;
            return tB - tA;
          });
          setRuns(fetchedRuns2);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const filteredRuns = runs.filter(run => {
    const matchesSearch = (run.agentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (run.output || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="renstoSuccess">Completed</Badge>;
      case 'failed':
        return <Badge variant="renstoError">Failed</Badge>;
      case 'running':
        return <Badge variant="renstoWarning">Running</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rensto-text-primary">Agent Runs</h1>
          <p className="text-rensto-text-secondary mt-2">
            View execution history and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search runs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-white/5 border-white/10 text-white focus:border-rensto-cyan focus:ring-rensto-cyan"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-rensto-cyan focus:border-transparent"
          >
            <option value="all" className="bg-slate-900">All Status</option>
            <option value="completed" className="bg-slate-900">Completed</option>
            <option value="failed" className="bg-slate-900">Failed</option>
            <option value="running" className="bg-slate-900">Running</option>
          </select>
        </div>
      </div>

      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle className="text-rensto-text-primary">Execution History</CardTitle>
          <CardDescription className="text-rensto-text-secondary">
            Recent agent executions and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rensto-cyan"></div>
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="text-center py-12 text-rensto-text-secondary">
              <Terminal className="h-12 w-12 mx-auto mb-4 text-white/5" />
              <p>No run history available.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-rensto-text-secondary">Agent</TableHead>
                  <TableHead className="text-rensto-text-secondary">Status</TableHead>
                  <TableHead className="text-rensto-text-secondary">Started</TableHead>
                  <TableHead className="text-rensto-text-secondary">Duration</TableHead>
                  <TableHead className="text-rensto-text-secondary">Cost</TableHead>
                  <TableHead className="text-rensto-text-secondary">Output</TableHead>
                  <TableHead className="text-rensto-text-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => (
                  <TableRow key={run.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-rensto-text-primary capitalize">{run.agentId.replace(/-/g, ' ')}</TableCell>
                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                    <TableCell className="text-rensto-text-secondary">
                      {run.startedAt?.toDate ? run.startedAt.toDate().toLocaleString() : new Date(run.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-rensto-text-secondary">{formatDuration(run.durationMs)}</TableCell>
                    <TableCell className="text-rensto-text-secondary">${(run.cost / 100).toFixed(4)}</TableCell>
                    <TableCell className="max-w-xs truncate text-rensto-text-tertiary">
                      {run.output || (run.status === 'completed' ? 'Success' : '-')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="renstoSecondary" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="renstoSecondary" size="sm">
                          <Download className="h-4 w-4" />
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
