#!/usr/bin/env node
/**
 * Analyze Latest Executions for Payload Testing
 * 
 * Fetches the latest executions and analyzes Smart Message Router output
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
 * Extract short message ID for comparison
 */
const extractShortId = (id) => {
  if (!id) return '';
  const parts = id.split('_');
  return parts[parts.length - 1];
};

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

  return {
    executionId: execution.id,
    actualType,
    detectedType,
    passed: detectedType === actualType || 
            (actualType === 'pdfWithCaption' && detectedType === 'document') ||
            (actualType === 'imageWithCaption' && detectedType === 'image') ||
            (actualType === 'videoWithCaption' && detectedType === 'video') ||
            (actualType === 'pdf' && detectedType === 'document') ||
            (actualType === 'voiceNote' && detectedType === 'voice'),
    messageId: routerOutput.messageId || '',
    textContent: routerOutput.textContent || '',
    timestamp: execution.startedAt
  };
}

/**
 * Main function
 */
async function analyzeLatestExecutions() {
  console.log('🔍 Analyzing Latest Executions...\n');

  // We'll need to fetch executions via API - for now, use saved data
  const savedExecutionsFile = path.join(__dirname, '..', 'data', 'whatsapp-payloads', 'executions.json');
  
  if (!fs.existsSync(savedExecutionsFile)) {
    console.log('⚠️ No saved executions file found. Run fetch-executions first.');
    return;
  }

  const savedExecutions = JSON.parse(fs.readFileSync(savedExecutionsFile, 'utf8'));
  const results = [];

  for (const exec of savedExecutions) {
    const analysis = analyzeExecution(exec);
    if (analysis) {
      results.push(analysis);
    }
  }

  // Group by payload type
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

  results.forEach(r => {
    if (byType[r.actualType]) {
      byType[r.actualType].push(r);
    }
  });

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
      
      if (failedCount > 0) {
        tests.filter(t => !t.passed).forEach(t => {
          console.log(`   Execution ${t.executionId}: Expected "${type}", got "${t.detectedType}"`);
        });
      }
    } else {
      console.log(`⏳ ${name}: 0 tests`);
    }
  }

  console.log(`\n📈 Overall: ${passed}/${total} passed (${failed} failed)`);

  // Save results
  const resultsFile = path.join(OUTPUT_DIR, `analysis-${Date.now()}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify({ results, byType, summary: { total, passed, failed } }, null, 2), 'utf8');
  console.log(`\n📁 Results saved to: ${resultsFile}`);
}

analyzeLatestExecutions().catch(console.error);

