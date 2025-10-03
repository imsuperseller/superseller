#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@notionhq/client';

class NotionMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'notion-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_notion_page',
            description: 'Create a new page in Notion',
            inputSchema: {
              type: 'object',
              properties: {
                parent_id: {
                  type: 'string',
                  description: 'The ID of the parent page or database',
                },
                title: {
                  type: 'string',
                  description: 'The title of the page',
                },
                content: {
                  type: 'string',
                  description: 'The content of the page in markdown format',
                },
                properties: {
                  type: 'object',
                  description: 'Additional properties for the page',
                },
              },
              required: ['parent_id', 'title'],
            },
          },
          {
            name: 'create_notion_database',
            description: 'Create a new database in Notion',
            inputSchema: {
              type: 'object',
              properties: {
                parent_id: {
                  type: 'string',
                  description: 'The ID of the parent page',
                },
                title: {
                  type: 'string',
                  description: 'The title of the database',
                },
                properties: {
                  type: 'object',
                  description: 'The properties of the database',
                },
              },
              required: ['parent_id', 'title'],
            },
          },
          {
            name: 'get_notion_page',
            description: 'Get a page from Notion',
            inputSchema: {
              type: 'object',
              properties: {
                page_id: {
                  type: 'string',
                  description: 'The ID of the page to retrieve',
                },
              },
              required: ['page_id'],
            },
          },
          {
            name: 'update_notion_page',
            description: 'Update a page in Notion',
            inputSchema: {
              type: 'object',
              properties: {
                page_id: {
                  type: 'string',
                  description: 'The ID of the page to update',
                },
                properties: {
                  type: 'object',
                  description: 'The properties to update',
                },
                content: {
                  type: 'string',
                  description: 'The new content for the page',
                },
              },
              required: ['page_id'],
            },
          },
          {
            name: 'search_notion',
            description: 'Search for pages and databases in Notion',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query',
                },
                filter: {
                  type: 'object',
                  description: 'Filter options for the search',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'list_notion_databases',
            description: 'List all databases in the workspace',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'query_notion_database',
            description: 'Query a database in Notion',
            inputSchema: {
              type: 'object',
              properties: {
                database_id: {
                  type: 'string',
                  description: 'The ID of the database to query',
                },
                filter: {
                  type: 'object',
                  description: 'Filter options for the query',
                },
                sorts: {
                  type: 'array',
                  description: 'Sort options for the query',
                },
              },
              required: ['database_id'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_notion_page':
            return await this.createPage(args);
          case 'create_notion_database':
            return await this.createDatabase(args);
          case 'get_notion_page':
            return await this.getPage(args);
          case 'update_notion_page':
            return await this.updatePage(args);
          case 'search_notion':
            return await this.search(args);
          case 'list_notion_databases':
            return await this.listDatabases();
          case 'query_notion_database':
            return await this.queryDatabase(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async createPage(args) {
    const { parent_id, title, content, properties = {} } = args;

    const pageData = {
      parent: { page_id: parent_id },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        ...properties,
      },
    };

    if (content) {
      // Convert markdown to Notion blocks
      const blocks = this.markdownToNotionBlocks(content);
      pageData.children = blocks;
    }

    const response = await this.notion.pages.create(pageData);

    return {
      content: [
        {
          type: 'text',
          text: `Page created successfully: ${response.url}`,
        },
      ],
    };
  }

  async createDatabase(args) {
    const { parent_id, title, properties = {} } = args;

    const databaseData = {
      parent: { page_id: parent_id },
      title: [
        {
          text: {
            content: title,
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        ...properties,
      },
    };

    const response = await this.notion.databases.create(databaseData);

    return {
      content: [
        {
          type: 'text',
          text: `Database created successfully: ${response.url}`,
        },
      ],
    };
  }

  async getPage(args) {
    const { page_id } = args;

    const response = await this.notion.pages.retrieve({ page_id });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  async updatePage(args) {
    const { page_id, properties, content } = args;

    const updateData = {};

    if (properties) {
      updateData.properties = properties;
    }

    if (content) {
      const blocks = this.markdownToNotionBlocks(content);
      await this.notion.blocks.children.append({
        block_id: page_id,
        children: blocks,
      });
    }

    const response = await this.notion.pages.update({
      page_id,
      ...updateData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Page updated successfully: ${response.url}`,
        },
      ],
    };
  }

  async search(args) {
    const { query, filter } = args;

    const searchData = {
      query,
      ...(filter && { filter }),
    };

    const response = await this.notion.search(searchData);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  async listDatabases() {
    const response = await this.notion.search({
      filter: {
        property: 'object',
        value: 'database',
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  async queryDatabase(args) {
    const { database_id, filter, sorts } = args;

    const queryData = {
      database_id,
      ...(filter && { filter }),
      ...(sorts && { sorts }),
    };

    const response = await this.notion.databases.query(queryData);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  markdownToNotionBlocks(markdown) {
    // Simple markdown to Notion blocks converter
    const lines = markdown.split('\n');
    const blocks = [];

    for (const line of lines) {
      if (line.trim() === '') {
        continue;
      }

      if (line.startsWith('# ')) {
        blocks.push({
          type: 'heading_1',
          heading_1: {
            rich_text: [
              {
                text: {
                  content: line.substring(2),
                },
              },
            ],
          },
        });
      } else if (line.startsWith('## ')) {
        blocks.push({
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                text: {
                  content: line.substring(3),
                },
              },
            ],
          },
        });
      } else if (line.startsWith('### ')) {
        blocks.push({
          type: 'heading_3',
          heading_3: {
            rich_text: [
              {
                text: {
                  content: line.substring(4),
                },
              },
            ],
          },
        });
      } else if (line.startsWith('- ')) {
        blocks.push({
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                text: {
                  content: line.substring(2),
                },
              },
            ],
          },
        });
      } else if (line.startsWith('1. ')) {
        blocks.push({
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [
              {
                text: {
                  content: line.substring(3),
                },
              },
            ],
          },
        });
      } else {
        blocks.push({
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: line,
                },
              },
            ],
          },
        });
      }
    }

    return blocks;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Notion MCP server running on stdio');
  }
}

const server = new NotionMCPServer();
server.run().catch(console.error);
