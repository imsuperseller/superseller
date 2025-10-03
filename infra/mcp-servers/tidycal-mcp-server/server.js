#!/usr/bin/env node

/**
 * TidyCal MCP Server
 * Custom implementation for TidyCal calendar integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class TidyCalMCPServer {
  constructor() {
    this.server = new Server(
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

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
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
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_calendars':
            return await this.listCalendars();
          
          case 'get_calendar':
            return await this.getCalendar(args.calendarId);
          
          case 'list_bookings':
            return await this.listBookings(args.calendarId, args.startDate, args.endDate);
          
          case 'create_booking':
            return await this.createBooking(
              args.calendarId,
              args.startTime,
              args.endTime,
              args.name,
              args.email
            );
          
          case 'cancel_booking':
            return await this.cancelBooking(args.bookingId);
          
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

  async listCalendars() {
    // Mock implementation - replace with actual TidyCal API call
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
  }

  async getCalendar(calendarId) {
    // Mock implementation - replace with actual TidyCal API call
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            id: calendarId,
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
  }

  async listBookings(calendarId, startDate, endDate) {
    // Mock implementation - replace with actual TidyCal API call
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            calendarId,
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
  }

  async createBooking(calendarId, startTime, endTime, name, email) {
    // Mock implementation - replace with actual TidyCal API call
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            id: 'book_new_123',
            calendarId,
            startTime,
            endTime,
            name,
            email,
            status: 'confirmed',
            message: 'Booking created successfully'
          }, null, 2),
        },
      ],
    };
  }

  async cancelBooking(bookingId) {
    // Mock implementation - replace with actual TidyCal API call
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            id: bookingId,
            status: 'cancelled',
            message: 'Booking cancelled successfully'
          }, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TidyCal MCP Server running on stdio');
  }
}

// Run the server
const server = new TidyCalMCPServer();
server.run().catch(console.error);

export default TidyCalMCPServer;