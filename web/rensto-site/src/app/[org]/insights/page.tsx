import { Brain, TrendingUp, AlertTriangle, Lightbulb, BarChart3, Target, Zap } from 'lucide-react';

interface InsightsPageProps {
  params: Promise<{ org: string }>;
}

const mockInsights = [
  {
    id: 1,
    type: 'anomaly',
    title: 'Agent Performance Drop Detected',
    description: 'Lead Intake Agent success rate dropped 15% in the last 24 hours',
    severity: 'high',
    impact: 'High impact on lead conversion',
    recommendation: 'Check Typeform webhook configuration and API rate limits',
    timestamp: '2 hours ago',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-100',
  },
  {
    id: 2,
    type: 'opportunity',
    title: 'Revenue Optimization Opportunity',
    description: 'Automated billing agent could save 8 hours/week',
    impact: 'Potential $2,400/month savings',
    recommendation: 'Implement Stripe webhook automation for invoice processing',
    timestamp: '1 day ago',
    icon: TrendingUp,
    color: 'text-green-600 bg-green-100',
  },
  {
    id: 3,
    type: 'insight',
    title: 'Peak Usage Patterns Identified',
    description: 'Agent usage peaks between 9-11 AM and 2-4 PM',
    impact: 'Consider scaling resources during peak hours',
    recommendation: 'Implement auto-scaling for n8n workflows during peak times',
    timestamp: '3 days ago',
    icon: BarChart3,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    id: 4,
    type: 'recommendation',
    title: 'New Agent Template Available',
    description: 'Customer support automation template matches your use case',
    impact: 'Could reduce response time by 60%',
    recommendation: 'Deploy customer support agent from marketplace',
    timestamp: '1 week ago',
    icon: Lightbulb,
    color: 'text-purple-600 bg-purple-100',
  },
];

const mockMetrics = {
  totalAgents: 12,
  activeAgents: 8,
  successRate: 94.2,
  avgResponseTime: 2.3,
  monthlySavings: 3200,
  efficiencyGain: 23.5,
};

const mockTrends = [
  { name: 'Success Rate', value: 94.2, change: 2.1, trend: 'up' },
  { name: 'Response Time', value: 2.3, change: -0.5, trend: 'down' },
  { name: 'Cost per Run', value: 0.12, change: -0.03, trend: 'down' },
  { name: 'Active Agents', value: 8, change: 1, trend: 'up' },
];

export default async function InsightsPage({ params }: InsightsPageProps) {
  await params; // Use params to avoid unused variable warning

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Insights</h1>
          <p className="text-slate-600 mt-1">
            Intelligent analytics and recommendations powered by AI.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Generate Insights</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Agents</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockMetrics.totalAgents}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2 this month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 style={{ color: 'var(--rensto-blue)' }}" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Success Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockMetrics.successRate}%
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.1%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Response</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockMetrics.avgResponseTime}s
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                -0.5s
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Monthly Savings</p>
              <p className="text-2xl font-bold text-slate-900">
                ${mockMetrics.monthlySavings.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.2%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Insights */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Insights</h3>
          <div className="space-y-4">
            {mockInsights.map((insight) => {
              const IconComponent = insight.icon;
              return (
                <div
                  key={insight.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${insight.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{insight.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                      <div className="mt-2">
                        <p className="text-xs text-slate-500">
                          <span className="font-medium">Impact:</span> {insight.impact}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="font-medium">Recommendation:</span> {insight.recommendation}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{insight.timestamp}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Trends</h3>
          <div className="space-y-4">
            {mockTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">{trend.name}</p>
                  <p className="text-xs text-slate-500">Last 30 days</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {typeof trend.value === 'number' && trend.value < 10 
                        ? trend.value.toFixed(1) 
                        : trend.value}
                      {trend.name === 'Success Rate' && '%'}
                      {trend.name === 'Response Time' && 's'}
                      {trend.name === 'Cost per Run' && '$'}
                    </p>
                    <div className="text-sm font-semibold text-slate-900">
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(trend.trend)}
                      <span className={`text-xs ${trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.change > 0 ? '+' : ''}{trend.change}
                        {trend.name === 'Success Rate' && '%'}
                        {trend.name === 'Response Time' && 's'}
                        {trend.name === 'Cost per Run' && '$'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI Recommendations</h3>
            <p className="text-sm text-slate-600">Based on your usage patterns and performance data</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-slate-900 mb-2">Optimize Agent Scheduling</h4>
            <p className="text-sm text-slate-600 mb-3">
              Schedule non-critical agents during off-peak hours to reduce costs by 15%.
            </p>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              View Schedule Optimization →
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-slate-900 mb-2">Add Error Monitoring</h4>
            <p className="text-sm text-slate-600 mb-3">
              Implement real-time error tracking for 3 agents with high failure rates.
            </p>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              Configure Monitoring →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
