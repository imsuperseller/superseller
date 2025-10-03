# Webflow MCP Server

MCP server for interacting with Webflow API v2.

## Status: ✅ Built & Ready

## Features

- List all Webflow sites
- Get site details
- List collections for a site
- Get collection items
- Create collection items
- Get form submissions

## Installation

```bash
npm install
npm run build
```

## Configuration

Set the following environment variables:

```bash
export WEBFLOW_API_TOKEN="your-api-token"
export WEBFLOW_SITE_ID="66c7e551a317e0e9c9f906d8"  # Optional, default site
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "node",
      "args": [
        "/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/webflow-mcp-server/dist/index.js"
      ],
      "env": {
        "WEBFLOW_API_TOKEN": "your-api-token-here",
        "WEBFLOW_SITE_ID": "66c7e551a317e0e9c9f906d8"
      }
    }
  }
}
```

## Available Tools

1. **list_webflow_sites** - List all sites in your account
2. **get_webflow_site** - Get details of a specific site
3. **list_webflow_collections** - List all CMS collections
4. **get_webflow_collection_items** - Get items from a collection
5. **create_webflow_collection_item** - Create new CMS items
6. **get_webflow_form_submissions** - Get form submissions

## Example Usage

```javascript
// List all sites
await mcp.call_tool("list_webflow_sites", {});

// Get collections
await mcp.call_tool("list_webflow_collections", {
  siteId: "66c7e551a317e0e9c9f906d8"
});

// Create a collection item
await mcp.call_tool("create_webflow_collection_item", {
  collectionId: "your-collection-id",
  fields: {
    name: "My Item",
    slug: "my-item",
    // ... other fields
  }
});
```

## Security

- API token is required via environment variable
- Never commit tokens to version control
- Tokens stored in secure config only

## Build Output

- TypeScript compiled to `dist/`
- Main entry: `dist/index.js`
- Type definitions: `dist/index.d.ts`
