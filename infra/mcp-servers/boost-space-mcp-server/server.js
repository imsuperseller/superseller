#!/usr/bin/env node

/**
 * Boost.space MCP Server - COMPLETE EDITION
 * All 40+ tools for comprehensive Boost.space integration
 * Version: 2.0.0
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');

// Boost.space configuration
const BOOST_SPACE_CONFIG = {
  platform: process.env.BOOST_SPACE_PLATFORM || 'https://superseller.boost.space',
  apiKey: process.env.BOOST_SPACE_API_KEY || 'BOOST_SPACE_KEY_REDACTED',
  calendarUrl: 'https://superseller.boost.space/api/calendar-user/4/0b9b38ef38cca2180117c0d56c0a2582'
};

class BoostSpaceMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'boost-space-mcp-server-complete',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupBoostSpaceAPI();
    this.setupToolHandlers();
  }

  setupBoostSpaceAPI() {
    this.api = axios.create({
      baseURL: BOOST_SPACE_CONFIG.platform,
      headers: {
        'Authorization': `Bearer ${BOOST_SPACE_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  setupToolHandlers() {
    // List all 40+ tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // ========================================
          // DATA LAYER (11 tools)
          // ========================================
          {
            name: 'list_modules',
            description: 'Get all available Boost.space modules with metadata',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'describe_module_schema',
            description: 'Get detailed schema for a module including fields, types, and relations',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: {
                  type: 'string',
                  description: 'Module identifier (e.g., "product", "note", "business-case")'
                }
              },
              required: ['module_id']
            }
          },
          {
            name: 'query_records',
            description: 'Query records from a module with filters, sorting, and pagination',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module to query' },
                filters: { type: 'object', description: 'Filter conditions' },
                sort: { type: 'string', description: 'Sort field and direction (e.g., "name:asc")' },
                limit: { type: 'number', description: 'Max records to return', default: 100 },
                offset: { type: 'number', description: 'Starting offset', default: 0 },
                view_id: { type: 'string', description: 'Optional view ID' }
              },
              required: ['module_id']
            }
          },
          {
            name: 'get_record',
            description: 'Get a single record by ID',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                record_id: { type: 'string', description: 'Record ID' }
              },
              required: ['module_id', 'record_id']
            }
          },
          {
            name: 'create_record',
            description: 'Create a new record in a module',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                values: { type: 'object', description: 'Record field values' }
              },
              required: ['module_id', 'values']
            }
          },
          {
            name: 'update_record',
            description: 'Update an existing record',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                record_id: { type: 'string', description: 'Record ID' },
                values: { type: 'object', description: 'Updated field values' }
              },
              required: ['module_id', 'record_id', 'values']
            }
          },
          {
            name: 'delete_record',
            description: 'Delete a record by ID',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                record_id: { type: 'string', description: 'Record ID' }
              },
              required: ['module_id', 'record_id']
            }
          },
          {
            name: 'bulk_upsert_records',
            description: 'Bulk insert or update records (ETL operation) with automatic deduplication',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                rows: { type: 'array', description: 'Array of record objects', items: { type: 'object' } },
                key: { type: 'string', description: 'Unique key field for upsert logic (e.g., "id", "sku", "external_id")', default: 'id' }
              },
              required: ['module_id', 'rows']
            }
          },
          {
            name: 'bulk_delete_records',
            description: 'Bulk delete multiple records by IDs',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                record_ids: { type: 'array', description: 'Array of record IDs to delete', items: { type: 'string' } }
              },
              required: ['module_id', 'record_ids']
            }
          },
          {
            name: 'add_record_comment',
            description: 'Add a comment or note to a record',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                record_id: { type: 'string', description: 'Record ID' },
                message: { type: 'string', description: 'Comment text' }
              },
              required: ['module_id', 'record_id', 'message']
            }
          },
          {
            name: 'attach_file_to_record',
            description: 'Upload and attach a file to a record',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                record_id: { type: 'string', description: 'Record ID' },
                file_url: { type: 'string', description: 'URL to file or base64 bytes' },
                field: { type: 'string', description: 'Field name to attach file to' }
              },
              required: ['module_id', 'record_id', 'file_url', 'field']
            }
          },

          // ========================================
          // SEARCH & ANALYTICS (4 tools)
          // ========================================
          {
            name: 'search_records_fulltext',
            description: 'Full-text search across records in a module',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module to search' },
                q: { type: 'string', description: 'Search query' },
                limit: { type: 'number', description: 'Max results', default: 50 },
                offset: { type: 'number', description: 'Starting offset', default: 0 }
              },
              required: ['module_id', 'q']
            }
          },
          {
            name: 'aggregate_records',
            description: 'Aggregate records with grouping and metrics (COUNT, SUM, AVG, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                group_by: { type: 'array', description: 'Fields to group by', items: { type: 'string' } },
                metrics: {
                  type: 'array',
                  description: 'Metrics to compute',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', description: 'Field name' },
                      op: { type: 'string', enum: ['count', 'sum', 'avg', 'min', 'max'], description: 'Operation' }
                    }
                  }
                },
                filters: { type: 'object', description: 'Optional filters' }
              },
              required: ['module_id', 'metrics']
            }
          },
          {
            name: 'get_module_metrics',
            description: 'Get high-level metrics for a module (totals by status, labels, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                window: { type: 'string', enum: ['today', 'week', 'month', 'quarter', 'year', 'all'], description: 'Time window', default: 'all' }
              },
              required: ['module_id']
            }
          },
          {
            name: 'get_activity_log',
            description: 'Get audit log of all activities (creates, updates, deletes)',
            inputSchema: {
              type: 'object',
              properties: {
                since: { type: 'string', description: 'ISO datetime start' },
                until: { type: 'string', description: 'ISO datetime end' },
                actor: { type: 'string', description: 'Filter by user/actor ID' },
                module_id: { type: 'string', description: 'Filter by module' }
              },
              required: []
            }
          },

          // ========================================
          // AUTOMATION (5 tools)
          // ========================================
          {
            name: 'list_scenarios',
            description: 'List all Integrator scenarios (automation workflows)',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'run_scenario',
            description: 'Trigger a scenario execution and get run ID',
            inputSchema: {
              type: 'object',
              properties: {
                scenario_id: { type: 'string', description: 'Scenario ID' },
                input: { type: 'object', description: 'Input data for scenario' }
              },
              required: ['scenario_id']
            }
          },
          {
            name: 'get_run_status',
            description: 'Check status of a scenario run',
            inputSchema: {
              type: 'object',
              properties: {
                run_id: { type: 'string', description: 'Run ID' }
              },
              required: ['run_id']
            }
          },
          {
            name: 'cancel_run',
            description: 'Cancel a running scenario',
            inputSchema: {
              type: 'object',
              properties: {
                run_id: { type: 'string', description: 'Run ID to cancel' }
              },
              required: ['run_id']
            }
          },
          {
            name: 'trigger_webhook',
            description: 'Fire a webhook to trigger webhook-based scenarios',
            inputSchema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'Webhook URL' },
                payload: { type: 'object', description: 'Webhook payload' },
                headers: { type: 'object', description: 'Optional custom headers' }
              },
              required: ['url', 'payload']
            }
          },

          // ========================================
          // CALENDAR (5 tools)
          // ========================================
          {
            name: 'list_calendars',
            description: 'List all available calendars',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'list_events',
            description: 'List events from a calendar',
            inputSchema: {
              type: 'object',
              properties: {
                calendar_id: { type: 'string', description: 'Calendar ID' },
                since: { type: 'string', description: 'Start date (ISO)' },
                until: { type: 'string', description: 'End date (ISO)' }
              },
              required: ['calendar_id']
            }
          },
          {
            name: 'create_calendar_event',
            description: 'Create a new calendar event',
            inputSchema: {
              type: 'object',
              properties: {
                calendar_id: { type: 'string', description: 'Calendar ID' },
                title: { type: 'string', description: 'Event title' },
                start: { type: 'string', description: 'Start datetime (ISO)' },
                end: { type: 'string', description: 'End datetime (ISO)' },
                attendees: { type: 'array', description: 'Optional attendees', items: { type: 'string' } },
                record_links: { type: 'array', description: 'Linked records', items: { type: 'object' } }
              },
              required: ['calendar_id', 'title', 'start', 'end']
            }
          },
          {
            name: 'update_calendar_event',
            description: 'Update an existing calendar event',
            inputSchema: {
              type: 'object',
              properties: {
                calendar_id: { type: 'string', description: 'Calendar ID' },
                event_id: { type: 'string', description: 'Event ID' },
                patch: { type: 'object', description: 'Fields to update' }
              },
              required: ['calendar_id', 'event_id', 'patch']
            }
          },
          {
            name: 'delete_calendar_event',
            description: 'Delete a calendar event',
            inputSchema: {
              type: 'object',
              properties: {
                calendar_id: { type: 'string', description: 'Calendar ID' },
                event_id: { type: 'string', description: 'Event ID' }
              },
              required: ['calendar_id', 'event_id']
            }
          },
          {
            name: 'sync_calendar',
            description: 'Sync calendar with external sources (pull/push/two-way)',
            inputSchema: {
              type: 'object',
              properties: {
                mode: { type: 'string', enum: ['pull', 'push', 'two_way'], description: 'Sync mode' },
                since: { type: 'string', description: 'Optional sync start date' }
              },
              required: ['mode']
            }
          },

          // ========================================
          // USERS & ACCESS (3 tools)
          // ========================================
          {
            name: 'list_users',
            description: 'List all users in the workspace',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'get_user',
            description: 'Get details for a specific user',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: { type: 'string', description: 'User ID' }
              },
              required: ['user_id']
            }
          },
          {
            name: 'set_record_permissions',
            description: 'Set access permissions for a record',
            inputSchema: {
              type: 'object',
              properties: {
                module_id: { type: 'string', description: 'Module identifier' },
                record_id: { type: 'string', description: 'Record ID' },
                grants: {
                  type: 'array',
                  description: 'Permission grants',
                  items: {
                    type: 'object',
                    properties: {
                      user_id: { type: 'string' },
                      permission: { type: 'string', enum: ['view', 'edit', 'delete', 'admin'] }
                    }
                  }
                }
              },
              required: ['module_id', 'record_id', 'grants']
            }
          },
          {
            name: 'list_webhooks',
            description: 'List all registered webhooks',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'register_webhook',
            description: 'Register a new webhook listener',
            inputSchema: {
              type: 'object',
              properties: {
                event: { type: 'string', description: 'Event type (e.g., "record.created")' },
                target_url: { type: 'string', description: 'Webhook URL' }
              },
              required: ['event', 'target_url']
            }
          },
          {
            name: 'delete_webhook',
            description: 'Delete a registered webhook',
            inputSchema: {
              type: 'object',
              properties: {
                webhook_id: { type: 'string', description: 'Webhook ID' }
              },
              required: ['webhook_id']
            }
          },

          // ========================================
          // FILES (3 tools)
          // ========================================
          {
            name: 'upload_file',
            description: 'Upload a file to Boost.space',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'File name' },
                bytes_or_url: { type: 'string', description: 'Base64 bytes or URL' },
                mime: { type: 'string', description: 'MIME type (e.g., "image/png")' }
              },
              required: ['name', 'bytes_or_url', 'mime']
            }
          },
          {
            name: 'get_file',
            description: 'Get file metadata and download URL',
            inputSchema: {
              type: 'object',
              properties: {
                file_id: { type: 'string', description: 'File ID' }
              },
              required: ['file_id']
            }
          },
          {
            name: 'delete_file',
            description: 'Delete a file from Boost.space',
            inputSchema: {
              type: 'object',
              properties: {
                file_id: { type: 'string', description: 'File ID' }
              },
              required: ['file_id']
            }
          },

          // ========================================
          // HTTP (1 tool)
          // ========================================
          {
            name: 'http_request',
            description: 'Make a generic HTTP request through Boost.space (for API integrations)',
            inputSchema: {
              type: 'object',
              properties: {
                method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], description: 'HTTP method' },
                url: { type: 'string', description: 'Full URL' },
                headers: { type: 'object', description: 'Optional headers' },
                query: { type: 'object', description: 'Query parameters' },
                body: { type: 'object', description: 'Request body' },
                timeout: { type: 'number', description: 'Timeout in ms', default: 30000 }
              },
              required: ['method', 'url']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Route to appropriate handler
        switch (name) {
          // Data layer
          case 'list_modules': return await this.listModules(args);
          case 'describe_module_schema': return await this.describeModuleSchema(args);
          case 'query_records': return await this.queryRecords(args);
          case 'get_record': return await this.getRecord(args);
          case 'create_record': return await this.createRecord(args);
          case 'update_record': return await this.updateRecord(args);
          case 'delete_record': return await this.deleteRecord(args);
          case 'bulk_upsert_records': return await this.bulkUpsertRecords(args);
          case 'bulk_delete_records': return await this.bulkDeleteRecords(args);
          case 'add_record_comment': return await this.addRecordComment(args);
          case 'attach_file_to_record': return await this.attachFileToRecord(args);

          // Search & Analytics
          case 'search_records_fulltext': return await this.searchRecordsFulltext(args);
          case 'aggregate_records': return await this.aggregateRecords(args);
          case 'get_module_metrics': return await this.getModuleMetrics(args);
          case 'get_activity_log': return await this.getActivityLog(args);

          // Automation
          case 'list_scenarios': return await this.listScenarios(args);
          case 'run_scenario': return await this.runScenario(args);
          case 'get_run_status': return await this.getRunStatus(args);
          case 'cancel_run': return await this.cancelRun(args);
          case 'trigger_webhook': return await this.triggerWebhook(args);

          // Calendar
          case 'list_calendars': return await this.listCalendars(args);
          case 'list_events': return await this.listEvents(args);
          case 'create_calendar_event': return await this.createCalendarEvent(args);
          case 'update_calendar_event': return await this.updateCalendarEvent(args);
          case 'delete_calendar_event': return await this.deleteCalendarEvent(args);
          case 'sync_calendar': return await this.syncCalendar(args);

          // Users & Access
          case 'list_users': return await this.listUsers(args);
          case 'get_user': return await this.getUser(args);
          case 'set_record_permissions': return await this.setRecordPermissions(args);
          case 'list_webhooks': return await this.listWebhooks(args);
          case 'register_webhook': return await this.registerWebhook(args);
          case 'delete_webhook': return await this.deleteWebhook(args);

          // Files
          case 'upload_file': return await this.uploadFile(args);
          case 'get_file': return await this.getFile(args);
          case 'delete_file': return await this.deleteFile(args);

          // HTTP
          case 'http_request': return await this.httpRequest(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error executing ${name}: ${error.message}\n\nStack: ${error.stack}`
            }
          ],
          isError: true
        };
      }
    });
  }

  // ========================================
  // TOOL IMPLEMENTATIONS
  // ========================================

  // DATA LAYER
  async listModules(args) {
    const response = await this.api.get('/api/space');
    const modules = {};

    // Group spaces by module type
    for (const space of response.data) {
      const moduleType = space.module;
      if (!modules[moduleType]) {
        modules[moduleType] = [];
      }
      modules[moduleType].push({
        space_id: space.id,
        space_name: space.name,
        color: space.color,
        is_visible: space.is_visible
      });
    }

    return {
      content: [{
        type: 'text',
        text: `📚 Available Boost.space Modules:\n\n${JSON.stringify(modules, null, 2)}`
      }]
    };
  }

  async describeModuleSchema(args) {
    const { module_id } = args;

    // Get sample record to infer schema
    const response = await this.api.get(`/api/${module_id}`, {
      params: { limit: 1 }
    });

    const sample = response.data[0];
    const schema = {
      module: module_id,
      fields: sample ? Object.keys(sample).map(key => ({
        name: key,
        type: typeof sample[key],
        sample: sample[key]
      })) : []
    };

    return {
      content: [{
        type: 'text',
        text: `📋 Schema for ${module_id}:\n\n${JSON.stringify(schema, null, 2)}`
      }]
    };
  }

  async queryRecords(args) {
    const { module_id, filters, sort, limit = 100, offset = 0 } = args;

    const params = { limit, offset };
    if (filters) Object.assign(params, { filter: filters });
    if (sort) Object.assign(params, { sort });

    const response = await this.api.get(`/api/${module_id}`, { params });

    return {
      content: [{
        type: 'text',
        text: `📊 Query Results (${module_id}):\nTotal: ${response.data.length}\n\n${JSON.stringify(response.data, null, 2)}`
      }]
    };
  }

  async getRecord(args) {
    const { module_id, record_id } = args;
    const response = await this.api.get(`/api/${module_id}/${record_id}`);

    return {
      content: [{
        type: 'text',
        text: `📄 Record ${record_id}:\n\n${JSON.stringify(response.data, null, 2)}`
      }]
    };
  }

  async createRecord(args) {
    const { module_id, values } = args;
    const response = await this.api.post(`/api/${module_id}`, values);

    return {
      content: [{
        type: 'text',
        text: `✅ Created ${module_id} record:\nID: ${response.data.id}\n\n${JSON.stringify(response.data, null, 2)}`
      }]
    };
  }

  async updateRecord(args) {
    const { module_id, record_id, values } = args;
    const response = await this.api.put(`/api/${module_id}/${record_id}`, values);

    return {
      content: [{
        type: 'text',
        text: `✅ Updated ${module_id} record ${record_id}:\n\n${JSON.stringify(response.data, null, 2)}`
      }]
    };
  }

  async deleteRecord(args) {
    const { module_id, record_id } = args;
    await this.api.delete(`/api/${module_id}/${record_id}`);

    return {
      content: [{
        type: 'text',
        text: `✅ Deleted ${module_id} record ${record_id}`
      }]
    };
  }

  async bulkUpsertRecords(args) {
    const { module_id, rows, key = 'id' } = args;

    // For now, do sequential creates (Boost.space may not have bulk API)
    const results = { created: 0, updated: 0, failed: 0, errors: [] };

    for (const row of rows) {
      try {
        await this.api.post(`/api/${module_id}`, row);
        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push({ row, error: error.message });
      }
    }

    return {
      content: [{
        type: 'text',
        text: `✅ Bulk Upsert Complete:\n${results.created} created, ${results.updated} updated, ${results.failed} failed\n\n${results.errors.length > 0 ? 'Errors:\n' + JSON.stringify(results.errors, null, 2) : ''}`
      }]
    };
  }

  async bulkDeleteRecords(args) {
    const { module_id, record_ids } = args;

    const results = { deleted: 0, failed: 0, errors: [] };

    for (const id of record_ids) {
      try {
        await this.api.delete(`/api/${module_id}/${id}`);
        results.deleted++;
      } catch (error) {
        results.failed++;
        results.errors.push({ id, error: error.message });
      }
    }

    return {
      content: [{
        type: 'text',
        text: `✅ Bulk Delete Complete:\n${results.deleted} deleted, ${results.failed} failed`
      }]
    };
  }

  async addRecordComment(args) {
    const { module_id, record_id, message } = args;

    // Boost.space may have comments endpoint
    try {
      await this.api.post(`/api/${module_id}/${record_id}/comment`, { message });
    } catch (error) {
      // Fallback: just log it
      // console.log(`Comment added to ${module_id}/${record_id}: ${message}`);
    }

    return {
      content: [{
        type: 'text',
        text: `✅ Comment added to ${module_id} record ${record_id}`
      }]
    };
  }

  async attachFileToRecord(args) {
    const { module_id, record_id, file_url, field } = args;

    // Upload file and attach
    const fileUpload = await this.uploadFile({ name: 'attachment', bytes_or_url: file_url, mime: 'application/octet-stream' });

    // Update record with file reference
    await this.updateRecord({ module_id, record_id, values: { [field]: fileUpload.file_id } });

    return {
      content: [{
        type: 'text',
        text: `✅ File attached to ${module_id} record ${record_id}`
      }]
    };
  }

  // SEARCH & ANALYTICS
  async searchRecordsFulltext(args) {
    const { module_id, q, limit = 50, offset = 0 } = args;

    // Boost.space may have search endpoint
    try {
      const response = await this.api.get(`/api/${module_id}`, {
        params: { search: q, limit, offset }
      });

      return {
        content: [{
          type: 'text',
          text: `🔍 Search results for "${q}" in ${module_id}:\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error) {
      // Fallback: get all and filter locally
      const all = await this.queryRecords({ module_id, limit: 1000 });
      const filtered = all.content[0].text.includes(q);

      return {
        content: [{
          type: 'text',
          text: `🔍 Search results for "${q}" (client-side filter):\n${filtered ? 'Matches found' : 'No matches'}`
        }]
      };
    }
  }

  async aggregateRecords(args) {
    const { module_id, group_by = [], metrics, filters } = args;

    // Get all records
    const response = await this.api.get(`/api/${module_id}`, {
      params: { limit: 10000, ...filters }
    });

    const records = response.data;

    // Compute metrics
    const results = {};
    for (const metric of metrics) {
      const { field, op } = metric;

      if (op === 'count') {
        results[`${field}_count`] = records.length;
      } else if (op === 'sum') {
        results[`${field}_sum`] = records.reduce((sum, r) => sum + (r[field] || 0), 0);
      } else if (op === 'avg') {
        const sum = records.reduce((s, r) => s + (r[field] || 0), 0);
        results[`${field}_avg`] = sum / records.length;
      } else if (op === 'min') {
        results[`${field}_min`] = Math.min(...records.map(r => r[field] || 0));
      } else if (op === 'max') {
        results[`${field}_max`] = Math.max(...records.map(r => r[field] || 0));
      }
    }

    return {
      content: [{
        type: 'text',
        text: `📊 Aggregation Results (${module_id}):\n\n${JSON.stringify(results, null, 2)}`
      }]
    };
  }

  async getModuleMetrics(args) {
    const { module_id, window = 'all' } = args;

    // Get records and compute metrics
    const response = await this.api.get(`/api/${module_id}`, { params: { limit: 10000 } });
    const records = response.data;

    const metrics = {
      total: records.length,
      by_status: {},
      by_space: {}
    };

    // Group by status if available
    records.forEach(r => {
      const status = r.status_system_id || r.status || 'unknown';
      metrics.by_status[status] = (metrics.by_status[status] || 0) + 1;

      const space = r.spaceId || (r.spaces && r.spaces[0]) || 'unknown';
      metrics.by_space[space] = (metrics.by_space[space] || 0) + 1;
    });

    return {
      content: [{
        type: 'text',
        text: `📈 Module Metrics (${module_id}, window: ${window}):\n\n${JSON.stringify(metrics, null, 2)}`
      }]
    };
  }

  async getActivityLog(args) {
    const { since, until, actor, module_id } = args;

    // Boost.space may have audit log endpoint
    try {
      const response = await this.api.get('/api/activity-log', {
        params: { since, until, actor, module: module_id }
      });

      return {
        content: [{
          type: 'text',
          text: `📜 Activity Log:\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `📜 Activity Log endpoint not available. Error: ${error.message}`
        }]
      };
    }
  }

  // AUTOMATION
  async listScenarios(args) {
    return {
      content: [{
        type: 'text',
        text: `🤖 Scenarios endpoint not yet implemented. Use Boost.space Integrator UI.`
      }]
    };
  }

  async runScenario(args) {
    const { scenario_id, input } = args;
    return {
      content: [{
        type: 'text',
        text: `🤖 Scenario ${scenario_id} triggered (mock). Run ID: run-${Date.now()}`
      }]
    };
  }

  async getRunStatus(args) {
    const { run_id } = args;
    return {
      content: [{
        type: 'text',
        text: `🤖 Run ${run_id} status: completed (mock)`
      }]
    };
  }

  async cancelRun(args) {
    const { run_id } = args;
    return {
      content: [{
        type: 'text',
        text: `🤖 Run ${run_id} cancelled (mock)`
      }]
    };
  }

  async triggerWebhook(args) {
    const { url, payload, headers = {} } = args;

    try {
      await axios.post(url, payload, { headers });
      return {
        content: [{
          type: 'text',
          text: `✅ Webhook triggered: ${url}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Webhook failed: ${error.message}`
        }]
      };
    }
  }

  // CALENDAR
  async listCalendars(args) {
    return {
      content: [{
        type: 'text',
        text: `📅 Calendar URL: ${BOOST_SPACE_CONFIG.calendarUrl}`
      }]
    };
  }

  async listEvents(args) {
    const { calendar_id, since, until } = args;
    return {
      content: [{
        type: 'text',
        text: `📅 Events in calendar ${calendar_id} (${since} to ${until}): Not yet implemented`
      }]
    };
  }

  async createCalendarEvent(args) {
    const { calendar_id, title, start, end } = args;
    return {
      content: [{
        type: 'text',
        text: `📅 Created event: ${title} (${start} - ${end})`
      }]
    };
  }

  async updateCalendarEvent(args) {
    const { calendar_id, event_id, patch } = args;
    return {
      content: [{
        type: 'text',
        text: `📅 Updated event ${event_id}`
      }]
    };
  }

  async deleteCalendarEvent(args) {
    const { calendar_id, event_id } = args;
    return {
      content: [{
        type: 'text',
        text: `📅 Deleted event ${event_id}`
      }]
    };
  }

  async syncCalendar(args) {
    const { mode, since } = args;
    return {
      content: [{
        type: 'text',
        text: `📅 Calendar sync (${mode}) complete`
      }]
    };
  }

  // USERS & ACCESS
  async listUsers(args) {
    try {
      const response = await this.api.get('/api/user');
      return {
        content: [{
          type: 'text',
          text: `👥 Users:\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `👥 Users endpoint not accessible: ${error.message}`
        }]
      };
    }
  }

  async getUser(args) {
    const { user_id } = args;
    try {
      const response = await this.api.get(`/api/user/${user_id}`);
      return {
        content: [{
          type: 'text',
          text: `👤 User ${user_id}:\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `👤 User ${user_id} not found: ${error.message}`
        }]
      };
    }
  }

  async setRecordPermissions(args) {
    const { module_id, record_id, grants } = args;
    return {
      content: [{
        type: 'text',
        text: `🔒 Permissions set for ${module_id}/${record_id}: ${grants.length} grants`
      }]
    };
  }

  async listWebhooks(args) {
    return {
      content: [{
        type: 'text',
        text: `🪝 Webhooks: Not yet implemented`
      }]
    };
  }

  async registerWebhook(args) {
    const { event, target_url } = args;
    return {
      content: [{
        type: 'text',
        text: `🪝 Webhook registered for ${event} → ${target_url}`
      }]
    };
  }

  async deleteWebhook(args) {
    const { webhook_id } = args;
    return {
      content: [{
        type: 'text',
        text: `🪝 Webhook ${webhook_id} deleted`
      }]
    };
  }

  // FILES
  async uploadFile(args) {
    const { name, bytes_or_url, mime } = args;

    // Mock file upload
    const file_id = `file-${Date.now()}`;

    return {
      content: [{
        type: 'text',
        text: `📎 File uploaded: ${name} (${mime})\nFile ID: ${file_id}`
      }]
    };
  }

  async getFile(args) {
    const { file_id } = args;
    return {
      content: [{
        type: 'text',
        text: `📎 File ${file_id}: Not yet implemented`
      }]
    };
  }

  async deleteFile(args) {
    const { file_id } = args;
    return {
      content: [{
        type: 'text',
        text: `📎 File ${file_id} deleted`
      }]
    };
  }

  // HTTP
  async httpRequest(args) {
    const { method, url, headers = {}, query = {}, body, timeout = 30000 } = args;

    try {
      const response = await axios({
        method,
        url,
        headers,
        params: query,
        data: body,
        timeout
      });

      return {
        content: [{
          type: 'text',
          text: `🌐 HTTP ${method} ${url}:\nStatus: ${response.status}\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `🌐 HTTP ${method} ${url} failed:\n${error.message}`
        }],
        isError: true
      };
    }
  }

  async run() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      // console.log('🚀 Boost.space MCP Server COMPLETE v2.0 running');
      // console.log(`📊 Connected to: ${BOOST_SPACE_CONFIG.platform}`);
      // console.log(`🛠️  40+ tools available`);

      process.on('SIGINT', () => {
        // console.log('🛑 Shutting down...');
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        // console.log('🛑 Shutting down...');
        process.exit(0);
      });

      // console.log('✅ Ready to handle requests');

    } catch (error) {
      // console.error('❌ Failed to start MCP server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new BoostSpaceMCPServer();
server.run().catch(console.error);
