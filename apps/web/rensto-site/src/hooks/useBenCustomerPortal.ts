import { useState, useEffect } from 'react';

interface Customer {
  name: string;
  email: string;
  company: string;
  role: string;
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
  webhookUrl?: string;
  n8nWorkflowId?: string;
  category?: string;
  features?: string[];
  estimatedROI?: string;
  setupTime?: string;
  lastRun?: string;
  totalExecutions?: number;
  successfulExecutions?: number;
  workflowStatus?: string;
}

interface DataSource {
  _id: string;
  name: string;
  type: string;
  status: string;
  lastSync: string;
  records: number;
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

export function useBenCustomerPortal() {
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
        console.log('🔍 Fetching Ben Ginati\'s customer portal data...');

        // Fetch Ben's agents from his specific API endpoint
        const agentsResponse = await fetch('/api/customers/ben-ginati/agents');
        const agentsData = await agentsResponse.json();

        if (agentsData.success) {
          console.log(`✅ Fetched ${agentsData.agents.length} agents for Ben`);
        } else {
          console.error('❌ Failed to fetch Ben\'s agents:', agentsData.error);
        }

        // Create customer data for Ben
        const customer: Customer = {
          name: 'Ben Ginati',
          email: 'ben@tax4us.co.il',
          company: 'Tax4Us',
          role: 'Owner',
          budget: '$5,000',
          successMetrics: 'Content automation and efficiency'
        };

        // Mock data sources for Ben
        const dataSources: DataSource[] = [
          {
            _id: '1',
            name: 'Tax4Us WordPress Site',
            type: 'wordpress',
            status: 'connected',
            lastSync: new Date().toISOString(),
            records: 25
          },
          {
            _id: '2',
            name: 'OpenAI API',
            type: 'ai',
            status: 'connected',
            lastSync: new Date().toISOString(),
            records: 150
          }
        ];

        // Mock payment status for Ben
        const paymentStatus: PaymentStatus = {
          plan: 'Professional',
          status: 'active',
          nextBilling: '2025-01-20',
          amount: 2500,
          currency: 'USD',
          usage: {
            current: 2,
            limit: 4,
            unit: 'agents'
          }
        };

        // Mock AI insights for Ben
        const insights: AIInsight[] = [
          {
            id: '1',
            type: 'performance',
            title: 'Blog Agent Performance',
            description: 'Your Blog Agent has achieved 100% success rate in manual testing',
            impact: 'high',
            action: 'Consider adding automated scheduling',
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            type: 'optimization',
            title: 'Content Generation Efficiency',
            description: 'Content Agent ready for production use with proper scheduling',
            impact: 'medium',
            action: 'Implement daily content generation schedule',
            timestamp: new Date().toISOString()
          },
          {
            id: '3',
            type: 'feature',
            title: 'WordPress Integration',
            description: 'Both agents successfully integrated with Tax4Us WordPress site',
            impact: 'high',
            action: 'Monitor content quality and engagement',
            timestamp: new Date().toISOString()
          }
        ];

        setData({
          customer,
          agents: agentsData.success ? agentsData.agents : [],
          dataSources,
          paymentStatus,
          insights,
          loading: false,
          error: null,
        });

        console.log('✅ Ben\'s customer portal data loaded successfully');

      } catch (error) {
        console.error('❌ Error fetching Ben\'s customer portal data:', error);
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

// Additional functions for Ben's portal
export async function runBenAgent(agentKey: string, data?: any) {
  try {
    const response = await fetch('/api/customers/ben-ginati/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'run',
        agentKey,
        data
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error running Ben\'s agent:', error);
    throw error;
  }
}

export async function activateBenAgent(agentKey: string) {
  try {
    const response = await fetch('/api/customers/ben-ginati/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'activate',
        agentKey
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error activating Ben\'s agent:', error);
    throw error;
  }
}

export async function deactivateBenAgent(agentKey: string) {
  try {
    const response = await fetch('/api/customers/ben-ginati/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deactivate',
        agentKey
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deactivating Ben\'s agent:', error);
    throw error;
  }
}

export async function getBenAgentMetrics(agentKey: string) {
  try {
    const response = await fetch('/api/customers/ben-ginati/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_metrics',
        agentKey
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting Ben\'s agent metrics:', error);
    throw error;
  }
}
