'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Users,
    FolderOpen,
    BarChart3,
    Settings,
    Bell,
    Search,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    LogOut,
    Bot,
    Package,
    ShieldCheck,
    ChevronDown,
    Zap,
    LayoutDashboard,
    Rocket,
    Globe,
    ChevronRight,
    Star,
    MoreVertical,
    CheckCircle2,
    Activity
} from 'lucide-react';
import WorkflowManagement from '@/components/admin/WorkflowManagement';
import AIAgentManagement from '@/components/admin/AIAgentManagement';
import NewProductWizard from '@/components/admin/NewProductWizard';
import SupportQueue from '@/components/admin/SupportQueue';
import ClientCRM from '@/components/admin/ClientIntelligence';
import ClientManagement from '@/components/admin/ClientManagement';
import LaunchControlCenter from '@/components/admin/LaunchControlCenter';
import ProjectManagement from '@/components/admin/ProjectManagement';
import VaultManagement from '@/components/admin/VaultManagement';
import TreasuryManagement from '@/components/admin/TreasuryManagement';
import TerryAssistant from '@/components/admin/TerryAssistant';
import EcosystemMap from '@/components/admin/EcosystemMap';
import { Skeleton } from '@/components/ui/skeleton-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Template } from '@/types/firestore';
import { SupportCase } from '@/types/support';
import { NoiseTexture } from '@/components/ui/premium/NoiseTexture';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';

interface DashboardStats {
    revenue: { current: number; previous: number; change: string };
    projects: { active: number; completed: number; pending: number };
    clients: { total: number; new: number; active: number };
    invoices: { pending: number; overdue: number; total: number };
}

interface ActivityItem {
    id: string;
    type: string;
    action: string;
    time: string;
    status: 'success' | 'pending' | 'error' | 'warning';
}

interface SessionUser {
    name: string;
    email: string;
}

interface AdminDashboardClientProps {
    session: { user: SessionUser };
    stats: DashboardStats;
    recentActivity: ActivityItem[];
    products?: any[];
}

export default function AdminDashboardClient({
    session,
    stats,
    recentActivity,
    products = []
}: AdminDashboardClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            router.push('/login');
        }
    };

    const [supportCases, setSupportCases] = useState<SupportCase[]>([]);
    const [fetchingSupport, setFetchingSupport] = useState(false);
    const [liveStats, setLiveStats] = useState<DashboardStats | null>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    useEffect(() => {
        if (activeTab === 'support') {
            fetchSupportCases();
        }
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Financials for Stats
            const finRes = await fetch('/api/admin/financials');
            const finData = await finRes.json();

            // 2. Fetch Clients for Stats
            const clientRes = await fetch('/api/admin/clients');
            const clientData = await clientRes.json();

            // 3. Fetch Intelligence Feed
            const intelRes = await fetch('/api/admin/intelligence');
            const intelData = await intelRes.json();

            if (finData.success && clientData.clients) {
                const revenueMetric = finData.metrics.find((m: any) => m.label.includes('Gross'));

                setLiveStats({
                    revenue: {
                        current: revenueMetric?.value || 0,
                        previous: revenueMetric?.value * 0.9 || 0,
                        change: revenueMetric?.change || '0%'
                    },
                    projects: {
                        active: clientData.clients.filter((c: any) => c.status === 'active').length,
                        completed: 12, // Mocked 
                        pending: clientData.clients.filter((c: any) => c.status === 'onboarding').length
                    },
                    clients: {
                        total: clientData.clients.length,
                        new: clientData.clients.filter((c: any) => c.status === 'lead').length,
                        active: clientData.clients.filter((c: any) => c.status === 'active').length
                    },
                    invoices: { pending: 3, overdue: 1, total: 4 }
                });
            }

            if (intelData.success) {
                setRecommendations(intelData.recommendations);
            }
        } catch (error) {
            console.error('Failed to sync dashboard intelligence', error);
        }
    };

    const fetchSupportCases = async () => {
        try {
            setFetchingSupport(true);
            const response = await fetch('/api/support/list');
            const data = await response.json();
            if (data.success) {
                setSupportCases(data.cases);
            }
        } catch (error) {
            console.error('Failed to fetch support cases', error);
        } finally {
            setFetchingSupport(false);
        }
    };

    const handleApproveSupport = async (caseId: string) => {
        try {
            const response = await fetch('/api/support/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    status: 'resolved',
                    resolution: { approved: true }
                })
            });
            const data = await response.json();
            if (data.success) {
                fetchSupportCases(); // Refresh
            }
        } catch (error) {
            console.error('Failed to approve support case', error);
        }
    };

    const handleRejectSupport = async (caseId: string, feedback: string) => {
        try {
            const response = await fetch('/api/support/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    status: 'escalated',
                    resolution: { approved: false, feedback }
                })
            });
            const data = await response.json();
            if (data.success) {
                fetchSupportCases(); // Refresh
            }
        } catch (error) {
            console.error('Failed to reject support case', error);
        }
    };

    const quickActions = [
        {
            icon: Plus,
            label: 'New Project',
            action: () => router.push('/admin/projects'),
        },
        {
            icon: Users,
            label: 'Add Client',
            action: () => router.push('/admin/clients'),
        },
        {
            icon: DollarSign,
            label: 'Create Invoice',
            action: () => console.log('Create invoice'),
        },
        {
            icon: BarChart3,
            label: 'View Analytics',
            action: () => console.log('View analytics'),
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--rensto-bg-primary)' }}>
            <AnimatedGridBackground className="opacity-40" />
            <NoiseTexture opacity={0.02} />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/5 relative z-50">
                <div className="flex h-16 items-center justify-between px-6 sm:px-8">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <Image
                                src="/rensto-logo.webp"
                                alt="Rensto"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                            <h1 className="text-xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                Rensto Admin
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm placeholder:text-slate-600 transition-all w-64"
                            />
                        </div>
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#fe3d51] rounded-full shadow-[0_0_10px_rgba(254,61,81,0.5)]"></span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/5"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black uppercase tracking-widest text-xs">
                                    {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <span className="hidden md:block text-xs font-black uppercase tracking-widest">
                                    {session.user?.name.split(' ')[0]}
                                </span>
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-[#1a162f] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-2xl ring-1 ring-black/50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <p className="text-xs font-black uppercase tracking-widest text-white">
                                            {session.user?.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center w-full px-4 py-2.5 text-left hover:bg-[#fe3d51]/10 text-slate-400 hover:text-[#fe3d51] text-xs font-black uppercase tracking-widest transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex relative z-10">
                {/* Sidebar */}
                <aside className="w-66 border-r border-white/5 min-h-[calc(100vh-64px)] bg-black/40 backdrop-blur-2xl">
                    <nav className="p-4 space-y-1">
                        <ul className="space-y-1">
                            {[
                                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                                { id: 'ecosystem', label: 'Ecosystem Map', icon: Activity },
                                { id: 'crm', label: 'Client CRM', icon: Users },
                                { id: 'projects', label: 'Projects', icon: FolderOpen },
                                { id: 'landing', label: 'Landing Content', icon: Globe },
                                { id: 'factory', label: 'Product Factory', icon: Package },
                                { id: 'vault', label: 'Vault & Infra', icon: ShieldCheck },
                                { id: 'treasury', label: 'Treasury', icon: DollarSign },
                                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                                { id: 'workflows', label: 'Workflows', icon: Settings },
                                { id: 'agents', label: 'AI Agents', icon: Bot },
                                { id: 'support', label: 'Support Queue', icon: ShieldCheck },
                                { id: 'launch', label: 'Launch Control', icon: Rocket },
                                { id: 'settings', label: 'Settings', icon: Settings },
                            ].map(item => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all border group ${activeTab === item.id
                                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                        <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-64px)]">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'overview' && (
                            <div className="space-y-12">
                                {/* Page Header */}
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                                        Dashboard Overview
                                    </h2>
                                    <p className="text-slate-400 font-medium">
                                        Welcome back! Here&apos;s a high-level view of your business intelligence.
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                {(() => {
                                    const displayStats = liveStats || stats;
                                    const statsList = [
                                        { label: 'Monthly Revenue', value: `$${displayStats.revenue.current.toLocaleString()}`, change: displayStats.revenue.change, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
                                        { label: 'Active Projects', value: displayStats.projects.active, sub: `${displayStats.projects.completed} completed`, icon: FolderOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                        { label: 'Total Clients', value: displayStats.clients.total, sub: `${displayStats.clients.new} new this month`, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                                        { label: 'Pending Invoices', value: displayStats.invoices.pending, sub: `${displayStats.invoices.overdue} overdue`, icon: Clock, color: 'text-red-400', bg: 'bg-[#fe3d51]/10' },
                                    ];

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {statsList.map((stat, i) => (
                                                <div key={i} className="group relative p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent blur-3xl rounded-full" />
                                                    <div className="relative z-10 space-y-4">
                                                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</p>
                                                            <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                                                        </div>
                                                        {stat.change && (
                                                            <p className="text-xs text-green-400 font-bold flex items-center">
                                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                                {stat.change}
                                                            </p>
                                                        )}
                                                        {stat.sub && (
                                                            <p className="text-xs text-slate-500 font-medium">{stat.sub}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}

                                {/* Quick Actions */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                                        Quick Operations
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {quickActions.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={action.action}
                                                className="group relative p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all text-center flex flex-col items-center space-y-4"
                                            >
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-cyan-500/20">
                                                    <action.icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                                                    {action.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Recent Activity */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                                                Intelligence Log
                                            </h3>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">View All Logs</button>
                                        </div>
                                        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                                            <div className="divide-y divide-white/5">
                                                {recommendations.length > 0 ? recommendations.map(rec => (
                                                    <div
                                                        key={rec.id}
                                                        className="flex items-center space-x-4 p-6 hover:bg-white/[0.02] transition-colors group"
                                                    >
                                                        <div
                                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${rec.priority === 'high' ? 'bg-red-500/10' : 'bg-cyan-500/10'}`}
                                                        >
                                                            {rec.type === 'optimization' ? <Zap className={`w-6 h-6 ${rec.priority === 'high' ? 'text-red-500' : 'text-cyan-400'}`} /> : <Bot className="w-6 h-6 text-purple-400" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-black uppercase tracking-tight text-white/90">
                                                                {rec.title}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-1 font-medium">{rec.message}</p>
                                                        </div>
                                                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest px-4">
                                                            {rec.action}
                                                        </Button>
                                                    </div>
                                                )) : recentActivity.slice(0, 3).map(activity => (
                                                    <div
                                                        key={activity.id}
                                                        className="flex items-center space-x-4 p-5 hover:bg-white/[0.02] transition-colors group"
                                                    >
                                                        <div
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${activity.status === 'success' ? 'bg-green-500/10' :
                                                                activity.status === 'error' ? 'bg-red-500/10' :
                                                                    activity.status === 'warning' ? 'bg-yellow-500/10' :
                                                                        'bg-cyan-500/10'
                                                                }`}
                                                        >
                                                            {activity.status === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                                                                activity.status === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                                                                    activity.status === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-500" /> :
                                                                        <Clock className="w-5 h-5 text-cyan-400" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-black uppercase tracking-tight text-white/90">
                                                                {activity.action}
                                                            </p>
                                                            <div className="flex items-center space-x-3 mt-1">
                                                                <span className="text-[10px] text-slate-500 font-medium">{activity.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Health / Right Panel */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                                            Network Status
                                        </h3>
                                        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Uptime</span>
                                                    <span className="text-xs font-black text-cyan-400">99.99%</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500 w-[99.99%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Latency</p>
                                                    <p className="text-lg font-black text-white">42ms</p>
                                                </div>
                                                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Crashes</p>
                                                    <p className="text-lg font-black text-white">0</p>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                                    Run System Audit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'ecosystem' && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                                            Ecosystem Intelligence
                                        </h2>
                                        <p className="text-slate-400 font-medium">Real-time hierarchy of Rensto autonomous agents and product pillars.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="px-5 py-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                            Active Cluster
                                        </div>
                                    </div>
                                </div>
                                <EcosystemMap products={products} />
                            </div>
                        )}
                        {activeTab === 'crm' && (
                            <ClientCRM />
                        )}
                        {activeTab === 'landing' && (
                            <ClientManagement />
                        )}
                        {activeTab === 'projects' && (
                            <ProjectManagement />
                        )}
                        {activeTab === 'workflows' && (
                            <WorkflowManagement products={products} />
                        )}
                        {activeTab === 'agents' && (
                            <AIAgentManagement products={products} />
                        )}
                        {activeTab === 'factory' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                                        Product Factory
                                    </h2>
                                    <p className="text-slate-400 font-medium">Create and deploy new automation products to the marketplace.</p>
                                </div>
                                <NewProductWizard />
                            </div>
                        )}
                        {activeTab === 'support' && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                                            Support Operations
                                        </h2>
                                        <p className="text-slate-400 mt-1 font-medium">Monitor and approve autonomous agent fixes.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 min-w-[140px] text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Active Agents</p>
                                            <p className="text-2xl font-black text-white">4</p>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 min-w-[140px] text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Avg Fix Time</p>
                                            <p className="text-2xl font-black text-cyan-400">12m</p>
                                        </div>
                                    </div>
                                </div>
                                {fetchingSupport ? (
                                    <div className="flex flex-col items-center justify-center p-24 space-y-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Syncing CRM Status...</p>
                                    </div>
                                ) : (
                                    <SupportQueue
                                        cases={supportCases}
                                        onApprove={handleApproveSupport}
                                        onReject={handleRejectSupport}
                                    />
                                )}
                            </div>
                        )}
                        {activeTab === 'launch' && (
                            <LaunchControlCenter />
                        )}
                        {activeTab === 'vault' && (
                            <VaultManagement />
                        )}
                        {activeTab === 'treasury' && (
                            <TreasuryManagement />
                        )}
                    </div>
                </main>
            </div>

            {/* Terry Assistant Global */}
            <TerryAssistant
                userId={session.user.email}
                userName={session.user.name}
                currentTab={activeTab}
            />
        </div>
    );
}
