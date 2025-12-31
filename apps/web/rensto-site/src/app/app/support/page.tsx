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
      case 'resolved': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'awaiting_approval': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'pending': return 'bg-slate-500/10 text-slate-600 border-slate-200';
      case 'researching':
      case 'fixing':
      case 'testing': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'escalated': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
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
          <h1 className="text-3xl font-bold text-slate-900">Care Plan Support</h1>
          <p className="text-slate-600 mt-1">Autonomous AI agent is monitoring and fixing your systems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">Active Cases</h2>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedCase?.id === c.id
                ? 'bg-white border-cyan-500 shadow-md ring-2 ring-cyan-500/10'
                : 'bg-white/50 border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-500">{c.id}</span>
                <Badge variant="outline" className={`text-[10px] flex items-center gap-1 ${getStatusColor(c.status)}`}>
                  {getStatusIcon(c.status)}
                  {c.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-slate-900 line-clamp-1 mb-1">{c.issueDescription}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="italic">{c.workflowId || 'General System'}</span>
              </div>
            </div>
          ))}

          {/* New Case Button / Card */}
          <Card className="border-dashed border-2 bg-transparent hover:bg-slate-100 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mb-3 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600">Need help with something else?</p>
              <p className="text-xs text-slate-400 mt-1">Click the Magic Button in the corner</p>
            </CardContent>
          </Card>
        </div>

        {/* Case Detail View */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <Card className="bg-white border-slate-200 shadow-sm min-h-[500px]">
              <CardHeader className="border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">{selectedCase.id}</span>
                      <Badge className={getStatusColor(selectedCase.status)}>
                        {selectedCase.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{selectedCase.workflowId || 'System Issue'}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Submitted via</p>
                    <Badge variant="outline" className="mt-1 capitalize">{selectedCase.submissionMethod.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Issue Section */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    Problem Description
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-700 text-sm leading-relaxed">
                    {selectedCase.issueDescription}
                  </div>
                </div>

                {/* AI Agent Reasoning Log */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-cyan-500" />
                    AI Agent Activity Log
                  </h3>
                  <div className="space-y-3 pl-2">
                    {selectedCase.aiReasoningLog.map((log, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="relative">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${i === selectedCase.aiReasoningLog.length - 1 ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300'}`} />
                          {i < selectedCase.aiReasoningLog.length - 1 && (
                            <div className="absolute top-4 left-0.5 bottom-[-12px] w-[1px] bg-slate-200" />
                          )}
                        </div>
                        <span className={i === selectedCase.aiReasoningLog.length - 1 ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed Fix / Action */}
                {selectedCase.status === 'awaiting_approval' && (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Proposed Resolution
                    </h3>
                    <p className="text-sm text-blue-800 mb-4">
                      The agent has successfully tested a fix in the sandbox. We need your approval to deploy it to production.
                    </p>
                    <div className="bg-slate-900 rounded-lg p-3 mb-4 overflow-x-auto">
                      <pre className="text-xs text-cyan-400 font-mono">
                        {selectedCase.proposedFix?.diff}
                      </pre>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="renstoPrimary" className="flex-1">Approve & Deploy</Button>
                      <Button variant="outline" className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100">Reject & Give Feedback</Button>
                    </div>
                  </div>
                )}

                {/* Escalation Notice */}
                {selectedCase.status === 'escalated' && (
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                    <h3 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Human Intervention Required
                    </h3>
                    <p className="text-sm text-red-800">
                      Our AI agent couldn't resolve this automatically after 3 attempts. Shai has been notified and will take over shortly.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Select a case to view details</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
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
