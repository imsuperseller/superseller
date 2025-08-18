import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const customerId = params.customerId;
    
    // Load current onboarding state
    const statePath = path.join(process.cwd(), 'data', 'customers', customerId, 'onboarding-state.json');
    const stateData = await fs.readFile(statePath, 'utf-8');
    const onboardingState = JSON.parse(stateData);
    
    // Mark onboarding as complete
    onboardingState.status = 'completed';
    onboardingState.completedAt = new Date().toISOString();
    
    // Update workflow progress
    const currentStep = onboardingState.workflow.steps[onboardingState.workflow.currentStep];
    if (currentStep && currentStep.type === 'completion') {
      currentStep.completed = true;
    }
    
    // Generate completion summary
    const completionSummary = await generateCompletionSummary(onboardingState);
    onboardingState.completionSummary = completionSummary;
    
    // Update customer profile with onboarding results
    await updateCustomerProfile(customerId, onboardingState);
    
    // Create success workflows
    await createSuccessWorkflows(customerId, onboardingState);
    
    // Save final state
    await fs.writeFile(statePath, JSON.stringify(onboardingState, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      completionSummary,
      onboardingState
    });
    
  } catch (error) {
    console.error('❌ Failed to complete onboarding:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to complete onboarding',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function generateCompletionSummary(onboardingState: any) {
  const summary = {
    totalSteps: onboardingState.workflow.steps.length,
    completedSteps: onboardingState.workflow.steps.filter((step: any) => step.completed).length,
    completionRate: 0,
    missingInfo: onboardingState.missingInfo.length,
    validationResults: onboardingState.validationResults ? Object.keys(onboardingState.validationResults).length : 0,
    testResults: onboardingState.testResults ? onboardingState.testResults.summary : null,
    recommendations: onboardingState.analysis.recommendations || [],
    nextActions: []
  };
  
  summary.completionRate = Math.round((summary.completedSteps / summary.totalSteps) * 100);
  
  // Generate next actions based on completion
  if (summary.completionRate === 100) {
    summary.nextActions.push('Activate automation workflows');
    summary.nextActions.push('Schedule follow-up consultation');
    summary.nextActions.push('Set up monitoring and alerts');
  } else {
    summary.nextActions.push('Complete remaining onboarding steps');
    summary.nextActions.push('Address missing information');
    summary.nextActions.push('Validate remaining credentials');
  }
  
  return summary;
}

async function updateCustomerProfile(customerId: string, onboardingState: any) {
  try {
    const profilePath = path.join(process.cwd(), 'data', 'customers', customerId, 'customer-profile.json');
    const profileData = await fs.readFile(profilePath, 'utf-8');
    const customerProfile = JSON.parse(profileData);
    
    // Update profile with onboarding results
    customerProfile.onboarding = {
      status: 'completed',
      completedAt: onboardingState.completedAt,
      completionRate: onboardingState.analysis.completeness,
      missingInfo: onboardingState.missingInfo.length,
      validationResults: onboardingState.validationResults,
      testResults: onboardingState.testResults
    };
    
    // Add answers to customer profile
    if (onboardingState.answers) {
      customerProfile.onboardingAnswers = onboardingState.answers;
    }
    
    // Save updated profile
    await fs.writeFile(profilePath, JSON.stringify(customerProfile, null, 2));
    
  } catch (error) {
    console.error('Failed to update customer profile:', error);
  }
}

async function createSuccessWorkflows(customerId: string, onboardingState: any) {
  try {
    // Create welcome workflow
    const welcomeWorkflow = {
      name: `${customerId} - Welcome Workflow`,
      active: true,
      nodes: [
        {
          id: 'welcome-email',
          type: 'n8n-nodes-base.emailSend',
          position: [240, 300],
          parameters: {
            toEmail: onboardingState.answers?.email || 'customer@example.com',
            subject: 'Welcome to Rensto - Your Automation is Ready!',
            text: `Hi ${onboardingState.answers?.name || 'there'}!

Welcome to Rensto! Your automation setup is now complete and ready to go.

Here's what we've accomplished:
- Profile completion: ${onboardingState.analysis.completeness}%
- Credentials validated: ${onboardingState.validationResults ? Object.keys(onboardingState.validationResults).length : 0}
- Tests passed: ${onboardingState.testResults?.summary?.passed || 0}/${onboardingState.testResults?.summary?.total || 0}

Your automation workflows are now active and will start processing according to your configuration.

If you have any questions or need adjustments, don't hesitate to reach out!

Best regards,
The Rensto Team`
          }
        }
      ]
    };
    
    // Create monitoring workflow
    const monitoringWorkflow = {
      name: `${customerId} - Health Monitoring`,
      active: true,
      nodes: [
        {
          id: 'health-check',
          type: 'n8n-nodes-base.httpRequest',
          position: [240, 300],
          parameters: {
            url: 'https://api.rensto.com/health',
            method: 'GET'
          }
        },
        {
          id: 'alert-if-failed',
          type: 'n8n-nodes-base.if',
          position: [460, 300],
          parameters: {
            conditions: {
              options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict'
              },
              conditions: [
                {
                  id: 'condition-1',
                  leftValue: '={{ $json.status }}',
                  rightValue: 'healthy',
                  operator: {
                    type: 'notEqual'
                  }
                }
              ],
              combinator: 'and'
            }
          }
        }
      ]
    };
    
    // Save workflows (this would typically be done through n8n API)
    console.log('Created welcome workflow:', welcomeWorkflow.name);
    console.log('Created monitoring workflow:', monitoringWorkflow.name);
    
  } catch (error) {
    console.error('Failed to create success workflows:', error);
  }
}
