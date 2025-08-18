import { useState, useEffect } from 'react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  industry: string;
  businessSize: string;
  primaryUseCase: string;
  currentAutomationLevel: string;
  plan: string;
  status: string;
  billingCycle: string;
  projectTimeline: string;
  budget: string;
  successMetrics: string;
}

interface Agent {
  _id: string;
  name: string;
  key: string;
  description: string;
  status: string;
  icon: string;
  tags: string[];
  capabilities: string[];
  pricing: {
    model: string;
    rate: number;
  };
  isActive: boolean;
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  dependencies: string[];
  progress?: {
    current: number;
    total: number;
    message: string;
  };
  successRate?: number;
  avgDuration?: number;
  costEst?: number;
  roi?: number;
}

interface DataSource {
  _id: string;
  name: string;
  type: 'apify' | 'n8n' | 'facebook' | 'stripe' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: string;
  credentials: {
    apiKey?: string;
    endpoint?: string;
    username?: string;
    isConfigured: boolean;
  };
  setupInstructions?: {
    title: string;
    steps: string[];
    pricingUrl?: string;
    signupUrl?: string;
  };
  lastSync?: Date;
}

interface PaymentStatus {
  plan: string;
  status: string;
  nextBilling: string;
  amount: number;
  currency: string;
  usage: {
    current: number;
    limit: number;
    unit: string;
  };
}

interface AIInsight {
  id: string;
  type: 'optimization' | 'cost' | 'performance' | 'feature';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  action: string;
  timestamp: string;
}

interface CustomerPortalData {
  customer: Customer | null;
  agents: Agent[];
  dataSources: DataSource[];
  paymentStatus: PaymentStatus | null;
  insights: AIInsight[];
  loading: boolean;
  error: string | null;
}

export function useCustomerPortal() {
  const [data, setData] = useState<CustomerPortalData>({
    customer: null,
    agents: [],
    dataSources: [],
    paymentStatus: null,
    insights: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch customer data (for now, use the test customer)
        const customerResponse = await fetch(
          '/api/customers?email=portal@example.com'
        );
        const customers = await customerResponse.json();
        const customer = customers[0] || null;

        // Fetch agents
        const agentsResponse = await fetch('/api/agents');
        const agents = await agentsResponse.json();

        // Fetch data sources
        const dataSourcesResponse = await fetch('/api/datasources');
        const dataSources = await dataSourcesResponse.json();

        // Fetch payment status
        const paymentResponse = await fetch('/api/billing/status');
        const paymentStatus = paymentResponse.ok
          ? await paymentResponse.json()
          : null;

        // Fetch AI insights
        const insightsResponse = await fetch('/api/insights');
        const insights = insightsResponse.ok
          ? await insightsResponse.json()
          : null;

        setData({
          customer,
          agents,
          dataSources,
          paymentStatus: paymentStatus?.paymentStatus || null,
          insights: insights?.insights || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching customer portal data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load customer portal data',
        }));
      }
    }

    fetchData();
  }, []);

  return data;
}
