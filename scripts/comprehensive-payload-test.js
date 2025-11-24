#!/usr/bin/env node
/**
 * Comprehensive Payload Testing Suite
 * 
 * Tests Smart Message Router V6 fix by analyzing recent executions
 * and verifying correct message type detection for all payload types
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_ID = 'eQSCUFw91oXLxtvn';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'whatsapp-payloads', 'test-results');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Analyze execution to determine payload type and router output
 */
function analyzeExecution(execution) {
  const routerNode = execution.nodes?.['Smart Message Router'];
  const triggerNode = execution.nodes?.['WAHA Trigger'];
  
  if (!routerNode || !triggerNode) {
    return { error: 'Missing nodes', detected: false };
  }

  // Get router output
  const routerOutput = routerNode.data?.output?.[0]?.[0]?.json || {};
  const detectedType = routerOutput.messageType || null;
  const textContent = routerOutput.textContent || '';
  const mediaUrl = routerOutput.mediaUrl || '';

  // Get trigger payload to determine expected type
  const payload = triggerNode.data?.output?.[1]?.[0]?.json?.payload || {};
  const _dataMessage = payload._data?.message || {};

  // Determine expected type from payload structure
  let expectedType = 'text';
  let payloadCategory = 'unknown';
  let hasCaption = false;
  let caption = '';

  // Check for captioned media FIRST (V6 fix)
  if (_dataMessage.documentWithCaptionMessage) {
    expectedType = 'document';
    payloadCategory = 'pdfWithCaption';
    hasCaption = true;
    caption = _dataMessage.documentWithCaptionMessage.message?.documentMessage?.caption || '';
  } else if (_dataMessage.imageWithCaptionMessage) {
    expectedType = 'image';
    payloadCategory = 'imageWithCaption';
    hasCaption = true;
    caption = _dataMessage.imageWithCaptionMessage.message?.imageMessage?.caption || '';
  } else if (_dataMessage.videoWithCaptionMessage) {
    expectedType = 'video';
    payloadCategory = 'videoWithCaption';
    hasCaption = true;
    caption = _dataMessage.videoWithCaptionMessage.message?.videoMessage?.caption || '';
  } else if (_dataMessage.documentMessage) {
    expectedType = 'document';
    payloadCategory = 'pdf';
  } else if (_dataMessage.imageMessage) {
    expectedType = 'image';
    payloadCategory = 'image';
  } else if (_dataMessage.videoMessage) {
    expectedType = 'video';
    payloadCategory = 'video';
  } else if (_dataMessage.audioMessage || payload.hasMedia && payload.media?.mimetype?.includes('audio')) {
    expectedType = 'voice';
    payloadCategory = 'voiceNote';
  } else if (payload.body || _dataMessage.conversation) {
    expectedType = 'text';
    payloadCategory = 'text';
  }

  const passed = detectedType === expectedType;
  const captionExtracted = hasCaption ? (textContent.trim().length > 0 && textContent === caption) : true;

  return {
    detected: true,
    executionId: execution.id,
    timestamp: execution.startedAt,
    status: execution.status,
    payloadCategory,
    expectedType,
    detectedType,
    passed,
    hasCaption,
    caption,
    captionExtracted,
    textContent: textContent.substring(0, 100),
    mediaUrl,
    errors: []
  };
}

/**
 * Run comprehensive tests on recent executions
 */
async function runComprehensiveTests() {
  console.log('🧪 Comprehensive Payload Testing Suite\n');
  console.log('Workflow:', WORKFLOW_ID);
  console.log('Testing Smart Message Router V6 fix...\n');

  const testResults = {
    timestamp: new Date().toISOString(),
    workflowId: WORKFLOW_ID,
    tests: [],
    coverage: {
      text: { found: false, count: 0, passed: 0 },
      image: { found: false, count: 0, passed: 0 },
      imageWithCaption: { found: false, count: 0, passed: 0 },
      video: { found: false, count: 0, passed: 0 },
      videoWithCaption: { found: false, count: 0, passed: 0 },
      pdf: { found: false, count: 0, passed: 0 },
      pdfWithCaption: { found: false, count: 0, passed: 0 },
      voiceNote: { found: false, count: 0, passed: 0 }
    },
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      errors: 0
    }
  };

  // Load saved executions
  const executionsFile = path.join(__dirname, '..', 'data', 'whatsapp-payloads', 'executions.json');
  let executions = [];
  
  if (fs.existsSync(executionsFile)) {
    executions = JSON.parse(fs.readFileSync(executionsFile, 'utf8'));
    console.log(`📦 Loaded ${executions.length} saved executions\n`);
  }

  // Analyze each execution
  for (const execution of executions) {
    const analysis = analyzeExecution(execution);
    
    if (!analysis.detected) {
      if (analysis.error) {
        testResults.summary.errors++;
      }
      continue;
    }

    const testResult = {
      executionId: analysis.executionId,
      timestamp: analysis.timestamp,
      status: analysis.status,
      payloadCategory: analysis.payloadCategory,
      expectedType: analysis.expectedType,
      detectedType: analysis.detectedType,
      passed: analysis.passed,
      hasCaption: analysis.hasCaption,
      captionExtracted: analysis.captionExtracted,
      textContent: analysis.textContent,
      mediaUrl: analysis.mediaUrl,
      errors: []
    };

    if (!analysis.passed) {
      testResult.errors.push(`Expected "${analysis.expectedType}" but got "${analysis.detectedType}"`);
      testResult.status = 'failed';
    }

    if (analysis.hasCaption && !analysis.captionExtracted) {
      testResult.errors.push(`Caption not extracted correctly. Expected: "${analysis.caption}", Got: "${analysis.textContent}"`);
      testResult.status = 'failed';
    }

    // Update coverage
    const category = analysis.payloadCategory;
    if (testResults.coverage[category]) {
      testResults.coverage[category].found = true;
      testResults.coverage[category].count++;
      if (analysis.passed && analysis.captionExtracted) {
        testResults.coverage[category].passed++;
      }
    }

    testResults.tests.push(testResult);
    testResults.summary.total++;

    if (testResult.status === 'failed') {
      testResults.summary.failed++;
    } else {
      testResults.summary.passed++;
    }
  }

  // Print results
  console.log('📊 Test Results:\n');
  
  for (const [category, stats] of Object.entries(testResults.coverage)) {
    const status = stats.found ? (stats.passed === stats.count ? '✅' : '⚠️') : '❌';
    const displayName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${displayName}: ${stats.count} found, ${stats.passed} passed`);
  }

  console.log('\n📈 Summary:');
  console.log(`  Total Tests: ${testResults.summary.total}`);
  console.log(`  ✅ Passed: ${testResults.summary.passed}`);
  console.log(`  ❌ Failed: ${testResults.summary.failed}`);
  console.log(`  ⚠️  Errors: ${testResults.summary.errors}`);

  // Show failed tests
  const failedTests = testResults.tests.filter(t => t.status === 'failed');
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    for (const test of failedTests) {
      console.log(`\n  Execution ${test.executionId} (${test.payloadCategory}):`);
      console.log(`    Expected: ${test.expectedType}`);
      console.log(`    Detected: ${test.detectedType}`);
      test.errors.forEach(err => console.log(`    Error: ${err}`));
    }
  }

  // Save results
  const resultsFile = path.join(OUTPUT_DIR, `comprehensive-test-${Date.now()}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2), 'utf8');
  console.log(`\n📁 Results saved to: ${resultsFile}`);

  return testResults;
}

// Run tests
runComprehensiveTests().catch(console.error);

export { runComprehensiveTests, analyzeExecution };

