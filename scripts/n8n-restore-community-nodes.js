const fs = require('fs');
const { execSync } = require('child_process');

const BACKUP_FILE = '/root/n8n-backups/2025-11-12_011306/community-nodes-backup.tgz';
const CUSTOM_DIR = '/home/node/custom';

console.log('📦 RESTORING COMMUNITY NODES');
console.log('============================\n');

try {
    if (!fs.existsSync(BACKUP_FILE)) {
        console.error(`❌ Backup file not found: ${BACKUP_FILE}`);
        process.exit(1);
    }

    console.log('✅ Found community nodes backup');
    
    // Create custom directory if it doesn't exist
    if (!fs.existsSync(CUSTOM_DIR)) {
        fs.mkdirSync(CUSTOM_DIR, { recursive: true });
        console.log('✅ Created custom directory');
    }

    // Extract backup
    console.log('\n📦 Extracting community nodes...');
    execSync(`cd ${CUSTOM_DIR} && tar -xzf ${BACKUP_FILE}`, { stdio: 'inherit' });
    console.log('✅ Extracted community nodes');

    // Check what was restored
    if (fs.existsSync(`${CUSTOM_DIR}/package.json`)) {
        const pkg = JSON.parse(fs.readFileSync(`${CUSTOM_DIR}/package.json`, 'utf8'));
        console.log('\n📋 Restored packages:');
        if (pkg.dependencies) {
            Object.keys(pkg.dependencies).forEach(name => {
                console.log(`   ✅ ${name}`);
            });
        }
    }

    // Install dependencies
    console.log('\n📥 Installing dependencies...');
    try {
        execSync(`cd ${CUSTOM_DIR} && npm install --production`, { 
            stdio: 'inherit',
            timeout: 300000 // 5 minutes
        });
        console.log('✅ Dependencies installed');
    } catch (error) {
        console.error('⚠️  npm install had issues, but continuing...');
    }

    console.log('\n✅ COMMUNITY NODES RESTORED!');

} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
}

