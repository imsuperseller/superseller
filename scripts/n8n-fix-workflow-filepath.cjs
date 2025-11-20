const fs = require('fs');
const https = require('https');
const http = require('http');

const WORKFLOW_ID = 'CPyj0qf6tofQQyDT';
const N8N_URL = 'http://173.254.201.134:5678';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYyMTAxOWI4LWRlM2UtNGU3ZC1iZTYxLWY0ODg5MjVlMjVkZCIsImVtYWlsIjoic2VydmljZUByZW5zdG8uY29tIiwidXNlcm5hbWUiOiJzaGFpIiwiaWF0IjoxNzI4NTI1NTAxLCJleHAiOjE5ODc5MTUxMDEsInJvbGUiOiJvd25lciJ9.Uxv4wY8r0V4_6j2xP8Yx6Ea3a2gH1xV7xQ5xJ7xK9xL0';

function makeRequest(url, options, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function fixWorkflow() {
    try {
        console.log('📥 Getting workflow...');
        const getResponse = await makeRequest(
            `${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`,
            {
                method: 'GET',
                headers: { 'X-N8N-API-KEY': API_KEY }
            }
        );
        
        if (getResponse.status !== 200) {
            throw new Error(`Failed to get workflow: ${getResponse.status} - ${JSON.stringify(getResponse.data)}`);
        }
        
        const workflow = getResponse.data;
        
        // Find and fix Read Products CSV node
        const readCsvNode = workflow.nodes.find(n => n.name === 'Read Products CSV');
        if (readCsvNode) {
            readCsvNode.parameters.fileName = '/home/node/.n8n/data/products.csv';
            console.log('✅ Updated fileName to: /home/node/.n8n/data/products.csv');
        } else {
            console.log('⚠️  Read Products CSV node not found');
        }
        
        // Update workflow
        console.log('📤 Updating workflow...');
        const updateResponse = await makeRequest(
            `${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-API-KEY': API_KEY
                }
            },
            workflow
        );
        
        if (updateResponse.status === 200) {
            console.log('✅ Workflow updated successfully!');
            console.log(`   URL: ${N8N_URL}/workflow/${WORKFLOW_ID}`);
        } else {
            console.error('❌ Failed to update:', updateResponse.status);
            console.error(JSON.stringify(updateResponse.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }
}

fixWorkflow();

