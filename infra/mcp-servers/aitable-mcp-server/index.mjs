#!/usr/bin/env node

/**
 * Aitable.ai MCP Server
 * Provides CRUD access to Aitable datasheets via the Fusion API.
 * Transport: stdio (for Claude Desktop / Claude Code)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_TOKEN = process.env.AITABLE_API_TOKEN;
if (!API_TOKEN) {
  console.error('FATAL: AITABLE_API_TOKEN environment variable is required');
  process.exit(1);
}

const BASE_URL = process.env.AITABLE_BASE_URL || 'https://aitable.ai/fusion/v1';
const DEFAULT_SPACE_ID = process.env.AITABLE_SPACE_ID || 'spc63cnXLdMYc';

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function aitableRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await res.json();

  if (!res.ok || (body.success === false)) {
    const msg = body.message || body.error || JSON.stringify(body);
    throw new Error(`Aitable API error (${res.status}): ${msg}`);
  }

  return body;
}

async function aitableGet(path) {
  return aitableRequest(path, { method: 'GET' });
}

async function aitablePost(path, data) {
  return aitableRequest(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function aitablePatch(path, data) {
  return aitableRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function aitableDelete(path) {
  return aitableRequest(path, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function listDatasheets(spaceId) {
  const sid = spaceId || DEFAULT_SPACE_ID;
  const result = await aitableGet(`/spaces/${sid}/nodes`);
  // Filter to datasheets only (type "Datasheet") for clarity
  const nodes = result.data?.nodes || [];
  const datasheets = nodes.filter(n => n.type === 'Datasheet');
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            spaceId: sid,
            totalNodes: nodes.length,
            datasheets: datasheets.map(d => ({
              id: d.id,
              name: d.name,
              icon: d.icon,
              type: d.type,
            })),
            otherNodes: nodes
              .filter(n => n.type !== 'Datasheet')
              .map(n => ({ id: n.id, name: n.name, type: n.type })),
          },
          null,
          2,
        ),
      },
    ],
  };
}

async function getFields(datasheetId) {
  const result = await aitableGet(`/datasheets/${datasheetId}/fields`);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            datasheetId,
            fields: result.data?.fields || [],
          },
          null,
          2,
        ),
      },
    ],
  };
}

async function getRecords(datasheetId, pageSize, pageNum, viewId, fieldNames) {
  const params = new URLSearchParams();
  if (pageSize) params.set('pageSize', String(pageSize));
  if (pageNum) params.set('pageNum', String(pageNum));
  if (viewId) params.set('viewId', viewId);
  if (fieldNames && fieldNames.length > 0) {
    // Aitable accepts repeated fieldNames params
    for (const fn of fieldNames) {
      params.append('fieldNames', fn);
    }
  }

  const qs = params.toString();
  const path = `/datasheets/${datasheetId}/records${qs ? '?' + qs : ''}`;
  const result = await aitableGet(path);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            datasheetId,
            total: result.data?.total,
            pageNum: result.data?.pageNum,
            pageSize: result.data?.pageSize,
            records: result.data?.records || [],
          },
          null,
          2,
        ),
      },
    ],
  };
}

async function createRecords(datasheetId, records) {
  if (!records || records.length === 0) {
    throw new Error('records array is required and must not be empty');
  }

  // Ensure each record has a "fields" key
  const payload = records.map(r => {
    if (r.fields) return r;
    return { fields: r };
  });

  const result = await aitablePost(`/datasheets/${datasheetId}/records`, {
    records: payload,
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            datasheetId,
            created: result.data?.records || [],
          },
          null,
          2,
        ),
      },
    ],
  };
}

async function updateRecords(datasheetId, records) {
  if (!records || records.length === 0) {
    throw new Error('records array is required and must not be empty');
  }

  for (const r of records) {
    if (!r.recordId) {
      throw new Error('Each record must have a recordId');
    }
    if (!r.fields) {
      throw new Error('Each record must have a fields object');
    }
  }

  const result = await aitablePatch(`/datasheets/${datasheetId}/records`, {
    records,
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            datasheetId,
            updated: result.data?.records || [],
          },
          null,
          2,
        ),
      },
    ],
  };
}

async function deleteRecords(datasheetId, recordIds) {
  if (!recordIds || recordIds.length === 0) {
    throw new Error('recordIds array is required and must not be empty');
  }

  const qs = recordIds.map(id => `recordIds=${id}`).join('&');
  const result = await aitableDelete(`/datasheets/${datasheetId}/records?${qs}`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            datasheetId,
            deleted: true,
            recordIds,
            message: 'Records deleted successfully',
          },
          null,
          2,
        ),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

class AitableMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'aitable-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // -- List tools --------------------------------------------------------
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'aitable_list_datasheets',
            description:
              'List all datasheets (and other nodes) in an Aitable space. Returns datasheet IDs and names.',
            inputSchema: {
              type: 'object',
              properties: {
                spaceId: {
                  type: 'string',
                  description:
                    'Space ID. Defaults to the configured space if omitted.',
                },
              },
            },
          },
          {
            name: 'aitable_get_fields',
            description:
              'Get field definitions (columns) for a specific Aitable datasheet. Useful to understand the schema before reading or writing records.',
            inputSchema: {
              type: 'object',
              properties: {
                datasheetId: {
                  type: 'string',
                  description: 'The datasheet ID (e.g. dstXXXX)',
                },
              },
              required: ['datasheetId'],
            },
          },
          {
            name: 'aitable_get_records',
            description:
              'Get records from an Aitable datasheet. Supports pagination and optional field filtering.',
            inputSchema: {
              type: 'object',
              properties: {
                datasheetId: {
                  type: 'string',
                  description: 'The datasheet ID (e.g. dstXXXX)',
                },
                pageSize: {
                  type: 'number',
                  description: 'Number of records per page (max 1000, default 100)',
                },
                pageNum: {
                  type: 'number',
                  description: 'Page number (1-based, default 1)',
                },
                viewId: {
                  type: 'string',
                  description: 'Optional view ID to filter by a specific view',
                },
                fieldNames: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'Optional list of field names to return. If omitted, all fields are returned.',
                },
              },
              required: ['datasheetId'],
            },
          },
          {
            name: 'aitable_create_records',
            description:
              'Create one or more records in an Aitable datasheet. Each record should have a "fields" object mapping field names to values.',
            inputSchema: {
              type: 'object',
              properties: {
                datasheetId: {
                  type: 'string',
                  description: 'The datasheet ID (e.g. dstXXXX)',
                },
                records: {
                  type: 'array',
                  items: {
                    type: 'object',
                    description:
                      'Record object with a "fields" key, e.g. {"fields": {"Name": "Test", "Status": "Active"}}',
                  },
                  description: 'Array of record objects to create',
                },
              },
              required: ['datasheetId', 'records'],
            },
          },
          {
            name: 'aitable_update_records',
            description:
              'Update one or more existing records in an Aitable datasheet. Each record must include "recordId" and "fields".',
            inputSchema: {
              type: 'object',
              properties: {
                datasheetId: {
                  type: 'string',
                  description: 'The datasheet ID (e.g. dstXXXX)',
                },
                records: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      recordId: {
                        type: 'string',
                        description: 'The record ID to update (e.g. recXXXX)',
                      },
                      fields: {
                        type: 'object',
                        description:
                          'Object mapping field names to their new values',
                      },
                    },
                    required: ['recordId', 'fields'],
                  },
                  description: 'Array of record objects to update',
                },
              },
              required: ['datasheetId', 'records'],
            },
          },
          {
            name: 'aitable_delete_records',
            description:
              'Delete one or more records from an Aitable datasheet by their record IDs.',
            inputSchema: {
              type: 'object',
              properties: {
                datasheetId: {
                  type: 'string',
                  description: 'The datasheet ID (e.g. dstXXXX)',
                },
                recordIds: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of record IDs to delete (e.g. ["recXXXX"])',
                },
              },
              required: ['datasheetId', 'recordIds'],
            },
          },
        ],
      };
    });

    // -- Call tools ---------------------------------------------------------
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'aitable_list_datasheets':
            return await listDatasheets(args?.spaceId);

          case 'aitable_get_fields':
            return await getFields(args.datasheetId);

          case 'aitable_get_records':
            return await getRecords(
              args.datasheetId,
              args.pageSize,
              args.pageNum,
              args.viewId,
              args.fieldNames,
            );

          case 'aitable_create_records':
            return await createRecords(args.datasheetId, args.records);

          case 'aitable_update_records':
            return await updateRecords(args.datasheetId, args.records);

          case 'aitable_delete_records':
            return await deleteRecords(args.datasheetId, args.recordIds);

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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Aitable MCP Server running on stdio');
  }
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const server = new AitableMCPServer();
server.run().catch(console.error);
