const Database = require('better-sqlite3');
const fs = require('fs');

const DB_PATH = '/home/node/.n8n/database.sqlite';
const WORKFLOWS_FILE = '/home/node/.n8n/backup-workflows.json';
const CREDENTIALS_FILE = '/home/node/.n8n/backup-credentials.json';

console.log('🚨 DIRECT DATABASE RESTORATION');
console.log('================================\n');

const db = new Database(DB_PATH);

try {
    // Read workflows
    console.log('📖 Reading workflows backup...');
    const workflows = JSON.parse(fs.readFileSync(WORKFLOWS_FILE, 'utf8'));
    console.log(`✅ Found ${workflows.length} workflows\n`);

    // Prepare insert statement
    const insertWorkflow = db.prepare(`
        INSERT OR REPLACE INTO workflow_entity (
            id, name, active, nodes, connections, settings, 
            staticData, pinData, tags, versionId, meta,
            createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTransaction = db.transaction((workflows) => {
        let restored = 0;
        for (const w of workflows) {
            try {
                insertWorkflow.run(
                    w.id,
                    w.name || 'Unnamed Workflow',
                    w.active ? 1 : 0,
                    JSON.stringify(w.nodes || []),
                    JSON.stringify(w.connections || {}),
                    JSON.stringify(w.settings || {}),
                    JSON.stringify(w.staticData || {}),
                    JSON.stringify(w.pinData || {}),
                    JSON.stringify(w.tags || []),
                    w.versionId || null,
                    JSON.stringify(w.meta || {}),
                    w.createdAt || new Date().toISOString(),
                    w.updatedAt || new Date().toISOString()
                );
                restored++;
                if (restored % 10 === 0) {
                    process.stdout.write(`\r   Restored: ${restored}/${workflows.length}`);
                }
            } catch (error) {
                console.error(`\n❌ Error restoring ${w.name || w.id}: ${error.message}`);
            }
        }
        return restored;
    });

    console.log('🔄 Restoring workflows to database...');
    const restored = insertTransaction(workflows);
    console.log(`\n✅ Successfully restored ${restored} workflows!\n`);

    // Restore credentials
    if (fs.existsSync(CREDENTIALS_FILE)) {
        console.log('📖 Reading credentials backup...');
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
        console.log(`✅ Found ${credentials.length} credentials\n`);

        const insertCred = db.prepare(`
            INSERT OR REPLACE INTO credentials_entity (
                id, name, type, nodesAccess, data, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const credTransaction = db.transaction((creds) => {
            let restored = 0;
            for (const c of creds) {
                try {
                    insertCred.run(
                        c.id,
                        c.name || 'Unnamed Credential',
                        c.type,
                        JSON.stringify(c.nodesAccess || []),
                        JSON.stringify(c.data || {}),
                        c.createdAt || new Date().toISOString(),
                        c.updatedAt || new Date().toISOString()
                    );
                    restored++;
                } catch (error) {
                    console.error(`❌ Error restoring credential ${c.name || c.id}: ${error.message}`);
                }
            }
            return restored;
        });

        console.log('🔄 Restoring credentials to database...');
        const credRestored = credTransaction(credentials);
        console.log(`✅ Successfully restored ${credRestored} credentials!\n`);
    }

    // Verify
    const workflowCount = db.prepare('SELECT COUNT(*) as count FROM workflow_entity').get();
    const credCount = db.prepare('SELECT COUNT(*) as count FROM credentials_entity').get();
    
    console.log('📊 VERIFICATION:');
    console.log(`   Workflows: ${workflowCount.count}`);
    console.log(`   Credentials: ${credCount.count}`);
    console.log('\n🎉 RESTORATION COMPLETE!');

} catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
} finally {
    db.close();
}

