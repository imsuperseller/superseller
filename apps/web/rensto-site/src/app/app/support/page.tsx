'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import {
  LifeBuoy,
  Search,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Plus,
  ChevronRight,
  Brain,
  History
} from 'lucide-react';
import { SupportCase, CaseStatus } from '@/types/support';
import { MagicButton } from '@/components/support/MagicButton';

export default function SupportDashboard() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/support/list?customerId=client-001');
      const data = await response.json();
      if (data.success) {
        setCases(data.cases);
        if (data.cases.length > 0 && !selectedCase) {
          setSelectedCase(data.cases[0]);
        }
      } else {
        setError(data.error || 'Failed to fetch cases');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'awaiting_approval': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'researching':
      case 'fixing':
      case 'testing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'escalated': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: CaseStatus) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'awaiting_approval': return <Clock className="w-4 h-4" />;
      case 'escalated': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'researching':
      case 'fixing':
      case 'testing': return <Brain className="w-4 h-4 animate-pulse" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rensto-text-primary">Care Plan Support</h1>
          <p className="text-rensto-text-secondary mt-1">Autonomous AI agent is monitoring and fixing your systems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-rensto-text-tertiary uppercase tracking-wider px-1">Active Cases</h2>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedCase?.id === c.id
                ? 'bg-white/5 border-rensto-cyan shadow-md shadow-rensto-cyan/10 ring-1 ring-rensto-cyan/20'
                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-rensto-text-tertiary">{c.id}</span>
                <Badge variant="outline" className={`text-[10px] flex items-center gap-1 ${getStatusColor(c.status)}`}>
                  {getStatusIcon(c.status)}
                  {c.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-rensto-text-primary line-clamp-1 mb-1">{c.issueDescription}</p>
              <div className="flex items-center justify-between text-[10px] text-rensto-text-secondary">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="italic">{c.workflowId || 'General System'}</span>
              </div>
            </div>
          ))}

          {/* New Case Button / Card */}
          <Card className="border-dashed border-2 border-white/10 bg-transparent hover:bg-white/5 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-rensto-cyan/20 group-hover:text-rensto-cyan transition-colors">
                <Plus className="w-6 h-6 text-rensto-text-secondary group-hover:text-rensto-cyan" />
              </div>
              <p className="text-sm font-medium text-rensto-text-primary">Need help with something else?</p>
              <p className="text-xs text-rensto-text-tertiary mt-1">Click the Magic Button in the corner</p>
            </CardContent>
          </Card>
        </div>

        {/* Case Detail View */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <Card variant="renstoNeon" className="rensto-card-neon min-h-[500px]">
              <CardHeader className="border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-rensto-text-secondary">{selectedCase.id}</span>
                      <Badge className={getStatusColor(selectedCase.status)}>
                        {selectedCase.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-rensto-text-primary">{selectedCase.workflowId || 'System Issue'}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-rensto-text-tertiary">Submitted via</p>
                    <Badge variant="outline" className="mt-1 capitalize text-rensto-text-secondary border-white/10">{selectedCase.submissionMethod.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Issue Section */}
                <div>
                  <h3 className="text-sm font-semibold text-rensto-text-primary mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-rensto-text-tertiary" />
                    Problem Description
                  </h3>
                  <div className="p-4 bg-white/5 rounded-xl text-rensto-text-secondary text-sm leading-relaxed border border-white/5">
                    {selectedCase.issueDescription}
                  </div>
                </div>

                {/* AI Agent Reasoning Log */}
                <div>
                  <h3 className="text-sm font-semibold text-rensto-text-primary mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-rensto-cyan" />
                    AI Agent Activity Log
                  </h3>
                  <div className="space-y-3 pl-2">
                    {selectedCase.aiReasoningLog.map((log, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="relative">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${i === selectedCase.aiReasoningLog.length - 1 ? 'bg-rensto-cyan animate-pulse' : 'bg-slate-700'}`} />
                          {i < selectedCase.aiReasoningLog.length - 1 && (
                            <div className="absolute top-4 left-0.5 bottom-[-12px] w-[1px] bg-slate-800" />
                          )}
                        </div>
                        <span className={i === selectedCase.aiReasoningLog.length - 1 ? 'text-rensto-text-primary font-medium' : 'text-rensto-text-tertiary'}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed Fix / Action */}
                {selectedCase.status === 'awaiting_approval' && (
                  <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                    <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Proposed Resolution
                    </h3>
                    <p className="text-sm text-blue-300 mb-4">
                      The agent has successfully tested a fix in the sandbox. We need your approval to deploy it to production.
                    </p>
                    <div className="bg-slate-950 rounded-lg p-3 mb-4 overflow-x-auto border border-white/10">
                      <pre className="text-xs text-rensto-cyan font-mono">
                        {selectedCase.proposedFix?.diff}
                      </pre>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="renstoPrimary" className="flex-1">Approve & Deploy</Button>
                      <Button variant="outline" className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">Reject & Give Feedback</Button>
                    </div>
                  </div>
                )}

                {/* Escalation Notice */}
                {selectedCase.status === 'escalated' && (
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                    <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Human Intervention Required
                    </h3>
                    <p className="text-sm text-red-300">
                      Our AI agent couldn't resolve this automatically after 3 attempts. Shai has been notified and will take over shortly.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-rensto-text-tertiary" />
              </div>
              <h3 className="text-lg font-semibold text-rensto-text-primary">Select a case to view details</h3>
              <p className="text-sm text-rensto-text-secondary mt-1 max-w-xs mx-auto">
                Track real-time research, fixing, and testing by our autonomous support agent.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Magic Button is already rendered globally in ClientAppLayout usually, 
          but if not, we can add it here too. For now I'll assume it's global or at least on this page. */}
      <MagicButton
        customerId="client-001"
        carePlanTier="growth"
      />
    </div>
  );
}
