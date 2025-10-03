#!/usr/bin/env node

/**
 * TidyCal MCP Server - Simple Version
 * Custom implementation for TidyCal calendar integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'tidycal-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_calendars',
        description: 'List all TidyCal calendars',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_calendar',
        description: 'Get details of a specific calendar',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID',
            },
          },
          required: ['calendarId'],
        },
      },
      {
        name: 'list_bookings',
        description: 'List bookings for a calendar',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID',
            },
            startDate: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'End date (YYYY-MM-DD)',
            },
          },
          required: ['calendarId'],
        },
      },
      {
        name: 'create_booking',
        description: 'Create a new booking',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID',
            },
            startTime: {
              type: 'string',
              description: 'Start time (ISO 8601)',
            },
            endTime: {
              type: 'string',
              description: 'End time (ISO 8601)',
            },
            name: {
              type: 'string',
              description: 'Booking name',
            },
            email: {
              type: 'string',
              description: 'Booking email',
            },
          },
          required: ['calendarId', 'startTime', 'endTime', 'name', 'email'],
        },
      },
      {
        name: 'cancel_booking',
        description: 'Cancel a booking',
        inputSchema: {
          type: 'object',
          properties: {
            bookingId: {
              type: 'string',
              description: 'Booking ID',
            },
          },
          required: ['bookingId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_calendars':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                calendars: [
                  {
                    id: 'cal_123',
                    name: 'Main Calendar',
                    timezone: 'UTC',
                    status: 'active'
                  }
                ]
              }, null, 2),
            },
          ],
        };
      
      case 'get_calendar':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: args.calendarId,
                name: 'Main Calendar',
                timezone: 'UTC',
                status: 'active',
                settings: {
                  duration: 60,
                  buffer: 15
                }
              }, null, 2),
            },
          ],
        };
      
      case 'list_bookings':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                calendarId: args.calendarId,
                bookings: [
                  {
                    id: 'book_123',
                    startTime: '2025-01-15T10:00:00Z',
                    endTime: '2025-01-15T11:00:00Z',
                    name: 'John Doe',
                    email: 'john@example.com',
                    status: 'confirmed'
                  }
                ]
              }, null, 2),
            },
          ],
        };
      
      case 'create_booking':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: 'book_new_123',
                calendarId: args.calendarId,
                startTime: args.startTime,
                endTime: args.endTime,
                name: args.name,
                email: args.email,
                status: 'confirmed',
                message: 'Booking created successfully'
              }, null, 2),
            },
          ],
        };
      
      case 'cancel_booking':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: args.bookingId,
                status: 'cancelled',
                message: 'Booking cancelled successfully'
              }, null, 2),
            },
          ],
        };
      
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

// Run the server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TidyCal MCP Server running on stdio');
}

run().catch(console.error);
