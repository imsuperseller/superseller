#!/usr/bin/env node

/**
 * Rensto MCP Server Template
 * Based on tutorial: "Build an MCP server even if you're not a dev"
 * 
 * This template demonstrates the 10-15 minute MCP server build process
 * with automated testing and Claude Desktop integration.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import tools
import { calculatorTools, handleCalculatorTool } from './tools/calculator.js';
import { fileTools, handleFileTool } from './tools/files.js';
import { apiTools, handleApiTool } from './tools/api.js';

// Import resources
import { fileResources, readFileResource } from './resources/files.js';

class RenstoMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "rensto-mcp-template",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Tool handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          ...calculatorTools,
          ...fileTools,
          ...apiTools,
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Route to appropriate tool handler
        if (calculatorTools.some(tool => tool.name === name)) {
          return await handleCalculatorTool(name, args);
        } else if (fileTools.some(tool => tool.name === name)) {
          return await handleFileTool(name, args);
        } else if (apiTools.some(tool => tool.name === name)) {
          return await handleApiTool(name, args);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error handling tool ${name}:`, error);
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

    // Resource handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          ...fileResources,
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      try {
        if (uri.startsWith('file://')) {
          return await readFileResource(uri);
        } else {
          throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        console.error(`Error reading resource ${uri}:`, error);
        throw error;
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Rensto MCP Server Template is running on stdio");
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new RenstoMCPServer();
  server.start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
