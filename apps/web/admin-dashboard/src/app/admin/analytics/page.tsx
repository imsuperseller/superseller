'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, 
  Activity, Target, Calendar, Filter, Download, RefreshCw,
  PieChart, LineChart, Zap, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    churnRate: number;
    engagement: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
    churn: number;
    ltv: number;
  };
  usage: {
    totalSessions: number;
    averageSessionTime: number;
    pageViews: number;
    bounceRate: number;
    conversionRate: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
  trends: {
    userGrowth: Array<{ month: string; users: number; growth: number }>;
    revenueGrowth: Array<{ month: string; revenue: number; growth: number }>;
    usageTrends: Array<{ day: string; sessions: number; users: number }>;
  };
  insights: Array<{
    id: string;
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          // Generate comprehensive mock data for demonstration
          const mockAnalytics: AnalyticsData = {
            overview: {
              totalUsers: 1247,
              activeUsers: 892,
              newUsers: 156,
              churnRate: 3.2,
              engagement: 78.5
            },
            revenue: {
              mrr: 15420,
              arr: 185040,
              growth: 20.0,
              churn: 3.2,
              ltv: 2850
            },
            usage: {
              totalSessions: 8942,
              averageSessionTime: 12.5,
              pageViews: 45678,
              bounceRate: 34.2,
              conversionRate: 15.8
            },
            performance: {
              responseTime: 245,
              uptime: 99.97,
              errorRate: 0.12,
              throughput: 2.1
            },
            trends: {
              userGrowth: [
                { month: 'Jan', users: 850, growth: 5.2 },
                { month: 'Feb', users: 920, growth: 8.2 },
                { month: 'Mar', users: 1010, growth: 9.8 },
                { month: 'Apr', users: 1120, growth: 10.9 },
                { month: 'May', users: 1210, growth: 8.0 },
                { month: 'Jun', users: 1285, growth: 6.2 },
                { month: 'Jul', users: 1350, growth: 5.1 },
                { month: 'Aug', users: 1420, growth: 5.2 },
                { month: 'Sep', users: 1480, growth: 4.2 },
                { month: 'Oct', users: 1520, growth: 2.7 },
                { month: 'Nov', users: 1247, growth: 1.4 },
                { month: 'Dec', users: 1247, growth: 20.0 }
              ],
              revenueGrowth: [
                { month: 'Jan', revenue: 8500, growth: 5.2 },
                { month: 'Feb', revenue: 9200, growth: 8.2 },
                { month: 'Mar', revenue: 10100, growth: 9.8 },
                { month: 'Apr', revenue: 11200, growth: 10.9 },
                { month: 'May', revenue: 12100, growth: 8.0 },
                { month: 'Jun', revenue: 12850, growth: 6.2 },
                { month: 'Jul', revenue: 13500, growth: 5.1 },
                { month: 'Aug', revenue: 14200, growth: 5.2 },
                { month: 'Sep', revenue: 14800, growth: 4.2 },
                { month: 'Oct', revenue: 15200, growth: 2.7 },
                { month: 'Nov', revenue: 15420, growth: 1.4 },
                { month: 'Dec', revenue: 15420, growth: 20.0 }
              ],
              usageTrends: [
                { day: 'Mon', sessions: 1250, users: 892 },
                { day: 'Tue', sessions: 1180, users: 845 },
                { day: 'Wed', sessions: 1320, users: 920 },
                { day: 'Thu', sessions: 1280, users: 890 },
                { day: 'Fri', sessions: 1100, users: 780 },
                { day: 'Sat', sessions: 850, users: 620 },
                { day: 'Sun', sessions: 720, users: 520 }
              ]
            },
            insights: [
              {
                id: 'insight_001',
                type: 'success',
                title: 'User Engagement Increased',
                description: 'Average session time increased by 15% this month, indicating better user experience.',
                impact: 'high',
                action: 'Continue current UX improvements'
              },
              {
                id: 'insight_002',
                type: 'warning',
                title: 'Churn Rate Above Target',
                description: 'Monthly churn rate of 3.2% is above the 2.5% target. Focus on retention strategies.',
                impact: 'high',
                action: 'Implement customer success program'
              },
              {
                id: 'insight_003',
                type: 'info',
                title: 'Peak Usage Times Identified',
                description: 'Highest usage occurs Tuesday-Thursday between 10 AM - 2 PM. Consider scaling resources.',
                impact: 'medium',
                action: 'Optimize server capacity for peak hours'
              },
              {
                id: 'insight_004',
                type: 'success',
                title: 'Conversion Rate Improved',
                description: 'Trial-to-paid conversion rate increased to 15.8%, up from 12.3% last month.',
                impact: 'high',
                action: 'Analyze successful conversion patterns'
              }
            ]
          };
          setAnalytics(mockAnalytics);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Activity className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Impact</Badge>;
      default:
        return <Badge variant="outline">{impact}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-500">Failed to load analytics data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analytics.overview.newUsers} new this month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.engagement}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.revenue.mrr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analytics.revenue.growth}% growth</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.usage.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.usage.totalSessions.toLocaleString()} total sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              User Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trends.userGrowth.slice(-6).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{trend.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{trend.users.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {trend.growth > 0 ? '+' : ''}{trend.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Revenue Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trends.revenueGrowth.slice(-6).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{trend.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${trend.revenue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {trend.growth > 0 ? '+' : ''}{trend.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Usage Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Sessions</span>
                <span className="text-lg font-bold">{analytics.usage.totalSessions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Session Time</span>
                <span className="text-lg font-bold">{analytics.usage.averageSessionTime}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Page Views</span>
                <span className="text-lg font-bold">{analytics.usage.pageViews.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bounce Rate</span>
                <span className="text-lg font-bold">{analytics.usage.bounceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-lg font-bold">{analytics.performance.responseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-lg font-bold text-green-600">{analytics.performance.uptime}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-lg font-bold text-red-600">{analytics.performance.errorRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Throughput</span>
                <span className="text-lg font-bold">{analytics.performance.throughput} GB/s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Business Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Annual Revenue</span>
                <span className="text-lg font-bold">${analytics.revenue.arr.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Churn Rate</span>
                <span className="text-lg font-bold text-red-600">{analytics.revenue.churn}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer LTV</span>
                <span className="text-lg font-bold">${analytics.revenue.ltv}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className="text-lg font-bold text-green-600">+{analytics.revenue.growth}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            AI-Powered Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      {getImpactBadge(insight.impact)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium">Recommended Action:</span>
                      <span className="text-xs text-muted-foreground">{insight.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
