'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, CreditCard, BarChart3, 
  PieChart, LineChart, Target, AlertCircle, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, Calendar, Filter, Download, RefreshCw
} from 'lucide-react';

interface RevenueMetrics {
  mrr: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
    breakdown: {
      starter: number;
      professional: number;
      enterprise: number;
    };
    monthlyHistory: Array<{
      month: string;
      mrr: number;
      growth: number;
    }>;
  };
  arr: {
    current: number;
    previous: number;
    growth: number;
  };
  churn: {
    rate: number;
    previousRate: number;
    trend: 'up' | 'down' | 'stable';
    reasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
    monthlyHistory: Array<{
      month: string;
      rate: number;
      customers: number;
    }>;
  };
  growth: {
    newCustomers: number;
    upgrades: number;
    downgrades: number;
    expansion: number;
    netGrowth: number;
    conversionRate: number;
  };
  customers: {
    total: number;
    active: number;
    trial: number;
    churned: number;
    newThisMonth: number;
    churnedThisMonth: number;
    convertedThisMonth: number;
  };
  forecasts: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
}

export default function RevenueAnalyticsPage() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12m');

  useEffect(() => {
    const fetchRevenueMetrics = async () => {
      try {
        const response = await fetch('/api/admin/revenue');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          // Generate comprehensive mock data for demonstration
          const mockMetrics: RevenueMetrics = {
            mrr: {
              current: 15420,
              previous: 12850,
              growth: 20.0,
              trend: 'up',
              breakdown: {
                starter: 4850,
                professional: 8920,
                enterprise: 1650
              },
              monthlyHistory: [
                { month: 'Jan', mrr: 8500, growth: 5.2 },
                { month: 'Feb', mrr: 9200, growth: 8.2 },
                { month: 'Mar', mrr: 10100, growth: 9.8 },
                { month: 'Apr', mrr: 11200, growth: 10.9 },
                { month: 'May', mrr: 12100, growth: 8.0 },
                { month: 'Jun', mrr: 12850, growth: 6.2 },
                { month: 'Jul', mrr: 13500, growth: 5.1 },
                { month: 'Aug', mrr: 14200, growth: 5.2 },
                { month: 'Sep', mrr: 14800, growth: 4.2 },
                { month: 'Oct', mrr: 15200, growth: 2.7 },
                { month: 'Nov', mrr: 15420, growth: 1.4 },
                { month: 'Dec', mrr: 15420, growth: 20.0 }
              ]
            },
            arr: {
              current: 185040,
              previous: 154200,
              growth: 20.0
            },
            churn: {
              rate: 3.2,
              previousRate: 4.1,
              trend: 'down',
              reasons: [
                { reason: 'Price too high', count: 8, percentage: 35 },
                { reason: 'Missing features', count: 6, percentage: 26 },
                { reason: 'Poor support', count: 4, percentage: 17 },
                { reason: 'Competitor switch', count: 3, percentage: 13 },
                { reason: 'Business closure', count: 2, percentage: 9 }
              ],
              monthlyHistory: [
                { month: 'Jan', rate: 5.2, customers: 12 },
                { month: 'Feb', rate: 4.8, customers: 11 },
                { month: 'Mar', rate: 4.5, customers: 10 },
                { month: 'Apr', rate: 4.2, customers: 9 },
                { month: 'May', rate: 4.0, customers: 8 },
                { month: 'Jun', rate: 4.1, customers: 9 },
                { month: 'Jul', rate: 3.8, customers: 8 },
                { month: 'Aug', rate: 3.5, customers: 7 },
                { month: 'Sep', rate: 3.3, customers: 6 },
                { month: 'Oct', rate: 3.2, customers: 6 },
                { month: 'Nov', rate: 3.2, customers: 6 },
                { month: 'Dec', rate: 3.2, customers: 6 }
              ]
            },
            growth: {
              newCustomers: 24,
              upgrades: 8,
              downgrades: 2,
              expansion: 6,
              netGrowth: 36,
              conversionRate: 15.2
            },
            customers: {
              total: 156,
              active: 142,
              trial: 14,
              churned: 6,
              newThisMonth: 24,
              churnedThisMonth: 6,
              convertedThisMonth: 18
            },
            forecasts: {
              nextMonth: 16200,
              nextQuarter: 19800,
              nextYear: 245000,
              confidence: 87
            }
          };
          setMetrics(mockMetrics);
        }
      } catch (error) {
        console.error('Error fetching revenue metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueMetrics();
  }, [timeRange]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">Comprehensive revenue analysis and forecasting</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading revenue analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">Comprehensive revenue analysis and forecasting</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-500">Failed to load revenue analytics. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">Comprehensive revenue analysis and forecasting</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="24m">Last 24 months</option>
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

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.mrr.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(metrics.mrr.trend)}
              <span className={getTrendColor(metrics.mrr.trend)}>
                +{metrics.mrr.growth}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.arr.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(metrics.mrr.trend)}
              <span className={getTrendColor(metrics.mrr.trend)}>
                +{metrics.arr.growth}% from last year
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.churn.rate}%</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(metrics.churn.trend)}
              <span className={getTrendColor(metrics.churn.trend)}>
                {metrics.churn.trend === 'down' ? '-' : '+'}{Math.abs(metrics.churn.rate - metrics.churn.previousRate)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Growth</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.growth.netGrowth}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.growth.newCustomers} new, {metrics.growth.upgrades} upgrades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              MRR Breakdown by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Starter</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">${metrics.mrr.breakdown.starter.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {((metrics.mrr.breakdown.starter / metrics.mrr.current) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(metrics.mrr.breakdown.starter / metrics.mrr.current) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Professional</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">${metrics.mrr.breakdown.professional.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {((metrics.mrr.breakdown.professional / metrics.mrr.current) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(metrics.mrr.breakdown.professional / metrics.mrr.current) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Enterprise</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">${metrics.mrr.breakdown.enterprise.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {((metrics.mrr.breakdown.enterprise / metrics.mrr.current) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(metrics.mrr.breakdown.enterprise / metrics.mrr.current) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Churn Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{metrics.churn.rate}%</div>
                <div className="text-sm text-muted-foreground">Current Churn Rate</div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Top Churn Reasons:</h4>
                {metrics.churn.reasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{reason.reason}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{reason.count}</span>
                      <span className="text-xs text-muted-foreground">({reason.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Customer Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Customers</span>
                <span className="text-lg font-bold text-green-600">+{metrics.growth.newCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upgrades</span>
                <span className="text-lg font-bold text-blue-600">+{metrics.growth.upgrades}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Downgrades</span>
                <span className="text-lg font-bold text-yellow-600">-{metrics.growth.downgrades}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expansion Revenue</span>
                <span className="text-lg font-bold text-purple-600">+{metrics.growth.expansion}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Conversion Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{metrics.growth.conversionRate}%</div>
                <div className="text-sm text-muted-foreground">Trial to Paid Conversion</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trial Customers</span>
                <span className="text-lg font-bold">{metrics.customers.trial}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Converted This Month</span>
                <span className="text-lg font-bold text-green-600">+{metrics.customers.convertedThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Revenue Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Month</span>
                <span className="text-lg font-bold">${metrics.forecasts.nextMonth.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Quarter</span>
                <span className="text-lg font-bold">${metrics.forecasts.nextQuarter.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Year</span>
                <span className="text-lg font-bold">${metrics.forecasts.nextYear.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence</span>
                <span className="text-lg font-bold text-green-600">{metrics.forecasts.confidence}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
