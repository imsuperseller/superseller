'use client';

import { useState } from 'react';
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
    Package
} from 'lucide-react';
import WorkflowManagement from '@/components/admin/WorkflowManagement';
import AIAgentManagement from '@/components/admin/AIAgentManagement';
import NewProductWizard from '@/components/admin/NewProductWizard';
import { Template } from '@/lib/firebase';

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
    templates?: Template[];
}

export default function AdminDashboardClient({
    session,
    stats,
    recentActivity,
    templates = []
}: AdminDashboardClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            router.push('/login');
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
        <div className="min-h-screen" style={{ background: 'var(--rensto-bg-primary)' }}>
            {/* Header */}
            <header className="border-b px-6 py-4" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <Image
                                src="/rensto-logo.webp"
                                alt="Rensto - AI-Powered Business Automation"
                                width={32}
                                height={32}
                                className="rounded-lg"
                            />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                                Rensto Admin
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <button className="relative p-2 text-slate-400 hover:text-white">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 border-r min-h-screen" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {[
                                { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                                { id: 'clients', label: 'Clients', icon: Users },
                                { id: 'projects', label: 'Projects', icon: FolderOpen },
                                { id: 'factory', label: 'Product Factory', icon: Package },
                                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                                { id: 'workflows', label: 'Workflows', icon: Settings },
                                { id: 'agents', label: 'AI Agents', icon: Bot },
                                { id: 'settings', label: 'Settings', icon: Settings },
                            ].map(item => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id
                                            ? 'bg-white/10 text-[var(--rensto-cyan)] border border-white/20 shadow-[0_0_15px_rgba(45,168,255,0.2)]'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'overview' && (
                            <>
                                {/* Page Header */}
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                                        Dashboard Overview
                                    </h2>
                                    <p style={{ color: 'var(--rensto-text-secondary)' }}>
                                        Welcome back! Here&apos;s what&apos;s happening with your
                                        business.
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="rounded-xl border p-6 shadow-sm" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">
                                                    Revenue This Month
                                                </p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                                                    ${stats.revenue.current.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-green-600 flex items-center mt-1">
                                                    <TrendingUp className="w-4 h-4 mr-1" />
                                                    {stats.revenue.change}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                <DollarSign className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border p-6 shadow-sm" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">
                                                    Active Projects
                                                </p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                                                    {stats.projects.active}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {stats.projects.completed} completed,{' '}
                                                    {stats.projects.pending} pending
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FolderOpen className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border p-6 shadow-sm" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">
                                                    Total Clients
                                                </p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                                                    {stats.clients.total}
                                                </p>
                                                <p className="text-sm text-green-600 flex items-center mt-1">
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    {stats.clients.new} new this month
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Users className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border p-6 shadow-sm" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">
                                                    Pending Invoices
                                                </p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                                                    {stats.invoices.pending}
                                                </p>
                                                <p className="text-sm text-red-600 flex items-center mt-1">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {stats.invoices.overdue} overdue
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-6 h-6 text-orange-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="rounded-xl border p-6 shadow-sm mb-8" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                                        Quick Actions
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {quickActions.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={action.action}
                                                className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                    <action.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {action.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="rounded-xl border p-6 shadow-sm" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-4">
                                        {recentActivity.map(activity => (
                                            <div
                                                key={activity.id}
                                                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50"
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.status === 'success' ? 'bg-green-100' :
                                                        activity.status === 'error' ? 'bg-red-100' :
                                                            activity.status === 'warning' ? 'bg-yellow-100' :
                                                                'bg-orange-100' // pending
                                                        }`}
                                                >
                                                    {activity.status === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                                                        activity.status === 'error' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                                                            activity.status === 'warning' ? <AlertCircle className="w-4 h-4 text-yellow-600" /> :
                                                                <Clock className="w-4 h-4 text-orange-600" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium" style={{ color: 'var(--rensto-text-primary)' }}>
                                                        {activity.action}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {activeTab === 'workflows' && (
                            <WorkflowManagement templates={templates} />
                        )}
                        {activeTab === 'agents' && (
                            <AIAgentManagement templates={templates} />
                        )}
                        {activeTab === 'factory' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                                        Product Factory
                                    </h2>
                                </div>
                                <NewProductWizard />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
