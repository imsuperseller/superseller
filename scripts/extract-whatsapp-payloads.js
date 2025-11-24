#!/usr/bin/env node
/**
 * Extract WhatsApp Payloads from n8n Workflow Executions
 * 
 * Extracts all payload types from INT-WHATSAPP-SUPPORT-001 workflow executions:
 * - Text
 * - Image (with/without caption)
 * - Video (with/without caption)
 * - PDF (with/without caption)
 * - Voice note
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_ID = 'eQSCUFw91oXLxtvn';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'whatsapp-payloads');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Extract payload from execution data
 */
function extractPayload(execution) {
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

  // Get WAHA Trigger node output
  const triggerNode = execution.nodes?.['WAHA Trigger'];
  if (!triggerNode || !triggerNode.data?.output) return payloads;

  const triggerOutput = triggerNode.data.output;
  if (!Array.isArray(triggerOutput) || triggerOutput.length < 2) return payloads;

  const messageItems = triggerOutput[1] || [];
  
  for (const item of messageItems) {
    const payload = item.json?.payload || item.json;
    if (!payload) continue;

    const hasMedia = payload.hasMedia || false;
    const media = payload.media || {};
    const body = payload.body || '';
    const _data = payload._data || {};
    const message = _data.message || {};
    
    // Check message type from _data.message structure
    const hasDocument = message.documentMessage || message.documentWithCaptionMessage;
    const hasImage = message.imageMessage || message.imageWithCaptionMessage;
    const hasVideo = message.videoMessage || message.videoWithCaptionMessage;
    const hasAudio = message.audioMessage || message.voiceMessage;
    const hasCaption = message.imageWithCaptionMessage || 
                      message.videoWithCaptionMessage || 
                      message.documentWithCaptionMessage;

    // Extract caption if present
    const caption = hasCaption?.message?.imageMessage?.caption ||
                   hasCaption?.message?.videoMessage?.caption ||
                   hasCaption?.message?.documentMessage?.caption ||
                   hasCaption?.caption ||
                   '';

    // TEXT MESSAGES
    if (!hasMedia && body && message.conversation) {
      payloads.text.push({
        executionId: execution.id,
        timestamp: payload.timestamp,
        from: payload.from,
        messageId: payload.id,
        text: body,
        rawPayload: payload
      });
    }

    // IMAGES
    if (hasImage || media.mimetype?.startsWith('image/')) {
      const imagePayload = {
        executionId: execution.id,
        timestamp: payload.timestamp,
        from: payload.from,
        messageId: payload.id,
        mediaUrl: media.url || '',
        filename: media.filename || '',
        mimetype: media.mimetype || '',
        caption: caption || '',
        rawPayload: payload
      };

      if (caption) {
        payloads.imageWithCaption.push(imagePayload);
      } else {
        payloads.image.push(imagePayload);
      }
    }

    // VIDEOS
    if (hasVideo || media.mimetype?.startsWith('video/')) {
      const videoPayload = {
        executionId: execution.id,
        timestamp: payload.timestamp,
        from: payload.from,
        messageId: payload.id,
        mediaUrl: media.url || '',
        filename: media.filename || '',
        mimetype: media.mimetype || '',
        caption: caption || '',
        rawPayload: payload
      };

      if (caption) {
        payloads.videoWithCaption.push(videoPayload);
      } else {
        payloads.video.push(videoPayload);
      }
    }

    // PDFs
    if (hasDocument || media.mimetype === 'application/pdf') {
      const pdfPayload = {
        executionId: execution.id,
        timestamp: payload.timestamp,
        from: payload.from,
        messageId: payload.id,
        mediaUrl: media.url || '',
        filename: media.filename || '',
        mimetype: media.mimetype || '',
        caption: caption || body || '',
        rawPayload: payload
      };

      if (caption || body) {
        payloads.pdfWithCaption.push(pdfPayload);
      } else {
        payloads.pdf.push(pdfPayload);
      }
    }

    // VOICE NOTES
    if (hasAudio || media.mimetype?.startsWith('audio/') || message.voiceMessage) {
      payloads.voiceNote.push({
        executionId: execution.id,
        timestamp: payload.timestamp,
        from: payload.from,
        messageId: payload.id,
        mediaUrl: media.url || '',
        filename: media.filename || '',
        mimetype: media.mimetype || '',
        rawPayload: payload
      });
    }
  }

  return payloads;
}

/**
 * Process all executions and extract payloads
 */
async function processExecutions() {
  console.log('🔍 Extracting payloads from workflow executions...\n');

  // Read execution list (we'll need to fetch more via API)
  // For now, process the ones we have
  const executionIds = [
    '20168', '20161', '20160', '20159', '20158', '20157', '20154', '20152', '20151', '20150',
    '20138', '20137', '20136', '20135', '20134', '20133', '20132', '20131', '20127', '20126',
    '20125', '20119', '20118', '20117', '20113', '20112', '20111', '20110', '20109', '20105',
    '20104', '20101', '20099', '20096', '20095', '20094', '19999', '19998', '19996', '19995',
    '19992', '19991', '19990', '19989', '19988', '19982', '19951', '19950', '19944', '19943',
    '19942', '19930', '19929', '19928', '19927', '19926', '19925', '19923', '19922', '19921',
    '19917', '19916', '19905', '19899', '19892', '19891', '19890', '19886', '19884', '19882',
    '19880', '19879', '19878', '19874', '19873', '19872', '19871', '19870', '19868', '19867',
    '19861', '19860', '19859', '19858', '19857', '19854', '19853', '19847', '19846'
  ];

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

  console.log(`📊 Processing ${executionIds.length} executions...\n`);

  // Note: In real implementation, we'd fetch execution details via n8n MCP API
  // For now, this script structure is ready for that
  console.log('⚠️  Note: This script needs to be integrated with n8n MCP API');
  console.log('📝 Run payloads extraction via n8n MCP tools first\n');

  return allPayloads;
}

/**
 * Generate test suite from extracted payloads
 */
function generateTestSuite(payloads) {
  const testSuite = {
    metadata: {
      workflowId: WORKFLOW_ID,
      workflowName: 'INT-WHATSAPP-SUPPORT-001: Rensto Support Agent (Final)',
      generatedAt: new Date().toISOString(),
      totalPayloads: Object.values(payloads).reduce((sum, arr) => sum + arr.length, 0)
    },
    testCases: {},
    coverage: {},
    issues: []
  };

  // Generate test cases for each payload type
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
    
    testSuite.coverage[type.key] = {
      name: type.name,
      found: items.length > 0,
      count: items.length,
      required: type.required,
      samples: items.slice(0, 3).map(item => ({
        executionId: item.executionId,
        messageId: item.messageId,
        timestamp: item.timestamp
      }))
    };

    if (type.required && items.length === 0) {
      testSuite.issues.push({
        type: 'missing_payload',
        severity: 'high',
        message: `No ${type.name} found in executions`,
        required: true
      });
    }

    testSuite.testCases[type.key] = {
      name: `Test ${type.name}`,
      description: `Verify workflow handles ${type.name.toLowerCase()} correctly`,
      payloads: items.slice(0, 5), // Store first 5 samples
      assertions: [
        'Payload is correctly extracted from WAHA Trigger',
        'Smart Message Router correctly identifies message type',
        'Message Type Router routes to correct branch',
        'Media URL is accessible (if applicable)',
        'Caption is extracted correctly (if applicable)',
        'Workflow completes without errors'
      ]
    };
  }

  return testSuite;
}

/**
 * Main execution
 */
async function main() {
  try {
    const payloads = await processExecutions();
    const testSuite = generateTestSuite(payloads);

    // Save results
    const outputFile = path.join(OUTPUT_DIR, `payloads-${Date.now()}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(payloads, null, 2));
    console.log(`✅ Payloads saved to: ${outputFile}`);

    const testSuiteFile = path.join(OUTPUT_DIR, `test-suite-${Date.now()}.json`);
    fs.writeFileSync(testSuiteFile, JSON.stringify(testSuite, null, 2));
    console.log(`✅ Test suite saved to: ${testSuiteFile}`);

    // Print summary
    console.log('\n📊 PAYLOAD EXTRACTION SUMMARY\n');
    console.log('='.repeat(60));
    
    for (const [key, items] of Object.entries(payloads)) {
      const emoji = items.length > 0 ? '✅' : '❌';
      console.log(`${emoji} ${key.padEnd(20)}: ${items.length} found`);
    }
    
    console.log('='.repeat(60));
    console.log(`\n📝 Total payloads: ${testSuite.metadata.totalPayloads}`);
    console.log(`⚠️  Issues found: ${testSuite.issues.length}`);
    
    if (testSuite.issues.length > 0) {
      console.log('\n🚨 ISSUES:\n');
      testSuite.issues.forEach(issue => {
        console.log(`  - [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
    }

    return { payloads, testSuite };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { extractPayload, generateTestSuite, processExecutions };

