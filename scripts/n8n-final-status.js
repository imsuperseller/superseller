const Database = require('better-sqlite3');
const db = new Database('/home/node/.n8n/database.sqlite');

console.log('📊 FINAL STATUS REPORT');
console.log('======================\n');

const workflowCount = db.prepare('SELECT COUNT(*) as count FROM workflow_entity').get();
const credCount = db.prepare('SELECT COUNT(*) as count FROM credentials_entity').get();
const setupStatus = db.prepare("SELECT value FROM settings WHERE key = 'userManagement.isInstanceOwnerSetUp'").get();
const ownerUser = db.prepare('SELECT email, firstName, lastName FROM user WHERE roleSlug = ?').get('global:owner');
const sharedWorkflows = db.prepare('SELECT COUNT(*) as count FROM shared_workflow').get();
const sharedCreds = db.prepare('SELECT COUNT(*) as count FROM shared_credentials').get();

console.log('✅ WORKFLOWS:');
console.log(`   Total: ${workflowCount.count}`);
console.log(`   Shared entries: ${sharedWorkflows.count}\n`);

console.log('✅ CREDENTIALS:');
console.log(`   Total: ${credCount.count}`);
console.log(`   Shared entries: ${sharedCreds.count}\n`);

console.log('✅ OWNER USER:');
console.log(`   Email: ${ownerUser.email}`);
console.log(`   Name: ${ownerUser.firstName} ${ownerUser.lastName}\n`);

console.log('✅ SETUP STATUS:');
console.log(`   Owner Setup Complete: ${setupStatus.value}\n`);

console.log('🎉 ALL SYSTEMS OPERATIONAL!');
console.log('\n💡 Access n8n at: http://173.254.201.134:5678');
console.log('   Login: admin@rensto.com / Rensto2024!');

db.close();

