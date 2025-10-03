'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-enhanced';
import { Textarea } from '@/components/ui/textarea-enhanced';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-enhanced';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Activity, 
  Mail, 
  Database, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search
} from 'lucide-react';
import { leadGenerationAPI } from '@/lib/lead-generation-api';

interface LeadGenerationStats {
  totalLeads: number;
  leadsThisMonth: number;
  conversionRate: number;
  activeCampaigns: number;
  crmContacts: number;
  emailCampaigns: number;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  leadsDelivered: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
}

export default function LeadGenerationDashboard() {
  const [stats, setStats] = useState<LeadGenerationStats>({
    totalLeads: 0,
    leadsThisMonth: 0,
    conversionRate: 0,
    activeCampaigns: 0,
    crmContacts: 0,
    emailCampaigns: 0
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Lead generation form state
  const [leadForm, setLeadForm] = useState({
    sources: [] as string[],
    industry: '',
    location: '',
    companySize: '',
    keywords: [] as string[],
    quantity: 50,
    deliveryMethod: 'crm' as 'email' | 'crm' | 'api'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load analytics data
      const analytics = await leadGenerationAPI.getAnalytics('current-customer', '30d');
      setStats({
        totalLeads: analytics.usage?.total?.leadGeneration || 0,
        leadsThisMonth: analytics.usage?.total?.leadGeneration || 0,
        conversionRate: analytics.metrics?.efficiencyScore || 0,
        activeCampaigns: analytics.usage?.total?.emailCampaigns || 0,
        crmContacts: analytics.usage?.total?.crmContacts || 0,
        emailCampaigns: analytics.usage?.total?.emailCampaigns || 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLeads = async () => {
    try {
      setLoading(true);
      const result = await leadGenerationAPI.generateLeads({
        customerId: 'current-customer',
        sources: leadForm.sources,
        criteria: {
          industry: leadForm.industry,
          location: leadForm.location,
          companySize: leadForm.companySize,
          keywords: leadForm.keywords
        },
        quantity: leadForm.quantity,
        deliveryMethod: leadForm.deliveryMethod
      });

      if (result.success) {
        alert(`Successfully generated ${result.leadsGenerated} leads!`);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error generating leads:', error);
      alert('Error generating leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      setLoading(true);
      const result = await leadGenerationAPI.createCampaign({
        name: `Lead Campaign - ${new Date().toLocaleDateString()}`,
        from_name: 'Rensto Lead Generation',
        from_email: 'leads@rensto.com',
        reply_to: 'leads@rensto.com',
        subject: 'Your Lead Generation Results',
        html_content: '<h2>Your Lead Generation Results</h2><p>Here are your generated leads...</p>',
        text_content: 'Your Lead Generation Results\n\nHere are your generated leads...'
      });

      if (result.success) {
        alert('Campaign created successfully!');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Generation Dashboard</h1>
          <p className="text-gray-600">Manage your lead generation campaigns and analytics</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={createCampaign} size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.leadsThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Efficiency score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Running campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CRM Contacts</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.crmContacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              In your CRM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Leads</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lead generation completed</p>
                      <p className="text-xs text-gray-500">50 leads generated from LinkedIn</p>
                    </div>
                    <span className="text-xs text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Campaign started</p>
                      <p className="text-xs text-gray-500">Email campaign "Q4 Leads" is now active</p>
                    </div>
                    <span className="text-xs text-gray-500">1 hour ago</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Usage alert</p>
                      <p className="text-xs text-gray-500">80% of monthly lead limit reached</p>
                    </div>
                    <span className="text-xs text-gray-500">3 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Generate LinkedIn Leads
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Create Email Campaign
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Sync to CRM
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Leads</CardTitle>
              <p className="text-sm text-gray-600">Configure your lead generation parameters</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sources">Lead Sources</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['linkedin', 'google_maps', 'facebook', 'apify'].map((source) => (
                        <label key={source} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={leadForm.sources.includes(source)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setLeadForm(prev => ({
                                  ...prev,
                                  sources: [...prev.sources, source]
                                }));
                              } else {
                                setLeadForm(prev => ({
                                  ...prev,
                                  sources: prev.sources.filter(s => s !== source)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={leadForm.industry}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={leadForm.location}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., New York, San Francisco, Remote"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      value={leadForm.companySize}
                      onValueChange={(value) => setLeadForm(prev => ({ ...prev, companySize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                        <SelectItem value="small">Small (11-50 employees)</SelectItem>
                        <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                        <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Number of Leads</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={leadForm.quantity}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryMethod">Delivery Method</Label>
                    <Select
                      value={leadForm.deliveryMethod}
                      onValueChange={(value: 'email' | 'crm' | 'api') => setLeadForm(prev => ({ ...prev, deliveryMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="crm">CRM Integration</SelectItem>
                        <SelectItem value="api">API Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setLeadForm({
                  sources: [],
                  industry: '',
                  location: '',
                  companySize: '',
                  keywords: [],
                  quantity: 50,
                  deliveryMethod: 'crm'
                })}>
                  Reset
                </Button>
                <Button onClick={generateLeads} disabled={loading || leadForm.sources.length === 0}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Generate Leads
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <p className="text-sm text-gray-600">Manage your email marketing campaigns</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No campaigns yet</p>
                    <p className="text-sm text-gray-400">Create your first campaign to get started</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-gray-500">
                          {campaign.leadsDelivered} leads • {campaign.openRate}% open rate
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Performance</CardTitle>
              <p className="text-sm text-gray-600">Track your lead generation performance</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Analytics coming soon</p>
                <p className="text-sm text-gray-400">Detailed performance metrics will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
