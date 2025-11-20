const Database = require('better-sqlite3');
const db = new Database('/home/node/.n8n/database.sqlite');

const stmt = db.prepare('SELECT id, email, firstName, lastName, roleSlug FROM user WHERE roleSlug = ?');
const owner = stmt.get('global:owner');

console.log('✅ Owner user status:');
console.log(JSON.stringify(owner, null, 2));

db.close();

