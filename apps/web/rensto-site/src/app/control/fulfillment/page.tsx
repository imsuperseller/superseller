'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getFirestore } from 'firebase/app';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client'; // Assuming there is a client-side firebase config
import { ServiceInstance } from '@/types/firestore';
import {
    ClipboardList,
    CheckCircle2,
    Clock,
    ExternalLink,
    MoreVertical,
    AlertCircle,
    Database
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { toast } from 'sonner';

export default function FulfillmentQueuePage() {
    const [instances, setInstances] = useState<ServiceInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstance, setSelectedInstance] = useState<ServiceInstance | null>(null);
    const [workflowId, setWorkflowId] = useState('');
    const [isFinalizing, setIsFinalizing] = useState(false);

    useEffect(() => {
        fetchInstances();
    }, []);

    const fetchInstances = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'service_instances'),
                where('status', '==', 'pending_setup'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const fetchedInstances = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ServiceInstance[];
            setInstances(fetchedInstances);
        } catch (error) {
            console.error('Error fetching instances:', error);
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
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Fulfillment Queue</h1>
                        <p className="text-slate-500">Manage pending service implementations and project handoffs.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {instances.length} Pending Orders
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchInstances}>
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid place-items-center h-64 bg-white border border-slate-200 rounded-2xl">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-500 font-mono">Scanning Firestore...</p>
                        </div>
                    </div>
                ) : instances.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl border-dashed">
                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <ClipboardList className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Queue is Clear</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            All service instances are currently active or being processed.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {instances.map(instance => (
                            <div key={instance.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-6 border-b border-slate-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                <Database className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{instance.productName}</h3>
                                                <p className="text-sm text-slate-500">Instance ID: <span className="font-mono">{instance.id}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedInstance(instance)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Finalize Setup
                                            </Button>
                                            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/50 grid md:grid-cols-2 gap-8">
                                    {/* Client Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client Details</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Email:</span>
                                                <span className="text-slate-900 font-medium">{instance.clientEmail}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Created:</span>
                                                <span className="text-slate-900 font-medium">
                                                    {new Date(instance.createdAt?.seconds * 1000).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Configuration Answers */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuration Answers</h4>
                                        <div className="space-y-3">
                                            {Object.entries(instance.configuration || {}).map(([key, value]) => (
                                                <div key={key} className="bg-white p-3 border border-slate-200 rounded-xl">
                                                    <p className="text-[10px] text-slate-400 font-mono uppercase mb-1">{key}</p>
                                                    <p className="text-sm text-slate-900 font-medium truncate">
                                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Finalize Modal */}
                {selectedInstance && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden rensto-animate-fade-in">
                            <div className="p-6 border-b border-slate-100 bg-blue-50/50">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    Finalize Service Activation
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Assign an N8N Workflow ID to activate this account.</p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        N8N Workflow ID
                                    </label>
                                    <input
                                        type="text"
                                        value={workflowId}
                                        onChange={(e) => setWorkflowId(e.target.value)}
                                        placeholder="e.g. 4OYGXXMYeJFfAo6X"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Enter the ID from your n8n cloud dashboard.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setSelectedInstance(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                                        onClick={handleFinalize}
                                        disabled={isFinalizing || !workflowId}
                                    >
                                        {isFinalizing ? 'Activating...' : 'Fully Activate'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
