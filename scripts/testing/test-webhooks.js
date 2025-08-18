const fetch = require('node-fetch');

// Test data for webhook endpoints
const testData = {
  provisioned: {
    orgSlug: 'demo-company',
    workflowId: 'workflow_test_123',
    agentMeta: {
      name: 'Test Agent',
      key: 'test-agent',
      description: 'A test agent for webhook validation',
      icon: '🧪',
      tags: ['test', 'webhook'],
      capabilities: ['data-processing'],
    },
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        result: { type: 'string' },
      },
    },
  },
  execution: {
    workflowId: 'workflow_test_123',
    executionId: 'exec_test_456',
    status: 'success',
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    metrics: {
      durationMs: 5000,
      nodes: 3,
      retries: 0,
      tokensIn: 100,
      tokensOut: 50,
      costUSD: 0.25,
    },
    samples: {
      input: { test: 'data' },
      output: { result: 'success' },
    },
  },
};

async function testWebhook(endpoint, data) {
  try {
    console.log(`\n🧪 Testing ${endpoint}...`);

    const response = await fetch(
      `http://localhost:3000/api/hooks/n8n/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(result, null, 2));

    return { success: response.ok, data: result };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllWebhooks() {
  console.log('🚀 Starting webhook tests...\n');

  // Test provisioned webhook
  const provisionedResult = await testWebhook(
    'provisioned',
    testData.provisioned
  );

  // Test execution webhook
  const executionResult = await testWebhook('execution', testData.execution);

  console.log('\n📊 Test Summary:');
  console.log(
    `Provisioned Webhook: ${provisionedResult.success ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log(
    `Execution Webhook: ${executionResult.success ? '✅ PASS' : '❌ FAIL'}`
  );

  if (provisionedResult.success && executionResult.success) {
    console.log('\n🎉 All webhook tests passed!');
  } else {
    console.log('\n⚠️  Some webhook tests failed. Check the logs above.');
  }
}

// Run tests
testAllWebhooks().catch(console.error);
