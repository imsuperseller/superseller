'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table-enhanced';
import {
  DollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// Mock data - replace with real API calls
const mockBillingData = {
  currentPeriod: {
    start: '2024-01-01',
    end: '2024-01-31',
    total: 127.50,
    usage: 85,
    limit: 100,
  },
  invoices: [
    {
      id: 'INV-001',
      date: '2024-01-15',
      amount: 45.75,
      status: 'paid',
      description: 'December 2024 Usage',
    },
    {
      id: 'INV-002',
      date: '2024-01-01',
      amount: 81.25,
      status: 'paid',
      description: 'November 2024 Usage',
    },
    {
      id: 'INV-003',
      date: '2024-12-15',
      amount: 67.30,
      status: 'paid',
      description: 'October 2024 Usage',
    },
  ],
  usageBreakdown: [
    {
      service: 'WordPress Content Agent',
      usage: 25.50,
      percentage: 30,
    },
    {
      service: 'Social Media Posts',
      usage: 18.75,
      percentage: 22,
    },
    {
      service: 'Facebook Group Scraper',
      usage: 12.25,
      percentage: 14,
    },
    {
      service: 'Podcast Creator',
      usage: 35.00,
      percentage: 41,
    },
    {
      service: 'Insurance Profile Generator',
      usage: 5.00,
      percentage: 6,
    },
  ],
  paymentMethod: {
    type: 'Visa',
    last4: '4242',
    expiry: '12/25',
    name: 'Ben Ginati',
  },
};

export default function BillingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="renstoSuccess">Paid</Badge>;
      case 'pending':
        return <Badge variant="renstoWarning">Pending</Badge>;
      case 'overdue':
        return <Badge variant="renstoError">Overdue</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Billing & Usage</h1>
          <p className="text-slate-600 mt-2">
            Manage your billing information and track usage
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Invoice
          </Button>
          <Button variant="renstoPrimary">
            <CreditCard className="h-4 w-4 mr-2" />
            Update Payment Method
          </Button>
        </div>
      </div>

      {/* Current Period Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Current Period</p>
                <p className="text-2xl font-bold text-slate-900">${mockBillingData.currentPeriod.total}</p>
                <p className="text-xs text-slate-500">
                  {mockBillingData.currentPeriod.start} - {mockBillingData.currentPeriod.end}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Usage</p>
                <p className="text-2xl font-bold text-slate-900">{mockBillingData.currentPeriod.usage}%</p>
                <p className="text-xs text-slate-500">of {mockBillingData.currentPeriod.limit}% limit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Next Invoice</p>
                <p className="text-2xl font-bold text-slate-900">Jan 31</p>
                <p className="text-xs text-slate-500">Estimated: ${mockBillingData.currentPeriod.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Payment Method</p>
                <p className="text-2xl font-bold text-slate-900">{mockBillingData.paymentMethod.type}</p>
                <p className="text-xs text-slate-500">•••• {mockBillingData.paymentMethod.last4}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Breakdown */}
      <Card className="rensto-card">
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of your current period usage by service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBillingData.usageBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <div>
                    <p className="font-medium text-slate-900">{item.service}</p>
                    <p className="text-sm text-slate-600">${item.usage}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-orange-500 ${getUsageColor(item.percentage)}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="rensto-card">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            View and download your recent invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBillingData.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>${invoice.amount}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="rensto-card">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Your current payment method for automatic billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {mockBillingData.paymentMethod.type} •••• {mockBillingData.paymentMethod.last4}
                </p>
                <p className="text-sm text-slate-600">
                  Expires {mockBillingData.paymentMethod.expiry} • {mockBillingData.paymentMethod.name}
                </p>
              </div>
            </div>
            <Button variant="outline">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
