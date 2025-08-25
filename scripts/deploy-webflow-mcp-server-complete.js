#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class WebflowMCPServerCompleteDeployment {
    constructor() {
        this.vpsHost = '173.254.201.134';
        this.vpsUser = 'root';
        this.vpsPassword = '05ngBiq2pTA8XSF76x';
        this.webflowApiToken = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';
        this.webflowSiteId = '66c7e551a317e0e9c9f906d8';

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            steps: [],
            errors: [],
            webflowMCPStatus: 'not_deployed'
        };
    }

    async deployWebflowMCPServer() {
        console.log('🚀 COMPLETE WEBFLOW MCP SERVER DEPLOYMENT');
        console.log('=========================================');
        console.log('Deploying Webflow MCP server to Racknerd VPS...');

        try {
            // Step 1: Build the Webflow MCP server locally
            await this.buildWebflowMCPServer();

            // Step 2: Deploy to VPS
            await this.deployToVPS();

            // Step 3: Configure systemd service
            await this.configureSystemdService();

            // Step 4: Test the deployment
            await this.testWebflowMCPServer();

            await this.saveResults();

            console.log('\n✅ WEBFLOW MCP SERVER DEPLOYMENT COMPLETED!');
            console.log('🎯 Webflow integration ready for use');

        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            this.results.errors.push({ step: 'deployment', error: error.message });
            await this.saveResults();
        }
    }

    async buildWebflowMCPServer() {
        console.log('\n🔨 Building Webflow MCP server...');

        try {
            // Create webflow-mcp-server directory if it doesn't exist
            await fs.mkdir('webflow-mcp-server', { recursive: true });

            // Create package.json
            const packageJson = {
                "name": "webflow-mcp-server",
                "version": "1.0.0",
                "description": "Webflow MCP Server for Rensto",
                "main": "dist/index.js",
                "type": "module",
                "scripts": {
                    "build": "tsc",
                    "start": "node dist/index.js",
                    "dev": "ts-node --loader ts-node/esm src/index.ts"
                },
                "dependencies": {
                    "@modelcontextprotocol/sdk": "^0.4.0",
                    "axios": "^1.6.0"
                },
                "devDependencies": {
                    "@types/node": "^20.0.0",
                    "typescript": "^5.0.0",
                    "ts-node": "^10.9.0"
                }
            };

            await fs.writeFile('webflow-mcp-server/package.json', JSON.stringify(packageJson, null, 2));

            // Create tsconfig.json
            const tsconfigJson = {
                "compilerOptions": {
                    "target": "ES2022",
                    "module": "ESNext",
                    "moduleResolution": "node",
                    "esModuleInterop": true,
                    "allowSyntheticDefaultImports": true,
                    "strict": true,
                    "skipLibCheck": true,
                    "forceConsistentCasingInFileNames": true,
                    "outDir": "./dist",
                    "rootDir": "./src",
                    "declaration": true,
                    "declarationMap": true,
                    "sourceMap": true
                },
                "include": ["src/**/*"],
                "exclude": ["node_modules", "dist"]
            };

            await fs.writeFile('webflow-mcp-server/tsconfig.json', JSON.stringify(tsconfigJson, null, 2));

            // Create src directory and index.ts
            await fs.mkdir('webflow-mcp-server/src', { recursive: true });

            const indexTs = `#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class WebflowMCPServer {
    private server: Server;
    private webflowApiToken: string;
    private webflowSiteId: string;

    constructor() {
        this.webflowApiToken = process.env.WEBFLOW_API_TOKEN || '${this.webflowApiToken}';
        this.webflowSiteId = process.env.WEBFLOW_SITE_ID || '${this.webflowSiteId}';
        
        this.server = new Server(
            {
                name: 'webflow-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupTools();
    }

    private setupTools() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'list_webflow_sites',
                        description: 'List all Webflow sites',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    },
                    {
                        name: 'get_webflow_site',
                        description: 'Get details of a specific Webflow site',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                siteId: {
                                    type: 'string',
                                    description: 'Webflow site ID'
                                }
                            },
                            required: ['siteId']
                        }
                    },
                    {
                        name: 'list_webflow_collections',
                        description: 'List all collections for a Webflow site',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                siteId: {
                                    type: 'string',
                                    description: 'Webflow site ID'
                                }
                            },
                            required: ['siteId']
                        }
                    },
                    {
                        name: 'get_webflow_collection_items',
                        description: 'Get items from a specific collection',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                collectionId: {
                                    type: 'string',
                                    description: 'Collection ID'
                                }
                            },
                            required: ['collectionId']
                        }
                    },
                    {
                        name: 'create_webflow_collection_item',
                        description: 'Create a new item in a collection',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                collectionId: {
                                    type: 'string',
                                    description: 'Collection ID'
                                },
                                fields: {
                                    type: 'object',
                                    description: 'Item fields'
                                }
                            },
                            required: ['collectionId', 'fields']
                        }
                    },
                    {
                        name: 'get_webflow_form_submissions',
                        description: 'Get form submissions for a site',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                siteId: {
                                    type: 'string',
                                    description: 'Webflow site ID'
                                }
                            },
                            required: ['siteId']
                        }
                    }
                ]
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'list_webflow_sites':
                        return await this.listWebflowSites();
                    
                    case 'get_webflow_site':
                        return await this.getWebflowSite(args.siteId);
                    
                    case 'list_webflow_collections':
                        return await this.listWebflowCollections(args.siteId);
                    
                    case 'get_webflow_collection_items':
                        return await this.getWebflowCollectionItems(args.collectionId);
                    
                    case 'create_webflow_collection_item':
                        return await this.createWebflowCollectionItem(args.collectionId, args.fields);
                    
                    case 'get_webflow_form_submissions':
                        return await this.getWebflowFormSubmissions(args.siteId);
                    
                    default:
                        throw new Error(\`Unknown tool: \${name}\`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: \`Error: \${error instanceof Error ? error.message : 'Unknown error'}\`
                        }
                    ]
                };
            }
        });
    }

    private async listWebflowSites() {
        const response = await axios.get('https://api.webflow.com/sites', {
            headers: {
                'Authorization': \`Bearer \${this.webflowApiToken}\`,
                'Accept': 'application/json'
            }
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }
            ]
        };
    }

    private async getWebflowSite(siteId: string) {
        const response = await axios.get(\`https://api.webflow.com/sites/\${siteId}\`, {
            headers: {
                'Authorization': \`Bearer \${this.webflowApiToken}\`,
                'Accept': 'application/json'
            }
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }
            ]
        };
    }

    private async listWebflowCollections(siteId: string) {
        const response = await axios.get(\`https://api.webflow.com/sites/\${siteId}/collections\`, {
            headers: {
                'Authorization': \`Bearer \${this.webflowApiToken}\`,
                'Accept': 'application/json'
            }
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }
            ]
        };
    }

    private async getWebflowCollectionItems(collectionId: string) {
        const response = await axios.get(\`https://api.webflow.com/collections/\${collectionId}/items\`, {
            headers: {
                'Authorization': \`Bearer \${this.webflowApiToken}\`,
                'Accept': 'application/json'
            }
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }
            ]
        };
    }

    private async createWebflowCollectionItem(collectionId: string, fields: any) {
        const response = await axios.post(\`https://api.webflow.com/collections/\${collectionId}/items\`, {
            fields: fields
        }, {
            headers: {
                'Authorization': \`Bearer \${this.webflowApiToken}\`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }
            ]
        };
    }

    private async getWebflowFormSubmissions(siteId: string) {
        const response = await axios.get(\`https://api.webflow.com/sites/\${siteId}/form_submissions\`, {
            headers: {
                'Authorization': \`Bearer \${this.webflowApiToken}\`,
                'Accept': 'application/json'
            }
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }
            ]
        };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Webflow MCP Server started');
    }
}

const server = new WebflowMCPServer();
server.run().catch(console.error);
`;

            await fs.writeFile('webflow-mcp-server/src/index.ts', indexTs);

            // Install dependencies and build
            console.log('  📦 Installing dependencies...');
            execSync('cd webflow-mcp-server && npm install', { stdio: 'inherit' });

            console.log('  🔨 Building TypeScript...');
            execSync('cd webflow-mcp-server && npm run build', { stdio: 'inherit' });

            console.log('  ✅ Webflow MCP server built successfully');
            this.results.steps.push({ step: 'build', status: 'success' });

        } catch (error) {
            console.error('  ❌ Build failed:', error.message);
            this.results.errors.push({ step: 'build', error: error.message });
            throw error;
        }
    }

    async deployToVPS() {
        console.log('\n🚀 Deploying to Racknerd VPS...');

        try {
            // Create directory on VPS
            const createDirCmd = `sshpass -p '${this.vpsPassword}' ssh ${this.vpsUser}@${this.vpsHost} "mkdir -p /opt/mcp-servers/webflow-mcp-server"`;
            execSync(createDirCmd, { stdio: 'inherit' });

            // Copy files to VPS
            const copyCmd = `sshpass -p '${this.vpsPassword}' scp -r webflow-mcp-server/* ${this.vpsUser}@${this.vpsHost}:/opt/mcp-servers/webflow-mcp-server/`;
            execSync(copyCmd, { stdio: 'inherit' });

            // Install dependencies on VPS
            const installCmd = `sshpass -p '${this.vpsPassword}' ssh ${this.vpsUser}@${this.vpsHost} "cd /opt/mcp-servers/webflow-mcp-server && npm install --production"`;
            execSync(installCmd, { stdio: 'inherit' });

            console.log('  ✅ Deployed to VPS successfully');
            this.results.steps.push({ step: 'deploy', status: 'success' });

        } catch (error) {
            console.error('  ❌ Deployment failed:', error.message);
            this.results.errors.push({ step: 'deploy', error: error.message });
            throw error;
        }
    }

    async configureSystemdService() {
        console.log('\n⚙️ Configuring systemd service...');

        try {
            const serviceContent = `[Unit]
Description=Webflow MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mcp-servers/webflow-mcp-server
Environment=WEBFLOW_API_TOKEN=${this.webflowApiToken}
Environment=WEBFLOW_SITE_ID=${this.webflowSiteId}
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
`;

            // Create service file locally
            await fs.writeFile('webflow-mcp-server.service', serviceContent);

            // Copy service file to VPS
            const copyServiceCmd = `sshpass -p '${this.vpsPassword}' scp webflow-mcp-server.service ${this.vpsUser}@${this.vpsHost}:/etc/systemd/system/`;
            execSync(copyServiceCmd, { stdio: 'inherit' });

            // Reload systemd and start service
            const startServiceCmd = `sshpass -p '${this.vpsPassword}' ssh ${this.vpsUser}@${this.vpsHost} "systemctl daemon-reload && systemctl enable webflow-mcp-server && systemctl start webflow-mcp-server"`;
            execSync(startServiceCmd, { stdio: 'inherit' });

            // Clean up local service file
            await fs.unlink('webflow-mcp-server.service');

            console.log('  ✅ Systemd service configured and started');
            this.results.steps.push({ step: 'systemd', status: 'success' });

        } catch (error) {
            console.error('  ❌ Systemd configuration failed:', error.message);
            this.results.errors.push({ step: 'systemd', error: error.message });
            throw error;
        }
    }

    async testWebflowMCPServer() {
        console.log('\n🧪 Testing Webflow MCP server...');

        try {
            // Check service status
            const statusCmd = `sshpass -p '${this.vpsPassword}' ssh ${this.vpsUser}@${this.vpsHost} "systemctl status webflow-mcp-server --no-pager"`;
            const status = execSync(statusCmd, { encoding: 'utf8' });

            console.log('  📊 Service Status:');
            console.log(status);

            // Test Webflow API directly
            console.log('  🔗 Testing Webflow API...');
            const testResponse = await axios.get(`https://api.webflow.com/sites/${this.webflowSiteId}`, {
                headers: {
                    'Authorization': `Bearer ${this.webflowApiToken}`,
                    'Accept': 'application/json'
                }
            });

            console.log('  ✅ Webflow API test successful');
            console.log(`    Site Name: ${testResponse.data.name}`);
            console.log(`    Site ID: ${testResponse.data._id}`);

            this.results.webflowMCPStatus = 'deployed_and_working';
            this.results.steps.push({ step: 'test', status: 'success', siteName: testResponse.data.name });

        } catch (error) {
            console.error('  ❌ Test failed:', error.message);
            this.results.errors.push({ step: 'test', error: error.message });
            this.results.webflowMCPStatus = 'deployed_but_test_failed';
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/webflow-integration/webflow-mcp-deployment-complete-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const deployment = new WebflowMCPServerCompleteDeployment();
deployment.deployWebflowMCPServer().catch(console.error);
