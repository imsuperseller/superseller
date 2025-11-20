const { execSync } = require('child_process');

const COMMUNITY_NODES = [
    '@apify/n8n-nodes-apify',
    '@devlikeapro/n8n-nodes-waha',
    '@elevenlabs/n8n-nodes-elevenlabs',
    '@mendable/n8n-nodes-firecrawl',
    '@tavily/n8n-nodes-tavily'
];

console.log('📦 INSTALLING COMMUNITY NODES');
console.log('==============================\n');

const CUSTOM_DIR = '/home/node/custom';

try {
    // Create custom directory
    const fs = require('fs');
    if (!fs.existsSync(CUSTOM_DIR)) {
        fs.mkdirSync(CUSTOM_DIR, { recursive: true });
        console.log('✅ Created custom directory');
    }

    // Create package.json if it doesn't exist
    const packageJsonPath = `${CUSTOM_DIR}/package.json`;
    let packageJson = { dependencies: {} };
    
    if (fs.existsSync(packageJsonPath)) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
    }

    // Add all community nodes
    console.log('📋 Installing community nodes...\n');
    COMMUNITY_NODES.forEach(node => {
        if (!packageJson.dependencies[node]) {
            console.log(`   Installing ${node}...`);
            try {
                execSync(`cd ${CUSTOM_DIR} && npm install ${node} --save`, {
                    stdio: 'inherit',
                    timeout: 120000
                });
                console.log(`   ✅ ${node} installed\n`);
            } catch (error) {
                console.error(`   ❌ Failed to install ${node}: ${error.message}\n`);
            }
        } else {
            console.log(`   ✅ ${node} already in package.json\n`);
        }
    });

    // Install all dependencies
    console.log('📥 Installing all dependencies...');
    try {
        execSync(`cd ${CUSTOM_DIR} && npm install`, {
            stdio: 'inherit',
            timeout: 300000
        });
        console.log('✅ All dependencies installed');
    } catch (error) {
        console.error('⚠️  Some dependencies may have failed, but continuing...');
    }

    console.log('\n✅ COMMUNITY NODES INSTALLED!');

} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
}

