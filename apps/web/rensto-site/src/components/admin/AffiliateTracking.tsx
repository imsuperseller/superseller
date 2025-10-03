import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CommissionData {
  customerId: string;
  customerName: string;
  platform: string;
  monthlyRevenue: number;
  commission: number;
  commissionRate: number;
  usage: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'pending';
}

interface AffiliateReport {
  period: string;
  totalRevenue: number;
  totalCommissions: number;
  topCustomers: CommissionData[];
  predictions: {
    nextMonthRevenue: number;
    nextQuarterRevenue: number;
    growthRate: number;
  };
}

export default function AffiliateTracking() {
  const [commissionData, setCommissionData] = useState<CommissionData[]>([
    {
      customerId: 'customer_001',
      customerName: 'Ben Ginati',
      platform: 'n8n',
      monthlyRevenue: 2500,
      commission: 375,
      commissionRate: 0.15,
      usage: 450,
      lastActivity: '2025-08-19T03:30:00Z',
      status: 'active'
    },
    {
      customerId: 'customer_002',
      customerName: 'Customer B',
      platform: 'n8n',
      monthlyRevenue: 1800,
      commission: 270,
      commissionRate: 0.15,
      usage: 320,
      lastActivity: '2025-08-19T03:25:00Z',
      status: 'active'
    },
    {
      customerId: 'customer_003',
      customerName: 'Ortal Portal',
      platform: 'n8n',
      monthlyRevenue: 1200,
      commission: 180,
      commissionRate: 0.15,
      usage: 280,
      lastActivity: '2025-08-19T03:20:00Z',
      status: 'active'
    },
    {
      customerId: 'customer_004',
      customerName: 'Massive Group',
      platform: 'n8n',
      monthlyRevenue: 950,
      commission: 142.5,
      commissionRate: 0.15,
      usage: 200,
      lastActivity: '2025-08-19T03:15:00Z',
      status: 'active'
    }
  ]);

  const [reports, setReports] = useState<AffiliateReport[]>([
    {
      period: 'August 2025',
      totalRevenue: 6450,
      totalCommissions: 967.5,
      topCustomers: [
        {
          customerId: 'customer_001',
          customerName: 'Ben Ginati',
          platform: 'n8n',
          monthlyRevenue: 2500,
          commission: 375,
          commissionRate: 0.15,
          usage: 450,
          lastActivity: '2025-08-19T03:30:00Z',
          status: 'active'
        },
        {
          customerId: 'customer_002',
          customerName: 'Customer B',
          platform: 'n8n',
          monthlyRevenue: 1800,
          commission: 270,
          commissionRate: 0.15,
          usage: 320,
          lastActivity: '2025-08-19T03:25:00Z',
          status: 'active'
        }
      ],
      predictions: {
        nextMonthRevenue: 7200,
        nextQuarterRevenue: 21000,
        growthRate: 0.25
      }
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('August 2025');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const totalRevenue = commissionData.reduce((sum, customer) => sum + customer.monthlyRevenue, 0);
  const totalCommissions = commissionData.reduce((sum, customer) => sum + customer.commission, 0);
  const totalUsage = commissionData.reduce((sum, customer) => sum + customer.usage, 0);

  const generateReport = async (period: string) => {
    console.log(`Generating affiliate report for ${period}`);
    // Implementation for generating affiliate report
  };

  const trackCommissions = async (customerId: string) => {
    console.log(`Tracking commissions for customer ${customerId}`);
    // Implementation for tracking commissions
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Affiliate Commission Tracking</h2>
        <div className="flex space-x-4">
          <Badge variant="outline">Total Revenue: ${totalRevenue}</Badge>
          <Badge variant="outline">Total Commissions: ${totalCommissions}</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissionData.length}</div>
            <p className="text-xs text-muted-foreground">Generating commissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">From affiliate sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommissions}</div>
            <p className="text-xs text-muted-foreground">15% commission rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">n8n executions</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Tracking and Reports */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Commission Tracking">Commission Tracking</TabsTrigger>
          <TabsTrigger value="Reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="Commission Tracking" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Customer Commission Data</h3>
            <Button onClick={() => generateReport('current')}>Generate Report</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {commissionData.map((customer) => (
              <Card key={customer.customerId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {customer.customerName}
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <span>{customer.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Revenue:</span>
                      <span>${customer.monthlyRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission:</span>
                      <span>${customer.commission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission Rate:</span>
                      <span>{(customer.commissionRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage:</span>
                      <span>{customer.usage} executions</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Activity:</span>
                      <span>{new Date(customer.lastActivity).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => trackCommissions(customer.customerId)}>
                      Track Commissions
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Affiliate Reports</h3>
            <Button onClick={() => generateReport('monthly')}>Generate Monthly Report</Button>
          </div>

          {reports.map((report) => (
            <Card key={report.period}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {report.period} Report
                  <div className="flex space-x-2">
                    <Badge variant="outline">Revenue: ${report.totalRevenue}</Badge>
                    <Badge variant="outline">Commissions: ${report.totalCommissions}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Top Customers */}
                <div>
                  <h4 className="font-semibold mb-3">Top Customers</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {report.topCustomers.map((customer) => (
                      <div key={customer.customerId} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{customer.customerName}</div>
                          <div className="text-sm text-muted-foreground">{customer.platform}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${customer.monthlyRevenue}</div>
                          <div className="text-sm text-muted-foreground">${customer.commission} commission</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predictions */}
                <div>
                  <h4 className="font-semibold mb-3">Revenue Predictions</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">Next Month</div>
                      <div className="text-xl font-bold">${report.predictions.nextMonthRevenue}</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">Next Quarter</div>
                      <div className="text-xl font-bold">${report.predictions.nextQuarterRevenue}</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">Growth Rate</div>
                      <div className="text-xl font-bold">{(report.predictions.growthRate * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
