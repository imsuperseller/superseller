#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class WebflowMCPServer {
    private server: Server;
    private webflowApiToken: string;
    private webflowSiteId: string;

    constructor() {
        this.webflowApiToken = process.env.WEBFLOW_API_TOKEN || '';
        this.webflowSiteId = process.env.WEBFLOW_SITE_ID || '66c7e551a317e0e9c9f906d8';

        if (!this.webflowApiToken) {
            throw new Error('WEBFLOW_API_TOKEN environment variable is required');
        }

        this.server = new Server(
            {
                name: 'webflow-mcp-server',
                version: '1.0.0',
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
                        if (args && typeof args.siteId === 'string') {
                            return await this.getWebflowSite(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');

                    case 'list_webflow_collections':
                        if (args && typeof args.siteId === 'string') {
                            return await this.listWebflowCollections(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');

                    case 'get_webflow_collection_items':
                        if (args && typeof args.collectionId === 'string') {
                            return await this.getWebflowCollectionItems(args.collectionId);
                        }
                        throw new Error('collectionId is required and must be a string');

                    case 'create_webflow_collection_item':
                        if (args && typeof args.collectionId === 'string' && args.fields) {
                            return await this.createWebflowCollectionItem(args.collectionId, args.fields);
                        }
                        throw new Error('collectionId and fields are required');

                    case 'get_webflow_form_submissions':
                        if (args && typeof args.siteId === 'string') {
                            return await this.getWebflowFormSubmissions(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }
                    ]
                };
            }
        });
    }

    private async listWebflowSites() {
        const response = await axios.get('https://api.webflow.com/v2/sites', {
            headers: {
                'Authorization': `Bearer ${this.webflowApiToken}`,
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
        const response = await axios.get(`https://api.webflow.com/v2/sites/${siteId}`, {
            headers: {
                'Authorization': `Bearer ${this.webflowApiToken}`,
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
        const response = await axios.get(`https://api.webflow.com/v2/sites/${siteId}/collections`, {
            headers: {
                'Authorization': `Bearer ${this.webflowApiToken}`,
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
        const response = await axios.get(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
            headers: {
                'Authorization': `Bearer ${this.webflowApiToken}`,
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
        const response = await axios.post(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
            fields: fields
        }, {
            headers: {
                'Authorization': `Bearer ${this.webflowApiToken}`,
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
        const response = await axios.get(`https://api.webflow.com/v2/sites/${siteId}/form_submissions`, {
            headers: {
                'Authorization': `Bearer ${this.webflowApiToken}`,
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
