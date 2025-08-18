import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const customerId = params.customerId;
    const { questionId, answer } = await request.json();
    
    // Load current onboarding state
    const statePath = path.join(process.cwd(), 'data', 'customers', customerId, 'onboarding-state.json');
    const stateData = await fs.readFile(statePath, 'utf-8');
    const onboardingState = JSON.parse(stateData);
    
    // Save the answer
    if (!onboardingState.answers) {
      onboardingState.answers = {};
    }
    onboardingState.answers[questionId] = {
      answer,
      timestamp: new Date().toISOString()
    };
    
    // Update workflow progress
    const currentStep = onboardingState.workflow.steps[onboardingState.workflow.currentStep];
    if (currentStep && currentStep.type === 'question') {
      currentStep.completed = true;
      onboardingState.workflow.currentStep += 1;
    }
    
    // Recalculate analysis
    const onboardingAgent = new (await import('../../../../../../../scripts/intelligent-onboarding-agent.js')).default();
    const updatedAnalysis = await onboardingAgent.analyzeCustomerData({
      customer: onboardingState.answers,
      agents: onboardingState.agents || []
    });
    
    onboardingState.analysis = updatedAnalysis;
    
    // Save updated state
    await fs.writeFile(statePath, JSON.stringify(onboardingState, null, 2));
    
    return NextResponse.json(onboardingState);
    
  } catch (error) {
    console.error('❌ Failed to save answer:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save answer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
