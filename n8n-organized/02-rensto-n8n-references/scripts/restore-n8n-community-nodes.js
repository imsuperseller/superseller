#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔄 Starting n8n community nodes restoration...');

// Read the backup file
const backupFile = 'data/n8n-credentials-backup.json';
if (!fs.existsSync(backupFile)) {
    console.error('❌ Backup file not found:', backupFile);
    process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
const communityNodes = backup.community_nodes.nodes;

console.log(`📋 Found backup with ${communityNodes.length} community nodes`);

const results = {
    successful: [],
    failed: []
};

for (const node of communityNodes) {
    console.log(`\n📦 Installing: ${node.name} (${node.package}@${node.version})`);
    
    try {
        const installCommand = `sshpass -p '05ngBiq2pTA8XSF76x' ssh -o StrictHostKeyChecking=no root@173.254.201.134 "docker exec n8n npm install ${node.package}@${node.version}"`;
        
        execSync(installCommand, {
            stdio: 'pipe',
            cwd: process.cwd()
        });
        
        console.log(`✅ Successfully installed: ${node.name}`);
        results.successful.push(node);
        
    } catch (error) {
        console.log(`❌ Failed to install ${node.name}:`, error.message);
        results.failed.push({
            ...node,
            error: error.message
        });
    }
}

console.log('\n📊 Installation Summary:');
console.log(`✅ Successful: ${results.successful.length}`);
console.log(`❌ Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
    console.log('\n❌ Failed installations:');
    results.failed.forEach(node => {
        console.log(`  - ${node.name}: ${node.error}`);
    });
}

console.log('\n🎉 Community nodes restoration completed!');