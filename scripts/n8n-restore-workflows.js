const fs = require('fs');
const path = require('path');

const BACKUP_FILE = process.env.BACKUP_FILE || '/tmp/workflows-backup.json';
const N8N_URL = 'http://localhost:5678';
const API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYyMTAxOWI4LWRlM2UtNGU3ZC1iZTYxLWY0ODg5MjVlMjVkZCIsImVtYWlsIjoic2VydmljZUByZW5zdG8uY29tIiwidXNlcm5hbWUiOiJzaGFpIiwiaWF0IjoxNzI4NTI1NTAxLCJleHAiOjE5ODc5MTUxMDEsInJvbGUiOiJvd25lciJ9.Uxv4wY8r0V4_6j2xP8Yx6Ea3a2gH1xV7xQ5xJ7xK9xL0';

console.log('🔄 Restoring workflows from backup...');
console.log(`📁 Backup file: ${BACKUP_FILE}`);

if (!fs.existsSync(BACKUP_FILE)) {
    console.error(`❌ Backup file not found: ${BACKUP_FILE}`);
    process.exit(1);
}

const workflows = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
console.log(`✅ Found ${workflows.length} workflows in backup`);

const https = require('https');
const http = require('http');

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

async function restoreWorkflows() {
    let restored = 0;
    let failed = 0;
    
    for (const workflow of workflows) {
        try {
            // Remove id and other fields that shouldn't be in create request
            const { id, ...workflowData } = workflow;
            
            const response = await makeRequest(
                `${N8N_URL}/api/v1/workflows`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-N8N-API-KEY': API_KEY
                    }
                },
                workflowData
            );
            
            if (response.status === 200 || response.status === 201) {
                console.log(`✅ Restored: ${workflow.name || workflowData.name || 'Unnamed'}`);
                restored++;
            } else {
                console.error(`❌ Failed: ${workflow.name || workflowData.name || 'Unnamed'} - Status ${response.status}`);
                failed++;
            }
        } catch (error) {
            console.error(`❌ Error restoring workflow: ${error.message}`);
            failed++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 Restoration complete!`);
    console.log(`   ✅ Restored: ${restored}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${workflows.length}`);
}

restoreWorkflows().catch(console.error);

