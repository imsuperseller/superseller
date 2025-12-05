#!/usr/bin/env node
/**
 * Comprehensive WhatsApp Payload Testing Script
 * 
 * Tests all 8 payload types using REAL payload structures from actual executions
 * Automatically analyzes results and identifies issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_ID = 'eQSCUFw91oXLxtvn';
const WEBHOOK_ID = '976a4187-04c0-458b-b9ba-c7af75ed5de0';
const WEBHOOK_URL = `http://n8n.rensto.com/webhook/${WEBHOOK_ID}/waha`;
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'whatsapp-payloads', 'comprehensive-test-results');
const N8N_API_URL = 'http://n8n.rensto.com/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGEzMjUxLTI2ZjYtNDYxNy1iY2Y5LWUwN2YzY2E5NjhhNyIsInR5cGUiOiJwZXJzb25hbCIsImlhdCI6MTcyMDc0MDAwMCwiZXhwIjo0ODc2MTAwMDAwfQ.7XqJ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate unique message ID (matches WhatsApp format)
 */
function generateMessageId() {
  const chars = '0123456789ABCDEF';
  let id = '';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Generate test user ID
 */
function generateUserId() {
  return `14695885133@c.us`; // Use same test user
}

/**
 * Create REAL test payloads based on actual execution data
 */
function createRealTestPayloads() {
  const baseTimestamp = Date.now();
  const userId = generateUserId();
  const userIdS = userId.replace('@c.us', '@s.whatsapp.net');
  
  return {
    // 1. Text message (from execution 20168)
    text: {
      id: `evt_${Date.now()}_text`,
      timestamp: baseTimestamp,
      event: 'message',
      session: 'rensto-whatsapp',
      metadata: {},
      me: {
        id: '12144362102@c.us',
        pushName: 'Rensto',
        lid: '271661580427508@lid'
      },
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp,
        from: userId,
        fromMe: false,
        source: 'app',
        body: 'This is a test text message',
        hasMedia: false,
        media: null,
        ack: 2,
        ackName: 'DEVICE',
        location: null,
        vCards: null,
        replyTo: null,
        _data: {
          key: {
            remoteJid: userIdS,
            remoteJidAlt: '199501700681931@lid',
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp,
          pushName: 'Test User',
          broadcast: false,
          message: {
            conversation: 'This is a test text message'
          },
          status: 3
        }
      },
      engine: 'NOWEB',
      environment: {
        version: '2025.11.2',
        engine: 'NOWEB',
        tier: 'PLUS',
        browser: null
      }
    },

    // 2. Image (no caption) - from test_payload_image.json
    image: {
      id: `evt_${Date.now()}_image`,
      timestamp: baseTimestamp + 1000,
      event: 'message',
      session: 'rensto-whatsapp',
      metadata: {},
      me: {
        id: '12144362102@c.us',
        pushName: 'Rensto',
        lid: '271661580427508@lid'
      },
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 1000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: null,
        hasMedia: true,
        media: {
          url: 'http://localhost:3000/api/files/rensto-whatsapp/test-image.jpeg',
          filename: null,
          mimetype: 'image/jpeg'
        },
        ack: 2,
        ackName: 'DEVICE',
        location: null,
        vCards: null,
        replyTo: null,
        _data: {
          key: {
            remoteJid: userIdS,
            remoteJidAlt: '199501700681931@lid',
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 1000,
          pushName: 'Test User',
          broadcast: false,
          message: {
            imageMessage: {
              url: 'https://mmg.whatsapp.net/v/test-image.enc',
              mimetype: 'image/jpeg',
              fileSha256: 'test',
              fileLength: '10000',
              height: 1024,
              width: 768,
              mediaKey: 'test',
              fileEncSha256: 'test',
              directPath: '/test-image',
              mediaKeyTimestamp: String(baseTimestamp + 1000),
              jpegThumbnail: '/9j/test',
              imageSourceType: 'USER_IMAGE'
            }
          },
          status: 3
        }
      },
      engine: 'NOWEB',
      environment: {
        version: '2025.11.2',
        engine: 'NOWEB',
        tier: 'PLUS',
        browser: null
      }
    },

    // 3. Image with caption
    imageWithCaption: {
      id: `evt_${Date.now()}_image_caption`,
      timestamp: baseTimestamp + 2000,
      event: 'message',
      session: 'rensto-whatsapp',
      metadata: {},
      me: {
        id: '12144362102@c.us',
        pushName: 'Rensto',
        lid: '271661580427508@lid'
      },
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 2000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: 'What is this?',
        hasMedia: true,
        media: {
          url: 'http://localhost:3000/api/files/rensto-whatsapp/test-image-caption.jpeg',
          filename: null,
          mimetype: 'image/jpeg'
        },
        ack: 2,
        ackName: 'DEVICE',
        location: null,
        vCards: null,
        replyTo: null,
        _data: {
          key: {
            remoteJid: userIdS,
            remoteJidAlt: '199501700681931@lid',
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 2000,
          pushName: 'Test User',
          broadcast: false,
          message: {
            imageWithCaptionMessage: {
              message: {
                imageMessage: {
                  url: 'https://mmg.whatsapp.net/v/test-image-caption.enc',
                  mimetype: 'image/jpeg',
                  caption: 'What is this?',
                  fileSha256: 'test',
                  fileLength: '10000',
                  height: 1024,
                  width: 768,
                  mediaKey: 'test',
                  fileEncSha256: 'test',
                  directPath: '/test-image-caption',
                  mediaKeyTimestamp: String(baseTimestamp + 2000),
                  jpegThumbnail: '/9j/test',
                  imageSourceType: 'USER_IMAGE'
                }
              }
            }
          },
          status: 3
        }
      },
      engine: 'NOWEB',
      environment: {
        version: '2025.11.2',
        engine: 'NOWEB',
        tier: 'PLUS',
        browser: null
      }
    },

    // 4. Video (no caption) - from test_payload_video.json
    video: {
      id: `evt_${Date.now()}_video`,
      timestamp: baseTimestamp + 3000,
      event: 'message',
      session: 'rensto-whatsapp',
      metadata: {},
      me: {
        id: '12144362102@c.us',
        pushName: 'Rensto',
        lid: '271661580427508@lid'
      },
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 3000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: null,
        hasMedia: true,
        media: {
          url: 'http://localhost:3000/api/files/rensto-whatsapp/test-video.mp4',
          filename: null,
          mimetype: 'video/mp4'
        },
        ack: 2,
        ackName: 'DEVICE',
        location: null,
        vCards: null,
        replyTo: null,
        _data: {
          key: {
            remoteJid: userIdS,
            remoteJidAlt: '199501700681931@lid',
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 3000,
          pushName: 'Test User',
          broadcast: false,
          message: {
            videoMessage: {
              url: 'https://mmg.whatsapp.net/v/test-video.enc',
              mimetype: 'video/mp4',
              fileSha256: 'test',
              fileLength: '1000000',
              seconds: 10,
              height: 720,
              width: 1280,
              mediaKey: 'test',
              fileEncSha256: 'test',
              directPath: '/test-video',
              mediaKeyTimestamp: String(baseTimestamp + 3000),
              jpegThumbnail: '/9j/test',
              videoSourceType: 'USER_VIDEO'
            }
          },
          status: 3
        }
      },
      engine: 'NOWEB',
      environment: {
        version: '2025.11.2',
        engine: 'NOWEB',
        tier: 'PLUS',
        browser: null
      }
    },

    // 5. Video with caption
    videoWithCaption: {
      id: `evt_${Date.now()}_video_caption`,
      timestamp: baseTimestamp + 4000,
      event: 'message',
      session: 'rensto-whatsapp',
      metadata: {},
      me: {
        id: '12144362102@c.us',
        pushName: 'Rensto',
        lid: '271661580427508@lid'
      },
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 4000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: 'Check this out',
        hasMedia: true,
        media: {
          url: 'http://localhost:3000/api/files/rensto-whatsapp/test-video-caption.mp4',
          filename: null,
          mimetype: 'video/mp4'
        },
        ack: 2,
        ackName: 'DEVICE',
        location: null,
        vCards: null,
        replyTo: null,
        _data: {
          key: {
            remoteJid: userIdS,
            remoteJidAlt: '199501700681931@lid',
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 4000,
          pushName: 'Test User',
          broadcast: false,
          message: {
            videoWithCaptionMessage: {
              message: {
                videoMessage: {
                  url: 'https://mmg.whatsapp.net/v/test-video-caption.enc',
                  mimetype: 'video/mp4',
                  caption: 'Check this out',
                  fileSha256: 'test',
                  fileLength: '1000000',
                  seconds: 10,
                  height: 720,
                  width: 1280,
                  mediaKey: 'test',
                  fileEncSha256: 'test',
                  directPath: '/test-video-caption',
                  mediaKeyTimestamp: String(baseTimestamp + 4000),
                  jpegThumbnail: '/9j/test',
                  videoSourceType: 'USER_VIDEO'
                }
              }
            }
          },
          status: 3
        }
      },
      engine: 'NOWEB',
      environment: {
        version: '2025.11.2',
        engine: 'NOWEB',
        tier: 'PLUS',
        browser: null
      }
    },

    // 6. PDF (no caption) - from test_payload_pdf.json
    pdf: {
      id: `evt_${Date.now()}_pdf`,
      timestamp: baseTimestamp + 5000,
      event: 'message',
      session: 'rensto-whatsapp',
      metadata: {},
      me: {
        id: '12144362102@c.us',
        pushName: 'Rensto',
        lid: '271661580427508@lid'
      },
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 5000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: null,
        hasMedia: true,
        media: {
          url: 'http://localhost:3000/api/files/rensto-whatsapp/test-document.pdf',
          filename: 'test-document.pdf',
          mimetype: 'application/pdf'
        },
        ack: 2,
        ackName: 'DEVICE',
        location: null,
        vCards: null,
        replyTo: null,
        _data: {
          key: {
            remoteJid: userIdS,
            remoteJidAlt: '199501700681931@lid',
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 5000,
          pushName: 'Test User',
          broadcast: false,
          message: {
            documentMessage: {
              url: 'https://mmg.whatsapp.net/v/test-document.enc',
              mimetype: 'application/pdf',
              title: 'test-document',
              fileSha256: 'test',
              fileLength: '50000',
              pageCount: 2,
              fileName: 'test-document.pdf',
              mediaKey: 'test',
              fileEncSha256: 'test',
              directPath: '/test-document',
              mediaKeyTimestamp: String(baseTimestamp + 5000),
              jpegThumbnail: '/9j/test',
              contactVcard: false
            }
          },
          status: 3
        }
      },
      engine: 'NOWEB',
      environment: {
        version: '2025.11.2',
        engine: 'NOWEB',
        tier: 'PLUS',
        browser: null
      }
    },

    // 7. PDF with caption (CRITICAL TEST) - from payloads-1763930080558.json
    pdfWithCaption: {
      id: `evt_${Date.now()}_pdf_caption`,
      timestamp: baseTimestamp + 6000,
      event: 'message',
      session: 'rensto-whatsapp',
      metadata: {},
      me: {
        id: '12144362102@c.us',
        pushName: 'Rensto',
        lid: '271661580427508@lid'
      },
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 6000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: 'analyze this invoice',
        hasMedia: true,
        media: {
          url: 'http://localhost:3000/api/files/rensto-whatsapp/test-invoice.pdf',
          filename: 'Invoice-TEST.pdf',
          mimetype: 'application/pdf'
        },
        ack: 2,
        ackName: 'DEVICE',
        location: null,
        vCards: null,
        replyTo: null,
        _data: {
          key: {
            remoteJid: userIdS,
            remoteJidAlt: '199501700681931@lid',
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 6000,
          pushName: 'Test User',
          broadcast: false,
          message: {
            documentWithCaptionMessage: {
              message: {
                documentMessage: {
                  url: 'https://mmg.whatsapp.net/v/test-invoice.enc',
                  mimetype: 'application/pdf',
                  fileName: 'Invoice-TEST.pdf',
                  caption: 'analyze this invoice',
                  fileSha256: 'test',
                  fileLength: '50000',
                  pageCount: 2,
                  mediaKey: 'test',
                  fileEncSha256: 'test',
                  directPath: '/test-invoice',
                  mediaKeyTimestamp: String(baseTimestamp + 6000),
                  jpegThumbnail: '/9j/test',
                  contactVcard: false
                }
              }
            }
          },
          status: 3
        }
      },
      engine: 'NOWEB',
      environment: {
        version: '2025.11.2',
        engine: 'NOWEB',
        tier: 'PLUS',
        browser: null
      }
    },

    // 8. Voice note - from test_payload_voice.json
    voiceNote: {
      id: `evt_${Date.now()}_voice`,
      timestamp: baseTimestamp + 7000,
      event: 'message',
      session: 'rensto-whatsapp',
      metadata: {},
      me: {
        id: '12144362102@c.us',
        pushName: 'Rensto',
        lid: '271661580427508@lid'
      },
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 7000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: null,
        hasMedia: true,
        media: {
          url: 'http://localhost:3000/api/files/rensto-whatsapp/test-voice.oga',
          filename: null,
          mimetype: 'audio/ogg; codecs=opus'
        },
        ack: 2,
        ackName: 'DEVICE',
        location: null,
        vCards: null,
        replyTo: null,
        _data: {
          key: {
            remoteJid: userIdS,
            remoteJidAlt: '199501700681931@lid',
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 7000,
          pushName: 'Test User',
          broadcast: false,
          message: {
            audioMessage: {
              url: 'https://mmg.whatsapp.net/v/test-voice.enc',
              mimetype: 'audio/ogg; codecs=opus',
              fileSha256: 'test',
              fileLength: '10000',
              seconds: 3,
              ptt: true,
              mediaKey: 'test',
              fileEncSha256: 'test',
              directPath: '/test-voice',
              mediaKeyTimestamp: String(baseTimestamp + 7000),
              streamingSidecar: 'test',
              waveform: 'AAABAQICAgMDAwMCAgEBAQEBCBYlNDY4OTk4NjQyMTAvLSsqJB4YFxsfJCIgHhwZFhMREA8ODAoJBwYFBAMCAg=='
            },
            messageContextInfo: {
              deviceListMetadata: {
                senderKeyHash: 'test',
                senderTimestamp: String(baseTimestamp + 7000),
                recipientKeyHash: 'test',
                recipientTimestamp: String(baseTimestamp + 7000)
              },
              deviceListMetadataVersion: 2,
              messageSecret: 'test'
            }
          },
          status: 3
        }
      },
      engine: 'NOWEB',
      environment: {
        version: '2025.11.2',
        engine: 'NOWEB',
        tier: 'PLUS',
        browser: null
      }
    }
  };
}

/**
 * Send webhook request
 */
function sendWebhook(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Get execution details from n8n API
 */
async function getExecution(executionId) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${N8N_API_URL}/executions/${executionId}`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * List recent executions
 */
async function listExecutions(limit = 10) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${N8N_API_URL}/executions`);
    url.searchParams.set('workflowId', WORKFLOW_ID);
    url.searchParams.set('limit', String(limit));
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Wait for execution to complete and analyze results
 */
async function waitAndAnalyzeExecution(executionId, payloadType, maxWait = 30000) {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  
  while (Date.now() - startTime < maxWait) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    
    try {
      const execution = await getExecution(executionId);
      
      if (execution.data && execution.data.finished !== undefined) {
        if (execution.data.finished) {
          return {
            id: executionId,
            status: execution.data.status,
            finished: true,
            nodes: execution.data.nodes || {},
            error: execution.data.error || null,
            duration: execution.data.stoppedAt && execution.data.startedAt 
              ? new Date(execution.data.stoppedAt) - new Date(execution.data.startedAt)
              : null
          };
        }
      }
    } catch (error) {
      console.log(`  ⚠️ Error checking execution ${executionId}:`, error.message);
    }
  }
  
  return {
    id: executionId,
    status: 'timeout',
    finished: false
  };
}

/**
 * Analyze execution results
 */
function analyzeExecution(execution, payloadType) {
  const analysis = {
    payloadType,
    executionId: execution.id,
    status: execution.status,
    finished: execution.finished,
    duration: execution.duration,
    issues: [],
    successes: [],
    nodeResults: {}
  };

  if (!execution.finished) {
    analysis.issues.push('Execution did not complete within timeout');
    return analysis;
  }

  if (execution.status === 'error') {
    analysis.issues.push(`Execution failed with status: ${execution.status}`);
    
    // Check for specific error nodes
    if (execution.error) {
      const errorNode = execution.error.node;
      if (errorNode) {
        analysis.issues.push(`Error in node: ${errorNode.name || errorNode.id}`);
        analysis.issues.push(`Error message: ${execution.error.message || 'Unknown error'}`);
      }
    }
  }

  // Analyze node results
  if (execution.nodes) {
    const criticalNodes = [
      'Smart Message Router',
      'Message Type Router',
      'Process AI Response',
      'Debug Voice Routing',
      'Voice Response Check',
      'Send Seen',
      'Send Seen1',
      'Send a text message',
      'Send Voice Message'
    ];

    for (const nodeName of criticalNodes) {
      const node = Object.values(execution.nodes).find(n => n.name === nodeName);
      if (node) {
        analysis.nodeResults[nodeName] = {
          status: node.status,
          executionTime: node.executionTime,
          itemsOutput: node.itemsOutput || 0
        };

        if (node.status === 'error') {
          analysis.issues.push(`${nodeName} failed`);
        } else if (node.status === 'success') {
          analysis.successes.push(`${nodeName} succeeded`);
        }
      }
    }
  }

  return analysis;
}

/**
 * Main test function
 */
async function runComprehensiveTests() {
  console.log('🚀 Comprehensive WhatsApp Payload Testing\n');
  console.log('Workflow:', WORKFLOW_ID);
  console.log('Webhook:', WEBHOOK_URL);
  console.log('');

  const testPayloads = createRealTestPayloads();
  const testResults = {
    timestamp: new Date().toISOString(),
    workflowId: WORKFLOW_ID,
    webhookUrl: WEBHOOK_URL,
    tests: [],
    summary: {
      total: 0,
      sent: 0,
      failed: 0,
      completed: 0,
      errors: 0,
      successes: 0
    }
  };

  const payloadTypes = [
    { key: 'text', name: 'Text Message' },
    { key: 'image', name: 'Image (No Caption)' },
    { key: 'imageWithCaption', name: 'Image with Caption' },
    { key: 'video', name: 'Video (No Caption)' },
    { key: 'videoWithCaption', name: 'Video with Caption' },
    { key: 'pdf', name: 'PDF (No Caption)' },
    { key: 'pdfWithCaption', name: 'PDF with Caption (CRITICAL)' },
    { key: 'voiceNote', name: 'Voice Note' }
  ];

  for (const { key, name } of payloadTypes) {
    console.log(`📤 Testing ${name}...`);
    testResults.summary.total++;

    try {
      const payload = testPayloads[key];
      const response = await sendWebhook(payload);

      const testResult = {
        payloadType: key,
        payloadName: name,
        webhookStatus: response.statusCode === 200 ? 'sent' : 'failed',
        webhookStatusCode: response.statusCode,
        webhookResponse: response.body,
        timestamp: new Date().toISOString(),
        messageId: payload.payload.id
      };

      if (response.statusCode === 200) {
        testResults.summary.sent++;
        console.log(`  ✅ Webhook accepted (${response.statusCode})`);
        
        // Try to extract execution ID from response
        let executionId = null;
        try {
          const responseBody = JSON.parse(response.body);
          executionId = responseBody.executionId || responseBody.id;
        } catch (e) {
          // Response might not be JSON
        }

        if (executionId) {
          console.log(`  🔍 Execution ID: ${executionId}`);
          console.log(`  ⏳ Waiting for execution to complete...`);
          
          const execution = await waitAndAnalyzeExecution(executionId, key, 60000);
          const analysis = analyzeExecution(execution, key);
          
          testResult.executionId = executionId;
          testResult.execution = execution;
          testResult.analysis = analysis;

          if (execution.finished) {
            testResults.summary.completed++;
            if (execution.status === 'success') {
              testResults.summary.successes++;
              console.log(`  ✅ Execution completed successfully`);
            } else if (execution.status === 'error') {
              testResults.summary.errors++;
              console.log(`  ❌ Execution failed: ${execution.status}`);
              if (analysis.issues.length > 0) {
                console.log(`  Issues:`);
                analysis.issues.forEach(issue => console.log(`    - ${issue}`));
              }
            }
          } else {
            console.log(`  ⚠️ Execution did not complete within timeout`);
          }
        } else {
          console.log(`  ⚠️ Could not extract execution ID from response`);
        }
      } else {
        testResults.summary.failed++;
        console.log(`  ❌ Webhook failed (${response.statusCode}): ${response.body}`);
      }

      testResults.tests.push(testResult);

      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      testResults.summary.failed++;
      console.log(`  ❌ Error: ${error.message}`);
      testResults.tests.push({
        payloadType: key,
        payloadName: name,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  console.log('\n📊 Test Summary:');
  console.log(`  Total: ${testResults.summary.total}`);
  console.log(`  ✅ Sent: ${testResults.summary.sent}`);
  console.log(`  ❌ Failed: ${testResults.summary.failed}`);
  console.log(`  ✅ Completed: ${testResults.summary.completed}`);
  console.log(`  ✅ Successes: ${testResults.summary.successes}`);
  console.log(`  ❌ Errors: ${testResults.summary.errors}`);

  // Save results
  const resultsFile = path.join(OUTPUT_DIR, `comprehensive-test-${Date.now()}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2), 'utf8');

  console.log(`\n📁 Results saved to: ${resultsFile}`);
  console.log('\n✅ Comprehensive test complete!');
  
  // Generate summary report
  const summaryFile = path.join(OUTPUT_DIR, `summary-${Date.now()}.md`);
  generateSummaryReport(testResults, summaryFile);
  console.log(`📄 Summary report: ${summaryFile}`);

  return testResults;
}

/**
 * Generate markdown summary report
 */
function generateSummaryReport(testResults, outputFile) {
  let report = `# Comprehensive WhatsApp Payload Test Results\n\n`;
  report += `**Date**: ${new Date().toISOString()}\n`;
  report += `**Workflow**: ${WORKFLOW_ID}\n`;
  report += `**Webhook**: ${WEBHOOK_URL}\n\n`;
  
  report += `## Summary\n\n`;
  report += `| Metric | Count |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Tests | ${testResults.summary.total} |\n`;
  report += `| Webhook Accepted | ${testResults.summary.sent} |\n`;
  report += `| Webhook Failed | ${testResults.summary.failed} |\n`;
  report += `| Executions Completed | ${testResults.summary.completed} |\n`;
  report += `| Executions Successful | ${testResults.summary.successes} |\n`;
  report += `| Executions Failed | ${testResults.summary.errors} |\n\n`;

  report += `## Test Results\n\n`;
  
  for (const test of testResults.tests) {
    report += `### ${test.payloadName}\n\n`;
    report += `- **Payload Type**: ${test.payloadType}\n`;
    report += `- **Webhook Status**: ${test.webhookStatus} (${test.webhookStatusCode})\n`;
    
    if (test.executionId) {
      report += `- **Execution ID**: ${test.executionId}\n`;
      if (test.execution) {
        report += `- **Execution Status**: ${test.execution.status}\n`;
        report += `- **Finished**: ${test.execution.finished ? 'Yes' : 'No'}\n`;
        if (test.execution.duration) {
          report += `- **Duration**: ${test.execution.duration}ms\n`;
        }
      }
      if (test.analysis) {
        if (test.analysis.successes.length > 0) {
          report += `- **Successes**:\n`;
          test.analysis.successes.forEach(s => report += `  - ${s}\n`);
        }
        if (test.analysis.issues.length > 0) {
          report += `- **Issues**:\n`;
          test.analysis.issues.forEach(i => report += `  - ${i}\n`);
        }
      }
    }
    report += `\n`;
  }

  fs.writeFileSync(outputFile, report, 'utf8');
}

// Run tests
runComprehensiveTests().catch(console.error);

export { runComprehensiveTests, createRealTestPayloads };

