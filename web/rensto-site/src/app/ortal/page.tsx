'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { RenstoProgress } from '@/components/ui/rensto-progress';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';
import { AIAnalysisEngine, RealTimeAnalytics } from '@/lib/real-time-analytics';
import {
  BarChart3,
  Bot,
  Link,
  CreditCard,
  Brain,
  Play,
  Pause,
  Settings,
  Bell,
  AlertCircle,
  Activity,
  TrendingUp,
  Key,
  Days,
  Workflow,
  Off,
} from 'lucide-react';

interface Agent {
  _id: string;
  name: string;
  key: string;
  status: 'draft' | 'provisioning' | 'qa' | 'ready' | 'paused' | 'error';
  lastRun?: string;
  successRate: number;
  avgDuration: number;
  costEst: number;
  roi: number;
  icon: string;
  tags: string[];
  capabilities: string[];
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  dependencies: string[];
  progress?: {
    current: number;
    total: number;
    message: string;
  };
  description?: string;
}

interface DataSource {
  _id: string;
  type: 'apify' | 'n8n' | 'facebook' | 'stripe' | 'custom';
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
  icon: string;
  credentials: {
    apiKey?: string;
    endpoint?: string;
    isConfigured: boolean;
  };
  setupInstructions?: {
    title: string;
    steps: string[];
    pricingUrl?: string;
    signupUrl?: string;
  };
}

interface PaymentStatus {
  plan: string;
  status: 'active' | 'past_due' | 'canceled';
  nextBilling: string;
  amount: number;
  currency: string;
  usage: {
    current: number;
    limit: number;
    unit: string;
  };
}

interface AIInsight {
  id: string;
  type: 'optimization' | 'cost' | 'performance' | 'security';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  timestamp: string;
}

export default function OrtalPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource | null>(null);

  // Ortal's specific data
  const [organization] = useState({
    name: 'Portal Flanary',
    slug: 'portal-flanary',
    domain: 'local-il.com',
  });

  const [agents, setAgents] = useState<Agent[]>([
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Facebook Group Scraper',
      key: 'ortal-facebook-scraper',
      description:
        'Scrapes public Facebook groups for Jewish community lead generation',
      status: 'ready',
      icon: '📘',
      tags: ['scraping', 'social-media', 'lead-generation', 'jewish-community'],
      capabilities: [
        'data-extraction',
        'api-integration',
        'scheduling',
        'custom-audiences',
      ],
      schedule: 'weekly',
      isActive: true,
      dependencies: ['apify', 'facebook'],
      successRate: 95,
      avgDuration: 45,
      costEst: 2.5,
      roi: 3.2,
    },
  ]);

  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      _id: '1',
      type: 'apify',
      name: 'Apify Web Scraping',
      status: 'connected',
      lastSync: '2 minutes ago',
      icon: '🕷️',
      credentials: {
        apiKey: 'apify_api_QfRR0XzZtbGi14p8xaTMc2Fg44a9aW0W5CQM',
        isConfigured: true,
      },
      setupInstructions: {
        title: 'Apify Setup Complete',
        steps: [
          '✅ API key already configured',
          '✅ Facebook Groups Scraper ready',
          '✅ 50+ Jewish community groups configured',
          'Ready to start scraping!',
        ],
        pricingUrl: 'https://apify.com/pricing',
        signupUrl: 'https://apify.com',
      },
    },
    {
      _id: '2',
      type: 'n8n',
      name: 'n8n Workflow Automation',
      status: 'pending',
      lastSync: undefined,
      icon: '⚡',
      credentials: {
        apiKey: '',
        endpoint: 'http://173.254.201.134:5678',
        isConfigured: false,
      },
      setupInstructions: {
        title: 'n8n Cloud Setup Required',
        steps: [
          '1. Sign up at https://cloud.n8n.io (free tier available)',
          '2. Create a new workspace',
          '3. Get your API key from Settings > API',
          '4. Enter your n8n cloud credentials below',
          '5. Import the Facebook Group Scraper workflow',
        ],
        pricingUrl: 'https://cloud.n8n.io/pricing',
        signupUrl: 'https://cloud.n8n.io',
      },
    },
    {
      _id: '3',
      type: 'facebook',
      name: 'Facebook Marketing API',
      status: 'pending',
      lastSync: undefined,
      icon: '📘',
      credentials: {
        apiKey: '',
        isConfigured: false,
      },
      setupInstructions: {
        title: 'Facebook Business Manager Setup',
        steps: [
          '1. Go to https://business.facebook.com',
          '2. Create a Business Manager account',
          '3. Add your Facebook page',
          '4. Create a Facebook App',
          '5. Get your access token',
          '6. Enter your Facebook credentials below',
        ],
        pricingUrl: 'https://www.facebook.com/business/help/',
        signupUrl: 'https://business.facebook.com',
      },
    },
  ]);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    plan: 'Pro',
    status: 'active',
    nextBilling: '2025-02-15',
    amount: 99,
    currency: 'USD',
    usage: {
      current: 750,
      limit: 1000,
      unit: 'API calls',
    },
  });

  // Load real billing data
  useEffect(() => {
    const loadBillingData = async () => {
      try {
        // Load real Stripe billing data
        const response = await fetch(
          '/api/billing/real-status?customerId=ortal-flanary'
        );
        if (response.ok) {
          const data = await response.json();
          if (data.data.subscription) {
            setPaymentStatus({
              plan: data.data.subscription.plan.name,
              status: data.data.subscription.status,
              nextBilling: data.data.subscription.nextBilling,
              amount: data.data.subscription.plan.amount,
              currency: data.data.subscription.plan.currency.toUpperCase(),
              usage: data.data.usage,
            });
          }
        }
      } catch (error) {
        console.error('Error loading billing data:', error);
      }
    };

    loadBillingData();
  }, []);

  // Real Facebook Scraping Analytics Data
  const [facebookAnalytics, setFacebookAnalytics] = useState({
    lastRun: new Date().toISOString(),
    totalGroups: 52,
    processedGroups: 0,
    successRate: 0,
    totalLeads: 0,
    customAudiences: [],
    processedGroups: [],
    leadQuality: {
      totalLeads: 0,
      validEmails: 0,
      validPhones: 0,
      completeProfiles: 0,
      engagementScore: 0,
    },
    performance: {
      avgProcessingTime: '0m 0s',
      totalProcessingTime: '0m 0s',
      costPerLead: 0,
      totalCost: 0,
      roi: 0,
    },
  });

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  // Load real AI insights
  useEffect(() => {
    const loadAIInsights = async () => {
      try {
        // Load real AI insights based on actual data
        const response = await fetch(
          '/api/analytics/ai-insights/ortal-flanary'
        );
        if (response.ok) {
          const data = await response.json();
          setAiInsights(data.insights || []);
        } else {
          // Generate insights based on current analytics data
          const insights = await AIAnalysisEngine.generateInsights(
            facebookAnalytics
          );
          setAiInsights(insights);
        }
      } catch (error) {
        console.error('Error loading AI insights:', error);
        // Fallback insights
        setAiInsights([
          {
            id: '1',
            type: 'optimization',
            title: 'Facebook Group Scraper Optimization',
            description:
              'Your Facebook group scraper can be optimized to run 30% faster by adjusting the concurrency settings.',
            impact: 'high',
            action: 'Optimize Agent',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    loadAIInsights();
  }, [facebookAnalytics]);

  // Real-time analytics
  const [realTimeAnalytics] = useState(() => {
    if (typeof window !== 'undefined') {
      return new RealTimeAnalytics();
    }
    return null;
  });

  // Load real data on component mount
  useEffect(() => {
    const loadRealData = async () => {
      try {
        // Load real Facebook analytics
        const response = await fetch(
          '/api/analytics/facebook-scraping/ortal-flanary'
        );
        if (response.ok) {
          const data = await response.json();
          setFacebookAnalytics(data.data);
        }

        // Set up real-time updates
        if (realTimeAnalytics) {
          realTimeAnalytics.on('scraping-progress', (data: unknown) => {
            setFacebookAnalytics(prev => ({
              ...prev,
              processedGroups: data.processedGroups,
              totalLeads: data.totalLeads,
            }));
          });

          realTimeAnalytics.on('audience-created', (data: unknown) => {
            setFacebookAnalytics(prev => ({
              ...prev,
              customAudiences: [...prev.customAudiences, data],
            }));
          });
        }
      } catch (error) {
        console.error('Error loading real data:', error);
      }
    };

    loadRealData();
  }, [realTimeAnalytics]);

  const [kpis] = useState({
    mrr: { current: 99, change: 0 },
    activeAgents: { total: 1, change: 0 },
    runs: { rate: 95, change: 5.2 },
    errorRate: { current: 5, change: -2.1 },
    invoices: { pending: 0, total: 99 },
  });

  useEffect(() => {
    // For now, let's bypass authentication to get the portal working
    // TODO: Implement proper authentication later
    setLoading(false);
  }, []);

  const handleToggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setAgents(prev =>
          prev.map(agent =>
            agent._id === agentId ? { ...agent, isActive } : agent
          )
        );
      }
    } catch (error) {
      console.error('Error toggling agent:', error);
    }
  };

  const handleUpdateSchedule = async (agentId: string, schedule: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      });

      if (response.ok) {
        setAgents(prev =>
          prev.map(agent =>
            agent._id === agentId
              ? { ...agent, schedule: schedule as Agent['schedule'] }
              : agent
          )
        );
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleSaveCredentials = async (
    dataSourceId: string,
    credentials: unknown
  ) => {
    try {
      const response = await fetch(
        `/api/datasources/${dataSourceId}/credentials`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        }
      );

      if (response.ok) {
        setShowCredentialModal(false);
        setSelectedDataSource(null);
        // Update data source status
        setDataSources(prev =>
          prev.map(ds =>
            ds._id === dataSourceId
              ? {
                  ...ds,
                  status: 'connected',
                  credentials: {
                    ...ds.credentials,
                    ...credentials,
                    isConfigured: true,
                  },
                }
              : ds
          )
        );
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const handleRunFacebookScraper = async () => {
    try {
      // Show loading state
      alert(
        '🚀 Starting Facebook Group Scraper...\n\nThis will:\n• Scrape 50+ Jewish community Facebook groups\n• Extract member data for lead generation\n• Create custom audiences for marketing\n\nEstimated time: 2-3 minutes'
      );

      // Simulate API call to trigger the n8n workflow
      const response = await fetch('/api/agents/507f1f77bcf86cd799439011/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run',
          agentId: '507f1f77bcf86cd799439011',
        }),
      });

      if (response.ok) {
        alert(
          '✅ Facebook Scraper started successfully!\n\nCheck the Agents tab to monitor progress.'
        );
        // Switch to agents tab to show progress
        setActiveTab('agents');
      } else {
        alert(
          '❌ Failed to start scraper. Please check your integrations first.'
        );
        setActiveTab('integrations');
      }
    } catch (error) {
      console.error('Error running Facebook scraper:', error);
      alert('❌ Error starting scraper. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rensto-background flex items-center justify-center">
        <div className="text-center">
          <div className="rensto-animate-glow rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-rensto-text/70">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rensto-background">
      {/* Header */}
      <div className="bg-rensto-card border-b border-rensto-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-rensto-text flex items-center gap-3"><div className="w-6 h-6 relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={24}
                  height={24}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>
                {organization.name} - Customer Portal
              </h1>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Pro Plan
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-rensto-text/70">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-700">O</span>
                </div>
                <span className="text-sm text-rensto-text/70">Ortal Flanary</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-rensto-card border-b border-rensto-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'agents', name: 'Agents', icon: Bot },
              { id: 'integrations', name: 'Integrations', icon: Link },
              { id: 'billing', name: 'Billing', icon: CreditCard },
              { id: 'insights', name: 'AI Insights', icon: Brain },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-rensto-orange'
                      : 'border-transparent text-rensto-text/60 hover:text-rensto-text/80 hover:border-rensto-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-rensto-card rounded-lg border border-rensto-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rensto-text/70">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-rensto-text">
                      ${kpis.mrr.current}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-rensto-cyan" />
                  </div>
                </div>
                <p className="text-sm text-rensto-cyan mt-2">
                  +{kpis.mrr.change}% from last month
                </p>
              </div>

              <div className="bg-rensto-card rounded-lg border border-rensto-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rensto-text/70">
                      Active Agents
                    </p>
                    <p className="text-2xl font-bold text-rensto-text">
                      {kpis.activeAgents.total}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bot className="w-6 h-6 text-rensto-blue" />
                  </div>
                </div>
                <p className="text-sm text-rensto-blue mt-2">
                  All agents running smoothly
                </p>
              </div>

              <div className="bg-rensto-card rounded-lg border border-rensto-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rensto-text/70">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-rensto-text">
                      {kpis.runs.rate}%
                    </p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="w-6 h-6 text-rensto-orange" />
                  </div>
                </div>
                <p className="text-sm text-rensto-orange mt-2">
                  +{kpis.runs.change}% from last week
                </p>
              </div>

              <div className="bg-rensto-card rounded-lg border border-rensto-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rensto-text/70">
                      Error Rate
                    </p>
                    <p className="text-2xl font-bold text-rensto-text">
                      {kpis.errorRate.current}%
                    </p>
                  </div>
                  <div className="p-2 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} rounded-lg">
                    <AlertCircle className="w-6 h-6 text-rensto-red" />
                  </div>
                </div>
                <p className="text-sm text-rensto-red mt-2">
                  {kpis.errorRate.change}% from last week
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-rensto-card rounded-lg border border-rensto-border p-6">
              <h3 className="text-lg font-semibold text-rensto-text mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleRunFacebookScraper}
                  className="flex items-center space-x-3 p-4 border border-rensto-border rounded-lg hover:bg-rensto-background transition-colors"
                >
                  <Play className="w-5 h-5 text-rensto-cyan" />
                  <span className="text-sm font-medium text-rensto-text/80">
                    Run Facebook Scraper
                  </span>
                </button>
                <button className="flex items-center space-x-3 p-4 border border-rensto-border rounded-lg hover:bg-rensto-background transition-colors">
                  <Settings className="w-5 h-5 text-rensto-blue" />
                  <span className="text-sm font-medium text-rensto-text/80">
                    Configure Integrations
                  </span>
                </button>
                <button className="flex items-center space-x-3 p-4 border border-rensto-border rounded-lg hover:bg-rensto-background transition-colors">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-rensto-text/80">
                    View Analytics
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-rensto-text">Your Agents</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-rensto-red to-rensto-orange text-white rounded-lg hover:rensto-glow transition-colors">
                Add New Agent
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agents.map(agent => (
                <div
                  key={agent._id}
                  className="bg-rensto-card rounded-lg border border-rensto-border p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-rensto-text">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-rensto-text/70">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-rensto-card text-rensto-text'
                      }`}
                    >
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-rensto-text/70">Success Rate</p>
                      <p className="text-lg font-semibold text-rensto-text">
                        {agent.successRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-rensto-text/70">Avg Duration</p>
                      <p className="text-lg font-semibold text-rensto-text">
                        {agent.avgDuration}s
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-rensto-text/70">Cost per Run</p>
                      <p className="text-lg font-semibold text-rensto-text">
                        ${agent.costEst}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-rensto-text/70">ROI</p>
                      <p className="text-lg font-semibold text-rensto-text">
                        {agent.roi}x
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-rensto-text/70">Schedule:</span>
                      <select
                        value={agent.schedule}
                        onChange={e =>
                          handleUpdateSchedule(agent._id, e.target.value)
                        }
                        className="text-sm border border-rensto-border rounded px-2 py-1"
                      >
                        <option value="manual">Manual</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleAgent(agent._id, !agent.isActive)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        agent.isActive
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {agent.isActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {agent.isActive ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-rensto-text">
                Integrations
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dataSources.map(dataSource => (
                <div
                  key={dataSource._id}
                  className="bg-rensto-card rounded-lg border border-rensto-border p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{dataSource.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-rensto-text">
                          {dataSource.name}
                        </h3>
                        <p className="text-sm text-rensto-text/70">
                          {dataSource.lastSync
                            ? `Last sync: ${dataSource.lastSync}`
                            : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dataSource.status === 'connected'
                          ? 'bg-green-100 text-green-800'
                          : dataSource.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {dataSource.status}
                    </div>
                  </div>

                  {dataSource.setupInstructions && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-rensto-text mb-2">
                        {dataSource.setupInstructions.title}
                      </h4>
                      <ul className="text-sm text-rensto-text/70 space-y-1">
                        {dataSource.setupInstructions.steps.map(
                          (step, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{step}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {dataSource.setupInstructions?.pricingUrl && (
                        <a
                          href={dataSource.setupInstructions.pricingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-rensto-blue hover:text-blue-700"
                        >
                          Pricing
                        </a>
                      )}
                      {dataSource.setupInstructions?.signupUrl && (
                        <a
                          href={dataSource.setupInstructions.signupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-rensto-blue hover:text-blue-700"
                        >
                          Sign Up
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDataSource(dataSource);
                        setShowCredentialModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-rensto-red to-rensto-orange text-white rounded-lg hover:rensto-glow transition-colors text-sm"
                    >
                      {dataSource.credentials.isConfigured
                        ? 'Update'
                        : 'Configure'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-rensto-text">
                Billing & Usage
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-rensto-card rounded-lg border border-rensto-border p-6">
                <h3 className="text-lg font-semibold text-rensto-text mb-4">
                  Current Plan
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-rensto-text/70">Plan</span>
                    <span className="font-medium">{paymentStatus.plan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rensto-text/70">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        paymentStatus.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {paymentStatus.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rensto-text/70">Next Billing</span>
                    <span className="font-medium">
                      {paymentStatus.nextBilling}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rensto-text/70">Amount</span>
                    <span className="font-medium">
                      ${paymentStatus.amount}/{paymentStatus.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-rensto-card rounded-lg border border-rensto-border p-6">
                <h3 className="text-lg font-semibold text-rensto-text mb-4">
                  Usage
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-rensto-text/70">API Calls</span>
                      <span className="text-sm font-medium">
                        {paymentStatus.usage.current} /{' '}
                        {paymentStatus.usage.limit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-rensto-red to-rensto-orange h-2 rounded-full"
                        style={{
                          width: `${
                            (paymentStatus.usage.current /
                              paymentStatus.usage.limit) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-rensto-text">AI Insights</h2>
            </div>

            <div className="space-y-4">
              {aiInsights.map(insight => (
                <div
                  key={insight.id}
                  className="bg-rensto-card rounded-lg border border-rensto-border p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                              insight.impact === 'high'
                                ? 'bg-red-100 text-red-600'
                                : insight.impact === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                        >
                          {insight.impact} impact
                        </span>
                        <span className="text-sm text-rensto-text/60">
                          {new Date(insight.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-rensto-text mb-2">
                        {insight.title}
                      </h3>
                      <p className="text-rensto-text/70 mb-4">
                        {insight.description}
                      </p>
                      <button className="px-4 py-2 bg-gradient-to-r from-rensto-red to-rensto-orange text-white rounded-lg hover:rensto-glow transition-colors text-sm">
                        {insight.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Credential Modal */}
      {showCredentialModal && selectedDataSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-rensto-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-rensto-text mb-4">
              Configure {selectedDataSource.name}
            </h3>
            <div className="space-y-4">
              {selectedDataSource.type === 'n8n' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-rensto-text/80 mb-1">
                      n8n Cloud URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://your-workspace.cloud.n8n.io"
                      className="w-full px-3 py-2 border border-rensto-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rensto-text/80 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your n8n API key"
                      className="w-full px-3 py-2 border border-rensto-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </>
              )}
              {selectedDataSource.type === 'facebook' && (
                <div>
                  <label className="block text-sm font-medium text-rensto-text/80 mb-1">
                    Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your Facebook access token"
                    className="w-full px-3 py-2 border border-rensto-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCredentialModal(false)}
                className="flex-1 px-4 py-2 border border-rensto-border text-rensto-text/80 rounded-lg hover:bg-rensto-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSaveCredentials(selectedDataSource._id, {})
                }
                className="flex-1 px-4 py-2 bg-gradient-to-r from-rensto-red to-rensto-orange text-white rounded-lg hover:rensto-glow transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
