import { BarChart3, TrendingUp, Calendar, Download, Activity, Users, DollarSign, Clock } from 'lucide-react';

interface AnalyticsPageProps {
  params: Promise<{ org: string }>;
}

const mockAnalyticsData = {
  overview: {
    totalAgents: 12,
    activeAgents: 8,
    totalRuns: 1247,
    successRate: 94.2,
    avgResponseTime: 2.3,
    totalCost: 1247.50,
    monthlyGrowth: 23.5,
  },
  trends: {
    daily: [
      { date: '2024-01-01', runs: 45, success: 42, cost: 12.50 },
      { date: '2024-01-02', runs: 52, success: 49, cost: 14.20 },
      { date: '2024-01-03', runs: 38, success: 36, cost: 10.80 },
      { date: '2024-01-04', runs: 67, success: 63, cost: 18.90 },
      { date: '2024-01-05', runs: 73, success: 69, cost: 20.40 },
      { date: '2024-01-06', runs: 58, success: 55, cost: 16.20 },
      { date: '2024-01-07', runs: 82, success: 78, cost: 23.10 },
    ],
    weekly: [
      { week: 'Week 1', runs: 315, success: 298, cost: 89.10 },
      { week: 'Week 2', runs: 342, success: 324, cost: 96.80 },
      { week: 'Week 3', runs: 378, success: 359, cost: 107.20 },
      { week: 'Week 4', runs: 412, success: 391, cost: 116.50 },
    ],
  },
  agentPerformance: [
    {
      name: 'Lead Intake Agent',
      runs: 456,
      successRate: 96.2,
      avgTime: 1.8,
      cost: 45.60,
      status: 'active',
    },
    {
      name: 'Invoice Processor',
      runs: 234,
      successRate: 92.1,
      avgTime: 3.2,
      cost: 23.40,
      status: 'active',
    },
    {
      name: 'Customer Support Bot',
      runs: 189,
      successRate: 88.5,
      avgTime: 2.1,
      cost: 18.90,
      status: 'paused',
    },
    {
      name: 'Data Sync Agent',
      runs: 156,
      successRate: 94.8,
      avgTime: 4.5,
      cost: 15.60,
      status: 'active',
    },
  ],
  costAnalysis: {
    byCategory: [
      { category: 'API Calls', cost: 456.20, percentage: 36.5 },
      { category: 'Processing', cost: 234.80, percentage: 18.8 },
      { category: 'Storage', cost: 189.50, percentage: 15.2 },
      { category: 'AI Services', cost: 367.00, percentage: 29.5 },
    ],
    byAgent: [
      { agent: 'Lead Intake', cost: 45.60, runs: 456 },
      { agent: 'Invoice Processor', cost: 23.40, runs: 234 },
      { agent: 'Support Bot', cost: 18.90, runs: 189 },
      { agent: 'Data Sync', cost: 15.60, runs: 156 },
    ],
  },
  errorAnalysis: {
    byType: [
      { type: 'API Timeout', count: 23, percentage: 35.4 },
      { type: 'Invalid Data', count: 18, percentage: 27.7 },
      { type: 'Rate Limit', count: 12, percentage: 18.5 },
      { type: 'Network Error', count: 8, percentage: 12.3 },
      { type: 'Other', count: 4, percentage: 6.1 },
    ],
    byAgent: [
      { agent: 'Lead Intake', errors: 8, successRate: 98.2 },
      { agent: 'Invoice Processor', errors: 12, successRate: 94.9 },
      { agent: 'Support Bot', errors: 15, successRate: 92.1 },
      { agent: 'Data Sync', errors: 6, successRate: 96.2 },
    ],
  },
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  await params; // Use params to avoid unused variable warning

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Reporting</h1>
          <p className="text-slate-600 mt-1">
            Comprehensive insights into your automation performance and costs.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Runs</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockAnalyticsData.overview.totalRuns.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{mockAnalyticsData.overview.monthlyGrowth}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 style={{ color: 'var(--rensto-blue)' }}" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Success Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockAnalyticsData.overview.successRate}%
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.1%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockAnalyticsData.overview.avgResponseTime}s
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                -0.5s
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Cost</p>
              <p className="text-2xl font-bold text-slate-900">
                ${mockAnalyticsData.overview.totalCost.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.2%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Performance Trends</h3>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm font-medium">
                Daily
              </button>
              <button className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                Weekly
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {mockAnalyticsData.trends.daily.slice(-7).map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-500">{day.runs} runs</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {((day.success / day.runs) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500">Success</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      ${day.cost.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">Cost</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Agent Performance</h3>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {mockAnalyticsData.agentPerformance.map((agent, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <h4 className="font-semibold text-slate-900">{agent.name}</h4>
                  </div>
                  <span className="text-sm text-slate-500">{agent.runs} runs</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Success Rate</p>
                    <p className="font-semibold text-slate-900">{agent.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Avg Time</p>
                    <p className="font-semibold text-slate-900">{agent.avgTime}s</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Cost</p>
                    <p className="font-semibold text-slate-900">${agent.cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Cost Breakdown</h3>
          
          <div className="space-y-4">
            {mockAnalyticsData.costAnalysis.byCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-slate-900">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">${category.cost.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{category.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold text-slate-900">
                ${mockAnalyticsData.costAnalysis.byCategory.reduce((sum, cat) => sum + cat.cost, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Error Analysis</h3>
          
          <div className="space-y-4">
            {mockAnalyticsData.errorAnalysis.byType.map((error, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full style={{ backgroundColor: 'var(--rensto-bg-primary)' }}"></div>
                  <span className="text-sm font-medium text-slate-900">{error.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{error.count}</p>
                  <p className="text-xs text-slate-500">{error.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} rounded-full"></div>
              <span className="text-sm font-medium style={{ color: 'var(--rensto-red)' }}">Total Errors: 65</span>
            </div>
            <p className="text-xs style={{ color: 'var(--rensto-red)' }} mt-1">
              {((65 / mockAnalyticsData.overview.totalRuns) * 100).toFixed(1)}% error rate
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Advanced Metrics</h3>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm">
            Generate Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 style={{ color: 'var(--rensto-blue)' }}" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">User Adoption</h4>
            <p className="text-2xl font-bold style={{ color: 'var(--rensto-blue)' }}">87%</p>
            <p className="text-sm text-slate-500">Active users this month</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">Efficiency Gain</h4>
            <p className="text-2xl font-bold text-green-600">23.5%</p>
            <p className="text-sm text-slate-500">Time saved vs manual</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">ROI</h4>
            <p className="text-2xl font-bold text-purple-600">312%</p>
            <p className="text-sm text-slate-500">Return on investment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
