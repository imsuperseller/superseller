'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardCheck,
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    Save,
    FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';

// ─── Types ───

interface AuditItem {
    id: string;
    question: string;
    hint?: string;
    order: number;
}

interface AuditSection {
    id: string;
    title: string;
    order: number;
    items: AuditItem[];
    progress: number;
    _count?: { items: number };
}

interface AuditTemplate {
    id: string;
    name: string;
    description?: string;
    version: string;
    sections: AuditSection[];
    _count?: { instances: number };
}

interface AuditInstance {
    id: string;
    templateId: string;
    projectId?: string;
    label?: string;
    createdAt: string;
    template: { name: string; version: string };
    project?: { name: string; type: string };
    _count: { responses: number };
}

interface AuditResponse {
    id: string;
    instanceId: string;
    itemId: string;
    status: string;
    answer?: string;
    notes?: string;
}

// ─── Main Component ───

export default function AuditManagement() {
    const [view, setView] = useState<'list' | 'instance'>('list');
    const [templates, setTemplates] = useState<AuditTemplate[]>([]);
    const [instances, setInstances] = useState<AuditInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [listTab, setListTab] = useState<'templates' | 'instances'>('instances');

    // Instance drill-down state
    const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);
    const [instanceData, setInstanceData] = useState<any>(null);
    const [responseMap, setResponseMap] = useState<Record<string, AuditResponse>>({});
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState<string | null>(null);

    // ─── Fetchers ───

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const [tRes, iRes] = await Promise.all([
                fetch('/api/admin/audits?view=templates'),
                fetch('/api/admin/audits?view=instances'),
            ]);
            const tData = await tRes.json();
            const iData = await iRes.json();
            if (tData.success) setTemplates(tData.templates ?? []);
            if (iData.success) setInstances(iData.instances ?? []);
        } catch (e) {
            console.error('Failed to fetch audits:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchInstance = useCallback(async (instanceId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/audits/${instanceId}/responses`);
            const data = await res.json();
            if (data.success) {
                setInstanceData(data.instance);
                setResponseMap(data.instance.responseMap ?? {});
                // Auto-expand first incomplete section
                const sections: AuditSection[] = data.instance.template?.sections ?? [];
                const firstIncomplete = sections.find((s: AuditSection) => s.progress < 100);
                if (firstIncomplete) {
                    setExpandedSections(new Set([firstIncomplete.id]));
                }
            }
        } catch (e) {
            console.error('Failed to fetch instance:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    // ─── Actions ───

    const openInstance = (id: string) => {
        setActiveInstanceId(id);
        setView('instance');
        fetchInstance(id);
    };

    const goBack = () => {
        setView('list');
        setActiveInstanceId(null);
        setInstanceData(null);
        setResponseMap({});
        setExpandedSections(new Set());
        fetchList();
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) next.delete(sectionId);
            else next.add(sectionId);
            return next;
        });
    };

    const saveResponse = async (itemId: string, updates: { status?: string; answer?: string; notes?: string }) => {
        if (!activeInstanceId) return;
        setSaving(itemId);
        try {
            const res = await fetch(`/api/admin/audits/${activeInstanceId}/responses`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, ...updates }),
            });
            const data = await res.json();
            if (data.success && data.response) {
                setResponseMap(prev => ({ ...prev, [itemId]: data.response }));
            }
        } catch (e) {
            console.error('Failed to save response:', e);
        } finally {
            setSaving(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'complete': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
            case 'in_progress': return <Clock className="w-4 h-4 text-cyan-400" />;
            case 'flagged': return <AlertCircle className="w-4 h-4 text-red-400" />;
            default: return <div className="w-4 h-4 rounded-full border border-white/20" />;
        }
    };

    const getProgressColor = (pct: number) => {
        if (pct >= 100) return 'bg-green-500';
        if (pct >= 50) return 'bg-cyan-500';
        if (pct > 0) return 'bg-yellow-500';
        return 'bg-white/10';
    };

    // ─── Stats ───

    const totalQuestions = templates.reduce(
        (sum, t) => sum + t.sections.reduce((s, sec) => s + (sec._count?.items ?? sec.items?.length ?? 0), 0),
        0,
    );

    // ─── Render: Instance Drill-Down ───

    if (view === 'instance' && instanceData) {
        const sections: AuditSection[] = instanceData.template?.sections ?? [];
        const overallProgress: number = instanceData.overallProgress ?? 0;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                            {instanceData.label ?? instanceData.template?.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            {instanceData.project && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                    {instanceData.project.name}
                                </span>
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                v{instanceData.template?.version}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-white">{overallProgress}%</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Complete</p>
                    </div>
                </div>

                {/* Overall progress bar */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-700 ${getProgressColor(overallProgress)}`}
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>

                {/* Sections accordion */}
                <div className="space-y-3">
                    {sections.map((section: AuditSection) => {
                        const isExpanded = expandedSections.has(section.id);
                        return (
                            <div key={section.id} className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                                {/* Section header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        {isExpanded
                                            ? <ChevronDown className="w-4 h-4 text-slate-400" />
                                            : <ChevronRight className="w-4 h-4 text-slate-400" />
                                        }
                                        <div className="text-left">
                                            <p className="text-sm font-black text-white uppercase tracking-tight">
                                                {section.order}. {section.title}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                {section.items.length} items
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${getProgressColor(section.progress)}`}
                                                style={{ width: `${section.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 w-10 text-right">
                                            {section.progress}%
                                        </span>
                                    </div>
                                </button>

                                {/* Section items */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 divide-y divide-white/5">
                                        {section.items.map((item: AuditItem) => {
                                            const resp = responseMap[item.id];
                                            const status = resp?.status ?? 'pending';
                                            return (
                                                <AuditItemRow
                                                    key={item.id}
                                                    item={item}
                                                    status={status}
                                                    answer={resp?.answer ?? ''}
                                                    notes={resp?.notes ?? ''}
                                                    saving={saving === item.id}
                                                    statusIcon={getStatusIcon(status)}
                                                    onSave={(updates) => saveResponse(item.id, updates)}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ─── Render: List View ───

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Audit Center</h2>
                    <p className="text-slate-400 font-medium tracking-tight">Business playbooks, customer audits, and operational checklists.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Templates', count: templates.length, color: 'text-purple-400' },
                    { label: 'Active Audits', count: instances.length, color: 'text-cyan-400' },
                    { label: 'Total Questions', count: totalQuestions, color: 'text-white' },
                    { label: 'Responses', count: instances.reduce((s, i) => s + i._count.responses, 0), color: 'text-green-400' },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
                    </div>
                ))}
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2">
                {(['instances', 'templates'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setListTab(tab)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            listTab === tab
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                : 'text-slate-500 border-transparent hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab === 'instances' ? 'Active Audits' : 'Templates'}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : listTab === 'instances' ? (
                <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                    {instances.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm font-medium">No audit instances yet. Create one from a template.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {instances.map(inst => (
                                <button
                                    key={inst.id}
                                    onClick={() => openInstance(inst.id)}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">
                                                {inst.label ?? inst.template.name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                {inst.project && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                                        {inst.project.name}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-500">
                                                    v{inst.template.version}
                                                </span>
                                                <span className="text-[10px] text-slate-600">
                                                    {inst._count.responses} responses
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                    {templates.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm font-medium">No templates yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {templates.map(tmpl => {
                                const itemCount = tmpl.sections.reduce((s, sec) => s + (sec._count?.items ?? sec.items?.length ?? 0), 0);
                                return (
                                    <div key={tmpl.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                    <ClipboardCheck className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{tmpl.name}</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                                        {tmpl.sections.length} sections &middot; {itemCount} items &middot; v{tmpl.version}
                                                        {tmpl._count?.instances ? ` · ${tmpl._count.instances} active` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {tmpl.description && (
                                            <p className="text-xs text-slate-400 mt-2 ml-14">{tmpl.description}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Audit Item Row (inline edit) ───

function AuditItemRow({
    item,
    status,
    answer,
    notes,
    saving,
    statusIcon,
    onSave,
}: {
    item: AuditItem;
    status: string;
    answer: string;
    notes: string;
    saving: boolean;
    statusIcon: React.ReactNode;
    onSave: (updates: { status?: string; answer?: string; notes?: string }) => void;
}) {
    const [localAnswer, setLocalAnswer] = useState(answer);
    const [localNotes, setLocalNotes] = useState(notes);
    const [expanded, setExpanded] = useState(false);

    const cycleStatus = () => {
        const order = ['pending', 'in_progress', 'complete', 'flagged'];
        const next = order[(order.indexOf(status) + 1) % order.length];
        onSave({ status: next, answer: localAnswer, notes: localNotes });
    };

    const handleBlur = () => {
        if (localAnswer !== answer || localNotes !== notes) {
            onSave({ status, answer: localAnswer, notes: localNotes });
        }
    };

    return (
        <div className="px-5 py-4 hover:bg-white/[0.01]">
            <div className="flex items-start gap-3">
                <button
                    onClick={cycleStatus}
                    className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                    title={`Status: ${status} (click to cycle)`}
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        statusIcon
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-left w-full"
                    >
                        <p className={`text-sm ${status === 'complete' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {item.question}
                        </p>
                        {item.hint && (
                            <p className="text-[10px] text-slate-600 mt-0.5">{item.hint}</p>
                        )}
                    </button>

                    {expanded && (
                        <div className="mt-3 space-y-2">
                            <textarea
                                value={localAnswer}
                                onChange={(e) => setLocalAnswer(e.target.value)}
                                onBlur={handleBlur}
                                placeholder="Answer..."
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
                            />
                            <textarea
                                value={localNotes}
                                onChange={(e) => setLocalNotes(e.target.value)}
                                onBlur={handleBlur}
                                placeholder="Notes (optional)..."
                                rows={1}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-400 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
                            />
                        </div>
                    )}

                    {!expanded && answer && (
                        <p className="text-xs text-slate-500 mt-1 truncate">{answer}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
