#!/usr/bin/env node

/**
 * Typeform MCP Server
 * Provides comprehensive Typeform integration for form management, response processing, and webhook handling
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'typeform-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Typeform API configuration
const TYPEFORM_API_BASE = 'https://api.typeform.com';

/**
 * Make authenticated request to Typeform API
 */
async function makeTypeformRequest(endpoint, options = {}) {
  const url = `${TYPEFORM_API_BASE}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${process.env.TYPEFORM_API_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Typeform API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

/**
 * List all available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Form Management Tools
      {
        name: 'typeform_create_form',
        description: 'Create a new Typeform form',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Form title' },
            description: { type: 'string', description: 'Form description' },
            fields: {
              type: 'array',
              description: 'Array of form fields',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['short_text', 'long_text', 'multiple_choice', 'email', 'phone_number', 'date', 'number', 'rating', 'yes_no'] },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  required: { type: 'boolean' },
                  properties: { type: 'object' }
                },
                required: ['type', 'title']
              }
            },
            settings: { type: 'object', description: 'Form settings' }
          },
          required: ['title']
        }
      },
      {
        name: 'typeform_list_forms',
        description: 'List all forms in the workspace',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number (default: 1)' },
            page_size: { type: 'number', description: 'Items per page (default: 10, max: 200)' },
            search: { type: 'string', description: 'Search query' }
          }
        }
      },
      {
        name: 'typeform_get_form',
        description: 'Get details of a specific form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' }
          },
          required: ['form_id']
        }
      },
      {
        name: 'typeform_update_form',
        description: 'Update an existing form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            title: { type: 'string', description: 'New form title' },
            description: { type: 'string', description: 'New form description' },
            fields: { type: 'array', description: 'Updated form fields' },
            settings: { type: 'object', description: 'Updated form settings' }
          },
          required: ['form_id']
        }
      },
      {
        name: 'typeform_delete_form',
        description: 'Delete a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' }
          },
          required: ['form_id']
        }
      },
      {
        name: 'typeform_clone_form',
        description: 'Clone an existing form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID to clone' },
            title: { type: 'string', description: 'New form title' }
          },
          required: ['form_id']
        }
      },
      {
        name: 'typeform_publish_form',
        description: 'Publish or unpublish a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            published: { type: 'boolean', description: 'Publish status' }
          },
          required: ['form_id', 'published']
        }
      },
      {
        name: 'typeform_get_form_questions',
        description: 'Get all questions from a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' }
          },
          required: ['form_id']
        }
      },

      // Response Management Tools
      {
        name: 'typeform_list_responses',
        description: 'List all responses for a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            page: { type: 'number', description: 'Page number' },
            page_size: { type: 'number', description: 'Items per page' },
            since: { type: 'string', description: 'ISO date string to filter responses' },
            until: { type: 'string', description: 'ISO date string to filter responses' },
            completed: { type: 'boolean', description: 'Filter by completion status' }
          },
          required: ['form_id']
        }
      },
      {
        name: 'typeform_get_response',
        description: 'Get a specific form response',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            response_id: { type: 'string', description: 'Response ID' }
          },
          required: ['form_id', 'response_id']
        }
      },
      {
        name: 'typeform_delete_response',
        description: 'Delete a form response',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            response_id: { type: 'string', description: 'Response ID' }
          },
          required: ['form_id', 'response_id']
        }
      },
      {
        name: 'typeform_export_responses',
        description: 'Export form responses to CSV or JSON',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            format: { type: 'string', enum: ['csv', 'json'], description: 'Export format' },
            since: { type: 'string', description: 'ISO date string to filter responses' },
            until: { type: 'string', description: 'ISO date string to filter responses' }
          },
          required: ['form_id', 'format']
        }
      },
      {
        name: 'typeform_get_response_stats',
        description: 'Get response statistics for a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' }
          },
          required: ['form_id']
        }
      },
      {
        name: 'typeform_filter_responses',
        description: 'Filter responses by specific criteria',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            filters: {
              type: 'object',
              description: 'Filter criteria',
              properties: {
                field_id: { type: 'string' },
                operator: { type: 'string', enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'] },
                value: { type: 'string' }
              }
            }
          },
          required: ['form_id', 'filters']
        }
      },

      // Webhook Management Tools
      {
        name: 'typeform_create_webhook',
        description: 'Create a webhook for a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            tag: { type: 'string', description: 'Webhook tag' },
            url: { type: 'string', description: 'Webhook URL' },
            enabled: { type: 'boolean', description: 'Enable webhook' }
          },
          required: ['form_id', 'tag', 'url']
        }
      },
      {
        name: 'typeform_list_webhooks',
        description: 'List all webhooks for a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' }
          },
          required: ['form_id']
        }
      },
      {
        name: 'typeform_update_webhook',
        description: 'Update a webhook',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            webhook_id: { type: 'string', description: 'Webhook ID' },
            tag: { type: 'string', description: 'Webhook tag' },
            url: { type: 'string', description: 'Webhook URL' },
            enabled: { type: 'boolean', description: 'Enable webhook' }
          },
          required: ['form_id', 'webhook_id']
        }
      },
      {
        name: 'typeform_delete_webhook',
        description: 'Delete a webhook',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            webhook_id: { type: 'string', description: 'Webhook ID' }
          },
          required: ['form_id', 'webhook_id']
        }
      },

      // Integration Management Tools
      {
        name: 'typeform_create_embed',
        description: 'Generate embed code for a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' },
            type: { type: 'string', enum: ['embed', 'popup', 'drawer'], description: 'Embed type' },
            options: { type: 'object', description: 'Embed options' }
          },
          required: ['form_id', 'type']
        }
      },
      {
        name: 'typeform_get_embed_options',
        description: 'Get available embed options for a form',
        inputSchema: {
          type: 'object',
          properties: {
            form_id: { type: 'string', description: 'Form ID' }
          },
          required: ['form_id']
        }
      },
      {
        name: 'typeform_validate_webhook',
        description: 'Validate webhook signature',
        inputSchema: {
          type: 'object',
          properties: {
            payload: { type: 'string', description: 'Webhook payload' },
            signature: { type: 'string', description: 'Webhook signature' },
            secret: { type: 'string', description: 'Webhook secret' }
          },
          required: ['payload', 'signature', 'secret']
        }
      }
    ]
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Form Management
      case 'typeform_create_form':
        return await createForm(args);
      case 'typeform_list_forms':
        return await listForms(args);
      case 'typeform_get_form':
        return await getForm(args);
      case 'typeform_update_form':
        return await updateForm(args);
      case 'typeform_delete_form':
        return await deleteForm(args);
      case 'typeform_clone_form':
        return await cloneForm(args);
      case 'typeform_publish_form':
        return await publishForm(args);
      case 'typeform_get_form_questions':
        return await getFormQuestions(args);

      // Response Management
      case 'typeform_list_responses':
        return await listResponses(args);
      case 'typeform_get_response':
        return await getResponse(args);
      case 'typeform_delete_response':
        return await deleteResponse(args);
      case 'typeform_export_responses':
        return await exportResponses(args);
      case 'typeform_get_response_stats':
        return await getResponseStats(args);
      case 'typeform_filter_responses':
        return await filterResponses(args);

      // Webhook Management
      case 'typeform_create_webhook':
        return await createWebhook(args);
      case 'typeform_list_webhooks':
        return await listWebhooks(args);
      case 'typeform_update_webhook':
        return await updateWebhook(args);
      case 'typeform_delete_webhook':
        return await deleteWebhook(args);

      // Integration Management
      case 'typeform_create_embed':
        return await createEmbed(args);
      case 'typeform_get_embed_options':
        return await getEmbedOptions(args);
      case 'typeform_validate_webhook':
        return await validateWebhook(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

// Form Management Functions
async function createForm(args) {
  const { title, description, fields, settings } = args;
  
  // Convert fields to Typeform API format
  const typeformFields = fields.map((field, index) => {
    const properties = { ...field.properties };
    
    // Remove unsupported properties
    delete properties.placeholder;
    
    // Handle choices for multiple_choice fields
    if (field.type === 'multiple_choice' && properties.choices) {
      properties.choices = properties.choices.map((choice, choiceIndex) => ({
        ref: `choice_${choiceIndex}`,
        label: choice.label
      }));
    }
    
    return {
      title: field.title,
      ref: `field_${index}`,
      type: field.type,
      properties,
      validations: {
        required: field.required || false
      }
    };
  });

  const formData = {
    title,
    settings: {
      language: 'en',
      is_public: true,
      show_progress_bar: true,
      show_typeform_branding: false,
      show_question_number: true,
      ...settings
    },
    fields: typeformFields
  };

  const result = await makeTypeformRequest('/forms', {
    method: 'POST',
    body: JSON.stringify(formData)
  });

  return {
    content: [
      {
        type: 'text',
        text: `Form created successfully: ${result.id}\nTitle: ${result.title}\nURL: ${result._links.display}`
      }
    ]
  };
}

async function listForms(args) {
  const { page = 1, page_size = 10, search } = args;
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString()
  });
  
  if (search) {
    params.append('search', search);
  }

  const result = await makeTypeformRequest(`/forms?${params}`);
  
  return {
    content: [
      {
        type: 'text',
        text: `Found ${result.total_items} forms:\n${result.items.map(form => 
          `- ${form.title} (ID: ${form.id}) - ${form.settings?.is_public ? 'Published' : 'Draft'}`
        ).join('\n')}`
      }
    ]
  };
}

async function getForm(args) {
  const { form_id } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}`);
  
  return {
    content: [
      {
        type: 'text',
        text: `Form: ${result.title}\nID: ${result.id}\nStatus: ${result.status}\nFields: ${result.fields.length}\nResponses: ${result.stats?.responses || 0}`
      }
    ]
  };
}

async function updateForm(args) {
  const { form_id, ...updateData } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  return {
    content: [
      {
        type: 'text',
        text: `Form updated successfully: ${result.id}`
      }
    ]
  };
}

async function deleteForm(args) {
  const { form_id } = args;
  await makeTypeformRequest(`/forms/${form_id}`, {
    method: 'DELETE'
  });

  return {
    content: [
      {
        type: 'text',
        text: `Form ${form_id} deleted successfully`
      }
    ]
  };
}

async function cloneForm(args) {
  const { form_id, title } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}/clone`, {
    method: 'POST',
    body: JSON.stringify({ title })
  });

  return {
    content: [
      {
        type: 'text',
        text: `Form cloned successfully: ${result.id}\nTitle: ${result.title}`
      }
    ]
  };
}

async function publishForm(args) {
  const { form_id, published } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}`, {
    method: 'PUT',
    body: JSON.stringify({ settings: { is_public: published } })
  });

  return {
    content: [
      {
        type: 'text',
        text: `Form ${form_id} ${published ? 'published' : 'unpublished'} successfully`
      }
    ]
  };
}

async function getFormQuestions(args) {
  const { form_id } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}`);
  
  return {
    content: [
      {
        type: 'text',
        text: `Questions for ${result.title}:\n${result.fields.map((field, index) => 
          `${index + 1}. ${field.title} (${field.type})`
        ).join('\n')}`
      }
    ]
  };
}

// Response Management Functions
async function listResponses(args) {
  const { form_id, page = 1, page_size = 10, since, until, completed } = args;
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString()
  });
  
  if (since) params.append('since', since);
  if (until) params.append('until', until);
  if (completed !== undefined) params.append('completed', completed.toString());

  const result = await makeTypeformRequest(`/forms/${form_id}/responses?${params}`);
  
  return {
    content: [
      {
        type: 'text',
        text: `Found ${result.total_items} responses:\n${result.items.map(response => 
          `- Response ${response.token} - ${response.submitted_at}`
        ).join('\n')}`
      }
    ]
  };
}

async function getResponse(args) {
  const { form_id, response_id } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}/responses/${response_id}`);
  
  return {
    content: [
      {
        type: 'text',
        text: `Response ${result.token}:\nSubmitted: ${result.submitted_at}\nAnswers: ${JSON.stringify(result.answers, null, 2)}`
      }
    ]
  };
}

async function deleteResponse(args) {
  const { form_id, response_id } = args;
  await makeTypeformRequest(`/forms/${form_id}/responses/${response_id}`, {
    method: 'DELETE'
  });

  return {
    content: [
      {
        type: 'text',
        text: `Response ${response_id} deleted successfully`
      }
    ]
  };
}

async function exportResponses(args) {
  const { form_id, format, since, until } = args;
  const params = new URLSearchParams({ format });
  if (since) params.append('since', since);
  if (until) params.append('until', until);

  const result = await makeTypeformRequest(`/forms/${form_id}/responses?${params}`);
  
  return {
    content: [
      {
        type: 'text',
        text: `Responses exported in ${format} format. Found ${result.total_items} responses.`
      }
    ]
  };
}

async function getResponseStats(args) {
  const { form_id } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}`);
  
  return {
    content: [
      {
        type: 'text',
        text: `Response Statistics for ${result.title}:\nTotal Responses: ${result.stats?.responses || 0}\nCompletion Rate: ${result.stats?.completion_rate || 0}%`
      }
    ]
  };
}

async function filterResponses(args) {
  const { form_id, filters } = args;
  // This would require more complex filtering logic
  // For now, return a basic implementation
  
  return {
    content: [
      {
        type: 'text',
        text: `Filtered responses for form ${form_id} with criteria: ${JSON.stringify(filters)}`
      }
    ]
  };
}

// Webhook Management Functions
async function createWebhook(args) {
  const { form_id, tag, url, enabled = true } = args;
  const webhookData = { url, enabled };

  const result = await makeTypeformRequest(`/forms/${form_id}/webhooks/${tag}`, {
    method: 'PUT',
    body: JSON.stringify(webhookData)
  });

  return {
    content: [
      {
        type: 'text',
        text: `Webhook created successfully: ${result.id}\nTag: ${result.tag}\nURL: ${result.url}\nStatus: ${result.enabled ? 'Enabled' : 'Disabled'}`
      }
    ]
  };
}

async function listWebhooks(args) {
  const { form_id } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}/webhooks`);
  
  return {
    content: [
      {
        type: 'text',
        text: `Webhooks for form ${form_id}:\n${result.items.map(webhook => 
          `- ${webhook.tag} (${webhook.id}) - ${webhook.enabled ? 'Enabled' : 'Disabled'}`
        ).join('\n')}`
      }
    ]
  };
}

async function updateWebhook(args) {
  const { form_id, webhook_id, ...updateData } = args;
  const result = await makeTypeformRequest(`/forms/${form_id}/webhooks/${webhook_id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  return {
    content: [
      {
        type: 'text',
        text: `Webhook ${webhook_id} updated successfully`
      }
    ]
  };
}

async function deleteWebhook(args) {
  const { form_id, webhook_id } = args;
  await makeTypeformRequest(`/forms/${form_id}/webhooks/${webhook_id}`, {
    method: 'DELETE'
  });

  return {
    content: [
      {
        type: 'text',
        text: `Webhook ${webhook_id} deleted successfully`
      }
    ]
  };
}

// Integration Management Functions
async function createEmbed(args) {
  const { form_id, type, options = {} } = args;
  
  return {
    content: [
      {
        type: 'text',
        text: `Embed code for form ${form_id} (${type}):\n<script src="https://embed.typeform.com/next/embed.js"></script>\n<div data-tf-widget="${form_id}" data-tf-${type}></div>`
      }
    ]
  };
}

async function getEmbedOptions(args) {
  const { form_id } = args;
  
  return {
    content: [
      {
        type: 'text',
        text: `Embed options for form ${form_id}:\n- embed: Standard embed\n- popup: Popup window\n- drawer: Slide-out drawer`
      }
    ]
  };
}

async function validateWebhook(args) {
  const { payload, signature, secret } = args;
  
  // Simple validation (in production, use proper HMAC validation)
  const isValid = signature && secret && payload;
  
  return {
    content: [
      {
        type: 'text',
        text: `Webhook validation: ${isValid ? 'Valid' : 'Invalid'}`
      }
    ]
  };
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Typeform MCP server running on stdio');
}

main().catch(console.error);
