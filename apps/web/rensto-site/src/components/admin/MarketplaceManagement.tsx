'use client';

import React, { useState, useEffect } from 'react';
import { Store, Package, Globe, Clock, AlertTriangle, CheckCircle2, Pause, Play, Loader2, RefreshCw } from 'lucide-react';

interface MarketplaceCustomer {
    id: string;
    businessName: string;
    subscription: string;
    status: string;
    createdAt: string;
    user: { email: string; name?: string };
    products: {
        id: string;
        name: string;
        productType: string;
        status: string;
        config: any;
        schedule: any;
    }[];
    sessions: {
        id: string;
        profileId: string;
        status: string;
        lastUsed: string | null;
        expiresAt: string | null;
    }[];
    posts: { total: number; today: number; failed: number };
}

export default function MarketplaceManagement() {
    const [customers, setCustomers] = useState<MarketplaceCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/marketplace');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setCustomers(data.customers || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = async (action: string, customerId: string, productId?: string) => {
        setActionLoading(`${action}-${productId || customerId}`);
        try {
            const res = await fetch('/api/admin/marketplace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, customerId, productId }),
            });
            if (!res.ok) throw new Error('Action failed');
            await fetchData();
        } catch (err: any) {
            alert(`Failed: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Store size={20} />
                        FB Marketplace Bot
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {customers.length} customer{customers.length !== 1 ? 's' : ''} configured
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm transition-colors"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <SummaryCard
                    label="Active Customers"
                    value={customers.filter(c => c.status === 'ACTIVE').length}
                    total={customers.length}
                />
                <SummaryCard
                    label="Products Live"
                    value={customers.reduce((sum, c) => sum + c.products.filter(p => p.status === 'ACTIVE').length, 0)}
                    total={customers.reduce((sum, c) => sum + c.products.length, 0)}
                />
                <SummaryCard
                    label="Posts Today"
                    value={customers.reduce((sum, c) => sum + c.posts.today, 0)}
                />
                <SummaryCard
                    label="Failed Posts"
                    value={customers.reduce((sum, c) => sum + c.posts.failed, 0)}
                    alert={customers.reduce((sum, c) => sum + c.posts.failed, 0) > 0}
                />
            </div>

            {/* Customer List */}
            {customers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/20 p-12 text-center">
                    <Store className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No marketplace customers yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Customers will appear here when they sign up for the FB Bot service.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {customers.map((customer) => (
                        <CustomerCard
                            key={customer.id}
                            customer={customer}
                            actionLoading={actionLoading}
                            onAction={handleAction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function SummaryCard({ label, value, total, alert }: { label: string; value: number; total?: number; alert?: boolean }) {
    return (
        <div className={`rounded-xl border p-4 ${alert ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-400' : 'text-white'}`}>
                {value}
                {total !== undefined && <span className="text-sm text-gray-500 font-normal">/{total}</span>}
            </p>
        </div>
    );
}

function CustomerCard({
    customer,
    actionLoading,
    onAction,
}: {
    customer: MarketplaceCustomer;
    actionLoading: string | null;
    onAction: (action: string, customerId: string, productId?: string) => void;
}) {
    const isActive = customer.status === 'ACTIVE';
    const healthySessions = customer.sessions.filter(s => s.status === 'ACTIVE').length;
    const totalSessions = customer.sessions.length;

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            {/* Customer Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <div>
                        <h3 className="font-semibold">{customer.businessName}</h3>
                        <p className="text-xs text-gray-400">
                            {customer.user.email} · {customer.subscription}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        {customer.posts.total} posts total · {customer.posts.today} today
                    </span>
                    <button
                        onClick={() => onAction(isActive ? 'pause' : 'resume', customer.id)}
                        disabled={actionLoading !== null}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                                ? 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                                : 'bg-green-500/10 text-green-300 hover:bg-green-500/20'
                        }`}
                    >
                        {actionLoading === `${isActive ? 'pause' : 'resume'}-${customer.id}` ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : isActive ? (
                            <><Pause size={12} /> Pause</>
                        ) : (
                            <><Play size={12} /> Resume</>
                        )}
                    </button>
                </div>
            </div>

            {/* Products */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customer.products.map((product) => (
                        <div
                            key={product.id}
                            className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-gray-400" />
                                    <span className="text-sm font-medium">{product.name}</span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    product.status === 'ACTIVE'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-yellow-500/10 text-yellow-400'
                                }`}>
                                    {product.status}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 space-y-0.5">
                                <p>Type: {product.productType}</p>
                                {product.schedule && (
                                    <p>Limit: {(product.schedule as any).postLimit || '?'} posts/cycle, {(product.schedule as any).cooldownMinutes || '?'}min cooldown</p>
                                )}
                            </div>
                            <div className="mt-2 flex gap-1">
                                <button
                                    onClick={() => onAction(
                                        product.status === 'ACTIVE' ? 'pause' : 'resume',
                                        customer.id,
                                        product.id
                                    )}
                                    disabled={actionLoading !== null}
                                    className="text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    {product.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sessions */}
                {customer.sessions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <Globe size={12} />
                            GoLogin Sessions: {healthySessions}/{totalSessions} active
                        </div>
                        <div className="flex gap-2">
                            {customer.sessions.map((s) => (
                                <div
                                    key={s.id}
                                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                                        s.status === 'ACTIVE'
                                            ? 'bg-green-500/10 text-green-400'
                                            : s.status === 'EXPIRED'
                                                ? 'bg-red-500/10 text-red-400'
                                                : 'bg-yellow-500/10 text-yellow-400'
                                    }`}
                                >
                                    {s.status === 'ACTIVE' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                    {s.profileId.slice(0, 8)}
                                    {s.lastUsed && (
                                        <span className="text-gray-500 ml-1">
                                            {new Date(s.lastUsed).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {customer.products.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">No products configured</p>
                )}
            </div>
        </div>
    );
}
