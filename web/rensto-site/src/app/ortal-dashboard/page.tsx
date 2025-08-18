import React from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from '@/components/ui/table-enhanced';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';
import Image from 'next/image';

// Mock data for demonstration
const mockLeads = [
  { id: 1, name: 'Jonathan Goldberg', location: 'Miami, Florida', group: 'ישראלים במיאמי', score: 100, engagement: 37 },
  { id: 2, name: 'Daniel Klein', location: 'Los Angeles, CA', group: 'לוח מודעות קהילתי - לוס אנג\'לס', score: 100, engagement: 99 },
  { id: 3, name: 'Sarah Goldberg', location: 'Portugal', group: 'ישראלים בפורטוגל Israelenses em Portugal', score: 100, engagement: 85 },
  { id: 4, name: 'Joseph Cohen', location: 'New York', group: 'World wide Jewish network', score: 95, engagement: 8 },
  { id: 5, name: 'Ruth Shapiro', location: 'Global', group: 'New York for Travelers', score: 92, engagement: 64 },
  { id: 6, name: 'Hannah Miller', location: 'Miami, Florida', group: 'ישראלים במיאמי', score: 89, engagement: 42 },
  { id: 7, name: 'Samuel Silver', location: 'Los Angeles, CA', group: 'לוח מודעות קהילתי - לוס אנג\'לס', score: 87, engagement: 73 },
  { id: 8, name: 'Leah Cohen', location: 'Portugal', group: 'ישראלים בפורטוגל Israelenses em Portugal', score: 85, engagement: 29 },
  { id: 9, name: 'David Schwartz', location: 'New York', group: 'World wide Jewish network', score: 83, engagement: 51 },
  { id: 10, name: 'Rachel Green', location: 'Global', group: 'New York for Travelers', score: 81, engagement: 38 }
];

export default function OrtalDashboard() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--rensto-bg-primary)' }}>
      {/* Header with Authentic Rensto Branding */}
      <div className="rensto-gradient-brand p-6" style={{ boxShadow: 'var(--rensto-glow-primary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative" style={{ width: 64, height: 64 }}>
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={64}
                  height={64}
                  priority
                  className="rensto-animate-glow rounded-lg"
                  style={{ objectFit: 'contain', backgroundColor: 'transparent', filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white rensto-animate-fadeIn">
                  Ortal's Facebook Leads Dashboard
                </h1>
                <p className="mt-1" style={{ color: 'var(--rensto-cyan)' }}>
                  5,548 Qualified Leads from Facebook Groups
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="renstoNeon" size="sm" className="rensto-animate-glow">
                📊 Export Data
              </Button>
              <Button variant="renstoPrimary" size="sm" className="rensto-animate-pulse">
                🔄 Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Cards with Authentic Rensto Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="rensto" className="rensto-card hover:rensto-glow-accent transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-col space-y-1.5 p-6 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👥</span>
                <h3 className="font-semibold tracking-tight text-lg" style={{ color: 'var(--rensto-text-primary)' }}>
                  Total Leads
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--rensto-red)' }}>5,548</span>
                <span className="text-sm text-green-400">+12%</span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--rensto-text-secondary)' }}>
                From last month
              </p>
            </CardContent>
          </Card>

          <Card variant="rensto" className="rensto-card hover:rensto-glow-accent transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-col space-y-1.5 p-6 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⭐</span>
                <h3 className="font-semibold tracking-tight text-lg" style={{ color: 'var(--rensto-text-primary)' }}>
                  High Value Leads
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--rensto-red)' }}>1,153</span>
                <span className="text-sm text-green-400">+8%</span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--rensto-text-secondary)' }}>
                Score 80+
              </p>
            </CardContent>
          </Card>

          <Card variant="rensto" className="rensto-card hover:rensto-glow-accent transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-col space-y-1.5 p-6 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <h3 className="font-semibold tracking-tight text-lg" style={{ color: 'var(--rensto-text-primary)' }}>
                  Active Groups
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--rensto-red)' }}>10</span>
                <span className="text-sm text-green-400">+2</span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--rensto-text-secondary)' }}>
                Facebook groups
              </p>
            </CardContent>
          </Card>

          <Card variant="rensto" className="rensto-card hover:rensto-glow-accent transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-col space-y-1.5 p-6 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <h3 className="font-semibold tracking-tight text-lg" style={{ color: 'var(--rensto-text-primary)' }}>
                  Avg. Engagement
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--rensto-red)' }}>67%</span>
                <span className="text-sm text-green-400">+5%</span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--rensto-text-secondary)' }}>
                Across all leads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Section with Authentic Rensto Styling */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight" style={{ color: 'var(--rensto-text-primary)' }}>
              🔍 Search & Filter Leads
            </h3>
            <p className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
              Find specific leads by name, location, or group
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by name..."
                className="rensto-input"
                style={{
                  backgroundColor: 'var(--rensto-bg-secondary)',
                  borderColor: 'var(--rensto-cyan)',
                  color: 'var(--rensto-text-primary)'
                }}
              />
              <Input
                placeholder="Filter by location..."
                className="rensto-input"
                style={{
                  backgroundColor: 'var(--rensto-bg-secondary)',
                  borderColor: 'var(--rensto-cyan)',
                  color: 'var(--rensto-text-primary)'
                }}
              />
              <Input
                placeholder="Filter by group..."
                className="rensto-input"
                style={{
                  backgroundColor: 'var(--rensto-bg-secondary)',
                  borderColor: 'var(--rensto-cyan)',
                  color: 'var(--rensto-text-primary)'
                }}
              />
            </div>
            <div className="flex space-x-3 mt-4">
              <Button variant="renstoPrimary" className="w-full rensto-animate-glow">
                Search
              </Button>
              <Button variant="renstoSecondary" className="w-full rensto-animate-glow">
                Clear Filters
              </Button>
              <Button variant="renstoGhost" className="w-full">
                Advanced Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table with Authentic Rensto Styling */}
        <Card variant="renstoGradient" className="rensto-card-gradient">
          <CardHeader className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold leading-none tracking-tight" style={{ color: 'var(--rensto-text-primary)' }}>
                  📋 Top Leads (Score 80+)
                </h3>
                <p className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
                  Showing 10 of 1,153 high-value leads
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="renstoNeon" size="sm" className="rensto-animate-glow">
                  Sort by Score
                </Button>
                <Button variant="renstoNeon" size="sm" className="rensto-animate-glow">
                  Sort by Engagement
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="rounded-lg border" style={{ backgroundColor: 'var(--rensto-bg-card)', borderColor: 'var(--rensto-bg-secondary)' }}>
              <Table>
                {/* Removed verbose caption for cleaner table */}
                <TableHeader>
                  <TableRow style={{ borderColor: 'var(--rensto-bg-secondary)' }}>
                    <TableHead style={{ color: 'var(--rensto-text-primary)' }}>Name</TableHead>
                    <TableHead style={{ color: 'var(--rensto-text-primary)' }}>Location</TableHead>
                    <TableHead style={{ color: 'var(--rensto-text-primary)' }}>Group</TableHead>
                    <TableHead style={{ color: 'var(--rensto-text-primary)' }}>Score</TableHead>
                    <TableHead style={{ color: 'var(--rensto-text-primary)' }}>Engagement</TableHead>
                    <TableHead style={{ color: 'var(--rensto-text-primary)' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLeads.map((lead) => (
                    <TableRow key={lead.id} style={{ borderColor: 'var(--rensto-bg-secondary)', backgroundColor: 'transparent' }}>
                      <TableCell className="font-medium" style={{ color: 'var(--rensto-cyan)' }}>
                        {lead.name}
                      </TableCell>
                      <TableCell style={{ color: 'var(--rensto-text-secondary)' }}>
                        {lead.location}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" style={{ color: 'var(--rensto-blue)' }}>
                        {lead.group}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          {lead.score}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium" style={{ color: 'var(--rensto-orange)' }}>
                        {lead.engagement}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="renstoPrimary" size="sm" className="rensto-animate-glow">
                            View
                          </Button>
                          <Button variant="renstoNeon" size="sm" className="rensto-animate-glow">
                            Contact
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="items-center p-6 pt-0 flex justify-between">
              <p className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
                Showing 1-10 of 1,153 high-value leads
              </p>
              <div className="flex space-x-2">
                <Button variant="renstoGhost" size="sm">
                  ← Previous
                </Button>
                <Button variant="renstoPrimary" size="sm">1</Button>
                <Button variant="renstoGhost" size="sm">2</Button>
                <Button variant="renstoGhost" size="sm">3</Button>
                <Button variant="renstoGhost" size="sm">Next →</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards with Authentic Rensto Styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="renstoNeon" className="rensto-card-neon rensto-animate-pulse">
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight" style={{ color: 'var(--rensto-text-primary)' }}>
                🎯 Custom Audiences
              </h3>
              <p className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
                Create targeted audiences
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="mb-4" style={{ color: 'var(--rensto-text-secondary)' }}>
                Generate custom audiences based on lead scores and engagement levels.
              </p>
              <Button variant="renstoPrimary" className="w-full rensto-animate-glow">
                Create Audience
              </Button>
            </CardContent>
          </Card>

          <Card variant="renstoNeon" className="rensto-card-neon">
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight" style={{ color: 'var(--rensto-text-primary)' }}>
                📊 Analytics Report
              </h3>
              <p className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
                Generate detailed reports
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="mb-4" style={{ color: 'var(--rensto-text-secondary)' }}>
                Get comprehensive analytics on lead performance and group effectiveness.
              </p>
              <Button variant="renstoSecondary" className="w-full rensto-animate-glow">
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card variant="rensto" className="rensto-card">
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight" style={{ color: 'var(--rensto-text-primary)' }}>
                ⚡ Quick Actions
              </h3>
              <p className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
                Common tasks
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              <Button variant="renstoGhost" className="w-full justify-start">
                📥 Export All Leads
              </Button>
              <Button variant="renstoGhost" className="w-full justify-start">
                📧 Send Campaign
              </Button>
              <Button variant="renstoGhost" className="w-full justify-start">
                🔄 Sync Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Banner with Authentic Rensto Styling */}
        <Card variant="renstoGradient" className="rensto-card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              <RenstoStatusIndicator status="online" size="lg" glow={true} />
              <span className="font-medium" style={{ color: 'var(--rensto-text-primary)' }}>
                ✅ Dashboard is running with authentic Rensto design system
              </span>
              <Button variant="renstoNeon" size="sm" className="rensto-animate-glow">
                View Live Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
