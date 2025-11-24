#!/usr/bin/env node
/**
 * Auto-Test All WhatsApp Payload Types
 * 
 * Automatically tests Smart Message Router V6 fix by triggering workflow
 * with simulated WhatsApp messages for all 8 payload types
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
const WEBHOOK_URL = `http://173.254.201.134:5678/webhook/${WEBHOOK_ID}/waha`;
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'whatsapp-payloads', 'auto-test-results');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate unique message ID
 */
function generateMessageId() {
  return `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Generate test user ID
 */
function generateUserId() {
  return `14695885133@c.us`; // Use same test user
}

/**
 * Create test payloads for all 8 types
 */
function createTestPayloads() {
  const baseTimestamp = Date.now();
  const userId = generateUserId();
  
  return {
    // 1. Text message
    text: {
      event: 'message',
      session: 'rensto-whatsapp',
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp,
        from: userId,
        fromMe: false,
        source: 'app',
        body: 'This is a test text message',
        hasMedia: false,
        media: null,
        _data: {
          key: {
            remoteJid: userId.replace('@c.us', '@s.whatsapp.net'),
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp,
          message: {
            conversation: 'This is a test text message'
          }
        }
      }
    },

    // 2. Image (no caption)
    image: {
      event: 'message',
      session: 'rensto-whatsapp',
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 1000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: '',
        hasMedia: true,
        media: {
          url: 'https://example.com/test-image.jpg',
          mimetype: 'image/jpeg',
          filename: 'test-image.jpg'
        },
        _data: {
          key: {
            remoteJid: userId.replace('@c.us', '@s.whatsapp.net'),
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 1000,
          message: {
            imageMessage: {
              url: 'https://example.com/test-image.jpg',
              mimetype: 'image/jpeg',
              caption: ''
            }
          }
        }
      }
    },

    // 3. Image with caption
    imageWithCaption: {
      event: 'message',
      session: 'rensto-whatsapp',
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 2000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: 'What is this?',
        hasMedia: true,
        media: {
          url: 'https://example.com/test-image-captioned.jpg',
          mimetype: 'image/jpeg',
          filename: 'test-image-captioned.jpg'
        },
        _data: {
          key: {
            remoteJid: userId.replace('@c.us', '@s.whatsapp.net'),
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 2000,
          message: {
            imageWithCaptionMessage: {
              message: {
                imageMessage: {
                  url: 'https://example.com/test-image-captioned.jpg',
                  mimetype: 'image/jpeg',
                  caption: 'What is this?'
                }
              }
            }
          }
        }
      }
    },

    // 4. Video (no caption)
    video: {
      event: 'message',
      session: 'rensto-whatsapp',
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 3000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: '',
        hasMedia: true,
        media: {
          url: 'https://example.com/test-video.mp4',
          mimetype: 'video/mp4',
          filename: 'test-video.mp4'
        },
        _data: {
          key: {
            remoteJid: userId.replace('@c.us', '@s.whatsapp.net'),
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 3000,
          message: {
            videoMessage: {
              url: 'https://example.com/test-video.mp4',
              mimetype: 'video/mp4',
              caption: ''
            }
          }
        }
      }
    },

    // 5. Video with caption
    videoWithCaption: {
      event: 'message',
      session: 'rensto-whatsapp',
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 4000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: 'Check this out',
        hasMedia: true,
        media: {
          url: 'https://example.com/test-video-captioned.mp4',
          mimetype: 'video/mp4',
          filename: 'test-video-captioned.mp4'
        },
        _data: {
          key: {
            remoteJid: userId.replace('@c.us', '@s.whatsapp.net'),
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 4000,
          message: {
            videoWithCaptionMessage: {
              message: {
                videoMessage: {
                  url: 'https://example.com/test-video-captioned.mp4',
                  mimetype: 'video/mp4',
                  caption: 'Check this out'
                }
              }
            }
          }
        }
      }
    },

    // 6. PDF (no caption)
    pdf: {
      event: 'message',
      session: 'rensto-whatsapp',
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 5000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: '',
        hasMedia: true,
        media: {
          url: 'https://example.com/test-document.pdf',
          mimetype: 'application/pdf',
          filename: 'test-document.pdf'
        },
        _data: {
          key: {
            remoteJid: userId.replace('@c.us', '@s.whatsapp.net'),
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 5000,
          message: {
            documentMessage: {
              url: 'https://example.com/test-document.pdf',
              mimetype: 'application/pdf',
              fileName: 'test-document.pdf',
              caption: ''
            }
          }
        }
      }
    },

    // 7. PDF with caption (CRITICAL TEST - the bug we fixed)
    pdfWithCaption: {
      event: 'message',
      session: 'rensto-whatsapp',
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 6000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: 'analyze this invoice',
        hasMedia: true,
        media: {
          url: 'https://example.com/test-invoice.pdf',
          mimetype: 'application/pdf',
          filename: 'Invoice-TEST.pdf'
        },
        _data: {
          key: {
            remoteJid: userId.replace('@c.us', '@s.whatsapp.net'),
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 6000,
          message: {
            documentWithCaptionMessage: {
              message: {
                documentMessage: {
                  url: 'https://example.com/test-invoice.pdf',
                  mimetype: 'application/pdf',
                  fileName: 'Invoice-TEST.pdf',
                  caption: 'analyze this invoice'
                }
              }
            }
          }
        }
      }
    },

    // 8. Voice note
    voiceNote: {
      event: 'message',
      session: 'rensto-whatsapp',
      payload: {
        id: `false_${userId}_${generateMessageId()}`,
        timestamp: baseTimestamp + 7000,
        from: userId,
        fromMe: false,
        source: 'app',
        body: '',
        hasMedia: true,
        media: {
          url: 'https://example.com/test-voice.ogg',
          mimetype: 'audio/ogg',
          filename: 'test-voice.ogg'
        },
        _data: {
          key: {
            remoteJid: userId.replace('@c.us', '@s.whatsapp.net'),
            fromMe: false,
            id: generateMessageId(),
            participant: '',
            addressingMode: 'pn'
          },
          messageTimestamp: baseTimestamp + 7000,
          message: {
            audioMessage: {
              url: 'https://example.com/test-voice.ogg',
              mimetype: 'audio/ogg',
              ptt: true
            }
          }
        }
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
 * Wait for execution to complete
 */
async function waitForExecution(executionId, maxWait = 30000) {
  // In a real scenario, we'd poll the n8n API for execution status
  // For now, just wait a bit
  await new Promise(resolve => setTimeout(resolve, 3000));
  return { id: executionId, status: 'success' };
}

/**
 * Main test function
 */
async function runAutoTests() {
  console.log('🚀 Auto-Testing All WhatsApp Payload Types\n');
  console.log('Workflow:', WORKFLOW_ID);
  console.log('Webhook:', WEBHOOK_URL);
  console.log('');

  const testPayloads = createTestPayloads();
  const testResults = {
    timestamp: new Date().toISOString(),
    workflowId: WORKFLOW_ID,
    webhookUrl: WEBHOOK_URL,
    tests: [],
    summary: {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0
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
    console.log(`📤 Sending ${name}...`);
    testResults.summary.total++;

    try {
      const payload = testPayloads[key];
      const response = await sendWebhook(payload);

      const testResult = {
        payloadType: key,
        payloadName: name,
        status: response.statusCode === 200 ? 'sent' : 'failed',
        statusCode: response.statusCode,
        response: response.body,
        timestamp: new Date().toISOString(),
        messageId: payload.payload.id
      };

      if (response.statusCode === 200) {
        testResults.summary.sent++;
        console.log(`  ✅ Sent successfully (${response.statusCode})`);
      } else {
        testResults.summary.failed++;
        console.log(`  ❌ Failed (${response.statusCode}): ${response.body}`);
      }

      testResults.tests.push(testResult);

      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 2000));

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
  console.log(`\n⏳ Waiting 10 seconds for executions to complete...`);

  // Wait for executions
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Save results
  const resultsFile = path.join(OUTPUT_DIR, `auto-test-${Date.now()}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2), 'utf8');

  console.log(`\n📁 Results saved to: ${resultsFile}`);
  console.log('\n✅ Auto-test complete! Check n8n executions to verify Smart Message Router output.');
  console.log(`\nNext step: Run comprehensive-payload-test.js to analyze the results`);

  return testResults;
}

// Run tests
runAutoTests().catch(console.error);

export { runAutoTests, createTestPayloads };

