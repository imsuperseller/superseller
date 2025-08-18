import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const customerId = params.customerId;
    
    // Load customer profile
    const profilePath = path.join(process.cwd(), 'data', 'customers', customerId, 'customer-profile.json');
    const profileData = await fs.readFile(profilePath, 'utf-8');
    const customerProfile = JSON.parse(profileData);
    
    // Initialize intelligent onboarding agent
    const onboardingAgent = new (await import('../../../../../../scripts/intelligent-onboarding-agent.js')).default();
    
    // Start onboarding process
    const result = await onboardingAgent.startOnboarding(customerId);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Onboarding initialization failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize onboarding',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const customerId = params.customerId;
    
    // Load onboarding state
    const statePath = path.join(process.cwd(), 'data', 'customers', customerId, 'onboarding-state.json');
    const stateData = await fs.readFile(statePath, 'utf-8');
    const onboardingState = JSON.parse(stateData);
    
    return NextResponse.json(onboardingState);
    
  } catch (error) {
    console.error('❌ Failed to load onboarding state:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load onboarding state',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 404 });
  }
}
