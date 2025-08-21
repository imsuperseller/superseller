'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useSession, signOut } from 'next-auth/react';
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
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock session for now - remove authentication requirement
  const session = { user: { name: 'Admin User', email: 'admin@rensto.com' } };
  const status = 'authenticated';

  // Mock data for demonstration
  const stats = {
    revenue: { current: 45200, previous: 38900, change: '+16.2%' },
    projects: { active: 12, completed: 8, pending: 3 },
    clients: { total: 24, new: 3, active: 21 },
    invoices: { pending: 5, overdue: 2, total: 18700 },
  };

  const recentActivity = [
    {
      id: 1,
      type: 'project',
      action: 'Project "Website Redesign" completed',
      time: '2 hours ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'invoice',
      action: 'Invoice #INV-2024-001 sent',
      time: '4 hours ago',
      status: 'pending',
    },
    {
      id: 3,
      type: 'client',
      action: 'New client "TechCorp Inc" added',
      time: '1 day ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'workflow',
      action: 'Automated email campaign triggered',
      time: '2 days ago',
      status: 'success',
    },
  ];

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/rensto-logo.png"
                alt="Rensto"
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
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button className="relative p-2 text-slate-600 hover:text-slate-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.[0] || 'A'}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-slate-600 hover:style={{ color: 'var(--rensto-red)' }} transition-colors"
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
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {[
                { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'workflows', label: 'Workflows', icon: Settings },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Dashboard Overview
              </h2>
              <p className="text-slate-600">
                Welcome back! Here&apos;s what&apos;s happening with your
                business.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Revenue This Month
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
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

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Active Projects
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
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

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Clients
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
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

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Pending Invoices
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
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
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
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
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.status === 'success'
                          ? 'bg-green-100'
                          : 'bg-orange-100'
                      }`}
                    >
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
