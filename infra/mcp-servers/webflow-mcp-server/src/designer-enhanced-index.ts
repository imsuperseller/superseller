#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class DesignerEnhancedWebflowMCPServer {
    private server: Server;
    private webflowApiToken: string;
    private webflowSiteId: string;
    private designerExtensionUrl: string;

    constructor() {
        this.webflowApiToken = process.env.WEBFLOW_API_TOKEN || '';
        this.webflowSiteId = process.env.WEBFLOW_SITE_ID || '66c7e551a317e0e9c9f906d8';
        this.designerExtensionUrl = process.env.DESIGNER_EXTENSION_URL || 'http://localhost:3000';

        if (!this.webflowApiToken) {
            throw new Error('WEBFLOW_API_TOKEN environment variable is required');
        }

        this.server = new Server(
            {
                name: 'designer-enhanced-webflow-mcp-server',
                version: '3.0.0',
            }
        );

        this.setupTools();
    }

    private setupTools() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    // EXISTING DATA API TOOLS
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
                        name: 'publish_webflow_site',
                        description: 'Publish site changes',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                siteId: {
                                    type: 'string',
                                    description: 'Webflow site ID'
                                },
                                publishToWebflowSubdomain: {
                                    type: 'boolean',
                                    description: 'Publish to Webflow subdomain'
                                },
                                customDomains: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Custom domains to publish to'
                                }
                            },
                            required: ['siteId']
                        }
                    },
                    {
                        name: 'list_webflow_pages',
                        description: 'List all pages for a Webflow site',
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
                        name: 'list_webflow_components',
                        description: 'List all components in a site',
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

                    // NEW DESIGNER API TOOLS
                    {
                        name: 'designer_get_page_content',
                        description: 'Get page content via Designer API',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                pageId: {
                                    type: 'string',
                                    description: 'Webflow page ID'
                                }
                            },
                            required: ['pageId']
                        }
                    },
                    {
                        name: 'designer_update_page_content',
                        description: 'Update page content via Designer API',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                pageId: {
                                    type: 'string',
                                    description: 'Webflow page ID'
                                },
                                content: {
                                    type: 'string',
                                    description: 'HTML content to update'
                                }
                            },
                            required: ['pageId', 'content']
                        }
                    },
                    {
                        name: 'designer_create_element',
                        description: 'Create element in Designer',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                pageId: {
                                    type: 'string',
                                    description: 'Webflow page ID'
                                },
                                elementType: {
                                    type: 'string',
                                    description: 'Type of element to create'
                                },
                                content: {
                                    type: 'string',
                                    description: 'Element content'
                                },
                                styles: {
                                    type: 'object',
                                    description: 'Element styles'
                                }
                            },
                            required: ['pageId', 'elementType', 'content']
                        }
                    },
                    {
                        name: 'designer_update_element',
                        description: 'Update element in Designer',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                elementId: {
                                    type: 'string',
                                    description: 'Element ID'
                                },
                                content: {
                                    type: 'string',
                                    description: 'Element content'
                                },
                                styles: {
                                    type: 'object',
                                    description: 'Element styles'
                                }
                            },
                            required: ['elementId', 'content']
                        }
                    },
                    {
                        name: 'designer_apply_styles',
                        description: 'Apply styles to element',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                elementId: {
                                    type: 'string',
                                    description: 'Element ID'
                                },
                                styles: {
                                    type: 'object',
                                    description: 'Styles to apply'
                                }
                            },
                            required: ['elementId', 'styles']
                        }
                    },
                    {
                        name: 'designer_get_components',
                        description: 'Get all components via Designer API',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    },
                    {
                        name: 'designer_update_component',
                        description: 'Update component content via Designer API',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentId: {
                                    type: 'string',
                                    description: 'Component ID'
                                },
                                content: {
                                    type: 'string',
                                    description: 'Component content'
                                },
                                styles: {
                                    type: 'object',
                                    description: 'Component styles'
                                }
                            },
                            required: ['componentId', 'content']
                        }
                    },
                    {
                        name: 'designer_authorize',
                        description: 'Authorize Designer API access',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                clientId: {
                                    type: 'string',
                                    description: 'Webflow App Client ID'
                                },
                                redirectUri: {
                                    type: 'string',
                                    description: 'OAuth redirect URI'
                                }
                            },
                            required: ['clientId']
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
                    // EXISTING DATA API METHODS
                    case 'list_webflow_sites':
                        return await this.listWebflowSites();
                    case 'get_webflow_site':
                        if (args && typeof args.siteId === 'string') {
                            return await this.getWebflowSite(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');
                    case 'publish_webflow_site':
                        if (args && typeof args.siteId === 'string') {
                            return await this.publishWebflowSite(args.siteId, args.publishToWebflowSubdomain as boolean, args.customDomains as string[]);
                        }
                        throw new Error('siteId is required and must be a string');
                    case 'list_webflow_pages':
                        if (args && typeof args.siteId === 'string') {
                            return await this.listWebflowPages(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');
                    case 'list_webflow_components':
                        if (args && typeof args.siteId === 'string') {
                            return await this.listWebflowComponents(args.siteId);
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

                    // NEW DESIGNER API METHODS
                    case 'designer_get_page_content':
                        if (args && typeof args.pageId === 'string') {
                            return await this.designerGetPageContent(args.pageId);
                        }
                        throw new Error('pageId is required and must be a string');
                    case 'designer_update_page_content':
                        if (args && typeof args.pageId === 'string' && typeof args.content === 'string') {
                            return await this.designerUpdatePageContent(args.pageId, args.content);
                        }
                        throw new Error('pageId and content are required');
                    case 'designer_create_element':
                        if (args && typeof args.pageId === 'string' && typeof args.elementType === 'string' && typeof args.content === 'string') {
                            return await this.designerCreateElement(args.pageId, args.elementType, args.content, args.styles);
                        }
                        throw new Error('pageId, elementType, and content are required');
                    case 'designer_update_element':
                        if (args && typeof args.elementId === 'string' && typeof args.content === 'string') {
                            return await this.designerUpdateElement(args.elementId, args.content, args.styles);
                        }
                        throw new Error('elementId and content are required');
                    case 'designer_apply_styles':
                        if (args && typeof args.elementId === 'string' && args.styles) {
                            return await this.designerApplyStyles(args.elementId, args.styles);
                        }
                        throw new Error('elementId and styles are required');
                    case 'designer_get_components':
                        return await this.designerGetComponents();
                    case 'designer_update_component':
                        if (args && typeof args.componentId === 'string' && typeof args.content === 'string') {
                            return await this.designerUpdateComponent(args.componentId, args.content, args.styles);
                        }
                        throw new Error('componentId and content are required');
                    case 'designer_authorize':
                        if (args && typeof args.clientId === 'string') {
                            return await this.designerAuthorize(args.clientId, args.redirectUri as string);
                        }
                        throw new Error('clientId is required');

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

    // EXISTING DATA API METHODS
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

    private async publishWebflowSite(siteId: string, publishToWebflowSubdomain?: boolean, customDomains?: string[]) {
        const response = await axios.post(`https://api.webflow.com/v2/sites/${siteId}/publish`, {
            publishToWebflowSubdomain: publishToWebflowSubdomain || true,
            customDomains: customDomains || []
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

    private async listWebflowPages(siteId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/sites/${siteId}/pages`, {
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

    private async listWebflowComponents(siteId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/sites/${siteId}/components`, {
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

    // NEW DESIGNER API METHODS
    private async designerGetPageContent(pageId: string) {
        const response = await axios.get(`${this.designerExtensionUrl}/api/designer/page-content/${pageId}`);
        
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }
            ]
        };
    }

    private async designerUpdatePageContent(pageId: string, content: string) {
        const response = await axios.put(`${this.designerExtensionUrl}/api/designer/page-content/${pageId}`, {
            content: content
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

    private async designerCreateElement(pageId: string, elementType: string, content: string, styles?: any) {
        const response = await axios.post(`${this.designerExtensionUrl}/api/designer/create-element`, {
            pageId,
            elementType,
            content,
            styles
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

    private async designerUpdateElement(elementId: string, content: string, styles?: any) {
        const response = await axios.put(`${this.designerExtensionUrl}/api/designer/update-element`, {
            elementId,
            content,
            styles
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

    private async designerApplyStyles(elementId: string, styles: any) {
        const response = await axios.post(`${this.designerExtensionUrl}/api/designer/apply-styles`, {
            elementId,
            styles
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

    private async designerGetComponents() {
        const response = await axios.get(`${this.designerExtensionUrl}/api/designer/components`);
        
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }
            ]
        };
    }

    private async designerUpdateComponent(componentId: string, content: string, styles?: any) {
        const response = await axios.put(`${this.designerExtensionUrl}/api/designer/component/${componentId}`, {
            content,
            styles
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

    private async designerAuthorize(clientId: string, redirectUri?: string) {
        const authUrl = `https://webflow.com/oauth/authorize?client_id=${clientId}&response_type=code&scope=designer&redirect_uri=${redirectUri || 'http://localhost:3000/auth/webflow/callback'}`;
        
        return {
            content: [
                {
                    type: 'text',
                    text: `Authorization URL: ${authUrl}\n\nPlease visit this URL to authorize the Designer API access.`
                }
            ]
        };
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}

// Start the server
const server = new DesignerEnhancedWebflowMCPServer();
server.start().catch(console.error);
