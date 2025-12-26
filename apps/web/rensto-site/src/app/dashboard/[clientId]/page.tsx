'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    LayoutDashboard,
    CheckCircle2,
    Clock,
    FileText,
    Upload,
    MessageSquare,
    CreditCard,
    TrendingUp,
    Package,
    Calendar,
    ExternalLink,
    Loader2,
    ChevronRight,
    AlertCircle,
    Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';

// Types
interface Deliverable {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'review' | 'completed';
    dueDate?: string;
    notes?: string;
}

interface Invoice {
    id: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    date: string;
    description: string;
}

interface ProjectData {
    clientName: string;
    packageName: string;
    startDate: string;
    status: 'discovery' | 'build' | 'review' | 'launch' | 'maintenance';
    progress: number;
    deliverables: Deliverable[];
    invoices: Invoice[];
    llmUsage: {
        tokensUsed: number;
        tokensLimit: number;
        lastReset: string;
    };
    id?: string;
}

export default function ClientDashboard() {
    const params = useParams();
    const clientId = params.clientId as string;
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<ProjectData | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'deliverables' | 'invoices' | 'usage' | 'agent'>('overview');
    const [error, setError] = useState<string | null>(null);

    // Mock deliverables and invoices for now (until we persist these in DB)
    // Eventually these should come from the Client object deliverables array
    const DEFAULT_DELIVERABLES: Deliverable[] = [
        { id: '1', name: 'Discovery & Requirements', status: 'completed' },
        { id: '2', name: 'CRM Integration Setup', status: 'in_progress' },
        { id: '3', name: 'Lead Qualification Bot', status: 'pending' },
        { id: '4', name: 'Email Automation Flows', status: 'pending' },
        { id: '5', name: 'Dashboard & Analytics', status: 'pending' },
        { id: '6', name: 'Training & Handoff', status: 'pending' },
    ];

    // Fallback ID for invoices if none exist
    const generateInvoiceId = () => Math.random().toString(36).substring(7);

    const fetchClientData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/clients?clientId=${clientId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Client not found');
                } else {
                    setError('Failed to load project data');
                }
                setProject(null);
                return;
            }

            const data = await response.json();
            if (data.success && data.client) {
                const client = data.client;

                // Map API data to Dashboard ProjectData structure
                // Use data from DB if available, otherwise defaults
                const mappedProject: ProjectData = {
                    id: client.id,
                    clientName: client.name || 'Valued Client',
                    packageName: client.selectedTier ? `${client.selectedTier.charAt(0).toUpperCase() + client.selectedTier.slice(1)} Package` : 'Custom Solution',
                    startDate: client.createdAt ? new Date(client.createdAt._seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
                    status: client.contractStatus === 'signed' ? 'build' : 'discovery',
                    progress: client.qualificationScore ? Math.min(client.qualificationScore, 100) : 15, // Use score as proxy for progress for now
                    deliverables: client.deliverables || DEFAULT_DELIVERABLES,
                    invoices: client.amountPaid ? [
                        {
                            id: generateInvoiceId(),
                            amount: client.amountPaid,
                            status: 'paid',
                            date: client.createdAt ? new Date(client.createdAt._seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
                            description: 'Initial Payment'
                        }
                    ] : [],
                    llmUsage: {
                        tokensUsed: 0,
                        tokensLimit: 500000,
                        lastReset: new Date().toLocaleDateString(),
                    },
                };

                setProject(mappedProject);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching client:', err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        if (clientId) {
            fetchClientData();
        }
    }, [clientId, fetchClientData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'paid':
                return 'var(--rensto-cyan)';
            case 'in_progress':
            case 'pending':
                return 'var(--rensto-orange)';
            case 'review':
                return 'var(--rensto-blue)';
            case 'overdue':
                return 'var(--rensto-primary)';
            default:
                return 'var(--rensto-text-muted)';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--rensto-bg-primary)' }}
            >
                <div>
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--rensto-cyan)' }} />
                    <p style={{ color: 'var(--rensto-text-muted)' }}>Loading Project Data...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--rensto-bg-primary)' }}
            >
                <div className="text-center p-8 max-w-md rounded-2xl border border-white/10" style={{ backgroundColor: 'var(--rensto-bg-card)' }}>
                    <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--rensto-primary)' }} />
                    <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                        {error || 'Project Not Found'}
                    </h1>
                    <p style={{ color: 'var(--rensto-text-secondary)' }} className="mb-6">
                        We couldn't load the project data for ID: <span className="font-mono text-sm bg-white/10 px-2 py-1 rounded">{clientId}</span>
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="renstoSecondary"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const completedDeliverables = project.deliverables.filter(d => d.status === 'completed').length;

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: 'var(--rensto-bg-primary)' }}
        >
            {/* Header */}
            <header
                className="border-b px-8 py-6"
                style={{
                    backgroundColor: 'var(--rensto-bg-card)',
                    borderColor: 'var(--rensto-bg-secondary)'
                }}
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <p
                            className="text-sm mb-1"
                            style={{ color: 'var(--rensto-text-muted)' }}
                        >
                            Client Dashboard
                        </p>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: 'var(--rensto-text-primary)' }}
                        >
                            {project.clientName}
                        </h1>
                    </div>
                    <div
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: 'rgba(95, 251, 253, 0.1)',
                            color: 'var(--rensto-cyan)',
                            border: '1px solid var(--rensto-cyan)'
                        }}
                    >
                        {project.packageName}
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'agent', label: 'Agent Hub', icon: Bot },
                        { id: 'deliverables', label: 'Deliverables', icon: Package },
                        { id: 'invoices', label: 'Invoices', icon: CreditCard },
                        { id: 'usage', label: 'LLM Usage', icon: TrendingUp },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
                            style={{
                                backgroundColor: activeTab === tab.id ? 'var(--rensto-bg-secondary)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--rensto-cyan)' : 'var(--rensto-text-muted)',
                                border: activeTab === tab.id ? '1px solid var(--rensto-cyan)' : '1px solid transparent'
                            }}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Progress Card */}
                        <div
                            className="rounded-xl p-6"
                            style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2
                                    className="text-lg font-bold"
                                    style={{ color: 'var(--rensto-text-primary)' }}
                                >
                                    Project Progress
                                </h2>
                                <span
                                    className="text-2xl font-bold"
                                    style={{ color: 'var(--rensto-cyan)' }}
                                >
                                    {project.progress}%
                                </span>
                            </div>
                            <div
                                className="h-3 rounded-full overflow-hidden"
                                style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${project.progress}%`,
                                        background: 'var(--rensto-gradient-secondary)'
                                    }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                                    Started: {project.startDate}
                                </span>
                                <span style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                                    {completedDeliverables}/{project.deliverables.length} deliverables complete
                                </span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div
                                className="rounded-xl p-5"
                                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(95, 251, 253, 0.2)' }}
                                    >
                                        <Package className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                                    </div>
                                    <span style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                                        Status
                                    </span>
                                </div>
                                <p
                                    className="text-xl font-bold capitalize"
                                    style={{ color: 'var(--rensto-text-primary)' }}
                                >
                                    {project.status.replace('_', ' ')}
                                </p>
                            </div>

                            <div
                                className="rounded-xl p-5"
                                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(95, 251, 253, 0.2)' }}
                                    >
                                        <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                                    </div>
                                    <span style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                                        Completed
                                    </span>
                                </div>
                                <p
                                    className="text-xl font-bold"
                                    style={{ color: 'var(--rensto-text-primary)' }}
                                >
                                    {completedDeliverables} of {project.deliverables.length}
                                </p>
                            </div>

                            <div
                                className="rounded-xl p-5"
                                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(95, 251, 253, 0.2)' }}
                                    >
                                        <TrendingUp className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                                    </div>
                                    <span style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                                        LLM Usage
                                    </span>
                                </div>
                                <p
                                    className="text-xl font-bold"
                                    style={{ color: 'var(--rensto-text-primary)' }}
                                >
                                    {Math.round((project.llmUsage.tokensUsed / project.llmUsage.tokensLimit) * 100)}%
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div
                            className="rounded-xl p-6"
                            style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                        >
                            <h2
                                className="text-lg font-bold mb-4"
                                style={{ color: 'var(--rensto-text-primary)' }}
                            >
                                Quick Actions
                            </h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                <a
                                    href="https://tidycal.com/rensto/custom-support"
                                    target="_blank"
                                    className="flex items-center justify-between p-4 rounded-lg transition-all hover:opacity-80"
                                    style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                                        <span style={{ color: 'var(--rensto-text-primary)' }}>Schedule Support Call</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4" style={{ color: 'var(--rensto-text-muted)' }} />
                                </a>
                                <a
                                    href="mailto:support@rensto.com"
                                    className="flex items-center justify-between p-4 rounded-lg transition-all hover:opacity-80"
                                    style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                                        <span style={{ color: 'var(--rensto-text-primary)' }}>Contact Support</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4" style={{ color: 'var(--rensto-text-muted)' }} />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Agent / Chat Hub Tab */}
                {activeTab === 'agent' && (
                    <div className="rounded-xl p-6 min-h-[500px] flex flex-col items-center justify-center text-center"
                        style={{ backgroundColor: 'var(--rensto-bg-card)' }}>
                        <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
                            <Bot className="w-10 h-10" style={{ color: 'var(--rensto-cyan)' }} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                            Chat Hub (Beta)
                        </h2>
                        <p className="max-w-md text-lg mb-8" style={{ color: 'var(--rensto-text-secondary)' }}>
                            Test your deployed agents directly in the dashboard. This feature connects to your active n8n workflows.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 mb-6">
                            <Clock className="w-4 h-4" />
                            <span>Awaiting Workflow Connection</span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                            Your configuration is currently compiling. Check back in 10-15 minutes or schedule a call.
                        </p>
                    </div>
                )}

                {/* Deliverables Tab */}
                {activeTab === 'deliverables' && (
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                    >
                        {project.deliverables.map((deliverable, i) => (
                            <div
                                key={deliverable.id}
                                className="flex items-center justify-between p-5 border-b last:border-b-0"
                                style={{ borderColor: 'var(--rensto-bg-secondary)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{
                                            backgroundColor: deliverable.status === 'completed'
                                                ? 'rgba(95, 251, 253, 0.2)'
                                                : 'var(--rensto-bg-secondary)'
                                        }}
                                    >
                                        {deliverable.status === 'completed' ? (
                                            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--rensto-cyan)' }} />
                                        ) : (
                                            <span
                                                className="text-sm font-bold"
                                                style={{ color: 'var(--rensto-text-muted)' }}
                                            >
                                                {i + 1}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p
                                            className="font-medium"
                                            style={{ color: 'var(--rensto-text-primary)' }}
                                        >
                                            {deliverable.name}
                                        </p>
                                        {deliverable.dueDate && (
                                            <p
                                                className="text-sm flex items-center gap-1"
                                                style={{ color: 'var(--rensto-text-muted)' }}
                                            >
                                                <Clock className="w-3 h-3" />
                                                Due: {deliverable.dueDate}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                                    style={{
                                        backgroundColor: `${getStatusColor(deliverable.status)}20`,
                                        color: getStatusColor(deliverable.status)
                                    }}
                                >
                                    {deliverable.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Invoices Tab */}
                {activeTab === 'invoices' && (
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                    >
                        {project.invoices.length > 0 ? (
                            project.invoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-5 border-b last:border-b-0"
                                    style={{ borderColor: 'var(--rensto-bg-secondary)' }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                                        >
                                            <FileText className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                                        </div>
                                        <div>
                                            <p
                                                className="font-medium"
                                                style={{ color: 'var(--rensto-text-primary)' }}
                                            >
                                                {invoice.description}
                                            </p>
                                            <p
                                                className="text-sm"
                                                style={{ color: 'var(--rensto-text-muted)' }}
                                            >
                                                {invoice.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className="font-bold"
                                            style={{ color: 'var(--rensto-text-primary)' }}
                                        >
                                            {formatCurrency(invoice.amount)}
                                        </p>
                                        <span
                                            className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                                            style={{
                                                backgroundColor: `${getStatusColor(invoice.status)}20`,
                                                color: getStatusColor(invoice.status)
                                            }}
                                        >
                                            {invoice.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No invoices found.
                            </div>
                        )}
                    </div>
                )}

                {/* Usage Tab */}
                {activeTab === 'usage' && (
                    <div
                        className="rounded-xl p-6"
                        style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                    >
                        <h2
                            className="text-lg font-bold mb-6"
                            style={{ color: 'var(--rensto-text-primary)' }}
                        >
                            LLM Token Usage
                        </h2>

                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <span style={{ color: 'var(--rensto-text-secondary)' }}>
                                    {project.llmUsage.tokensUsed.toLocaleString()} / {project.llmUsage.tokensLimit.toLocaleString()} tokens
                                </span>
                                <span
                                    className="font-bold"
                                    style={{ color: 'var(--rensto-cyan)' }}
                                >
                                    {Math.round((project.llmUsage.tokensUsed / project.llmUsage.tokensLimit) * 100)}%
                                </span>
                            </div>
                            <div
                                className="h-4 rounded-full overflow-hidden"
                                style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${(project.llmUsage.tokensUsed / project.llmUsage.tokensLimit) * 100}%`,
                                        background: 'var(--rensto-gradient-secondary)'
                                    }}
                                />
                            </div>
                            <p
                                className="text-sm mt-2"
                                style={{ color: 'var(--rensto-text-muted)' }}
                            >
                                Resets on: {project.llmUsage.lastReset}
                            </p>
                        </div>

                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor: 'rgba(95, 251, 253, 0.1)',
                                border: '1px solid var(--rensto-cyan)'
                            }}
                        >
                            <p
                                className="text-sm"
                                style={{ color: 'var(--rensto-cyan)' }}
                            >
                                💡 Need more tokens? Contact us to upgrade your plan.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
