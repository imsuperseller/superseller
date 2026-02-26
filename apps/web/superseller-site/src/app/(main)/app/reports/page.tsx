'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Activity,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-superseller-text-primary">Reports & Analytics</h1>
          <p className="text-superseller-text-secondary mt-2">
            View detailed performance reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="supersellerSecondary">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button variant="supersellerSecondary">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-superseller-text-secondary">Total Savings</p>
                <p className="text-2xl font-bold text-superseller-text-primary">$2,450</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+15% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-superseller-text-secondary">Agent Efficiency</p>
                <p className="text-2xl font-bold text-superseller-text-primary">94.2%</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+2.4% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-superseller-text-secondary">Tasks Automated</p>
                <p className="text-2xl font-bold text-superseller-text-primary">1,284</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+8% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader>
            <CardTitle className="text-superseller-text-primary">Performance Overview</CardTitle>
            <CardDescription className="text-superseller-text-secondary">Agent performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-superseller-text-secondary">Success Rate</span>
                <Badge variant="supersellerSuccess">94.2%</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-superseller-text-secondary">Total Runs</span>
                <span className="font-medium text-superseller-text-primary">47</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-superseller-text-secondary">Avg Duration</span>
                <span className="font-medium text-superseller-text-primary">1m 45s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader>
            <CardTitle className="text-superseller-text-primary">Cost Analysis</CardTitle>
            <CardDescription className="text-superseller-text-secondary">Usage and cost breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-superseller-text-secondary">This Month</span>
                <span className="font-medium text-superseller-text-primary">$127.50</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-superseller-text-secondary">Last Month</span>
                <span className="font-medium text-superseller-text-primary">$98.75</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-superseller-text-secondary">Change</span>
                <Badge variant="supersellerWarning">+29.1%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon md:col-span-2">
          <CardHeader>
            <CardTitle className="text-superseller-text-primary">Agent Usage</CardTitle>
            <CardDescription className="text-superseller-text-secondary">Most active agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-superseller-text-primary">WordPress Agent</span>
                <span className="font-medium text-superseller-cyan">15 runs</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-superseller-text-primary">Social Media</span>
                <span className="font-medium text-superseller-cyan">12 runs</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-superseller-text-primary">Podcast Creator</span>
                <span className="font-medium text-superseller-cyan">8 runs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
