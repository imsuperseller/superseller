'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    ClipboardList,
    CheckCircle2,
    Clock,
    Database,
    Search,
    RefreshCw,
    Layers,
    Activity,
    Lock,
    Cpu,
    Shield,
    Zap,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { toast } from 'sonner';
import { NoiseTexture } from '@/components/ui/premium/NoiseTexture';

interface ServiceInstance {
    id: string;
    clientId: string;
    clientEmail: string;
    productId: string;
    productName: string;
    status: string;
    configuration: Record<string, any>;
    createdAt: string;
    [key: string]: any;
}

interface FulfillmentQueueClientProps {
    initialProducts: any[];
}

export default function FulfillmentQueueClient({ initialProducts }: FulfillmentQueueClientProps) {
    const [instances, setInstances] = useState<ServiceInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstance, setSelectedInstance] = useState<ServiceInstance | null>(null);
    const [workflowId, setWorkflowId] = useState('');
    const [isFinalizing, setIsFinalizing] = useState(false);

    const [onboardingRequests, setOnboardingRequests] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'instances' | 'onboarding'>('instances');
    const [selectedPillar, setSelectedPillar] = useState<'all' | 'lead-machine' | 'knowledge-engine' | 'content-engine' | 'autonomous-secretary'>('all');

    // Dynamic Registry from AITable
    const activeRegistry: Record<string, any> = {};
    initialProducts.forEach(p => {
        const id = p['Product ID'] || p.id;
        activeRegistry[id] = {
            id,
            name: p['Product Name'] || p.name,
            adminLabel: p['Admin Label'] || p['adminLabel'] || ''
        };
    });

    const pillars = [
        { id: 'all', label: 'All Clusters', icon: Layers, color: 'text-slate-400' },
        { id: 'lead-machine', label: 'Salah: Leads', icon: Target, color: 'text-cyan-400' },
        { id: 'knowledge-engine', label: 'Klopp: Knowledge', icon: Database, color: 'text-purple-400' },
        { id: 'content-engine', label: 'Darwin: Content', icon: Zap, color: 'text-orange-400' },
        { id: 'autonomous-secretary', label: 'The Team: Ops', icon: Cpu, color: 'text-[#fe3d51]' },
    ];

    useEffect(() => {
        fetchInstances();
    }, []);

    const filteredInstances = instances.filter(inst =>
        selectedPillar === 'all' || inst.productId.includes(selectedPillar) || (inst as any).pillarId === selectedPillar
    );

    const filteredOnboarding = onboardingRequests.filter(req =>
        selectedPillar === 'all' || req.productId?.includes(selectedPillar) || req.solutionId?.includes(selectedPillar)
    );

    const handleApproveOnboarding = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/onboarding/${id}/approve`, { method: 'POST' });
            if (response.ok) {
                toast.success('Mission approved and activated!');
                fetchInstances();
            } else {
                toast.error('Failed to approve mission');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const fetchInstances = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/fulfillment/queue');
            if (!res.ok) throw new Error('Failed to load');
            const data = await res.json();
            setInstances(data.instances || []);
            setOnboardingRequests(data.onboardingRequests || []);
        } catch (error) {
            console.error('Error fetching queue:', error);
            toast.error('Failed to load fulfillment queue');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        if (!selectedInstance || !workflowId) {
            toast.error('Please enter a valid N8N Workflow ID');
            return;
        }

        setIsFinalizing(true);
        try {
            const response = await fetch('/api/fulfillment/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instanceId: selectedInstance.id,
                    n8nWorkflowId: workflowId,
                    adminNotes: `Activated via Admin Dashboard`
                })
            });

            if (response.ok) {
                toast.success('Service instance activated successfully!');
                setSelectedInstance(null);
                setWorkflowId('');
                fetchInstances();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to finalize');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <AdminLayout>
            <div className="relative min-h-[calc(100vh-8rem)] space-y-12">
                <NoiseTexture opacity={0.3} />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-cyan-400">
                            <Layers className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Deployment Pipeline</span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                            Fulfillment <span className="text-cyan-400">Queue</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Coordinate and authorize autonomous service standups.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-6 py-4 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Pending Orders</p>
                            <p className="text-2xl font-black text-white">{instances.length}</p>
                        </div>
                        <button
                            onClick={fetchInstances}
                            className="p-5 bg-white/5 border border-white/10 rounded-[2rem] text-slate-400 hover:text-white hover:border-white/20 transition-all shadow-xl"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Queue Tabs */}
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('instances')}
                            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'instances' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Active Clusters ({instances.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('onboarding')}
                            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'onboarding' ? 'bg-[#fe3d51] text-white shadow-lg shadow-[#fe3d51]/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Intake Requests ({onboardingRequests.length})
                        </button>
                    </div>

                    {/* Pillar Sub-Tabs */}
                    <div className="flex flex-wrap gap-3">
                        {pillars.map((pillar) => (
                            <button
                                key={pillar.id}
                                onClick={() => setSelectedPillar(pillar.id as any)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${selectedPillar === pillar.id
                                    ? 'bg-white/10 border-white/20 text-white shadow-2xl'
                                    : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                                    }`}
                            >
                                <pillar.icon className={`w-4 h-4 ${selectedPillar === pillar.id ? pillar.color : 'text-current'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{pillar.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Queue Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-b-2 border-cyan-500 rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.3)]" />
                            <Cpu className="absolute inset-0 m-auto w-8 h-8 text-cyan-500/50" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Scanning Grid Clusters...</p>
                    </div>
                ) : activeTab === 'onboarding' ? (
                    <div className="grid gap-8">
                        {filteredOnboarding.length === 0 ? (
                            <div className="p-32 text-center text-slate-500 uppercase font-black tracking-widest border border-dashed border-white/5 rounded-[3rem]">
                                No pending {selectedPillar !== 'all' ? selectedPillar.replace('-', ' ') : ''} requests.
                            </div>
                        ) : (
                            filteredOnboarding.map(req => (
                                <div key={req.id} className="group relative bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.03] transition-all duration-500">
                                    <div className="p-8 border-b border-white/5">
                                        <div className="grid md:grid-cols-2 gap-8 items-center">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-[#fe3d51]/10 text-[#fe3d51] rounded-3xl flex items-center justify-center border border-[#fe3d51]/20 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-[#fe3d51]/10">
                                                    <Zap className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{req.solutionName}</h3>
                                                        {(activeRegistry[req.productId || req.solutionId])?.adminLabel && (
                                                            <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest rounded-md">
                                                                Agent: {activeRegistry[req.productId || req.solutionId]?.adminLabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Request ID</span>
                                                        <span className="text-[10px] font-mono text-[#fe3d51]/70">{req.id}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-4">
                                                <button
                                                    onClick={() => handleApproveOnboarding(req.id)}
                                                    className="px-8 py-4 bg-[#fe3d51] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#ff4d61] transition-all shadow-xl shadow-[#fe3d51]/20"
                                                >
                                                    Approve & Deploy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6 bg-white/[0.01]">
                                        {Object.entries(req.inputs || {}).map(([key, value]) => (
                                            <div key={key} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">{key}</p>
                                                <p className="text-xs text-white font-bold truncate">{String(value)}</p>
                                            </div>
                                        ))}
                                        {req.hasSecrets && (
                                            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-center gap-3">
                                                <Lock className="w-4 h-4 text-cyan-400" />
                                                <div>
                                                    <p className="text-[8px] text-cyan-500 font-black uppercase tracking-widest">Encrypted Secrets</p>
                                                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-tight">Safely Stored in Vault</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {filteredInstances.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <ClipboardList className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Cluster Optimized</h3>
                                <p className="text-slate-500 text-center font-medium max-w-sm">
                                    Zero pending {selectedPillar !== 'all' ? selectedPillar.replace('-', ' ') : ''} instances. All neural channels set to idle.
                                </p>
                            </div>
                        ) : (
                            filteredInstances.map(instance => (
                                <div key={instance.id} className="group relative bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.03] transition-all duration-500">
                                    <div className="p-8 border-b border-white/5">
                                        <div className="grid md:grid-cols-2 gap-8 items-center">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-3xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-cyan-500/10">
                                                    <Database className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{instance.productName}</h3>
                                                        {activeRegistry[instance.productId]?.adminLabel && (
                                                            <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest rounded-md">
                                                                Agent: {activeRegistry[instance.productId]?.adminLabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node ID</span>
                                                        <span className="text-[10px] font-mono text-cyan-500/70">{instance.id}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-4">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Timestamp</p>
                                                    <p className="text-xs font-bold text-white uppercase">
                                                        {new Date(instance.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedInstance(instance)}
                                                    className="px-8 py-4 bg-cyan-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20"
                                                >
                                                    Authorize Activation
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 grid md:grid-cols-2 gap-12 bg-white/[0.01]">
                                        {/* Client Details */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Shield className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Manifest</span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auth Identity</span>
                                                    <span className="text-xs font-bold text-white">{instance.clientEmail}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Network Status</span>
                                                    <span className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                        Pending Finalization
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Configuration Matrix */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Activity className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Parameter Matrix</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(instance.configuration || {}).map(([key, value]) => (
                                                    <div key={key} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 truncate">{key}</p>
                                                        <p className="text-[10px] text-white font-bold uppercase truncate">
                                                            {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : String(value)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Activation Modal */}
            {selectedInstance && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                    <div className="bg-[#1a162f] w-full max-w-lg rounded-[3.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden scale-in-center">
                        <div className="p-10 border-b border-white/5 bg-gradient-to-br from-cyan-500/5 to-transparent">
                            <div className="flex items-center gap-4 mb-4 text-cyan-400">
                                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    Authorize <span className="text-cyan-400">Uplink</span>
                                </h3>
                            </div>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Finalizing activation for <span className="text-white font-bold">{selectedInstance.productName}</span>.
                                Assign the neural workflow ID to bridge the autonomous connection.
                            </p>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/70 ml-2">
                                    N8N Workflow ID
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={workflowId}
                                        onChange={(e) => setWorkflowId(e.target.value)}
                                        placeholder="XXXX-XXXX-XXXX-XXXX"
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[2rem] focus:ring-2 focus:ring-cyan-500/50 outline-none font-mono text-white placeholder:text-slate-700 uppercase tracking-widest"
                                    />
                                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedInstance(null)}
                                    className="flex-1 py-4 px-6 border border-white/10 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleFinalize}
                                    disabled={isFinalizing || !workflowId}
                                    className="flex-2 py-4 px-10 bg-cyan-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
                                >
                                    {isFinalizing ? (
                                        <Activity className="w-4 h-4 animate-spin mx-auto" />
                                    ) : (
                                        'Finalize Uplink'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
