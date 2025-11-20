const Database = require('better-sqlite3');
const db = new Database('/home/node/.n8n/database.sqlite');

console.log('🔍 VERIFYING RESTORATION\n');

const workflowCount = db.prepare('SELECT COUNT(*) as count FROM workflow_entity').get();
const credCount = db.prepare('SELECT COUNT(*) as count FROM credentials_entity').get();

console.log(`✅ Workflows in database: ${workflowCount.count}`);
console.log(`✅ Credentials in database: ${credCount.count}\n`);

if (workflowCount.count > 0) {
    const recent = db.prepare('SELECT id, name, active FROM workflow_entity ORDER BY updatedAt DESC LIMIT 10').all();
    console.log('📋 Recent workflows:');
    recent.forEach(w => {
        console.log(`   ${w.active ? '✅' : '⏸️'} ${w.name || w.id.substring(0, 8)}`);
    });
}

if (credCount.count > 0) {
    const recentCreds = db.prepare('SELECT id, name, type FROM credentials_entity ORDER BY updatedAt DESC LIMIT 10').all();
    console.log('\n📋 Recent credentials:');
    recentCreds.forEach(c => {
        console.log(`   🔐 ${c.name || 'Unnamed'} (${c.type})`);
    });
}

db.close();

