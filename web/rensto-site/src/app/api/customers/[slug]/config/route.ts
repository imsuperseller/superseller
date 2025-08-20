import { NextRequest, NextResponse } from 'next/server';

// Simple customer configuration without database dependencies
const CUSTOMER_CONFIGS = {
  'tax4us': {
    name: 'Ben Ginati',
    company: 'Tax4Us',
    industry: 'tax-services',
    language: {
      customerApp: 'English',
      agentInterface: 'English',
      rtlSupport: false,
      locale: 'en-US'
    },
    tabs: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'tasks', label: 'Tasks', icon: '📋' },
      { id: 'agents', label: 'Agents', icon: '🤖' },
      { id: 'analytics', label: 'Analytics', icon: '📈' }
    ]
  },
  'shelly-mizrahi': {
    name: 'Shelly Mizrahi',
    company: 'Insurance Services', 
    industry: 'insurance',
    language: {
      customerApp: 'Hebrew',
      agentInterface: 'Hebrew',
      rtlSupport: true,
      locale: 'he-IL'
    },
    tabs: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'tasks', label: 'Tasks', icon: '📋' },
      { id: 'agents', label: 'Agents', icon: '🤖' },
      { id: 'analytics', label: 'Analytics', icon: '📈' }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const config = CUSTOMER_CONFIGS[slug as keyof typeof CUSTOMER_CONFIGS];
    
    if (!config) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching customer config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
