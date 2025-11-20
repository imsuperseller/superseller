const Database = require('better-sqlite3');
const fs = require('fs');

const DB_PATH = '/home/node/.n8n/database.sqlite';

console.log('📊 FINAL VERIFICATION');
console.log('=====================\n');

const db = new Database(DB_PATH);

try {
    // Workflows
    const workflowCount = db.prepare('SELECT COUNT(*) as count FROM workflow_entity').get();
    console.log(`✅ Workflows: ${workflowCount.count}`);
    
    // Credentials
    const credCount = db.prepare('SELECT COUNT(*) as count FROM credentials_entity').get();
    console.log(`✅ Credentials: ${credCount.count}`);
    
    // Check credential data format
    const credSample = db.prepare('SELECT name, type, data FROM credentials_entity WHERE data IS NOT NULL LIMIT 3').all();
    console.log('\n📋 Credential samples:');
    credSample.forEach(c => {
        const dataStr = c.data.toString();
        const hasData = dataStr.length > 10;
        const isEncrypted = dataStr.includes('"data"') || dataStr.includes('"iv"') || dataStr.startsWith('U2FsdGVkX1');
        console.log(`   ${c.name} (${c.type}): ${hasData ? '✅ Has data' : '❌ Empty'} ${isEncrypted ? '🔐 Encrypted' : '⚠️ Not encrypted'}`);
    });
    
    // Community nodes check
    const customDir = '/home/node/custom';
    if (fs.existsSync(customDir)) {
        const pkgPath = `${customDir}/package.json`;
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const nodeCount = Object.keys(pkg.dependencies || {}).length;
            console.log(`\n✅ Community nodes: ${nodeCount} installed`);
            Object.keys(pkg.dependencies || {}).forEach(name => {
                console.log(`   ✅ ${name}`);
            });
        }
    }
    
    // Owner user
    const owner = db.prepare('SELECT email FROM user WHERE roleSlug = ?').get('global:owner');
    console.log(`\n✅ Owner: ${owner.email}`);
    
    // Setup status
    const setup = db.prepare("SELECT value FROM settings WHERE key = 'userManagement.isInstanceOwnerSetUp'").get();
    console.log(`✅ Setup complete: ${setup.value}`);
    
    console.log('\n🎉 VERIFICATION COMPLETE!');
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
} finally {
    db.close();
}

