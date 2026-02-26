'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Users, UserPlus, UserMinus, UserCheck } from 'lucide-react';

interface CustomerData {
  total: number;
  active: number;
  trial: number;
  churned: number;
  newThisMonth: number;
  churnedThisMonth: number;
  convertedThisMonth: number;
}

export function CustomerMetrics() {
  // Mock data - replace with actual API call
  const customerData: CustomerData = {
    total: 1247,
    active: 1156,
    trial: 67,
    churned: 24,
    newThisMonth: 89,
    churnedThisMonth: 12,
    convertedThisMonth: 23,
  };

  const conversionRate = customerData.convertedThisMonth / customerData.newThisMonth * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Customer Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold">{customerData.total.toLocaleString()}</p>
            <div className="flex items-center text-sm text-green-600">
              <UserPlus className="h-4 w-4" />
              <span className="ml-1">+{customerData.newThisMonth} this month</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Customers</p>
            <p className="text-2xl font-bold">{customerData.active.toLocaleString()}</p>
            <div className="flex items-center text-sm text-gray-600">
              <span>{((customerData.active / customerData.total) * 100).toFixed(1)}% of total</span>
            </div>
          </div>
        </div>

        {/* Customer Status Breakdown */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Customer Status</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <span className="font-medium">{customerData.active.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Trial
                </Badge>
              </div>
              <span className="font-medium">{customerData.trial.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  Churned
                </Badge>
              </div>
              <span className="font-medium">{customerData.churned.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Monthly Metrics */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium text-gray-700 mb-3">This Month</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <UserPlus className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600">+{customerData.newThisMonth}</p>
              <p className="text-xs text-gray-600">New</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <UserCheck className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-600">+{customerData.convertedThisMonth}</p>
              <p className="text-xs text-gray-600">Converted</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <UserMinus className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-lg font-bold text-red-600">-{customerData.churnedThisMonth}</p>
              <p className="text-xs text-gray-600">Churned</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              Conversion Rate: <span className="font-medium">{conversionRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
