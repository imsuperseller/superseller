'use client';

import React, { useEffect, useState } from 'react';

interface CustomerConfig {
  name: string;
  company: string;
  industry: string;
  language: {
    customerApp: string;
    agentInterface: string;
    rtlSupport: boolean;
    locale: string;
  };
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

export default function CustomerPortal({ params }: { params: { slug: string } }) {
  const customerId = params.slug;
  const [config, setConfig] = useState<CustomerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/customers/${customerId}/config`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer configuration');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-300 mx-auto mb-4"></div>
          <p className="text-xl">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Portal Error</h2>
          <p className="text-gray-300 mb-6">{error || 'Failed to load customer configuration'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">Business Overview</h3>
                <p className="text-gray-300">Monitor your key performance indicators and business metrics</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-white mb-2">Active Agents</h3>
                <p className="text-gray-300">View and manage your automation agents</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-white mb-2">Revenue Tracking</h3>
                <p className="text-gray-300">Track your revenue and financial performance</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-white mb-2">Growth Analytics</h3>
                <p className="text-gray-300">Analyze your business growth patterns</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-white mb-2">Goal Tracking</h3>
                <p className="text-gray-300">Monitor progress towards your business goals</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-2">Performance</h3>
                <p className="text-gray-300">System performance and optimization insights</p>
              </div>
            </div>
          </div>
        );

      case 'agents':
        return (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">🤖 AI Agents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Customer Service Agent</h4>
                  <p className="text-gray-300 text-sm">Handles customer inquiries and support</p>
                  <div className="mt-2">
                    <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Active</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Marketing Agent</h4>
                  <p className="text-gray-300 text-sm">Manages marketing campaigns and outreach</p>
                  <div className="mt-2">
                    <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">📊 Analytics Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">2,847</div>
                  <div className="text-gray-300 text-sm">Total Visitors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">$12,450</div>
                  <div className="text-gray-300 text-sm">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">94%</div>
                  <div className="text-gray-300 text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">⚙️ Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    defaultValue={config.company}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Industry</label>
                  <input
                    type="text"
                    defaultValue={config.industry}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-white">
            <p>Select a tab to view content</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">R</div>
              <div>
                <h1 className="text-xl font-bold text-white">{config.company}</h1>
                <p className="text-gray-300 text-sm">Customer Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {config.name}</span>
              <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            {config.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
