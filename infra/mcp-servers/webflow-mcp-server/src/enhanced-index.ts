#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class EnhancedWebflowMCPServer {
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
                name: 'enhanced-webflow-mcp-server',
                version: '2.0.0',
            }
        );

        this.setupTools();
    }

    private setupTools() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    // SITES MANAGEMENT
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
                        name: 'get_webflow_site_domains',
                        description: 'Get site domains',
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

                    // PAGES MANAGEMENT
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
                        name: 'get_webflow_page_metadata',
                        description: 'Get page metadata',
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
                        name: 'get_webflow_page_content',
                        description: 'Get page content',
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
                        name: 'update_webflow_page_settings',
                        description: 'Update page settings',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                pageId: {
                                    type: 'string',
                                    description: 'Webflow page ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Page settings to update'
                                }
                            },
                            required: ['pageId', 'body']
                        }
                    },
                    {
                        name: 'update_webflow_static_content',
                        description: 'Update page static content',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                pageId: {
                                    type: 'string',
                                    description: 'Webflow page ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Static content to update'
                                }
                            },
                            required: ['pageId', 'body']
                        }
                    },
                    {
                        name: 'create_webflow_page',
                        description: 'Create a new page',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                siteId: {
                                    type: 'string',
                                    description: 'Webflow site ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Page data to create'
                                }
                            },
                            required: ['siteId', 'body']
                        }
                    },
                    {
                        name: 'delete_webflow_page',
                        description: 'Delete a page',
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

                    // COMPONENTS MANAGEMENT
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
                        name: 'get_webflow_component_content',
                        description: 'Get component content',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentId: {
                                    type: 'string',
                                    description: 'Webflow component ID'
                                }
                            },
                            required: ['componentId']
                        }
                    },
                    {
                        name: 'update_webflow_component_content',
                        description: 'Update component content',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentId: {
                                    type: 'string',
                                    description: 'Webflow component ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Component content to update'
                                }
                            },
                            required: ['componentId', 'body']
                        }
                    },
                    {
                        name: 'get_webflow_component_properties',
                        description: 'Get component properties',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentId: {
                                    type: 'string',
                                    description: 'Webflow component ID'
                                }
                            },
                            required: ['componentId']
                        }
                    },
                    {
                        name: 'update_webflow_component_properties',
                        description: 'Update component properties',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentId: {
                                    type: 'string',
                                    description: 'Webflow component ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Component properties to update'
                                }
                            },
                            required: ['componentId', 'body']
                        }
                    },

                    // CMS MANAGEMENT (EXTENDED)
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
                        name: 'get_webflow_collection',
                        description: 'Get collection details',
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
                        name: 'create_webflow_collection',
                        description: 'Create a new collection',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                siteId: {
                                    type: 'string',
                                    description: 'Webflow site ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Collection data to create'
                                }
                            },
                            required: ['siteId', 'body']
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
                        name: 'create_webflow_collection_item_live',
                        description: 'Create collection item (live)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                collectionId: {
                                    type: 'string',
                                    description: 'Collection ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Item data to create'
                                }
                            },
                            required: ['collectionId', 'body']
                        }
                    },
                    {
                        name: 'update_webflow_collection_items_live',
                        description: 'Update collection items (live)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                collectionId: {
                                    type: 'string',
                                    description: 'Collection ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Items data to update'
                                }
                            },
                            required: ['collectionId', 'body']
                        }
                    },
                    {
                        name: 'list_webflow_collection_items',
                        description: 'List collection items',
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
                        name: 'publish_webflow_collection_items',
                        description: 'Publish collection items',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                collectionId: {
                                    type: 'string',
                                    description: 'Collection ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Items to publish'
                                }
                            },
                            required: ['collectionId', 'body']
                        }
                    },

                    // FORM MANAGEMENT
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
                    },

                    // CUSTOM CODE MANAGEMENT
                    {
                        name: 'add_webflow_inline_site_script',
                        description: 'Add inline script to site',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                siteId: {
                                    type: 'string',
                                    description: 'Webflow site ID'
                                },
                                body: {
                                    type: 'object',
                                    description: 'Script data to add'
                                }
                            },
                            required: ['siteId', 'body']
                        }
                    },
                    {
                        name: 'get_webflow_registered_site_scripts',
                        description: 'List all scripts registered to a site',
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
                        name: 'get_webflow_applied_site_scripts',
                        description: 'Get all scripts applied to a site',
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
                        name: 'delete_webflow_site_custom_code',
                        description: 'Remove scripts from a site',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                siteId: {
                                    type: 'string',
                                    description: 'Webflow site ID'
                                },
                                scriptId: {
                                    type: 'string',
                                    description: 'Script ID to remove'
                                }
                            },
                            required: ['siteId', 'scriptId']
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
                    // SITES MANAGEMENT
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
                    case 'get_webflow_site_domains':
                        if (args && typeof args.siteId === 'string') {
                            return await this.getWebflowSiteDomains(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');

                    // PAGES MANAGEMENT
                    case 'list_webflow_pages':
                        if (args && typeof args.siteId === 'string') {
                            return await this.listWebflowPages(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');
                    case 'get_webflow_page_metadata':
                        if (args && typeof args.pageId === 'string') {
                            return await this.getWebflowPageMetadata(args.pageId);
                        }
                        throw new Error('pageId is required and must be a string');
                    case 'get_webflow_page_content':
                        if (args && typeof args.pageId === 'string') {
                            return await this.getWebflowPageContent(args.pageId);
                        }
                        throw new Error('pageId is required and must be a string');
                    case 'update_webflow_page_settings':
                        if (args && typeof args.pageId === 'string' && args.body) {
                            return await this.updateWebflowPageSettings(args.pageId, args.body);
                        }
                        throw new Error('pageId and body are required');
                    case 'update_webflow_static_content':
                        if (args && typeof args.pageId === 'string' && args.body) {
                            return await this.updateWebflowStaticContent(args.pageId, args.body);
                        }
                        throw new Error('pageId and body are required');
                    case 'create_webflow_page':
                        if (args && typeof args.siteId === 'string' && args.body) {
                            return await this.createWebflowPage(args.siteId, args.body);
                        }
                        throw new Error('siteId and body are required');
                    case 'delete_webflow_page':
                        if (args && typeof args.pageId === 'string') {
                            return await this.deleteWebflowPage(args.pageId);
                        }
                        throw new Error('pageId is required and must be a string');

                    // COMPONENTS MANAGEMENT
                    case 'list_webflow_components':
                        if (args && typeof args.siteId === 'string') {
                            return await this.listWebflowComponents(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');
                    case 'get_webflow_component_content':
                        if (args && typeof args.componentId === 'string') {
                            return await this.getWebflowComponentContent(args.componentId);
                        }
                        throw new Error('componentId is required and must be a string');
                    case 'update_webflow_component_content':
                        if (args && typeof args.componentId === 'string' && args.body) {
                            return await this.updateWebflowComponentContent(args.componentId, args.body);
                        }
                        throw new Error('componentId and body are required');
                    case 'get_webflow_component_properties':
                        if (args && typeof args.componentId === 'string') {
                            return await this.getWebflowComponentProperties(args.componentId);
                        }
                        throw new Error('componentId is required and must be a string');
                    case 'update_webflow_component_properties':
                        if (args && typeof args.componentId === 'string' && args.body) {
                            return await this.updateWebflowComponentProperties(args.componentId, args.body);
                        }
                        throw new Error('componentId and body are required');

                    // CMS MANAGEMENT
                    case 'list_webflow_collections':
                        if (args && typeof args.siteId === 'string') {
                            return await this.listWebflowCollections(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');
                    case 'get_webflow_collection':
                        if (args && typeof args.collectionId === 'string') {
                            return await this.getWebflowCollection(args.collectionId);
                        }
                        throw new Error('collectionId is required and must be a string');
                    case 'create_webflow_collection':
                        if (args && typeof args.siteId === 'string' && args.body) {
                            return await this.createWebflowCollection(args.siteId, args.body);
                        }
                        throw new Error('siteId and body are required');
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
                    case 'create_webflow_collection_item_live':
                        if (args && typeof args.collectionId === 'string' && args.body) {
                            return await this.createWebflowCollectionItemLive(args.collectionId, args.body);
                        }
                        throw new Error('collectionId and body are required');
                    case 'update_webflow_collection_items_live':
                        if (args && typeof args.collectionId === 'string' && args.body) {
                            return await this.updateWebflowCollectionItemsLive(args.collectionId, args.body);
                        }
                        throw new Error('collectionId and body are required');
                    case 'list_webflow_collection_items':
                        if (args && typeof args.collectionId === 'string') {
                            return await this.listWebflowCollectionItems(args.collectionId);
                        }
                        throw new Error('collectionId is required and must be a string');
                    case 'publish_webflow_collection_items':
                        if (args && typeof args.collectionId === 'string' && args.body) {
                            return await this.publishWebflowCollectionItems(args.collectionId, args.body);
                        }
                        throw new Error('collectionId and body are required');

                    // FORM MANAGEMENT
                    case 'get_webflow_form_submissions':
                        if (args && typeof args.siteId === 'string') {
                            return await this.getWebflowFormSubmissions(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');

                    // CUSTOM CODE MANAGEMENT
                    case 'add_webflow_inline_site_script':
                        if (args && typeof args.siteId === 'string' && args.body) {
                            return await this.addWebflowInlineSiteScript(args.siteId, args.body);
                        }
                        throw new Error('siteId and body are required');
                    case 'get_webflow_registered_site_scripts':
                        if (args && typeof args.siteId === 'string') {
                            return await this.getWebflowRegisteredSiteScripts(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');
                    case 'get_webflow_applied_site_scripts':
                        if (args && typeof args.siteId === 'string') {
                            return await this.getWebflowAppliedSiteScripts(args.siteId);
                        }
                        throw new Error('siteId is required and must be a string');
                    case 'delete_webflow_site_custom_code':
                        if (args && typeof args.siteId === 'string' && typeof args.scriptId === 'string') {
                            return await this.deleteWebflowSiteCustomCode(args.siteId, args.scriptId);
                        }
                        throw new Error('siteId and scriptId are required');

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

    // SITES MANAGEMENT METHODS
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

    private async getWebflowSiteDomains(siteId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/sites/${siteId}/domains`, {
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

    // PAGES MANAGEMENT METHODS
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

    private async getWebflowPageMetadata(pageId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/pages/${pageId}`, {
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

    private async getWebflowPageContent(pageId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/pages/${pageId}/content`, {
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

    private async updateWebflowPageSettings(pageId: string, body: any) {
        const response = await axios.patch(`https://api.webflow.com/v2/pages/${pageId}`, body, {
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

    private async updateWebflowStaticContent(pageId: string, body: any) {
        const response = await axios.patch(`https://api.webflow.com/v2/pages/${pageId}/content`, body, {
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

    private async createWebflowPage(siteId: string, body: any) {
        const response = await axios.post(`https://api.webflow.com/v2/sites/${siteId}/pages`, body, {
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

    private async deleteWebflowPage(pageId: string) {
        const response = await axios.delete(`https://api.webflow.com/v2/pages/${pageId}`, {
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

    // COMPONENTS MANAGEMENT METHODS
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

    private async getWebflowComponentContent(componentId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/components/${componentId}/content`, {
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

    private async updateWebflowComponentContent(componentId: string, body: any) {
        const response = await axios.patch(`https://api.webflow.com/v2/components/${componentId}/content`, body, {
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

    private async getWebflowComponentProperties(componentId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/components/${componentId}/properties`, {
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

    private async updateWebflowComponentProperties(componentId: string, body: any) {
        const response = await axios.patch(`https://api.webflow.com/v2/components/${componentId}/properties`, body, {
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

    // CMS MANAGEMENT METHODS
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

    private async getWebflowCollection(collectionId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/collections/${collectionId}`, {
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

    private async createWebflowCollection(siteId: string, body: any) {
        const response = await axios.post(`https://api.webflow.com/v2/sites/${siteId}/collections`, body, {
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

    private async createWebflowCollectionItemLive(collectionId: string, body: any) {
        const response = await axios.post(`https://api.webflow.com/v2/collections/${collectionId}/items/live`, body, {
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

    private async updateWebflowCollectionItemsLive(collectionId: string, body: any) {
        const response = await axios.patch(`https://api.webflow.com/v2/collections/${collectionId}/items/live`, body, {
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

    private async listWebflowCollectionItems(collectionId: string) {
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

    private async publishWebflowCollectionItems(collectionId: string, body: any) {
        const response = await axios.post(`https://api.webflow.com/v2/collections/${collectionId}/items/publish`, body, {
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

    // FORM MANAGEMENT METHODS
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

    // CUSTOM CODE MANAGEMENT METHODS
    private async addWebflowInlineSiteScript(siteId: string, body: any) {
        const response = await axios.post(`https://api.webflow.com/v2/sites/${siteId}/custom_code`, body, {
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

    private async getWebflowRegisteredSiteScripts(siteId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/sites/${siteId}/custom_code`, {
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

    private async getWebflowAppliedSiteScripts(siteId: string) {
        const response = await axios.get(`https://api.webflow.com/v2/sites/${siteId}/custom_code/applied`, {
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

    private async deleteWebflowSiteCustomCode(siteId: string, scriptId: string) {
        const response = await axios.delete(`https://api.webflow.com/v2/sites/${siteId}/custom_code/${scriptId}`, {
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

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}

// Start the server
const server = new EnhancedWebflowMCPServer();
server.start().catch(console.error);
