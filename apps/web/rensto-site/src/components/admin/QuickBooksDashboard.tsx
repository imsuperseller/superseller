'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CustomerData {
  id: string;
  name: string;
  company: string;
  paid: number;
  outstanding: number;
  monthlyExpenses: number;
  status: 'active' | 'inactive';
}

interface ExpenseData {
  service: string;
  amount: number;
  percentage: number;
}

interface QuickBooksStatus {
  integrationStatus: string;
  apiConnection: string;
  lastSync: string;
  realmId: string;
  accessToken: string;
  refreshToken: string;
}

interface MCPTool {
  name: string;
  description: string;
  price: string;
  icon: string;
}

export default function QuickBooksDashboard() {
  const [customerData, setCustomerData] = useState<CustomerData[]>([
    {
      id: '1',
      name: 'Customer A',
      company: 'Business Solutions Inc',
      paid: 3000,
      outstanding: 2000,
      monthlyExpenses: 1250,
      status: 'active'
    },
    {
      id: '2',
      name: 'Customer B',
      company: 'Professional Services',
      paid: 150,
      outstanding: 100,
      monthlyExpenses: 75,
      status: 'active'
    },
    {
      id: '3',
      name: 'Customer C',
      company: 'Digital Marketing Co',
      paid: 5198,
      outstanding: 0,
      monthlyExpenses: 450,
      status: 'active'
    }
  ]);

  const [expenseData, setExpenseData] = useState<ExpenseData[]>([
    { service: 'OpenAI API', amount: 525, percentage: 42 },
    { service: 'n8n Platform', amount: 900, percentage: 72 },
    { service: 'Stripe Fees', amount: 200, percentage: 16 },
    { service: 'QuickBooks', amount: 50, percentage: 4 }
  ]);

  const [quickBooksStatus, setQuickBooksStatus] = useState<QuickBooksStatus>({
    integrationStatus: 'Active',
    apiConnection: 'Connected',
    lastSync: '2 min ago',
    realmId: '9341454031329905',
    accessToken: 'Valid',
    refreshToken: 'Valid'
  });

  const [mcpTools, setMcpTools] = useState<MCPTool[]>([
    { name: 'Payment Data', description: 'Real-time customer payment tracking', price: '$29/mo', icon: '💳' },
    { name: 'Revenue Analytics', description: 'Period-based revenue analysis', price: '$29/mo', icon: '📊' },
    { name: 'Payment Records', description: 'Automated payment recording', price: '$29/mo', icon: '✅' },
    { name: 'Balance & Aging', description: 'Customer credit analysis', price: '$29/mo', icon: '⚖️' },
    { name: 'Expense Tracking', description: 'External service monitoring', price: '$29/mo', icon: '💰' },
    { name: 'Expense Summary', description: 'Cost breakdown & optimization', price: '$29/mo', icon: '📈' }
  ]);

  const totalRevenue = customerData.reduce((sum, customer) => sum + customer.paid, 0);
  const totalOutstanding = customerData.reduce((sum, customer) => sum + customer.outstanding, 0);
  const totalMonthlyExpenses = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyMcpRevenue = mcpTools.length * 29;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-8 border-b border-border">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent font-mono mb-2">
          QuickBooks Data Center
        </h1>
        <p className="text-xl text-muted-foreground font-light">
          Real-time financial analytics and customer management
        </p>
      </div>

      {/* Data Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 font-mono mb-2">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Total Revenue
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 font-mono mb-2">
              {customerData.length}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Active Customers
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 font-mono mb-2">
              {mcpTools.length}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              MCP Tools
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 font-mono mb-2">
              ${monthlyMcpRevenue}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Monthly Revenue
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Data Table */}
        <div className="lg:col-span-2">
          <Card className="border-cyan-500/10">
            <CardHeader className="border-b border-cyan-500/10 pb-4">
              <CardTitle className="text-xl font-bold text-cyan-400 font-mono flex items-center">
                📊 Customer Financial Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-500/10">
                      <th className="text-left p-4 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Customer
                      </th>
                      <th className="text-left p-4 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Company
                      </th>
                      <th className="text-left p-4 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Paid
                      </th>
                      <th className="text-left p-4 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Outstanding
                      </th>
                      <th className="text-left p-4 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Monthly Expenses
                      </th>
                      <th className="text-left p-4 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.map((customer) => (
                      <tr key={customer.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.company}</div>
                        </td>
                        <td className="p-4 text-muted-foreground">{customer.company}</td>
                        <td className="p-4 font-mono font-semibold text-cyan-400">
                          ${customer.paid.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono font-semibold text-orange-500">
                          ${customer.outstanding.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono font-semibold text-cyan-400">
                          ${customer.monthlyExpenses.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            {customer.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QuickBooks Status Panel */}
        <div>
          <Card className="border-cyan-500/10 h-fit">
            <CardHeader className="border-b border-cyan-500/10 pb-4">
              <CardTitle className="text-xl font-bold text-cyan-400 font-mono flex items-center">
                🔗 QuickBooks Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-cyan-500/5">
                <span className="text-sm text-muted-foreground font-medium">Integration Status</span>
                <div className="flex items-center">
                  <span className="text-sm font-mono font-semibold text-cyan-400">{quickBooksStatus.integrationStatus}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-cyan-500/5">
                <span className="text-sm text-muted-foreground font-medium">API Connection</span>
                <div className="flex items-center">
                  <span className="text-sm font-mono font-semibold text-cyan-400">{quickBooksStatus.apiConnection}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-cyan-500/5">
                <span className="text-sm text-muted-foreground font-medium">Last Sync</span>
                <span className="text-sm font-mono font-semibold text-cyan-400">{quickBooksStatus.lastSync}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-cyan-500/5">
                <span className="text-sm text-muted-foreground font-medium">Realm ID</span>
                <span className="text-sm font-mono font-semibold text-cyan-400">{quickBooksStatus.realmId}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-cyan-500/5">
                <span className="text-sm text-muted-foreground font-medium">Access Token</span>
                <span className="text-sm font-mono font-semibold text-cyan-400">{quickBooksStatus.accessToken}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground font-medium">Refresh Token</span>
                <span className="text-sm font-mono font-semibold text-cyan-400">{quickBooksStatus.refreshToken}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expense Breakdown */}
      <Card className="border-cyan-500/10">
        <CardHeader className="border-b border-cyan-500/10 pb-4">
          <CardTitle className="text-xl font-bold text-cyan-400 font-mono flex items-center">
            💰 External Service Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expenseData.map((expense, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-4 border border-orange-500/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground font-medium">{expense.service}</span>
                  <span className="text-sm font-mono font-semibold text-orange-500">
                    ${expense.amount.toLocaleString()}/mo
                  </span>
                </div>
                <div className="w-full bg-orange-500/20 rounded-full h-1">
                  <div
                    className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${expense.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MCP Tools */}
      <Card className="border-cyan-500/10">
        <CardHeader className="border-b border-cyan-500/10 pb-4">
          <CardTitle className="text-xl font-bold text-cyan-400 font-mono flex items-center">
            🛠️ QuickBooks MCP Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {mcpTools.map((tool, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-4 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 text-center">
                <div className="text-2xl mb-2">{tool.icon}</div>
                <div className="text-sm font-semibold text-foreground font-mono mb-1">{tool.name}</div>
                <div className="text-xs text-muted-foreground mb-3 leading-tight">{tool.description}</div>
                <div className="text-xs font-semibold text-orange-500 font-mono">{tool.price}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
