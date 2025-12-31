#!/usr/bin/env node

/**
 * Firebase Lite MCP Server
 * Minimal version with only 4 core tools for Opus 4.5 stability
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execSync, spawn } from 'child_process';

class FirebaseLiteServer {
    constructor() {
        this.server = new Server(
            {
                name: 'firebase-lite',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupHandlers();
    }

    runFirebaseCommand(args) {
        try {
            const result = execSync(`npx firebase-tools ${args}`, {
                encoding: 'utf-8',
                timeout: 60000,
                maxBuffer: 10 * 1024 * 1024
            });
            return result;
        } catch (error) {
            throw new Error(`Firebase CLI error: ${error.message}`);
        }
    }

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'firebase_list_projects',
                        description: 'List all Firebase projects',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    },
                    {
                        name: 'firebase_deploy',
                        description: 'Deploy to Firebase Hosting',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                project: { type: 'string', description: 'Firebase project ID' },
                                only: { type: 'string', description: 'Deploy only specific targets (hosting, functions, firestore, etc.)' }
                            },
                            required: ['project']
                        }
                    },
                    {
                        name: 'firebase_hosting_sites',
                        description: 'List hosting sites for a project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                project: { type: 'string', description: 'Firebase project ID' }
                            },
                            required: ['project']
                        }
                    },
                    {
                        name: 'firebase_firestore_indexes',
                        description: 'List Firestore indexes for a project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                project: { type: 'string', description: 'Firebase project ID' }
                            },
                            required: ['project']
                        }
                    }
                ]
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                let result;

                switch (name) {
                    case 'firebase_list_projects': {
                        result = this.runFirebaseCommand('projects:list --json');
                        break;
                    }
                    case 'firebase_deploy': {
                        const onlyFlag = args.only ? `--only ${args.only}` : '';
                        result = this.runFirebaseCommand(`deploy --project ${args.project} ${onlyFlag} --json`);
                        break;
                    }
                    case 'firebase_hosting_sites': {
                        result = this.runFirebaseCommand(`hosting:sites:list --project ${args.project} --json`);
                        break;
                    }
                    case 'firebase_firestore_indexes': {
                        result = this.runFirebaseCommand(`firestore:indexes --project ${args.project} --json`);
                        break;
                    }
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }

                return {
                    content: [{ type: 'text', text: result }]
                };
            } catch (error) {
                return {
                    content: [{ type: 'text', text: `Error: ${error.message}` }],
                    isError: true
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Firebase Lite MCP Server running on stdio');
    }
}

const server = new FirebaseLiteServer();
server.run().catch(console.error);
