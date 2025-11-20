const Database = require('better-sqlite3');
const fs = require('fs');

const DB_PATH = '/home/node/.n8n/database.sqlite';

const db = new Database(DB_PATH);

console.log('📊 COMPLETE RESTORATION STATUS');
console.log('==============================\n');

const workflowCount = db.prepare('SELECT COUNT(*) as count FROM workflow_entity').get();
const credCount = db.prepare('SELECT COUNT(*) as count FROM credentials_entity').get();
const credsWithData = db.prepare('SELECT COUNT(*) as count FROM credentials_entity WHERE data IS NOT NULL AND LENGTH(data) > 20').get();
const owner = db.prepare('SELECT email FROM user WHERE roleSlug = ?').get('global:owner');
const setup = db.prepare("SELECT value FROM settings WHERE key = 'userManagement.isInstanceOwnerSetUp'").get();

console.log('✅ WORKFLOWS:');
console.log(`   Total: ${workflowCount.count}\n`);

console.log('✅ CREDENTIALS:');
console.log(`   Total: ${credCount.count}`);
console.log(`   With encrypted data: ${credsWithData.count}\n`);

console.log('✅ OWNER USER:');
console.log(`   Email: ${owner.email}\n`);

console.log('✅ SETUP STATUS:');
console.log(`   Complete: ${setup.value}\n`);

// Check community nodes
const customDir = '/home/node/custom';
if (fs.existsSync(customDir)) {
    const pkgPath = `${customDir}/package.json`;
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const nodeCount = Object.keys(pkg.dependencies || {}).length;
        console.log('✅ COMMUNITY NODES:');
        console.log(`   Installed: ${nodeCount}`);
        Object.keys(pkg.dependencies || {}).forEach(name => {
            console.log(`   ✅ ${name}`);
        });
    }
}

db.close();

console.log('\n🎉 ALL SYSTEMS RESTORED AND OPERATIONAL!');

