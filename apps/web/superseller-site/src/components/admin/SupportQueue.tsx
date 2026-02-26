'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    Brain,
    Cpu,
    MessageSquare,
    AlertTriangle,
    Clock,
    User,
    Workflow
} from 'lucide-react';
import { SupportCase, CaseStatus } from '@/types/support';

interface SupportQueueProps {
    cases: SupportCase[];
    onApprove: (caseId: string) => Promise<void>;
    onReject: (caseId: string, feedback: string) => Promise<void>;
}

export default function SupportQueue({ cases, onApprove, onReject }: SupportQueueProps) {
    const [selectedCase, setSelectedCase] = useState<SupportCase | null>(cases[0] || null);
    const [rejectFeedback, setRejectFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusBadge = (status: CaseStatus) => {
        switch (status) {
            case 'resolved': return <Badge className="bg-green-500/10 text-green-600 border-green-200">Resolved</Badge>;
            case 'awaiting_approval': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Awaiting Approval</Badge>;
            case 'fixing': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">AI Fixing</Badge>;
            case 'escalated': return <Badge className="bg-red-500/10 text-red-600 border-red-200">Escalated</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleApprove = async () => {
        if (!selectedCase) return;
        setIsSubmitting(true);
        await onApprove(selectedCase.id);
        setIsSubmitting(false);
    };

    const handleReject = async () => {
        if (!selectedCase || !rejectFeedback) return;
        setIsSubmitting(true);
        await onReject(selectedCase.id, rejectFeedback);
        setRejectFeedback('');
        setIsSubmitting(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar List */}
            <div className="lg:col-span-1 space-y-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Support Queue</h2>
                <div className="space-y-2">
                    {cases.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedCase(c)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedCase?.id === c.id
                                    ? 'bg-white/10 border-orange-500 shadow-lg'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-slate-500">{c.id}</span>
                                {getStatusBadge(c.status)}
                            </div>
                            <p className="text-sm font-medium text-white line-clamp-1 mb-2">{c.issueDescription}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {c.customerId}
                                </div>
                                <div className="flex items-center gap-1 italic">
                                    <Workflow className="w-3 h-3" />
                                    {c.workflowId || 'General'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Detail View */}
            <div className="lg:col-span-2">
                {selectedCase ? (
                    <Card className="bg-white/5 border-white/10 shadow-2xl backdrop-blur-sm min-h-[600px]">
                        <CardHeader className="border-b border-white/10 p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-mono text-slate-500">{selectedCase.id}</span>
                                        {getStatusBadge(selectedCase.status)}
                                        <Badge variant="outline" className="text-[10px] uppercase border-white/10">{selectedCase.carePlanTier} Care Plan</Badge>
                                    </div>
                                    <CardTitle className="text-2xl text-white">{selectedCase.customerId}</CardTitle>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Submitted at</p>
                                    <p className="text-sm text-slate-300 font-mono">
                                        {new Date(selectedCase.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            {/* Context / Issue */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" />
                                        Customer Description
                                    </h3>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm leading-relaxed">
                                        {selectedCase.issueDescription}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                        <Cpu className="w-3 h-3" />
                                        Workflow Context
                                    </h3>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-sm font-mono">
                                        <p>ID: {selectedCase.workflowId || 'N/A'}</p>
                                        <p className="mt-2 text-red-400/80">
                                            Recent Errors: {selectedCase.contextData.recentErrors?.length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Agent Reasoning */}
                            <div>
                                <h3 className="text-xs font-semibold text-cyan-400 uppercase mb-4 flex items-center gap-2">
                                    <Brain className="w-3 h-3" />
                                    Autonomous Agent Reasoning Log
                                </h3>
                                <div className="space-y-4">
                                    {selectedCase.aiReasoningLog.map((log, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 ${i === selectedCase.aiReasoningLog.length - 1 ? 'bg-cyan-500 animate-pulse' : 'bg-white/20'}`} />
                                                {i < selectedCase.aiReasoningLog.length - 1 && (
                                                    <div className="w-[1px] h-full bg-white/10 min-h-[20px]" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-1">
                                                <p className={`text-sm ${i === selectedCase.aiReasoningLog.length - 1 ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                    {log}
                                                </p>
                                                <p className="text-[10px] text-slate-600 mt-0.5">Step {i + 1}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Approval Action */}
                            {selectedCase.status === 'awaiting_approval' && (
                                <div className="mt-8 p-6 rounded-2xl border border-orange-500/30 bg-orange-500/5 ring-1 ring-orange-500/20">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">Human Approval Requested</h3>
                                            <p className="text-sm text-slate-400">The agent has proposed and tested a fix. Review the diff below.</p>
                                        </div>
                                        <Badge className="bg-orange-500 text-white">Action Required</Badge>
                                    </div>

                                    <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5 font-mono">
                                        <div className="text-xs text-slate-500 mb-2">// Suggested Workflow Patch</div>
                                        <pre className="text-xs text-cyan-400 leading-relaxed">
                                            {selectedCase.proposedFix?.diff}
                                        </pre>
                                    </div>

                                    <div className="flex flex-col space-y-4">
                                        <div className="flex gap-4">
                                            <Button
                                                disabled={isSubmitting}
                                                onClick={handleApprove}
                                                className="flex-1 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 h-12 font-bold"
                                            >
                                                {isSubmitting ? 'Deploying...' : 'Approve & Deploy Fix'}
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <textarea
                                                value={rejectFeedback}
                                                onChange={(e) => setRejectFeedback(e.target.value)}
                                                placeholder="Provide feedback for the agent if rejecting..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:border-red-500/50 outline-none resize-none h-20"
                                            />
                                            <Button
                                                variant="outline"
                                                disabled={isSubmitting || !rejectFeedback}
                                                onClick={handleReject}
                                                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                Reject & Send Feedback to Agent
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCase.status === 'escalated' && (
                                <div className="mt-8 p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
                                    <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Agent Gave Up
                                    </h3>
                                    <p className="text-sm text-slate-300">
                                        The agent reached its max attempt limit (3) or encountered an unsolvable blockage.
                                        Manual intervention is now mandatory.
                                    </p>
                                    <Button className="mt-4 bg-white/10 hover:bg-white/20 text-white">
                                        Access Customer Instance
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                        <Clock className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-slate-400">Support queue is clear</h3>
                        <p className="text-slate-500 mt-2">All autonomous agents are operating normally.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
