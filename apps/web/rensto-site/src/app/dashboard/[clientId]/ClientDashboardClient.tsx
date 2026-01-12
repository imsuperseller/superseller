'use client';

import React, { useState } from 'react';
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
    Bot,
    Sparkles,
    Zap,
    Users,
    Send,
    Phone,
    Lock,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Progress } from '@/components/ui/progress';
import { UserEntitlements, getVisibleTabs, DashboardTabConfig } from '@/types/entitlements';
import LeadsTab, { Lead } from '@/components/dashboard/LeadsTab';
import OutreachTab, { Campaign } from '@/components/dashboard/OutreachTab';
import SecretaryTab, { CallLog, SecretaryConfig, WhatsAppThread, Booking } from '@/components/dashboard/SecretaryTab';
import ContentTab, { ContentItem } from '@/components/dashboard/ContentTab';
import KnowledgeTab, { IndexedDocument, KnowledgeStats } from '@/components/dashboard/KnowledgeTab';
import { BundleUpsell } from '@/components/dashboard/UpsellComponents';
import { ImpersonationBanner, useImpersonation } from '@/components/dashboard/ImpersonationBanner';

// Types
export interface Deliverable {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'review' | 'completed';
    dueDate?: string;
    notes?: string;
}

export interface Invoice {
    id: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    date: string;
    description: string;
}

export interface ProjectData {
    clientName: string;
    packageName: string;
    startDate: string;
    status: 'discovery' | 'build' | 'review' | 'launch' | 'maintenance' | 'paid' | 'onboarding';
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

interface ClientDashboardClientProps {
    project: ProjectData;
    entitlements?: UserEntitlements;
    leads?: Lead[];
    outreachData?: { campaigns: Campaign[] };
    voiceData?: {
        callLogs: CallLog[],
        whatsappThreads?: WhatsAppThread[],
        bookings?: Booking[],
        config?: SecretaryConfig
    };
    contentItems?: ContentItem[];
    knowledgeData?: {
        documents: IndexedDocument[];
        stats?: KnowledgeStats;
    };
    usageData?: {
        tokenUsage: { used: number; limit: number; resetDate: string };
        volume: { totalRuns: number; successRate: number; trend: string };
        billing: { estimatedCost: number; currency: string; nextInvoiceDate: string };
    };
    purchasedProducts?: Array<{
        id: string;
        productId: string;
        name: string;
        purchaseDate: string;
        status: string;
        lastUsed: string;
    }>;
}

export default function ClientDashboardClient({
    project,
    entitlements,
    leads = [],
    outreachData = { campaigns: [] },
    voiceData = { callLogs: [] },
    contentItems = [],
    knowledgeData,
    usageData,
    purchasedProducts = []
}: ClientDashboardClientProps) {
    // Determine visible tabs based on real entitlements
    const userEntitlements: UserEntitlements = entitlements || {
        freeLeadsTrial: false,
        pillars: [],
        marketplaceProducts: [],
        customSolution: project ? { projectId: project.id || '', status: project.status as any, packageName: project.packageName } : null
    };
    const visibleTabs = getVisibleTabs(userEntitlements);

    const [activeTab, setActiveTab] = useState<string>('overview');

    // Check if admin is impersonating
    const { isImpersonating, clientInfo, exitImpersonation } = useImpersonation();

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

    const completedDeliverables = project.deliverables.filter(d => d.status === 'completed').length;

    const handleUpgradeClick = (service: string) => {
        window.location.href = `/pricing?upgrade=${service}`;
    };

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: 'var(--rensto-bg-primary)' }}
        >
            {/* Impersonation Banner */}
            {isImpersonating && clientInfo && (
                <ImpersonationBanner
                    clientName={clientInfo.name}
                    clientEmail={clientInfo.email}
                    onExit={exitImpersonation}
                />
            )}

            {/* Header */}
            <header
                className={`border-b px-8 py-6 ${isImpersonating ? 'mt-12' : ''}`}
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
                    {visibleTabs.filter(tab => tab.visible).map(tab => {
                        const IconMap: Record<string, any> = {
                            LayoutDashboard, Bot, Package, CreditCard, TrendingUp,
                            Users, Send, Phone, FileText, Briefcase
                        };
                        const TabIcon = IconMap[tab.icon] || LayoutDashboard;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => !tab.locked && setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${tab.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{
                                    backgroundColor: activeTab === tab.id ? 'var(--rensto-bg-secondary)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--rensto-cyan)' : 'var(--rensto-text-muted)',
                                    border: activeTab === tab.id ? '1px solid var(--rensto-cyan)' : '1px solid transparent'
                                }}
                                title={tab.locked ? tab.upsellMessage : undefined}
                            >
                                {tab.locked && <Lock className="w-3 h-3" />}
                                <TabIcon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
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

                        {/* AI Opportunity Radar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-xl p-6 border border-white/5 relative overflow-hidden group bg-gradient-to-br from-[#1a1438] to-[#110d28]">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Sparkles className="w-24 h-24 text-[#fe3d51]" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                    <span className="p-2 bg-[#fe3d51]/20 rounded-lg"><Zap className="w-5 h-5 text-[#fe3d51]" /></span>
                                    AI Opportunity Radar
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    <p className="text-gray-400 text-sm">Targeted upgrades to maximize your automation ROI.</p>
                                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-[#fe3d51]/30 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-white">Customer Support AI</span>
                                            <span className="text-xs text-[#5ffbfd] font-bold">+85% Efficiency</span>
                                        </div>
                                        <Progress value={85} className="h-1.5" />
                                    </div>
                                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-[#1eaef7]/30 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-white">Automated Outreach</span>
                                            <span className="text-xs text-[#1eaef7] font-bold">+300% Leads</span>
                                        </div>
                                        <Progress value={70} className="h-1.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Marketplace Hot Picks */}
                            <div className="rounded-xl p-6 border border-white/5 group bg-gradient-to-br from-[#1a1438] to-[#110d28]">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                    <span className="p-2 bg-[#1eaef7]/20 rounded-lg"><Package className="w-5 h-5 text-[#1eaef7]" /></span>
                                    Marketplace Hot Picks
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: '1', category: 'Sales', name: 'Lead Qualifier Pro', price: 199 },
                                        { id: '2', category: 'Support', name: 'Auto-Responder 2.0', price: 149 },
                                        { id: '3', category: 'Ops', name: 'Invoice Generator', price: 99 },
                                        { id: '4', category: 'Marketing', name: 'Social Scheduler', price: 299 }
                                    ].map(item => (
                                        <div key={item.id} className="bg-black/20 rounded-xl p-3 border border-white/5 hover:scale-[1.02] transition-transform cursor-pointer">
                                            <div className="text-[10px] text-[#5ffbfd] font-bold uppercase mb-1">{item.category}</div>
                                            <div className="text-xs font-bold line-clamp-1 text-white">{item.name}</div>
                                            <div className="mt-2 text-[10px] text-gray-400 font-medium">Starting at ${item.price}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Stats Grid */}
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
                                        <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--rensto-cyan)' }} />
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
                                    href="/contact?type=support"
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

                {/* Leads Tab */}
                {activeTab === 'leads' && (
                    <LeadsTab
                        leads={leads}
                        isFreeTrialUser={userEntitlements.freeLeadsTrial && !userEntitlements.pillars.includes('leads')}
                        freeLeadsRemaining={userEntitlements.freeLeadsRemaining}
                        onUpgradeClick={() => handleUpgradeClick('leads')}
                    />
                )}

                {/* Outreach Tab */}
                {activeTab === 'outreach' && (
                    <OutreachTab
                        campaigns={outreachData.campaigns}
                        isLocked={!userEntitlements.pillars.includes('outreach')}
                        onUpgradeClick={() => handleUpgradeClick('outreach')}
                    />
                )}

                {/* Autonomous Secretary Tab */}
                {activeTab === 'voice' && (
                    <SecretaryTab
                        callLogs={voiceData.callLogs}
                        whatsappThreads={voiceData.whatsappThreads}
                        bookings={voiceData.bookings}
                        config={voiceData.config}
                        isLocked={!userEntitlements.pillars.includes('voice')}
                        onUpgradeClick={() => handleUpgradeClick('voice')}
                        clientId={project.id || ''}
                    />
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                    <ContentTab
                        content={contentItems}
                        isLocked={!userEntitlements.pillars.includes('content')}
                        onUpgradeClick={() => handleUpgradeClick('content')}
                    />
                )}

                {/* Knowledge Tab */}
                {activeTab === 'knowledge' && (
                    <KnowledgeTab
                        documents={knowledgeData?.documents || []}
                        stats={knowledgeData?.stats}
                        isLocked={!userEntitlements.pillars.includes('knowledge')}
                        onUpgradeClick={() => handleUpgradeClick('knowledge')}
                    />
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
                        {(project.status === 'onboarding' || project.status === 'paid') && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 mb-6">
                                <Clock className="w-4 h-4" />
                                <span>Awaiting Workflow Connection</span>
                            </div>
                        )}
                        <p className="text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                            {project.status === 'onboarding' || project.status === 'paid'
                                ? 'Your configuration is currently compiling. Check back in 10-15 minutes or schedule a call.'
                                : 'Connect your first automation to see live performance data here.'}
                        </p>
                    </div>
                )}

                {/* Bundle Upsell */}
                {activeTab !== 'overview' && userEntitlements.pillars.length < 4 && (
                    <div className="mt-8">
                        <BundleUpsell
                            ownedServices={userEntitlements.pillars}
                            onUpgrade={() => handleUpgradeClick('bundle')}
                        />
                    </div>
                )}

                {/* Deliverables Tab */}
                {activeTab === 'deliverables' && (
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                    >
                        {project.deliverables.length > 0 ? (
                            project.deliverables.map((deliverable, i) => (
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
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400">No deliverables yet</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Your project roadmap will appear here once the discovery phase is complete.
                                </p>
                            </div>
                        )}
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
                            <div className="p-12 text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No invoices found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* My Products Tab */}
                {activeTab === 'products' && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {purchasedProducts.length > 0 ? (
                            purchasedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="rounded-xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all group"
                                    style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                            <Package className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded">
                                                {product.status}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Purchased on: {product.purchaseDate}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Last used: {product.lastUsed}
                                        </span>
                                        <Button
                                            variant="renstoSecondary"
                                            size="sm"
                                            onClick={() => window.location.href = `/marketplace/${product.productId}`}
                                        >
                                            Launch <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-12 text-center" style={{ backgroundColor: 'var(--rensto-bg-card)' }}>
                                <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400">You haven't purchased any marketplace products yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Usage Tab */}
                {activeTab === 'usage' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="rounded-xl p-6 border border-white/5 bg-[#1a1438]/40">
                                <div className="flex items-center gap-2 mb-4 text-gray-400">
                                    <Zap className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm">Total Runs</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-white">{usageData?.volume.totalRuns || 0}</span>
                                    <span className="text-xs text-green-400 font-medium mb-1">{usageData?.volume.trend}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Operations across all pillars</p>
                            </div>

                            <div className="rounded-xl p-6 border border-white/5 bg-[#1a1438]/40">
                                <div className="flex items-center gap-2 mb-4 text-gray-400">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="text-sm">Success Rate</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{usageData?.volume.successRate || 0}%</div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${usageData?.volume.successRate || 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl p-6 border border-white/5 bg-[#1a1438]/40">
                                <div className="flex items-center gap-2 mb-4 text-gray-400">
                                    <CreditCard className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm">Estimated Cost</span>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {usageData?.billing.currency === 'USD' ? '$' : ''}{usageData?.billing.estimatedCost || 0}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Next invoice: {usageData?.billing.nextInvoiceDate}</p>
                            </div>
                        </div>

                        {/* Token Usage Block */}
                        <div
                            className="rounded-xl p-6"
                            style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                        >
                            <h3 className="text-lg font-bold text-white mb-6">LLM Token Usage</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm text-gray-400">Monthly Allowance</p>
                                        <p className="text-xl font-bold text-white">
                                            {(usageData?.tokenUsage.used || 0).toLocaleString()} / {(usageData?.tokenUsage.limit || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-cyan-400">
                                            {usageData ? Math.round((usageData.tokenUsage.used / usageData.tokenUsage.limit) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                <div className="h-4 rounded-full overflow-hidden bg-white/5">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${usageData ? (usageData.tokenUsage.used / usageData.tokenUsage.limit) * 100 : 0}%`,
                                            background: 'var(--rensto-gradient-secondary)'
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>Usage resets on {usageData?.tokenUsage.resetDate}</span>
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Automatic top-up enabled
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <p className="text-sm text-cyan-400">
                                    💡 <strong>Pro Tip:</strong> Your average token efficiency increased by 14% this month by switching to quantized models.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


