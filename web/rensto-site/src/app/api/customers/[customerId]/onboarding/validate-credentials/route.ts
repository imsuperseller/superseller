import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const customerId = params.customerId;
    const { credentials } = await request.json();
    
    // Initialize onboarding agent for credential validation
    const onboardingAgent = new (await import('../../../../../../../scripts/intelligent-onboarding-agent.js')).default();
    
    // Validate credentials
    const validationResults = await onboardingAgent.validateCredentials(customerId, credentials);
    
    // Load current onboarding state
    const statePath = path.join(process.cwd(), 'data', 'customers', customerId, 'onboarding-state.json');
    const stateData = await fs.readFile(statePath, 'utf-8');
    const onboardingState = JSON.parse(stateData);
    
    // Save validation results
    onboardingState.validationResults = validationResults;
    
    // Update workflow progress
    const currentStep = onboardingState.workflow.steps[onboardingState.workflow.currentStep];
    if (currentStep && currentStep.type === 'credentials') {
      currentStep.completed = true;
      onboardingState.workflow.currentStep += 1;
    }
    
    // Save updated state
    await fs.writeFile(statePath, JSON.stringify(onboardingState, null, 2));
    
    return NextResponse.json(validationResults);
    
  } catch (error) {
    console.error('❌ Failed to validate credentials:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate credentials',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
