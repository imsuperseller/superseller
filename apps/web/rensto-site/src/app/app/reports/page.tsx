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
} from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-2">
            View detailed performance reports and analytics
          </p>
        </div>
        <Button variant="renstoPrimary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rensto-card">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Agent performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Success Rate</span>
                <Badge variant="renstoSuccess">94.2%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Runs</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Duration</span>
                <span className="font-medium">1m 45s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>Usage and cost breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>This Month</span>
                <span className="font-medium">$127.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Month</span>
                <span className="font-medium">$98.75</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Change</span>
                <Badge variant="renstoWarning">+29.1%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardHeader>
            <CardTitle>Agent Usage</CardTitle>
            <CardDescription>Most active agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>WordPress Agent</span>
                <span className="font-medium">15 runs</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Social Media</span>
                <span className="font-medium">12 runs</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Podcast Creator</span>
                <span className="font-medium">8 runs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
