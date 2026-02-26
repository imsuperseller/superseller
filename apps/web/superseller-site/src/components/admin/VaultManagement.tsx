'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Key,
    Server,
    Eye,
    EyeOff,
    Copy,
    Check,
    Plus,
    Search,
    RefreshCcw,
    ExternalLink,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';

interface VaultItem {
    id: string;
    category: string;
    key: string;
    value: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export default function VaultManagement() {
    const [activeSubTab, setActiveSubTab] = useState<'credentials' | 'infrastructure' | 'heartbeat'>('credentials');
    const [items, setItems] = useState<VaultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (activeSubTab !== 'heartbeat') {
            fetchVault();
        } else {
            setLoading(false);
        }
    }, [activeSubTab]);

    const fetchVault = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/vault?category=${activeSubTab}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch vault:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleReveal = (id: string) => {
        const next = new Set(revealedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setRevealedIds(next);
    };

    const copyToClipboard = (id: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredItems = items.filter(item =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.metadata?.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                        The SuperSeller AI Vault
                    </h2>
                    <p className="text-slate-400 mt-1 font-medium">Single Source of Truth for all encrypted business secrets and infrastructure.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    <Button
                        variant={activeSubTab === 'credentials' ? 'default' : 'ghost'}
                        onClick={() => setActiveSubTab('credentials')}
                        className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10"
                    >
                        <Key className="w-4 h-4 mr-2" />
                        Certs
                    </Button>
                    <Button
                        variant={activeSubTab === 'infrastructure' ? 'default' : 'ghost'}
                        onClick={() => setActiveSubTab('infrastructure')}
                        className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10"
                    >
                        <Server className="w-4 h-4 mr-2" />
                        Infra
                    </Button>
                    <Button
                        variant={activeSubTab === 'heartbeat' ? 'default' : 'ghost'}
                        onClick={() => setActiveSubTab('heartbeat')}
                        className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Health
                    </Button>
                </div>
            </div>

            {activeSubTab === 'heartbeat' ? (
                <HeartbeatPanel />
            ) : (
                <>
                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search the vault..."
                                className="bg-white/5 border-white/5 pl-11 h-12 rounded-xl text-white font-medium focus:border-cyan-500/50 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl border border-white/5 text-slate-500 hover:text-white" onClick={fetchVault}>
                            <RefreshCcw className="w-5 h-5" />
                        </Button>
                        <Button variant="supersellerPrimary" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6">
                            <Plus className="w-4 h-4 mr-2" />
                            New Secret
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Decrypting Vault...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item) => (
                                <VaultCard
                                    key={item.id}
                                    item={item}
                                    isRevealed={revealedIds.has(item.id)}
                                    onToggleReveal={() => toggleReveal(item.id)}
                                    onCopy={copyToClipboard}
                                    isCopied={copiedId === item.id}
                                    type={activeSubTab}
                                />
                            ))}

                            {filteredItems.length === 0 && (
                                <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-[3rem]">
                                    <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">No records found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function HeartbeatPanel() {
    const healthChecks = [
        { id: 'rack-01', provider: 'RackNerd', label: 'Primary Compute Cluster', status: 'online', load: '12%', lastPing: '2s ago' },
        { id: 'go-login-pool', provider: 'GoLogin', label: 'FB Fingerprint Pool', status: 'online', load: '45/100', lastPing: '15s ago' },
        { id: 'telnyx-v3', provider: 'Telnyx', label: 'Voice Gateway', status: 'online', load: 'Operational', lastPing: '1m ago' },
        { id: 'n8n-internal', provider: 'n8n_self_hosted', label: 'SuperSeller AI Ops Engine', status: 'online', load: '87 Flows Active', lastPing: 'Just Now' },
        { id: 'tax4us-cloud', provider: 'n8n_cloud', label: 'Tax4Us Outreach', status: 'online', load: '14 Flows Active', lastPing: '30s ago' },
        { id: 'fb-lister-david', provider: 'gologin', label: 'David FB Machine', status: 'online', load: 'Idle', lastPing: '5m ago' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthChecks.map((check) => (
                <Card key={check.id} className="p-6 bg-white/[0.01] border-white/5 hover:border-cyan-500/30 transition-all rounded-[2rem] space-y-4 group">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cyan-500/10 rounded-xl">
                                <RefreshCcw className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{check.label}</h4>
                                <p className="text-[10px] text-slate-500 uppercase font-mono">{check.provider}</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                            {check.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Load / Metric</p>
                            <p className="text-sm font-black text-white">{check.load}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Latency</p>
                            <p className="text-sm font-black text-white">{check.lastPing}</p>
                        </div>
                    </div>

                    <Button variant="ghost" className="w-full h-10 text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 rounded-xl">
                        View Detailed Metrics
                    </Button>
                </Card>
            ))}
        </div>
    );
}

function VaultCard({ item, isRevealed, onToggleReveal, onCopy, isCopied, type }: any) {
    const displayValue = isRevealed ? item.value : '●●●●●●●●●●●●●●●●';

    return (
        <Card className="group relative overflow-hidden bg-white/[0.02] border-white/5 hover:border-cyan-500/30 transition-all duration-500 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{item.id}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{item.metadata?.description || 'No description provided'}</p>
                </div>
                <Badge className={`uppercase tracking-tighter text-[9px] font-black ${item.metadata?.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {item.metadata?.status || 'Active'}
                </Badge>
            </div>

            <div className="relative">
                <div className={`p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-xs overflow-hidden transition-all ${isRevealed ? 'text-white' : 'text-slate-600'}`}>
                    <pre className="whitespace-pre-wrap break-all leading-relaxed">
                        {displayValue}
                    </pre>
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/10" onClick={onToggleReveal}>
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/10" onClick={() => onCopy(item.id, item.value)}>
                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                    <div className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1">
                        <RefreshCcw className="w-3 h-3" />
                        v1.0
                    </div>
                </div>
                <Button variant="ghost" className="h-8 text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest">
                    History
                </Button>
            </div>
        </Card>
    );
}
