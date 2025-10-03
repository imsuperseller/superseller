'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface RevenueData {
  mrr: number;
  arr: number;
  growth: number;
  churn: number;
  breakdown: {
    starter: number;
    professional: number;
    enterprise: number;
  };
}

export function RevenueMetrics() {
  // Mock data - replace with actual API call
  const revenueData: RevenueData = {
    mrr: 125000,
    arr: 1500000,
    growth: 12.5,
    churn: 3.2,
    breakdown: {
      starter: 45000,
      professional: 65000,
      enterprise: 15000,
    },
  };

  const getTrendIcon = (value: number) => {
    return value > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Revenue Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* MRR Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
            <p className="text-2xl font-bold">${revenueData.mrr.toLocaleString()}</p>
            <div className={`flex items-center text-sm ${getTrendColor(revenueData.growth)}`}>
              {getTrendIcon(revenueData.growth)}
              <span className="ml-1">
                {revenueData.growth > 0 ? '+' : ''}{revenueData.growth}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Annual Recurring Revenue</p>
            <p className="text-2xl font-bold">${revenueData.arr.toLocaleString()}</p>
            <div className="flex items-center text-sm text-gray-600">
              <span>Projected</span>
            </div>
          </div>
        </div>

        {/* Plan Breakdown */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Revenue by Plan</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Starter</Badge>
                <span className="text-sm text-gray-600">$97/month</span>
              </div>
              <span className="font-medium">${revenueData.breakdown.starter.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="default">Professional</Badge>
                <span className="text-sm text-gray-600">$297/month</span>
              </div>
              <span className="font-medium">${revenueData.breakdown.professional.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Enterprise</Badge>
                <span className="text-sm text-gray-600">$997/month</span>
              </div>
              <span className="font-medium">${revenueData.breakdown.enterprise.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-lg font-bold">{revenueData.churn}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Target</p>
              <p className="text-lg font-bold text-green-600">&lt;5%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
