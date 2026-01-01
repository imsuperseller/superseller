'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge-enhanced';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { ServiceInstance } from '@/types/firestore';
import { Loader2, CheckCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminFulfillmentPage() {
    const [instances, setInstances] = useState<ServiceInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<string | null>(null);
    const [workflowIdInputs, setWorkflowIdInputs] = useState<Record<string, string>>({});

    const fetchInstances = async () => {
        setLoading(true);
        try {
            // Ideally verify admin here
            const q = query(
                collection(db, 'service_instances'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceInstance));
            setInstances(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstances();
    }, []);

    const handleActivate = async (instanceId: string) => {
        const n8nId = workflowIdInputs[instanceId];
        if (!n8nId) return alert("Please enter the N8N Workflow ID");

        setActivatingId(instanceId);
        try {
            const response = await fetch('/api/fulfillment/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instanceId,
                    n8nWorkflowId: n8nId,
                    adminNotes: 'Activated via Admin Dashboard'
                })
            });

            if (!response.ok) throw new Error('Failed');

            // Refresh
            fetchInstances();
            alert("Activated!");
        } catch (e) {
            alert("Error activating");
        } finally {
            setActivatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#110d28] text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Fulfillment Queue</h1>
                    <Button onClick={fetchInstances} variant="ghost">
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin w-8 h-8 text-cyan-500" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {instances.map(instance => (
                            <div key={instance.id} className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl flex flex-col lg:flex-row gap-6 justify-between">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={instance.status === 'active' ? 'renstoSuccess' : 'renstoWarning'}>
                                            {instance.status.toUpperCase()}
                                        </Badge>
                                        <h3 className="text-xl font-bold">{instance.productName}</h3>
                                        <span className="text-slate-500 text-sm font-mono">{instance.id}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500 block">Client</span>
                                            {instance.clientEmail || instance.clientId}
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Date</span>
                                            {new Date(instance.createdAt?.seconds * 1000).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="bg-black/20 p-4 rounded-lg space-y-2">
                                        <h4 className="font-bold text-xs uppercase text-slate-500">Configuration</h4>
                                        <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
                                            {JSON.stringify(instance.configuration, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                <div className="lg:w-1/3 space-y-4 border-l border-slate-700/50 lg:pl-6">
                                    <h4 className="font-bold text-sm">Action Required</h4>

                                    {instance.status === 'active' ? (
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Active (ID: {instance.n8nWorkflowId})
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-400">N8N Workflow ID</label>
                                                <Input
                                                    placeholder="Paste ID here..."
                                                    className="bg-black/20"
                                                    value={workflowIdInputs[instance.id] || ''}
                                                    onChange={e => setWorkflowIdInputs(prev => ({ ...prev, [instance.id]: e.target.value }))}
                                                />
                                            </div>
                                            <Button
                                                className="w-full bg-cyan-600 hover:bg-cyan-500"
                                                onClick={() => handleActivate(instance.id)}
                                                disabled={activatingId === instance.id}
                                            >
                                                {activatingId === instance.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                Finalize & Activate
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
