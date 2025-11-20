const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = '/home/node/.n8n/database.sqlite';
const db = new Database(DB_PATH);

const REAL_EMAIL = 'service@rensto.com';
const REAL_PASSWORD = 'vEdki7-vetwej-jotwuh';

console.log('🔍 VERIFYING LOGIN CREDENTIALS\n');

const user = db.prepare('SELECT * FROM user WHERE email = ?').get(REAL_EMAIL);

if (!user) {
    console.error('❌ User not found!');
    process.exit(1);
}

console.log('✅ User found:');
console.log(`   ID: ${user.id}`);
console.log(`   Email: ${user.email}`);
console.log(`   Role: ${user.roleSlug}`);
console.log(`   Has Password: ${user.password ? 'YES' : 'NO'}`);

if (user.password) {
    const match = bcrypt.compareSync(REAL_PASSWORD, user.password);
    console.log(`   Password Match: ${match ? '✅ YES' : '❌ NO'}`);
    
    if (!match) {
        console.log('\n⚠️  Password mismatch! Updating...');
        const hashed = bcrypt.hashSync(REAL_PASSWORD, 10);
        db.prepare('UPDATE user SET password = ? WHERE id = ?').run(hashed, user.id);
        console.log('✅ Password updated!');
    }
} else {
    console.log('\n⚠️  No password set! Setting password...');
    const hashed = bcrypt.hashSync(REAL_PASSWORD, 10);
    db.prepare('UPDATE user SET password = ? WHERE id = ?').run(hashed, user.id);
    console.log('✅ Password set!');
}

db.close();
console.log('\n✅ Login credentials verified!');

