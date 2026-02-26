'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building,
  Phone,
  CreditCard,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Workflow,
  Bot,
  Users,
  FileText,
  Link,
} from 'lucide-react';

interface CustomerFormData {
  // Basic Information
  name: string;
  email: string;
  company: string;
  phone: string;

  // Business Context
  industry: string;
  businessSize: 'startup' | 'small' | 'medium' | 'enterprise';
  primaryUseCase: string;
  currentAutomationLevel: 'none' | 'basic' | 'intermediate' | 'advanced';

  // AI Agent Requirements
  agentTypes: {
    offerCrafting: boolean;
    bugFinding: boolean;
    salesAutomation: boolean;
    dataAnalysis: boolean;
    customerSupport: boolean;
    marketingAutomation: boolean;
    processOptimization: boolean;
    customWorkflows: boolean;
  };

  // Technical Requirements
  integrations: {
    n8n: boolean;
    mongodb: boolean;
    stripe: boolean;
    nextAuth: boolean;
    customAPIs: boolean;
    databases: boolean;
    crm: boolean;
    emailMarketing: boolean;
    socialMedia: boolean;
  };

  // Workflow Requirements
  workflowComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  expectedVolume: 'low' | 'medium' | 'high' | 'enterprise';
  realTimeRequirements: boolean;

  // Subscription & Billing
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'pending';
  billingCycle: 'monthly' | 'quarterly' | 'annual';

  // Project Details
  projectTimeline: string;
  budget: string;
  successMetrics: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  general?: string;
}

export default function AddCustomerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    businessSize: 'small',
    primaryUseCase: '',
    currentAutomationLevel: 'none',
    agentTypes: {
      offerCrafting: false,
      bugFinding: false,
      salesAutomation: false,
      dataAnalysis: false,
      customerSupport: false,
      marketingAutomation: false,
      processOptimization: false,
      customWorkflows: false,
    },
    integrations: {
      n8n: false,
      zapier: false,
      make: false,
      customAPIs: false,
      databases: false,
      crm: false,
      emailMarketing: false,
      socialMedia: false,
    },
    workflowComplexity: 'simple',
    expectedVolume: 'low',
    realTimeRequirements: false,
    plan: 'basic',
    status: 'pending',
    billingCycle: 'monthly',
    projectTimeline: '',
    budget: '',
    successMetrics: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<{
    customer: unknown;
    tempPassword: string;
  } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.primaryUseCase.trim()) {
      newErrors.general =
        'Primary use case is required to understand automation needs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerFormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleAgentTypeChange = (
    agentType: keyof CustomerFormData['agentTypes'],
    value: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      agentTypes: {
        ...prev.agentTypes,
        [agentType]: value,
      },
    }));
  };

  const handleIntegrationChange = (
    integration: keyof CustomerFormData['integrations'],
    value: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integration]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer');
      }

      setSuccess({
        customer: data.customer,
        tempPassword: data.customer.tempPassword,
      });

      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        industry: '',
        businessSize: 'small',
        primaryUseCase: '',
        currentAutomationLevel: 'none',
        agentTypes: {
          offerCrafting: false,
          bugFinding: false,
          salesAutomation: false,
          dataAnalysis: false,
          customerSupport: false,
          marketingAutomation: false,
          processOptimization: false,
          customWorkflows: false,
        },
        integrations: {
          n8n: false,
          mongodb: false,
          stripe: false,
          nextAuth: false,
          customAPIs: false,
          databases: false,
          crm: false,
          emailMarketing: false,
          socialMedia: false,
        },
        workflowComplexity: 'simple',
        expectedVolume: 'low',
        realTimeRequirements: false,
        plan: 'basic',
        status: 'pending',
        billingCycle: 'monthly',
        projectTimeline: '',
        budget: '',
        successMetrics: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      setErrors({
        general:
          error instanceof Error ? error.message : 'Failed to create customer',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/customers');
  };

  const getSelectedAgentCount = () => {
    return Object.values(formData.agentTypes).filter(Boolean).length;
  };

  const getSelectedIntegrationCount = () => {
    return Object.values(formData.integrations).filter(Boolean).length;
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-green-900">
                  Customer Created Successfully!
                </h2>
                <p className="text-green-700">
                  AI automation setup is ready to begin.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {success.customer.name}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Company:</span>
                  <span className="ml-2 text-gray-900">
                    {success.customer.company}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Industry:</span>
                  <span className="ml-2 text-gray-900">
                    {success.customer.industry}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Use Case:</span>
                  <span className="ml-2 text-gray-900">
                    {success.customer.primaryUseCase}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">AI Agents:</span>
                  <span className="ml-2 text-gray-900">
                    {getSelectedAgentCount()} types selected
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Integrations:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {getSelectedIntegrationCount()} platforms
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium style={{ color: 'var(--superseller-blue)' }} mb-2">Next Steps</h3>
              <ul className="style={{ color: 'var(--superseller-blue)' }} text-sm space-y-1">
                <li>• AI Agent configuration and training</li>
                <li>• Workflow automation setup</li>
                <li>• Integration with existing systems</li>
                <li>• Performance monitoring setup</li>
              </ul>
            </div>

            <div className="flex space-x-4 mt-6">
              <Button
                onClick={handleBack}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View All Customers
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  setErrors({});
                }}
              >
                Create Another Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Customer
            </h1>
            <p className="text-gray-600">
              Set up AI automation for business transformation
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errors.general && (
        <Card className="border-red-200 style={{ backgroundColor: 'var(--superseller-bg-primary)' }}">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 style={{ color: 'var(--superseller-red)' }}" />
              <span className="style={{ color: 'var(--superseller-red)' }}">{errors.general}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John Smith"
                />
                {errors.name && (
                  <p className="mt-1 text-sm style={{ color: 'var(--superseller-red)' }}">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm style={{ color: 'var(--superseller-red)' }}">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={e => handleInputChange('company', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.company ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Acme Corporation"
                />
                {errors.company && (
                  <p className="mt-1 text-sm style={{ color: 'var(--superseller-red)' }}">{errors.company}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={e => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., E-commerce, SaaS, Healthcare"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Size
                </label>
                <select
                  value={formData.businessSize}
                  onChange={e =>
                    handleInputChange('businessSize', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="startup">Startup (1-10 employees)</option>
                  <option value="small">
                    Small Business (11-50 employees)
                  </option>
                  <option value="medium">
                    Medium Business (51-200 employees)
                  </option>
                  <option value="enterprise">
                    Enterprise (200+ employees)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Use Case *
              </label>
              <textarea
                required
                value={formData.primaryUseCase}
                onChange={e =>
                  handleInputChange('primaryUseCase', e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the main automation goal (e.g., 'Automate customer onboarding process', 'Optimize sales lead qualification')"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Automation Level
              </label>
              <select
                value={formData.currentAutomationLevel}
                onChange={e =>
                  handleInputChange('currentAutomationLevel', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No automation currently</option>
                <option value="basic">
                  Basic automation (email, simple workflows)
                </option>
                <option value="intermediate">
                  Intermediate (CRM integration, basic AI)
                </option>
                <option value="advanced">
                  Advanced (complex workflows, multiple integrations)
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* AI Agent Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Agent Requirements
            </CardTitle>
            <p className="text-sm text-gray-600">
              Select the types of AI agents needed for automation
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agentTypes.offerCrafting}
                    onChange={e =>
                      handleAgentTypeChange('offerCrafting', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Offer Crafting Agent
                    </span>
                    <p className="text-xs text-gray-500">
                      Automated proposal and offer generation
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agentTypes.bugFinding}
                    onChange={e =>
                      handleAgentTypeChange('bugFinding', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Bug Finding Agent
                    </span>
                    <p className="text-xs text-gray-500">
                      Automated testing and issue detection
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agentTypes.salesAutomation}
                    onChange={e =>
                      handleAgentTypeChange('salesAutomation', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Sales Automation Agent
                    </span>
                    <p className="text-xs text-gray-500">
                      Lead qualification and sales process automation
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agentTypes.dataAnalysis}
                    onChange={e =>
                      handleAgentTypeChange('dataAnalysis', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Data Analysis Agent
                    </span>
                    <p className="text-xs text-gray-500">
                      Business intelligence and analytics automation
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agentTypes.customerSupport}
                    onChange={e =>
                      handleAgentTypeChange('customerSupport', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Customer Support Agent
                    </span>
                    <p className="text-xs text-gray-500">
                      Automated customer service and support
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agentTypes.marketingAutomation}
                    onChange={e =>
                      handleAgentTypeChange(
                        'marketingAutomation',
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Marketing Automation Agent
                    </span>
                    <p className="text-xs text-gray-500">
                      Campaign management and marketing workflows
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agentTypes.processOptimization}
                    onChange={e =>
                      handleAgentTypeChange(
                        'processOptimization',
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Process Optimization Agent
                    </span>
                    <p className="text-xs text-gray-500">
                      Workflow optimization and efficiency improvement
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agentTypes.customWorkflows}
                    onChange={e =>
                      handleAgentTypeChange('customWorkflows', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Custom Workflow Agent
                    </span>
                    <p className="text-xs text-gray-500">
                      Bespoke automation workflows
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Technical Integrations
            </CardTitle>
            <p className="text-sm text-gray-600">
              Select existing platforms to integrate with
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.n8n}
                    onChange={e =>
                      handleIntegrationChange('n8n', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      n8n Workflows
                    </span>
                    <p className="text-xs text-gray-500">
                      Existing n8n automation workflows
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.mongodb}
                    onChange={e =>
                      handleIntegrationChange('mongodb', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      MongoDB
                    </span>
                    <p className="text-xs text-gray-500">
                      MongoDB database integration
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.stripe}
                    onChange={e =>
                      handleIntegrationChange('stripe', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Stripe
                    </span>
                    <p className="text-xs text-gray-500">
                      Payment processing integration
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.crm}
                    onChange={e =>
                      handleIntegrationChange('crm', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      CRM System
                    </span>
                    <p className="text-xs text-gray-500">
                      Customer relationship management
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.nextAuth}
                    onChange={e =>
                      handleIntegrationChange('nextAuth', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      NextAuth.js
                    </span>
                    <p className="text-xs text-gray-500">
                      Authentication and user management
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.databases}
                    onChange={e =>
                      handleIntegrationChange('databases', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      s
                    </span>
                    <p className="text-xs text-gray-500">
                      SQL, NoSQL, or cloud databases
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.customAPIs}
                    onChange={e =>
                      handleIntegrationChange('customAPIs', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Custom APIs
                    </span>
                    <p className="text-xs text-gray-500">
                      Internal or third-party APIs
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.emailMarketing}
                    onChange={e =>
                      handleIntegrationChange(
                        'emailMarketing',
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Email Marketing
                    </span>
                    <p className="text-xs text-gray-500">
                      chimp, SendGrid, etc.
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.integrations.socialMedia}
                    onChange={e =>
                      handleIntegrationChange('socialMedia', e.target.checked)
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Social Media
                    </span>
                    <p className="text-xs text-gray-500">
                      Social media platforms
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Workflow Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Complexity
                </label>
                <select
                  value={formData.workflowComplexity}
                  onChange={e =>
                    handleInputChange('workflowComplexity', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="simple">Simple (1-5 steps)</option>
                  <option value="moderate">Moderate (6-15 steps)</option>
                  <option value="complex">Complex (16-50 steps)</option>
                  <option value="enterprise">Enterprise (50+ steps)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Volume
                </label>
                <select
                  value={formData.expectedVolume}
                  onChange={e =>
                    handleInputChange('expectedVolume', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low (&lt; 100/day)</option>
                  <option value="medium">Medium (100-1000/day)</option>
                  <option value="high">High (1000-10000/day)</option>
                  <option value="enterprise">
                    Enterprise (&gt; 10000/day)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Real-time Requirements
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.realTimeRequirements}
                    onChange={e =>
                      handleInputChange(
                        'realTimeRequirements',
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 style={{ color: 'var(--superseller-blue)' }} focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">
                    Requires real-time processing
                  </span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Timeline
                </label>
                <input
                  type="text"
                  value={formData.projectTimeline}
                  onChange={e =>
                    handleInputChange('projectTimeline', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3 months, ASAP, Q2 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={e => handleInputChange('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., $10k-50k, $100k+, TBD"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success Metrics
              </label>
              <textarea
                value={formData.successMetrics}
                onChange={e =>
                  handleInputChange('successMetrics', e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How will you measure success? (e.g., 'Reduce manual work by 80%', 'Increase conversion rate by 25%')"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  value={formData.plan}
                  onChange={e => handleInputChange('plan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic - $99/month</option>
                  <option value="pro">Pro - $299/month</option>
                  <option value="enterprise">Enterprise - $999/month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={e =>
                    handleInputChange('billingCycle', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional requirements, constraints, or special considerations..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 superseller-animate-glow" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Customer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
