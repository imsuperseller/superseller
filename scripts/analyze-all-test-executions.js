#!/usr/bin/env node
/**
 * Analyze All Test Executions
 * 
 * Fetches and analyzes all recent test executions to verify Smart Message Router V6 fix
 */

const WORKFLOW_ID = 'eQSCUFw91oXLxtvn';

/**
 * Determine actual payload type from trigger node data
 */
function determineActualType(execution) {
  const triggerNode = execution.nodes?.['WAHA Trigger'];
  if (!triggerNode || !triggerNode.data?.output) return null;

  const messageItems = triggerNode.data.output[1] || [];
  if (messageItems.length === 0) return null;

  const payload = messageItems[0].json?.payload || {};
  const _data = payload._data || {};
  const message = _data.message || {};

  // Check for captioned types first (V6 fix)
  if (message.documentWithCaptionMessage) return 'pdfWithCaption';
  if (message.imageWithCaptionMessage) return 'imageWithCaption';
  if (message.videoWithCaptionMessage) return 'videoWithCaption';

  // Check direct types
  if (message.documentMessage) return 'pdf';
  if (message.imageMessage) return 'image';
  if (message.videoMessage) return 'video';
  if (message.audioMessage && message.audioMessage.ptt) return 'voiceNote';
  if (message.conversation || payload.body) return 'text';

  return null;
}

/**
 * Analyze execution
 */
function analyzeExecution(execution) {
  const routerNode = execution.nodes?.['Smart Message Router'];
  const actualType = determineActualType(execution);
  
  if (!routerNode || !actualType) return null;

  const routerOutput = routerNode.data?.output?.[0]?.[0]?.json || {};
  const detectedType = routerOutput.messageType || 'unknown';

  // Normalize types for comparison
  const normalizedActual = actualType === 'pdfWithCaption' ? 'document' :
                          actualType === 'pdf' ? 'document' :
                          actualType === 'imageWithCaption' ? 'image' :
                          actualType === 'videoWithCaption' ? 'video' :
                          actualType === 'voiceNote' ? 'voice' :
                          actualType;

  const passed = detectedType === normalizedActual;

  return {
    executionId: execution.id,
    status: execution.status,
    actualType,
    detectedType,
    normalizedActual,
    passed,
    messageId: routerOutput.messageId || '',
    textContent: routerOutput.textContent || '',
    mediaUrl: routerOutput.mediaUrl || '',
    timestamp: execution.startedAt
  };
}

/**
 * Main function - will be called with execution data
 */
function analyzeExecutions(executions) {
  console.log(`\n🔍 Analyzing ${executions.length} Executions...\n`);

  const results = [];
  const byType = {
    text: [],
    image: [],
    imageWithCaption: [],
    video: [],
    videoWithCaption: [],
    pdf: [],
    pdfWithCaption: [],
    voiceNote: []
  };

  for (const exec of executions) {
    const analysis = analyzeExecution(exec);
    if (analysis) {
      results.push(analysis);
      if (byType[analysis.actualType]) {
        byType[analysis.actualType].push(analysis);
      }
    }
  }

  console.log('📊 Test Results Summary:\n');
  
  const typeNames = {
    text: 'Text',
    image: 'Image',
    imageWithCaption: 'Image with Caption',
    video: 'Video',
    videoWithCaption: 'Video with Caption',
    pdf: 'PDF',
    pdfWithCaption: 'PDF with Caption',
    voiceNote: 'Voice Note'
  };

  let total = 0;
  let passed = 0;
  let failed = 0;

  for (const [type, tests] of Object.entries(byType)) {
    const name = typeNames[type] || type;
    const passedCount = tests.filter(t => t.passed).length;
    const failedCount = tests.length - passedCount;
    
    total += tests.length;
    passed += passedCount;
    failed += failedCount;

    if (tests.length > 0) {
      const status = passedCount === tests.length ? '✅' : failedCount > 0 ? '❌' : '⚠️';
      console.log(`${status} ${name}: ${passedCount}/${tests.length} passed`);
      
      tests.forEach(t => {
        const icon = t.passed ? '✅' : '❌';
        console.log(`   ${icon} Execution ${t.executionId} (${t.status}): Expected "${t.normalizedActual}", got "${t.detectedType}"`);
        if (!t.passed) {
          console.log(`      Actual type: ${t.actualType}`);
        }
      });
    } else {
      console.log(`⏳ ${name}: 0 tests`);
    }
  }

  console.log(`\n📈 Overall: ${passed}/${total} passed (${failed} failed)`);
  
  if (failed === 0 && total > 0) {
    console.log(`\n🎉 ALL TESTS PASSED! Smart Message Router V6 fix is working correctly!`);
  }

  return { results, byType, summary: { total, passed, failed } };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analyzeExecution, determineActualType, analyzeExecutions };
}

// If run directly, fetch executions and analyze
if (import.meta.url === `file://${process.argv[1]}`) {
  // This will be called with execution data from n8n MCP
  console.log('Run this script with execution data from n8n MCP tools');
}

export { analyzeExecution, determineActualType, analyzeExecutions };

