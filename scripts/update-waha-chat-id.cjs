#!/usr/bin/env node
/**
 * Update n8n workflow "Send a text message" node with WAHA chat ID
 * 
 * Usage:
 *   node scripts/update-waha-chat-id.js <workflow_id> <chat_id>
 * 
 * Example:
 *   node scripts/update-waha-chat-id.js GokbOOc0YpO6xWXH 12144362102@c.us
 */

const https = require('https');
const http = require('http');

const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDkyMDIxfQ.YKPTmHyLr1_kXX2JMY7hsPy4jvnCJDL71mOCltoUbQc';
const N8N_URL = 'http://172.245.56.50:5678'; // or http://173.254.201.134:5678
const WORKFLOW_ID = process.argv[2] || 'GokbOOc0YpO6xWXH';
const CHAT_ID = process.argv[3] || '14695885133@c.us'; // User requested chat ID

// WAHA Configuration
const WAHA_URL = 'http://172.245.56.50:3000';
const WAHA_API_KEY = '4fc7e008d7d24fc995475029effc8fa8';
const WAHA_SESSION = 'default';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function getWahaSessionInfo() {
  console.log('📱 Getting WAHA default session info...');
  try {
    const response = await makeRequest(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY
      }
    });
    
    console.log('✅ Session Info:');
    console.log(`   Session ID: ${response.me?.id || 'N/A'}`);
    console.log(`   Session Name: ${response.me?.pushName || 'N/A'}`);
    console.log(`   Status: ${response.status}`);
    
    return response.me?.id || CHAT_ID;
  } catch (error) {
    console.error('❌ Error getting WAHA session:', error.message);
    return CHAT_ID;
  }
}

async function getWorkflow() {
  console.log(`\n📋 Fetching workflow ${WORKFLOW_ID}...`);
  try {
    const workflow = await makeRequest(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`);
    if (workflow.message) {
      throw new Error(workflow.message);
    }
    return workflow;
  } catch (error) {
    console.error('❌ Error fetching workflow:', error.message);
    throw error;
  }
}

async function updateWorkflowNode(workflow, chatId) {
  console.log(`\n🔧 Updating "Send a text message" node with chat ID: ${chatId}`);
  
  // Find the "Send a text message" node
  const sendTextNode = workflow.nodes.find(node => 
    node.name && node.name.toLowerCase().includes('send a text message')
  );
  
  if (!sendTextNode) {
    console.error('❌ Could not find "Send a text message" node');
    console.log('Available nodes:');
    workflow.nodes.forEach(node => {
      if (node.name && (node.name.toLowerCase().includes('send') || node.name.toLowerCase().includes('message'))) {
        console.log(`   - ${node.name} (${node.type})`);
      }
    });
    return null;
  }
  
  console.log(`✅ Found node: ${sendTextNode.name} (${sendTextNode.id})`);
  console.log(`   Current type: ${sendTextNode.type}`);
  
  // Update based on node type
  if (sendTextNode.type === 'n8n-nodes-base.code' || sendTextNode.type.includes('code')) {
    // Code node - update the chatId in the code
    const code = sendTextNode.parameters.jsCode || sendTextNode.parameters.code || '';
    if (code.includes('chatId') || code.includes('chat_id')) {
      // Update chatId in code
      const updatedCode = code.replace(
        /(const|let|var)\s+chatId\s*=\s*[^;]+;/g,
        `const chatId = '${chatId}';`
      ).replace(
        /chatId:\s*[^,}\n]+/g,
        `chatId: '${chatId}'`
      );
      sendTextNode.parameters.jsCode = updatedCode;
      sendTextNode.parameters.code = updatedCode;
      console.log('   ✅ Updated chatId in code node');
    } else {
      // Add chatId if not present
      const sessionLine = code.includes('sessionId') ? '' : `const sessionId = '${WAHA_SESSION}';\n`;
      const chatIdLine = `const chatId = '${chatId}';\n`;
      sendTextNode.parameters.jsCode = sessionLine + chatIdLine + code;
      sendTextNode.parameters.code = sendTextNode.parameters.jsCode;
      console.log('   ✅ Added chatId to code node');
    }
  } else if (sendTextNode.type.includes('waha') || sendTextNode.type.includes('WAHA')) {
    // WAHA node - update parameters
    sendTextNode.parameters.session = WAHA_SESSION;
    sendTextNode.parameters.chatId = chatId;
    console.log('   ✅ Updated WAHA node parameters');
  } else if (sendTextNode.type === 'n8n-nodes-base.httpRequest') {
    // HTTP Request node - update URL or body
    if (sendTextNode.parameters.url && sendTextNode.parameters.url.includes('sendText')) {
      // Update body parameters
      if (!sendTextNode.parameters.bodyParameters) {
        sendTextNode.parameters.bodyParameters = { values: [] };
      }
      const bodyParams = sendTextNode.parameters.bodyParameters.values || [];
      const chatIdParam = bodyParams.find(p => p.name === 'chatId' || p.name === 'chat_id');
      if (chatIdParam) {
        chatIdParam.value = chatId;
      } else {
        bodyParams.push({ name: 'chatId', value: chatId });
      }
      const sessionParam = bodyParams.find(p => p.name === 'session');
      if (sessionParam) {
        sessionParam.value = WAHA_SESSION;
      } else {
        bodyParams.push({ name: 'session', value: WAHA_SESSION });
      }
      console.log('   ✅ Updated HTTP request body parameters');
    }
  }
  
  return workflow;
}

async function saveWorkflow(workflow) {
  console.log(`\n💾 Saving workflow...`);
  try {
    const response = await makeRequest(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      body: workflow
    });
    
    if (response.message) {
      throw new Error(response.message);
    }
    
    console.log('✅ Workflow updated successfully!');
    return response;
  } catch (error) {
    console.error('❌ Error saving workflow:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Updating n8n workflow with WAHA chat ID\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`WAHA Session: ${WAHA_SESSION}`);
  console.log(`WAHA URL: ${WAHA_URL}\n`);
  
  try {
    // Get chat ID from WAHA (optional - can use provided one)
    const wahaChatId = await getWahaSessionInfo();
    const chatId = process.argv[3] || wahaChatId;
    
    // Get workflow
    const workflow = await getWorkflow();
    
    // Update workflow node
    const updatedWorkflow = await updateWorkflowNode(workflow, chatId);
    
    if (!updatedWorkflow) {
      console.error('\n❌ Failed to update workflow node');
      process.exit(1);
    }
    
    // Save workflow
    await saveWorkflow(updatedWorkflow);
    
    console.log('\n✅ Done! The "Send a text message" node has been updated.');
    console.log(`   Chat ID: ${chatId}`);
    console.log(`   Session: ${WAHA_SESSION}`);
    console.log('\n⚠️  Please review the workflow in n8n before deleting "Send a message1" node.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

