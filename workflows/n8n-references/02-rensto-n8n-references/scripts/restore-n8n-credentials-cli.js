#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔄 Starting n8n credentials restoration via CLI...');

// Read the backup file
const backupFile = 'data/n8n-credentials-backup.json';
if (!fs.existsSync(backupFile)) {
    console.error('❌ Backup file not found:', backupFile);
    process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
console.log(`📋 Found backup with ${Object.keys(backup.credentials).length} credentials`);

// Convert backup format to n8n CLI format
const credentialsForImport = [];
for (const [id, cred] of Object.entries(backup.credentials)) {
    const credential = {
        id: id,
        name: cred.name,
        type: cred.type,
        data: cred.connection_details || cred.header_config || {},
        nodesAccess: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    credentialsForImport.push(credential);
}

// Write credentials to temporary file for import
const tempFile = 'temp-credentials-import.json';
fs.writeFileSync(tempFile, JSON.stringify(credentialsForImport, null, 2));
console.log(`📝 Created temporary import file: ${tempFile}`);

try {
    // Import credentials using n8n CLI
    console.log('🚀 Importing credentials via n8n CLI...');
    const importCommand = `sshpass -p '05ngBiq2pTA8XSF76x' ssh -o StrictHostKeyChecking=no root@173.254.201.134 "docker exec n8n n8n import:credentials --input=/tmp/credentials.json"`;
    
    // Copy file to server first
    console.log('📤 Copying credentials file to server...');
    execSync(`sshpass -p '05ngBiq2pTA8XSF76x' scp -o StrictHostKeyChecking=no ${tempFile} root@173.254.201.134:/tmp/credentials.json`);
    
    // Import credentials
    console.log('📥 Importing credentials...');
    const result = execSync(importCommand, { 
        stdio: 'pipe',
        encoding: 'utf8'
    });
    
    console.log('✅ Credentials imported successfully!');
    console.log('Result:', result);
    
} catch (error) {
    console.error('❌ Error importing credentials:', error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
} finally {
    // Clean up temporary file
    if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
        console.log('🧹 Cleaned up temporary file');
    }
}

console.log('🎉 Credential restoration completed!');
