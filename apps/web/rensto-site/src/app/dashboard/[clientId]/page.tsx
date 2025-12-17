'use client';

import React, { useState, useEffect } from 'react';
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
    AlertCircle
} from 'lucide-react';

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
}

// Mock data for demo purposes
const MOCK_PROJECT: ProjectData = {
    clientName: 'Demo Client',
    packageName: 'Professional',
    startDate: '2024-01-15',
    status: 'build',
    progress: 45,
    deliverables: [
        { id: '1', name: 'Discovery & Requirements', status: 'completed' },
        { id: '2', name: 'CRM Integration Setup', status: 'completed' },
        { id: '3', name: 'Lead Qualification Bot', status: 'in_progress' },
        { id: '4', name: 'Email Automation Flows', status: 'pending', dueDate: '2024-02-01' },
        { id: '5', name: 'Dashboard & Analytics', status: 'pending', dueDate: '2024-02-15' },
        { id: '6', name: 'Training & Handoff', status: 'pending', dueDate: '2024-02-20' },
    ],
    invoices: [
        { id: 'inv-001', amount: 4997, status: 'paid', date: '2024-01-15', description: 'Professional Package - Initial Payment' },
        { id: 'inv-002', amount: 147, status: 'pending', date: '2024-02-15', description: 'Monthly Maintenance - February' },
    ],
    llmUsage: {
        tokensUsed: 125000,
        tokensLimit: 500000,
        lastReset: '2024-02-01',
    },
};

export default function ClientDashboard() {
    const params = useParams();
    const clientId = params.clientId as string;
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<ProjectData | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'deliverables' | 'invoices' | 'usage'>('overview');

    useEffect(() => {
        // In real implementation, fetch from API
        // For now, use mock data
        setTimeout(() => {
            setProject(MOCK_PROJECT);
            setLoading(false);
        }, 500);
    }, [clientId]);

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
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--rensto-cyan)' }} />
            </div>
        );
    }

    if (!project) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--rensto-bg-primary)' }}
            >
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--rensto-primary)' }} />
                    <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                        Project Not Found
                    </h1>
                    <p style={{ color: 'var(--rensto-text-secondary)' }}>
                        Please check your access link or contact support.
                    </p>
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
                        {project.packageName} Package
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
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
                        {project.invoices.map((invoice) => (
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
                        ))}
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
