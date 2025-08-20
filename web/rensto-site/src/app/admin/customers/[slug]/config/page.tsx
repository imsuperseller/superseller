'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { Switch } from '@/components/ui/switch-enhanced';
import { Textarea } from '@/components/ui/textarea-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Settings,
  Bot,
  Globe,
  FileText,
  Users,
  Building
} from 'lucide-react';

interface CustomerConfig {
  name: string;
  company: string;
  industry: string;
  businessType: string;
  tabs: Array<{ id: string; label: string; icon: string }>;
  agents: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    status: string;
    type: string;
    capabilities?: string[];
  }>;
  features: {
    podcastManagement?: boolean;
    wordpressAutomation?: boolean;
    socialMediaAutomation?: boolean;
    contentGeneration?: boolean;
    excelProcessing?: boolean;
    dataAnalysis?: boolean;
    documentManagement?: boolean;
    clientManagement?: boolean;
  };
  availableIntegrations?: string[];
  templates?: string[];
}

export default function CustomerConfigPage() {
  const params = useParams();
  const router = useRouter();
  const customerSlug = params.slug as string;
  
  const [config, setConfig] = useState<CustomerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch customer configuration
  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        const response = await fetch(`/api/customers/${customerSlug}/config`);
        const data = await response.json();
        
        if (data.success) {
          setConfig(data.config);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    }

    if (customerSlug) {
      fetchConfig();
    }
  }, [customerSlug]);

  // Save configuration
  const handleSave = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/customers/${customerSlug}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Configuration saved successfully!');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Update feature toggle
  const updateFeature = (feature: string, value: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      features: {
        ...config.features,
        [feature]: value
      }
    });
  };

  // Add new tab
  const addTab = () => {
    if (!config) return;
    const newTab = {
      id: `tab-${Date.now()}`,
      label: 'New Tab',
      icon: '📊'
    };
    setConfig({
      ...config,
      tabs: [...config.tabs, newTab]
    });
  };

  // Remove tab
  const removeTab = (tabId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      tabs: config.tabs.filter(tab => tab.id !== tabId)
    });
  };

  // Add new agent
  const addAgent = () => {
    if (!config) return;
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: 'New Agent',
      description: 'Agent description',
      icon: '🤖',
      status: 'pending',
      type: 'general'
    };
    setConfig({
      ...config,
      agents: [...config.agents, newAgent]
    });
  };

  // Remove agent
  const removeAgent = (agentId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      agents: config.agents.filter(agent => agent.id !== agentId)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rensto-bg text-rensto-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rensto-primary mx-auto mb-4"></div>
          <p className="text-rensto-text-muted">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-rensto-bg text-rensto-text flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-rensto-text mb-2">Configuration Not Found</h1>
          <p className="text-rensto-text-muted mb-4">
            Customer configuration could not be loaded.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rensto-bg text-rensto-text">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold text-rensto-text mb-2">
              {config.company} Configuration
            </h1>
            <p className="text-rensto-text-muted">
              Manage customer-specific features and settings
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        {/* Configuration Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'features', label: 'Features', icon: Bot },
            { id: 'tabs', label: 'Portal Tabs', icon: Globe },
            { id: 'agents', label: 'Agents', icon: Bot },
            { id: 'integrations', label: 'Integrations', icon: Building }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-rensto-primary text-white'
                  : 'bg-rensto-card text-rensto-text-muted hover:text-rensto-text hover:bg-rensto-card/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>General Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={config.company}
                      onChange={(e) => setConfig({ ...config, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={config.industry}
                      onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input
                      id="businessType"
                      value={config.businessType}
                      onChange={(e) => setConfig({ ...config, businessType: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'features' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Feature Toggles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(config.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between p-4 border border-rensto-border rounded-lg">
                      <div>
                        <h3 className="font-medium text-rensto-text capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-rensto-text-muted">
                          Enable {feature.toLowerCase()} features
                        </p>
                      </div>
                      <Switch
                        checked={enabled || false}
                        onCheckedChange={(checked) => updateFeature(feature, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'tabs' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Portal Tabs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-rensto-text-muted">
                    Configure which tabs appear in the customer portal
                  </p>
                  <Button onClick={addTab} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tab
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {config.tabs.map((tab, index) => (
                    <div key={tab.id} className="flex items-center space-x-3 p-3 border border-rensto-border rounded-lg">
                      <Input
                        value={tab.icon}
                        onChange={(e) => {
                          const newTabs = [...config.tabs];
                          newTabs[index].icon = e.target.value;
                          setConfig({ ...config, tabs: newTabs });
                        }}
                        className="w-16 text-center"
                      />
                      <Input
                        value={tab.label}
                        onChange={(e) => {
                          const newTabs = [...config.tabs];
                          newTabs[index].label = e.target.value;
                          setConfig({ ...config, tabs: newTabs });
                        }}
                        placeholder="Tab Label"
                      />
                      <Input
                        value={tab.id}
                        onChange={(e) => {
                          const newTabs = [...config.tabs];
                          newTabs[index].id = e.target.value;
                          setConfig({ ...config, tabs: newTabs });
                        }}
                        placeholder="Tab ID"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTab(tab.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'agents' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>AI Agents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-rensto-text-muted">
                    Configure AI agents available to this customer
                  </p>
                  <Button onClick={addAgent} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Agent
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {config.agents.map((agent, index) => (
                    <div key={agent.id} className="p-4 border border-rensto-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Input
                            value={agent.icon}
                            onChange={(e) => {
                              const newAgents = [...config.agents];
                              newAgents[index].icon = e.target.value;
                              setConfig({ ...config, agents: newAgents });
                            }}
                            className="w-16 text-center"
                          />
                          <Input
                            value={agent.name}
                            onChange={(e) => {
                              const newAgents = [...config.agents];
                              newAgents[index].name = e.target.value;
                              setConfig({ ...config, agents: newAgents });
                            }}
                            placeholder="Agent Name"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAgent(agent.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={agent.description}
                        onChange={(e) => {
                          const newAgents = [...config.agents];
                          newAgents[index].description = e.target.value;
                          setConfig({ ...config, agents: newAgents });
                        }}
                        placeholder="Agent description"
                        className="mb-3"
                      />
                      <div className="flex items-center space-x-3">
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                        <Badge variant="outline">{agent.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Available Integrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-rensto-text-muted">
                  These integrations will be available for this customer to configure.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.availableIntegrations?.map((integration) => (
                    <div key={integration} className="p-3 border border-rensto-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-rensto-text">{integration}</span>
                        <Badge variant="outline">Available</Badge>
                      </div>
                    </div>
                  )) || (
                    <p className="text-rensto-text-muted col-span-2">
                      No integrations configured
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
