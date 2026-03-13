'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Zap,
    CheckCircle2,
    AlertCircle,
    Clock,
    Minus,
    Sparkles,
    ChevronDown,
    X,
    Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';

interface Capability {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    category: string;
    type: string;
    status: string;
    dependencies: string[];
    filePaths: string[];
}

interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: string;
}

interface CellData {
    id: string;
    status: string;
    blockedReason: string | null;
    config: unknown;
    enabledAt: string | null;
    enabledBy: string | null;
}

interface SmartSuggestion {
    tenantId: string;
    tenantName: string;
    reason: string;
    score: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    enabled: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    eligible: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <Clock className="w-3.5 h-3.5" /> },
    blocked: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    not_applicable: { bg: 'bg-slate-500/10', text: 'text-slate-600', icon: <Minus className="w-3.5 h-3.5" /> },
};

const CATEGORY_COLORS: Record<string, string> = {
    social: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    content: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    automation: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    analytics: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    infrastructure: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

export default function CapabilityMatrix() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [capabilities, setCapabilities] = useState<Capability[]>([]);
    const [matrix, setMatrix] = useState<Record<string, Record<string, CellData | null>>>({});
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [editingCell, setEditingCell] = useState<{ tenantId: string; capabilityId: string } | null>(null);
    const [editStatus, setEditStatus] = useState('eligible');
    const [editBlockedReason, setEditBlockedReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [smartMatchCap, setSmartMatchCap] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
    const [loadingSmart, setLoadingSmart] = useState(false);

    const fetchMatrix = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/capabilities/matrix');
            const data = await res.json();
            if (data.success) {
                setTenants(data.tenants);
                setCapabilities(data.capabilities);
                setMatrix(data.matrix);
            }
        } catch (err) {
            console.error('Failed to fetch capability matrix:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMatrix(); }, [fetchMatrix]);

    const handleCellClick = (tenantId: string, capabilityId: string) => {
        const cell = matrix[tenantId]?.[capabilityId];
        setEditingCell({ tenantId, capabilityId });
        setEditStatus(cell?.status || 'eligible');
        setEditBlockedReason(cell?.blockedReason || '');
    };

    const handleSave = async () => {
        if (!editingCell) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/capabilities/entity', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    capabilityId: editingCell.capabilityId,
                    tenantId: editingCell.tenantId,
                    status: editStatus,
                    blockedReason: editStatus === 'blocked' ? editBlockedReason : undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to update');
            } else {
                setEditingCell(null);
                await fetchMatrix();
            }
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSmartMatch = async (capabilityId: string) => {
        setSmartMatchCap(capabilityId);
        setLoadingSmart(true);
        setSuggestions([]);
        try {
            const res = await fetch('/api/admin/capabilities/smart-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ capabilityId }),
            });
            const data = await res.json();
            if (data.success) {
                setSuggestions(data.suggestions || []);
            }
        } catch (err) {
            console.error('Smart match failed:', err);
        } finally {
            setLoadingSmart(false);
        }
    };

    const filteredCapabilities = categoryFilter === 'all'
        ? capabilities
        : capabilities.filter(c => c.category === categoryFilter);

    const categories = [...new Set(capabilities.map(c => c.category))];

    // Stats
    const totalCells = tenants.length * capabilities.length;
    const allCells = Object.values(matrix).flatMap(row => Object.values(row));
    const enabledCount = allCells.filter(c => c?.status === 'enabled').length;
    const blockedCount = allCells.filter(c => c?.status === 'blocked').length;
    const eligibleCount = allCells.filter(c => c?.status === 'eligible').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                        Capability Engine
                    </h2>
                    <p className="text-slate-400 font-medium">
                        Build once, deploy everywhere. Every feature as a reusable capability.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
                        {enabledCount} Enabled
                    </div>
                    <div className="px-4 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-widest">
                        {eligibleCount} Eligible
                    </div>
                    <div className="px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest">
                        {blockedCount} Blocked
                    </div>
                    <div className="px-4 py-2 bg-slate-500/10 rounded-xl border border-slate-500/20 text-slate-400 text-xs font-black uppercase tracking-widest">
                        {totalCells} Total
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filter:</span>
                <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        categoryFilter === 'all'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                    }`}
                >
                    All ({capabilities.length})
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            categoryFilter === cat
                                ? CATEGORY_COLORS[cat] + ' border'
                                : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                        }`}
                    >
                        {cat} ({capabilities.filter(c => c.category === cat).length})
                    </button>
                ))}
            </div>

            {/* Matrix Grid */}
            <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="sticky left-0 z-10 bg-black/80 backdrop-blur px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 min-w-[180px]">
                                        Entity
                                    </th>
                                    {filteredCapabilities.map(cap => (
                                        <th key={cap.id} className="px-3 py-3 text-center min-w-[120px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[cap.category] || ''}`}>
                                                    {cap.category}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-white leading-tight">
                                                    {cap.displayName}
                                                </span>
                                                <button
                                                    onClick={() => handleSmartMatch(cap.id)}
                                                    className="mt-1 flex items-center gap-1 text-[9px] text-cyan-500 hover:text-cyan-400 transition-colors"
                                                    title="AI Smart Match"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    Match
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map((tenant, idx) => (
                                    <tr key={tenant.id} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                                        <td className="sticky left-0 z-10 bg-black/80 backdrop-blur px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                                <div>
                                                    <div className="text-sm font-bold text-white">{tenant.name}</div>
                                                    <div className="text-[10px] text-slate-500">{tenant.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {filteredCapabilities.map(cap => {
                                            const cell = matrix[tenant.id]?.[cap.id];
                                            const cellStatus = cell?.status || 'not_applicable';
                                            const style = STATUS_COLORS[cellStatus] || STATUS_COLORS.not_applicable;
                                            const isEditing = editingCell?.tenantId === tenant.id && editingCell?.capabilityId === cap.id;

                                            return (
                                                <td key={cap.id} className="px-3 py-3 text-center">
                                                    <button
                                                        onClick={() => handleCellClick(tenant.id, cap.id)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 ${style.bg} ${style.text} ${isEditing ? 'ring-2 ring-cyan-500' : ''}`}
                                                        title={cell?.blockedReason || cellStatus}
                                                    >
                                                        {style.icon}
                                                        {cellStatus === 'not_applicable' ? 'N/A' : cellStatus}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Modal */}
            {editingCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditingCell(null)}>
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase tracking-tight text-white">
                                Toggle Capability
                            </h3>
                            <button onClick={() => setEditingCell(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-sm text-slate-400">
                            <strong className="text-white">{tenants.find(t => t.id === editingCell.tenantId)?.name}</strong>
                            {' → '}
                            <strong className="text-cyan-400">{capabilities.find(c => c.id === editingCell.capabilityId)?.displayName}</strong>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
                            <div className="flex gap-2">
                                {(['enabled', 'eligible', 'blocked', 'not_applicable'] as const).map(s => {
                                    const style = STATUS_COLORS[s];
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setEditStatus(s)}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                                                editStatus === s
                                                    ? `${style.bg} ${style.text} border-current`
                                                    : 'bg-white/5 text-slate-500 border-white/5'
                                            }`}
                                        >
                                            {style.icon}
                                            {s === 'not_applicable' ? 'N/A' : s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {editStatus === 'blocked' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Blocked Reason</label>
                                <input
                                    type="text"
                                    value={editBlockedReason}
                                    onChange={e => setEditBlockedReason(e.target.value)}
                                    placeholder="e.g. Waiting on IG credentials"
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase tracking-wider">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                            </Button>
                            <Button onClick={() => setEditingCell(null)} variant="outline" className="border-white/10 text-slate-400">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Match Panel */}
            {smartMatchCap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSmartMatchCap(null)}>
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                                    Smart Match
                                </h3>
                            </div>
                            <button onClick={() => setSmartMatchCap(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-400">
                            AI evaluating which entities would benefit from{' '}
                            <strong className="text-cyan-400">
                                {capabilities.find(c => c.id === smartMatchCap)?.displayName}
                            </strong>
                        </p>
                        {loadingSmart ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                                <span className="ml-2 text-sm text-slate-400">Analyzing entities...</span>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No additional entities would benefit from this capability right now.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {suggestions.map((s, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white">{s.tenantName}</span>
                                                <Badge variant="outline" className="text-[9px] font-bold">
                                                    {Math.round(s.score * 100)}% fit
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">{s.reason}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={async () => {
                                                await fetch('/api/admin/capabilities/entity', {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        capabilityId: smartMatchCap,
                                                        tenantId: s.tenantId,
                                                        status: 'eligible',
                                                    }),
                                                });
                                                await fetchMatrix();
                                            }}
                                            className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
