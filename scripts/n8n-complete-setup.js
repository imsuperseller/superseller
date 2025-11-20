const Database = require('better-sqlite3');
const db = new Database('/home/node/.n8n/database.sqlite');

console.log('🔧 COMPLETING N8N SETUP');
console.log('========================\n');

try {
    // Fix the isInstanceOwnerSetUp flag
    console.log('📋 Step 1: Fixing owner setup flag...');
    const updateStmt = db.prepare(`
        UPDATE settings 
        SET value = ? 
        WHERE key = 'userManagement.isInstanceOwnerSetUp'
    `);
    
    const result = updateStmt.run('true');
    console.log(`✅ Updated ${result.changes} setting(s)`);
    
    // Verify
    const checkStmt = db.prepare("SELECT * FROM settings WHERE key = 'userManagement.isInstanceOwnerSetUp'");
    const setting = checkStmt.get();
    console.log('   Current value:', setting.value);
    
    // Fix shared workflows
    console.log('\n📋 Step 2: Fixing shared workflows...');
    const ownerUser = db.prepare('SELECT id FROM user WHERE roleSlug = ?').get('global:owner');
    
    if (ownerUser) {
        console.log(`✅ Owner user: ${ownerUser.id}`);
        
        // Check shared_workflow schema
        const schemaStmt = db.prepare("PRAGMA table_info(shared_workflow)");
        const columns = schemaStmt.all();
        console.log('   Columns:', columns.map(c => c.name).join(', '));
        
        // Get workflows without shared entries
        const workflows = db.prepare('SELECT id, name FROM workflow_entity').all();
        console.log(`   Found ${workflows.length} workflows`);
        
        // Get default project (or create one)
        let projectId = null;
        try {
            const projectStmt = db.prepare("SELECT id FROM project LIMIT 1");
            const project = projectStmt.get();
            if (project) {
                projectId = project.id;
            }
        } catch (e) {
            console.log('   No project found, workflows will be personal');
        }
        
        // Create shared workflow entries (using projectId, not userId)
        const insertShared = db.prepare(`
            INSERT OR IGNORE INTO shared_workflow (
                workflowId, projectId, role, createdAt, updatedAt
            ) VALUES (?, ?, ?, datetime('now'), datetime('now'))
        `);
        
        let created = 0;
        for (const wf of workflows) {
            try {
                insertShared.run(wf.id, projectId, 'workflow:owner');
                created++;
            } catch (e) {
                // Ignore duplicates or errors
            }
        }
        
        console.log(`✅ Created ${created} shared workflow entries`);
    }
    
    // Fix shared credentials
    console.log('\n📋 Step 3: Fixing shared credentials...');
    const credSchemaStmt = db.prepare("PRAGMA table_info(shared_credentials)");
    const credColumns = credSchemaStmt.all();
    console.log('   Columns:', credColumns.map(c => c.name).join(', '));
    
    const credentials = db.prepare('SELECT id FROM credentials_entity').all();
    console.log(`   Found ${credentials.length} credentials`);
    
    // Check if shared_credentials uses projectId or userId
    const hasProjectId = credColumns.some(c => c.name === 'projectId');
    const hasUserId = credColumns.some(c => c.name === 'userId');
    
    if (hasProjectId) {
        const insertSharedCred = db.prepare(`
            INSERT OR IGNORE INTO shared_credentials (
                credentialsId, projectId, role, createdAt, updatedAt
            ) VALUES (?, ?, ?, datetime('now'), datetime('now'))
        `);
        
        let projectId = null;
        try {
            const projectStmt = db.prepare("SELECT id FROM project LIMIT 1");
            const project = projectStmt.get();
            if (project) projectId = project.id;
        } catch (e) {}
        
        let credCreated = 0;
        for (const cred of credentials) {
            try {
                insertSharedCred.run(cred.id, projectId, 'credential:owner');
                credCreated++;
            } catch (e) {
                // Ignore
            }
        }
        console.log(`✅ Created ${credCreated} shared credential entries`);
    } else if (hasUserId) {
        const insertSharedCred = db.prepare(`
            INSERT OR IGNORE INTO shared_credentials (
                credentialsId, userId, role, createdAt, updatedAt
            ) VALUES (?, ?, ?, datetime('now'), datetime('now'))
        `);
        
        let credCreated = 0;
        for (const cred of credentials) {
            try {
                insertSharedCred.run(cred.id, ownerUser.id, 'credential:owner');
                credCreated++;
            } catch (e) {
                // Ignore
            }
        }
        console.log(`✅ Created ${credCreated} shared credential entries`);
    } else {
        console.log('⚠️  Cannot determine shared_credentials schema');
    }
    
    console.log('\n✅ SETUP COMPLETE!');
    console.log('💡 Restart n8n container for changes to take effect');
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
} finally {
    db.close();
}

