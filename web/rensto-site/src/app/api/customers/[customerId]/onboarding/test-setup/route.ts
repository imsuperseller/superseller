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
    
    // Run comprehensive tests
    const testResults = await runSetupTests(customerId, onboardingState);
    
    // Update workflow progress
    const currentStep = onboardingState.workflow.steps[onboardingState.workflow.currentStep];
    if (currentStep && currentStep.type === 'testing') {
      currentStep.completed = true;
      onboardingState.workflow.currentStep += 1;
    }
    
    // Save test results
    onboardingState.testResults = testResults;
    
    // Save updated state
    await fs.writeFile(statePath, JSON.stringify(onboardingState, null, 2));
    
    return NextResponse.json(testResults);
    
  } catch (error) {
    console.error('❌ Failed to test setup:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function runSetupTests(customerId: string, onboardingState: any) {
  const testResults = {
    overall: 'pass',
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };
  
  // Test 1: Customer Profile Completeness
  const profileTest = await testCustomerProfile(onboardingState);
  testResults.tests.push(profileTest);
  
  // Test 2: Credential Validation
  if (onboardingState.validationResults) {
    const credentialTest = await testCredentials(onboardingState.validationResults);
    testResults.tests.push(credentialTest);
  }
  
  // Test 3: n8n Integration
  const n8nTest = await testN8NIntegration(customerId);
  testResults.tests.push(n8nTest);
  
  // Test 4: Workflow Creation
  const workflowTest = await testWorkflowCreation(customerId, onboardingState);
  testResults.tests.push(workflowTest);
  
  // Calculate summary
  testResults.summary.total = testResults.tests.length;
  testResults.summary.passed = testResults.tests.filter(t => t.status === 'pass').length;
  testResults.summary.failed = testResults.tests.filter(t => t.status === 'fail').length;
  testResults.summary.warnings = testResults.tests.filter(t => t.status === 'warning').length;
  
  // Determine overall status
  if (testResults.summary.failed > 0) {
    testResults.overall = 'fail';
  } else if (testResults.summary.warnings > 0) {
    testResults.overall = 'warning';
  } else {
    testResults.overall = 'pass';
  }
  
  return testResults;
}

async function testCustomerProfile(onboardingState: any) {
  const requiredFields = ['name', 'email', 'company', 'website'];
  const missingFields = requiredFields.filter(field => !onboardingState.answers?.[field]);
  
  return {
    name: 'Customer Profile Completeness',
    status: missingFields.length === 0 ? 'pass' : 'fail',
    details: missingFields.length === 0 
      ? 'All required customer information is complete'
      : `Missing required fields: ${missingFields.join(', ')}`,
    missingFields
  };
}

async function testCredentials(validationResults: any) {
  const validCredentials = Object.values(validationResults).filter((result: any) => result.valid);
  const totalCredentials = Object.keys(validationResults).length;
  
  return {
    name: 'Credential Validation',
    status: validCredentials.length === totalCredentials ? 'pass' : 'warning',
    details: `${validCredentials.length}/${totalCredentials} credentials are valid`,
    validCount: validCredentials.length,
    totalCount: totalCredentials
  };
}

async function testN8NIntegration(customerId: string) {
  try {
    // Test n8n connection
    const response = await fetch('http://173.254.201.134:5678/api/v1/credentials', {
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE'
      }
    });
    
    if (response.ok) {
      return {
        name: 'n8n Integration',
        status: 'pass',
        details: 'Successfully connected to n8n instance'
      };
    } else {
      return {
        name: 'n8n Integration',
        status: 'fail',
        details: 'Failed to connect to n8n instance'
      };
    }
  } catch (error) {
    return {
      name: 'n8n Integration',
      status: 'fail',
      details: 'Error connecting to n8n instance'
    };
  }
}

async function testWorkflowCreation(customerId: string, onboardingState: any) {
  try {
    // Check if customer has any workflows
    const response = await fetch(`/api/customers/${customerId}/workflows`);
    
    if (response.ok) {
      const workflows = await response.json();
      
      if (workflows.workflows && workflows.workflows.length > 0) {
        return {
          name: 'Workflow Creation',
          status: 'pass',
          details: `Found ${workflows.workflows.length} workflows for customer`
        };
      } else {
        return {
          name: 'Workflow Creation',
          status: 'warning',
          details: 'No workflows found for customer'
        };
      }
    } else {
      return {
        name: 'Workflow Creation',
        status: 'fail',
        details: 'Failed to retrieve workflows'
      };
    }
  } catch (error) {
    return {
      name: 'Workflow Creation',
      status: 'fail',
      details: 'Error checking workflows'
    };
  }
}
