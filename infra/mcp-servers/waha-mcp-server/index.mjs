#!/usr/bin/env node

/**
 * WAHA MCP Server
 * MCP server for WAHA (WhatsApp HTTP API) — send messages, list chats, read conversations.
 *
 * WAHA instance: http://172.245.56.50:3004
 * Default session: superseller-whatsapp
 *
 * Environment variables (optional overrides):
 *   WAHA_BASE_URL  — default http://172.245.56.50:3004
 *   WAHA_API_KEY   — sent as X-Api-Key header when set
 *   WAHA_SESSION   — default session name (superseller-whatsapp)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = process.env.WAHA_BASE_URL || "http://172.245.56.50:3004";
const API_KEY = process.env.WAHA_API_KEY || "";
const DEFAULT_SESSION = process.env.WAHA_SESSION || "superseller-whatsapp";

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function wahaFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(API_KEY ? { "X-Api-Key": API_KEY } : {}),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `WAHA ${options.method || "GET"} ${path} → ${res.status}: ${text}`
    );
  }

  // Some endpoints return empty 200
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "waha_list_sessions",
    description:
      "List all WAHA sessions. Returns session name, status, and engine for each.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "waha_session_status",
    description:
      "Get the status of a specific WAHA session (STARTING, SCAN_QR_CODE, WORKING, FAILED, STOPPED).",
    inputSchema: {
      type: "object",
      properties: {
        session: {
          type: "string",
          description: `Session name. Defaults to "${DEFAULT_SESSION}".`,
        },
      },
    },
  },
  {
    name: "waha_session_info",
    description:
      "Get profile information for a session (phone number, name, picture URL).",
    inputSchema: {
      type: "object",
      properties: {
        session: {
          type: "string",
          description: `Session name. Defaults to "${DEFAULT_SESSION}".`,
        },
      },
    },
  },
  {
    name: "waha_send_text",
    description:
      'Send a WhatsApp text message. chatId format: "972501234567@c.us" for contacts, or "972501234567-1234567890@g.us" for groups.',
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description:
            'Recipient chat ID, e.g. "972501234567@c.us" or group ID ending in @g.us',
        },
        text: {
          type: "string",
          description: "Message text to send",
        },
        session: {
          type: "string",
          description: `Session name. Defaults to "${DEFAULT_SESSION}".`,
        },
      },
      required: ["chatId", "text"],
    },
  },
  {
    name: "waha_send_file",
    description:
      "Send a file (image, document, video) via URL to a WhatsApp chat.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description:
            'Recipient chat ID, e.g. "972501234567@c.us" or group ID',
        },
        fileUrl: {
          type: "string",
          description: "Public URL of the file to send",
        },
        caption: {
          type: "string",
          description: "Optional caption for the file",
        },
        session: {
          type: "string",
          description: `Session name. Defaults to "${DEFAULT_SESSION}".`,
        },
      },
      required: ["chatId", "fileUrl"],
    },
  },
  {
    name: "waha_list_chats",
    description:
      "List all chats (contacts and groups) for a WAHA session. Returns chat ID, name, last message timestamp, and unread count.",
    inputSchema: {
      type: "object",
      properties: {
        session: {
          type: "string",
          description: `Session name. Defaults to "${DEFAULT_SESSION}".`,
        },
      },
    },
  },
  {
    name: "waha_get_messages",
    description:
      "Get recent messages from a specific WhatsApp chat. Returns message body, sender, timestamp, and type.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description:
            'Chat ID to retrieve messages from, e.g. "972501234567@c.us"',
        },
        limit: {
          type: "number",
          description: "Number of messages to retrieve (default 20, max 100)",
        },
        session: {
          type: "string",
          description: `Session name. Defaults to "${DEFAULT_SESSION}".`,
        },
      },
      required: ["chatId"],
    },
  },
  {
    name: "waha_start_session",
    description:
      "Start a WAHA session. Use this if the session is STOPPED or needs to be initialized.",
    inputSchema: {
      type: "object",
      properties: {
        session: {
          type: "string",
          description: `Session name. Defaults to "${DEFAULT_SESSION}".`,
        },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function handleTool(name, args) {
  const session = args?.session || DEFAULT_SESSION;

  switch (name) {
    // -- List sessions -------------------------------------------------------
    case "waha_list_sessions": {
      const data = await wahaFetch("/api/sessions");
      return formatResult(data);
    }

    // -- Session status ------------------------------------------------------
    case "waha_session_status": {
      const data = await wahaFetch(`/api/sessions/${session}/status`);
      return formatResult(data);
    }

    // -- Session info (me) ---------------------------------------------------
    case "waha_session_info": {
      const data = await wahaFetch(`/api/sessions/${session}/me`);
      return formatResult(data);
    }

    // -- Send text -----------------------------------------------------------
    case "waha_send_text": {
      const { chatId, text } = args;
      if (!chatId || !text) throw new Error("chatId and text are required");
      const data = await wahaFetch("/api/sendText", {
        method: "POST",
        body: JSON.stringify({ session, chatId, text }),
      });
      return formatResult(data);
    }

    // -- Send file -----------------------------------------------------------
    case "waha_send_file": {
      const { chatId, fileUrl, caption } = args;
      if (!chatId || !fileUrl)
        throw new Error("chatId and fileUrl are required");
      const body = {
        session,
        chatId,
        file: { url: fileUrl },
      };
      if (caption) body.caption = caption;
      const data = await wahaFetch("/api/sendFile", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return formatResult(data);
    }

    // -- List chats ----------------------------------------------------------
    case "waha_list_chats": {
      const data = await wahaFetch(`/api/${session}/chats`);
      return formatResult(data);
    }

    // -- Get messages --------------------------------------------------------
    case "waha_get_messages": {
      const { chatId, limit } = args;
      if (!chatId) throw new Error("chatId is required");
      const msgLimit = Math.min(limit || 20, 100);
      const data = await wahaFetch(
        `/api/${session}/chats/${chatId}/messages?limit=${msgLimit}`
      );
      return formatResult(data);
    }

    // -- Start session -------------------------------------------------------
    case "waha_start_session": {
      const data = await wahaFetch("/api/startSession", {
        method: "POST",
        body: JSON.stringify({ name: session }),
      });
      return formatResult(data);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ---------------------------------------------------------------------------
// Formatting helper
// ---------------------------------------------------------------------------

function formatResult(data) {
  return {
    content: [
      {
        type: "text",
        text:
          typeof data === "string"
            ? data
            : JSON.stringify(data, null, 2) ?? "OK (empty response)",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

class WahaMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "waha-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        return await handleTool(name, args || {});
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(
      `WAHA MCP Server running on stdio (base=${BASE_URL}, session=${DEFAULT_SESSION})`
    );
  }
}

const server = new WahaMCPServer();
server.run().catch(console.error);
