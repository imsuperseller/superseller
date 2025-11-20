const fs = require('fs');
const { execSync } = require('child_process');

const WORKFLOWS_BACKUP = '/home/node/.n8n/backup-workflows.json';
const CREDENTIALS_BACKUP = '/home/node/.n8n/backup-credentials.json';
const DB_PATH = '/home/node/.n8n/database.sqlite';

console.log('🚨 EMERGENCY RESTORATION STARTING...\n');

// Step 1: Restore database from backup if exists
console.log('📦 Step 1: Checking for database backup...');
const dbBackup = '/home/node/.n8n/database.sqlite.backup';
if (fs.existsSync(dbBackup)) {
    console.log('✅ Found database backup, restoring...');
    fs.copyFileSync(dbBackup, DB_PATH);
    console.log('✅ Database restored from backup');
} else {
    console.log('⚠️  No database backup found, will restore workflows via API');
}

// Step 2: Get API key from environment or generate one
console.log('\n🔑 Step 2: Getting API key...');
let apiKey = process.env.N8N_API_KEY;

if (!apiKey) {
    // Try to read from config or generate
    try {
        const config = JSON.parse(fs.readFileSync('/home/node/.n8n/config', 'utf8'));
        // API keys are stored in database, not config
    } catch (e) {}
}

if (!apiKey) {
    console.log('⚠️  No API key found. Will need to restore via database directly.');
    console.log('💡 Alternative: Restore workflows by importing JSON files manually in UI');
}

// Step 3: Restore workflows
console.log('\n📋 Step 3: Restoring workflows...');
if (fs.existsSync(WORKFLOWS_BACKUP)) {
    const workflows = JSON.parse(fs.readFileSync(WORKFLOWS_BACKUP, 'utf8'));
    console.log(`✅ Found ${workflows.length} workflows in backup`);
    
    if (apiKey) {
        console.log('🔄 Restoring via API...');
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
        
        (async () => {
            let restored = 0;
            let failed = 0;
            
            for (const workflow of workflows) {
                try {
                    const { id, ...workflowData } = workflow;
                    const response = await makeRequest(
                        'http://localhost:5678/api/v1/workflows',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-N8N-API-KEY': apiKey
                            }
                        },
                        workflowData
                    );
                    
                    if (response.status === 200 || response.status === 201) {
                        restored++;
                        if (restored % 10 === 0) {
                            process.stdout.write(`\r   Progress: ${restored}/${workflows.length}`);
                        }
                    } else {
                        failed++;
                    }
                } catch (error) {
                    failed++;
                }
                
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            console.log(`\n✅ Restored: ${restored}, Failed: ${failed}`);
        })().catch(console.error);
    } else {
        console.log('⚠️  Cannot restore via API (no key). Workflows JSON available at:');
        console.log(`   ${WORKFLOWS_BACKUP}`);
        console.log('💡 Import manually via n8n UI: Settings → Import/Export → Import from File');
    }
} else {
    console.log('❌ Workflows backup not found!');
}

// Step 4: Restore credentials
console.log('\n🔐 Step 4: Restoring credentials...');
if (fs.existsSync(CREDENTIALS_BACKUP)) {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_BACKUP, 'utf8'));
    console.log(`✅ Found ${credentials.length} credentials in backup`);
    console.log('⚠️  Credentials must be restored manually via n8n UI');
    console.log(`   File location: ${CREDENTIALS_BACKUP}`);
} else {
    console.log('❌ Credentials backup not found!');
}

console.log('\n🎉 Emergency restoration script completed!');
console.log('💡 If API restoration failed, use n8n UI to import workflows and credentials manually.');

