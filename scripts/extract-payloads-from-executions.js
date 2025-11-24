#!/usr/bin/env node
/**
 * Extract WhatsApp Payloads from n8n Executions via MCP API
 * 
 * This script extracts all payload types and creates test suites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'whatsapp-payloads');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Extract payload from execution node data
 */
function extractPayloadFromExecution(execution) {
  const payloads = {
    text: [],
    image: [],
    imageWithCaption: [],
    video: [],
    videoWithCaption: [],
    pdf: [],
    pdfWithCaption: [],
    voiceNote: []
  };

  const triggerNode = execution.nodes?.['WAHA Trigger'];
  if (!triggerNode || !triggerNode.data?.output) return payloads;

  const messageItems = triggerNode.data.output[1] || [];
  
  for (const item of messageItems) {
    const payload = item.json?.payload || item.json;
    if (!payload) continue;

    const hasMedia = payload.hasMedia || false;
    const media = payload.media || {};
    const body = payload.body || '';
    const _data = payload._data || {};
    const message = _data.message || {};
    
    // Detect message types from WhatsApp message structure
    const documentMsg = message.documentMessage;
    const documentWithCaptionMsg = message.documentWithCaptionMessage;
    const imageMsg = message.imageMessage;
    const imageWithCaptionMsg = message.imageWithCaptionMessage;
    const videoMsg = message.videoMessage;
    const videoWithCaptionMsg = message.videoWithCaptionMessage;
    const audioMsg = message.audioMessage;
    const voiceMsg = message.voiceMessage;
    
    // Extract caption
    let caption = '';
    if (documentWithCaptionMsg?.message?.documentMessage?.caption) {
      caption = documentWithCaptionMsg.message.documentMessage.caption;
    } else if (imageWithCaptionMsg?.message?.imageMessage?.caption) {
      caption = imageWithCaptionMsg.message.imageMessage.caption;
    } else if (videoWithCaptionMsg?.message?.videoMessage?.caption) {
      caption = videoWithCaptionMsg.message.videoMessage.caption;
    } else if (documentWithCaptionMsg?.caption) {
      caption = documentWithCaptionMsg.caption;
    }

    const executionId = execution.id;
    const messageId = payload.id || '';
    const timestamp = payload.timestamp || Date.now();
    const from = payload.from || '';

    // TEXT MESSAGES
    if (!hasMedia && !documentMsg && !imageMsg && !videoMsg && !audioMsg && !voiceMsg && body) {
      if (message.conversation || body.trim()) {
        payloads.text.push({
          executionId,
          timestamp,
          from,
          messageId,
          text: body,
          conversation: message.conversation || body,
          rawPayload: payload
        });
      }
    }

    // IMAGES
    if (imageMsg || imageWithCaptionMsg || (hasMedia && media.mimetype?.startsWith('image/'))) {
      const imageUrl = imageMsg?.url || imageWithCaptionMsg?.message?.imageMessage?.url || media.url || '';
      const imagePayload = {
        executionId,
        timestamp,
        from,
        messageId,
        mediaUrl: imageUrl,
        filename: media.filename || imageMsg?.fileName || '',
        mimetype: media.mimetype || imageMsg?.mimetype || 'image/jpeg',
        caption: caption || '',
        hasCaption: !!caption,
        rawPayload: payload
      };

      if (caption) {
        payloads.imageWithCaption.push(imagePayload);
      } else {
        payloads.image.push(imagePayload);
      }
    }

    // VIDEOS
    if (videoMsg || videoWithCaptionMsg || (hasMedia && media.mimetype?.startsWith('video/'))) {
      const videoUrl = videoMsg?.url || videoWithCaptionMsg?.message?.videoMessage?.url || media.url || '';
      const videoPayload = {
        executionId,
        timestamp,
        from,
        messageId,
        mediaUrl: videoUrl,
        filename: media.filename || videoMsg?.fileName || '',
        mimetype: media.mimetype || videoMsg?.mimetype || 'video/mp4',
        caption: caption || '',
        hasCaption: !!caption,
        rawPayload: payload
      };

      if (caption) {
        payloads.videoWithCaption.push(videoPayload);
      } else {
        payloads.video.push(videoPayload);
      }
    }

    // PDFs
    if (documentMsg || documentWithCaptionMsg || (hasMedia && media.mimetype === 'application/pdf')) {
      const pdfUrl = documentMsg?.url || 
                    documentWithCaptionMsg?.message?.documentMessage?.url || 
                    media.url || '';
      const pdfPayload = {
        executionId,
        timestamp,
        from,
        messageId,
        mediaUrl: pdfUrl,
        filename: media.filename || documentMsg?.fileName || '',
        mimetype: media.mimetype || documentMsg?.mimetype || 'application/pdf',
        caption: caption || body || '', // Body might be caption for PDF
        hasCaption: !!(caption || body),
        rawPayload: payload
      };

      if (caption || body) {
        payloads.pdfWithCaption.push(pdfPayload);
      } else {
        payloads.pdf.push(pdfPayload);
      }
    }

    // VOICE NOTES
    if (audioMsg || voiceMsg || (hasMedia && media.mimetype?.startsWith('audio/'))) {
      const audioUrl = audioMsg?.url || voiceMsg?.url || media.url || '';
      payloads.voiceNote.push({
        executionId,
        timestamp,
        from,
        messageId,
        mediaUrl: audioUrl,
        filename: media.filename || audioMsg?.fileName || '',
        mimetype: media.mimetype || audioMsg?.mimetype || 'audio/ogg',
        isPTT: audioMsg?.ptt === true || voiceMsg !== undefined,
        rawPayload: payload
      });
    }
  }

  return payloads;
}

/**
 * Analyze Smart Message Router output for issues
 */
function analyzeRouterOutput(execution, payloads) {
  const issues = [];
  const routerNode = execution.nodes?.['Smart Message Router'];
  
  if (!routerNode || !routerNode.data?.output) return issues;

  const routerOutput = routerNode.data.output[0] || [];
  
  // Helper: Extract short message ID from composite ID
  const extractShortId = (id) => {
    if (!id) return '';
    // Extract last part after last underscore (format: false_from_id or just id)
    const parts = String(id).split('_');
    return parts[parts.length - 1] || id;
  };

  // Collect all payloads by messageId (using both full and short IDs for matching)
  const allPayloadsMap = new Map();
  [
    ...payloads.text.map(p => ({...p, actualType: 'text'})),
    ...payloads.image.map(p => ({...p, actualType: 'image'})),
    ...payloads.imageWithCaption.map(p => ({...p, actualType: 'image'})),
    ...payloads.video.map(p => ({...p, actualType: 'video'})),
    ...payloads.videoWithCaption.map(p => ({...p, actualType: 'video'})),
    ...payloads.pdf.map(p => ({...p, actualType: 'document'})),
    ...payloads.pdfWithCaption.map(p => ({...p, actualType: 'document'})),
    ...payloads.voiceNote.map(p => ({...p, actualType: 'voice'}))
  ].forEach(p => {
    const shortId = extractShortId(p.messageId);
    allPayloadsMap.set(p.messageId, p); // Full ID
    if (shortId !== p.messageId) {
      allPayloadsMap.set(shortId, p); // Short ID
    }
  });
  
  for (const routerItem of routerOutput) {
    const routerData = routerItem.json || {};
    const routerMessageType = routerData.messageType || '';
    const messageId = routerData.messageId || '';
    
    // Find corresponding payload
    const payload = allPayloadsMap.get(messageId);
    if (!payload) continue;

    const actualType = payload.actualType || payload.type || 'unknown';
    
    // Map router types to expected types
    const routerTypeMap = {
      'text': 'text',
      'image': 'image',
      'video': 'video',
      'document': 'document',
      'voice': 'voice'
    };
    const expectedRouterType = routerTypeMap[actualType] || actualType;
    
    // Check for misidentification
    if (actualType === 'document' && routerMessageType === 'text') {
      issues.push({
        severity: 'high',
        type: 'misidentification',
        executionId: execution.id,
        messageId,
        expected: 'document',
        actual: routerMessageType,
        description: `PDF${payload.hasCaption ? ' with caption' : ''} misidentified as text. ${payload.hasCaption ? `Caption: "${payload.caption}"` : ''}`,
        mediaUrl: payload.mediaUrl,
        mediaInfo: {
          filename: payload.filename,
          mimetype: payload.mimetype
        },
        fix: 'Smart Message Router should check for documentMessage before defaulting to text'
      });
    } else if (actualType === 'image' && routerMessageType !== 'image') {
      issues.push({
        severity: 'high',
        type: 'misidentification',
        executionId: execution.id,
        messageId,
        expected: 'image',
        actual: routerMessageType,
        description: `Image${payload.hasCaption ? ' with caption' : ''} misidentified as ${routerMessageType}`,
        mediaUrl: payload.mediaUrl
      });
    } else if (actualType === 'video' && routerMessageType !== 'video') {
      issues.push({
        severity: 'high',
        type: 'misidentification',
        executionId: execution.id,
        messageId,
        expected: 'video',
        actual: routerMessageType,
        description: `Video${payload.hasCaption ? ' with caption' : ''} misidentified as ${routerMessageType}`,
        mediaUrl: payload.mediaUrl
      });
    } else if (actualType === 'voice' && routerMessageType !== 'voice') {
      issues.push({
        severity: 'medium',
        type: 'misidentification',
        executionId: execution.id,
        messageId,
        expected: 'voice',
        actual: routerMessageType,
        description: 'Voice note misidentified'
      });
    }
  }

  return issues;
}

/**
 * Generate comprehensive test suite
 */
function generateTestSuite(payloads, issues) {
  const testSuite = {
    metadata: {
      generatedAt: new Date().toISOString(),
      workflowId: 'eQSCUFw91oXLxtvn',
      workflowName: 'INT-WHATSAPP-SUPPORT-001: Rensto Support Agent (Final)',
      totalPayloads: Object.values(payloads).reduce((sum, arr) => sum + arr.length, 0),
      totalIssues: issues.length
    },
    coverage: {},
    testCases: {},
    issues: issues,
    recommendations: []
  };

  const payloadTypes = [
    { key: 'text', name: 'Text Messages', required: true },
    { key: 'image', name: 'Images', required: true },
    { key: 'imageWithCaption', name: 'Images with Caption', required: true },
    { key: 'video', name: 'Videos', required: true },
    { key: 'videoWithCaption', name: 'Videos with Caption', required: true },
    { key: 'pdf', name: 'PDFs', required: true },
    { key: 'pdfWithCaption', name: 'PDFs with Caption', required: true },
    { key: 'voiceNote', name: 'Voice Notes', required: true }
  ];

  for (const type of payloadTypes) {
    const items = payloads[type.key] || [];
    const hasItems = items.length > 0;
    
    testSuite.coverage[type.key] = {
      name: type.name,
      found: hasItems,
      count: items.length,
      required: type.required,
      status: hasItems ? '✅' : '❌',
      samples: items.slice(0, 3).map(item => ({
        executionId: item.executionId,
        messageId: item.messageId,
        timestamp: item.timestamp,
        ...(item.mediaUrl ? { mediaUrl: item.mediaUrl } : {}),
        ...(item.caption ? { caption: item.caption.substring(0, 50) } : {})
      }))
    };

    if (type.required && !hasItems) {
      testSuite.recommendations.push({
        priority: 'high',
        type: 'missing_test_data',
        message: `Need to send ${type.name.toLowerCase()} to test workflow`,
        action: `Create test message: ${type.name.toLowerCase()}`
      });
    }

    testSuite.testCases[type.key] = {
      name: `Test ${type.name}`,
      description: `Verify workflow correctly handles ${type.name.toLowerCase()}`,
      payloadCount: items.length,
      testSteps: [
        `Send ${type.name.toLowerCase()} via WhatsApp`,
        'Verify WAHA Trigger receives payload',
        'Verify Smart Message Router identifies message type correctly',
        'Verify Message Type Router routes to correct branch',
        ...(type.key.includes('WithCaption') ? ['Verify caption is extracted'] : []),
        ...(type.key !== 'text' && type.key !== 'voiceNote' ? ['Verify media URL is accessible'] : []),
        'Verify workflow completes successfully',
        'Verify response is sent correctly'
      ],
      assertions: [
        'Payload extraction successful',
        'Message type detection correct',
        'Media URL valid (if applicable)',
        'Caption extracted (if applicable)',
        'No errors in execution',
        'Response sent successfully'
      ],
      samplePayloads: items.slice(0, 5)
    };
  }

  // Add issue-based recommendations
  const misidentificationIssues = issues.filter(i => i.type === 'misidentification');
  if (misidentificationIssues.length > 0) {
    testSuite.recommendations.push({
      priority: 'critical',
      type: 'router_fix',
      message: `${misidentificationIssues.length} message type misidentifications found`,
      action: 'Fix Smart Message Router logic to correctly detect media types',
      issues: misidentificationIssues
    });
  }

  return testSuite;
}

/**
 * Main function - expects execution data as input
 * This will be called from a script that fetches via MCP
 */
function processExecutions(executions) {
  const allPayloads = {
    text: [],
    image: [],
    imageWithCaption: [],
    video: [],
    videoWithCaption: [],
    pdf: [],
    pdfWithCaption: [],
    voiceNote: []
  };

  const allIssues = [];

  console.log(`📊 Processing ${executions.length} executions...\n`);

  for (const execution of executions) {
    const payloads = extractPayloadFromExecution(execution);
    const issues = analyzeRouterOutput(execution, payloads);

    // Merge payloads
    for (const [key, items] of Object.entries(payloads)) {
      // Add type marker to each payload for easier identification
      items.forEach(item => {
        if (key.includes('pdf')) item.type = 'pdf';
        else if (key.includes('image')) item.type = 'image';
        else if (key.includes('video')) item.type = 'video';
        else if (key.includes('voice')) item.type = 'voice';
        else if (key === 'text') item.type = 'text';
      });
      allPayloads[key].push(...items);
    }

    allIssues.push(...issues);
  }

  const testSuite = generateTestSuite(allPayloads, allIssues);

  // Save results
  const timestamp = Date.now();
  const payloadsFile = path.join(OUTPUT_DIR, `payloads-${timestamp}.json`);
  const testSuiteFile = path.join(OUTPUT_DIR, `test-suite-${timestamp}.json`);

  fs.writeFileSync(payloadsFile, JSON.stringify(allPayloads, null, 2));
  fs.writeFileSync(testSuiteFile, JSON.stringify(testSuite, null, 2));

  // Print summary
  console.log('\n📊 PAYLOAD EXTRACTION SUMMARY\n');
  console.log('='.repeat(60));
  for (const [key, items] of Object.entries(allPayloads)) {
    const emoji = items.length > 0 ? '✅' : '❌';
    console.log(`${emoji} ${key.padEnd(20)}: ${items.length} found`);
  }
  console.log('='.repeat(60));
  console.log(`\n📝 Total payloads: ${testSuite.metadata.totalPayloads}`);
  console.log(`⚠️  Issues found: ${allIssues.length}`);
  console.log(`\n💾 Results saved:`);
  console.log(`   - Payloads: ${payloadsFile}`);
  console.log(`   - Test Suite: ${testSuiteFile}\n`);

  if (allIssues.length > 0) {
    console.log('🚨 ISSUES FOUND:\n');
    allIssues.forEach(issue => {
      console.log(`  [${issue.severity.toUpperCase()}] ${issue.description}`);
      console.log(`      Execution: ${issue.executionId}, Message: ${issue.messageId}`);
    });
  }

  return { payloads: allPayloads, testSuite, issues: allIssues };
}

export { 
  extractPayloadFromExecution, 
  analyzeRouterOutput, 
  generateTestSuite, 
  processExecutions 
};

// Allow direct execution with JSON file input
const execFile = process.argv[2];
if (execFile) {
  const executions = JSON.parse(fs.readFileSync(execFile, 'utf8'));
  processExecutions(executions);
} else {
  console.log('Usage: node extract-payloads-from-executions.js <executions-file.json>');
}

