# 🚀 MCP 101 CHEAT SHEET

**Date**: January 16, 2025  
**Status**: ✅ **COMPLETE**  
**Purpose**: Give Claude "master's degree in MCP servers"

## 🎯 **WHAT IS MCP?**

### **📋 Model Context Protocol (MCP)**
- **Definition**: Open standard that enables LLMs to interact with external tools and data sources
- **Purpose**: Bridge between AI models and external applications
- **Benefits**: Real-time data retrieval, custom computations, API integrations

### **📋 MCP Server**
- **Definition**: Intermediary that facilitates communication between AI models and external tools/APIs
- **Function**: Enables AI models to perform tasks like fetching data, executing commands, interacting with software systems
- **Integration**: Seamless connection with Claude Desktop, Claude Code, and other AI platforms

## 🔧 **MCP CAPABILITIES**

### **📋 Built-in MCP Servers**
- **Quick Enable/Disable**: Can quickly be enabled and disabled
- **Platform Integration**: Claude Code knows exactly what MCP servers are
- **Capability Awareness**: Platform-specific capabilities and limitations

### **📋 Claude Code Integration**
- **Native Support**: Built-in MCP servers can quickly be enabled/disabled
- **Context Awareness**: Claude Code knows exactly what MCP servers are
- **Platform Optimization**: Platform-specific capabilities and limitations

### **📋 Transport Protocols**
- **stdio**: Standard input/output communication
- **HTTP**: Web-based communication
- **WebSocket**: Real-time bidirectional communication

## 🏗️ **MCP ARCHITECTURE**

### **📋 Three Pillars of MCP**
1. **Tools**: Functions that AI can call
   - Input validation
   - Output formatting
   - Error handling
   - Authentication

2. **Resources**: Data sources AI can access
   - File systems
   - Databases
   - APIs
   - Real-time data

3. **Prompts**: Templates for AI interactions
   - Context setting
   - Instruction templates
   - Response formatting
   - Error handling

### **📋 MCP Server Structure**
```typescript
// Basic MCP Server Structure
class MCPServer {
  private server: Server;
  
  constructor() {
    this.server = new Server({
      name: "my-mcp-server",
      version: "1.0.0"
    }, {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      }
    });
  }
  
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

## 🚀 **DEVELOPMENT WORKFLOW**

### **📋 1. Environment Setup**
```bash
# Create project directory
mkdir my-mcp-server
cd my-mcp-server

# Initialize Node.js project
npm init -y

# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Install development dependencies
npm install --save-dev typescript @types/node tsx nodemon
```

### **📋 2. TypeScript Configuration**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **📋 3. Server Development**
```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

class MyMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "my-mcp-server",
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
    // Define handlers for tools and resources here
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("My MCP Server is running on stdio");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MyMCPServer();
  server.start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
```

### **📋 4. Testing and Debugging**
```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector node ./dist/index.js

# Build and run
npm run build
npm start
```

## 🔧 **TOOL IMPLEMENTATION**

### **📋 Tool Definition**
```typescript
// Define a tool
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'my_tool',
        description: 'Description of what the tool does',
        inputSchema: {
          type: 'object',
          properties: {
            param1: { type: 'string', description: 'Parameter description' },
            param2: { type: 'number', description: 'Another parameter' }
          },
          required: ['param1']
        }
      }
    ]
  };
});
```

### **📋 Tool Handler**
```typescript
// Handle tool calls
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'my_tool':
      return await this.handleMyTool(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

private async handleMyTool(args: any) {
  // Tool implementation
  const result = await this.performToolAction(args);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result)
      }
    ]
  };
}
```

## 📊 **RESOURCE IMPLEMENTATION**

### **📋 Resource Definition**
```typescript
// Define resources
this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'file:///path/to/resource',
        name: 'My Resource',
        description: 'Description of the resource',
        mimeType: 'text/plain'
      }
    ]
  };
});
```

### **📋 Resource Handler**
```typescript
// Handle resource requests
this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  // Read resource content
  const content = await this.readResource(uri);
  
  return {
    contents: [
      {
        uri,
        mimeType: 'text/plain',
        text: content
      }
    ]
  };
});
```

## 🎯 **CLAUDE DESKTOP INTEGRATION**

### **📋 Configuration**
```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/index.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### **📋 Testing Workflow**
1. **Add Server**: Add server to Claude Desktop config
2. **Restart Claude**: Restart Claude Desktop
3. **Check Logs**: Monitor logs for errors
4. **Fix Issues**: Address any errors found
5. **Verify**: Confirm server is working

## 🚀 **BEST PRACTICES**

### **📋 Development**
- **Error Handling**: Implement comprehensive error handling
- **Input Validation**: Validate all inputs
- **Logging**: Add detailed logging
- **Testing**: Test thoroughly before deployment

### **📋 Security**
- **API Keys**: Store securely in environment variables
- **Input Sanitization**: Sanitize all inputs
- **Rate Limiting**: Implement rate limiting
- **Authentication**: Use proper authentication

### **📋 Performance**
- **Caching**: Implement caching where appropriate
- **Async Operations**: Use async/await for I/O operations
- **Resource Management**: Manage resources efficiently
- **Monitoring**: Monitor performance and usage

## 📊 **COMMON PATTERNS**

### **📋 API Integration**
```typescript
// API integration pattern
private async callExternalAPI(endpoint: string, data: any) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}
```

### **📋 File Operations**
```typescript
// File operations pattern
private async readFile(filePath: string): Promise<string> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('File read error:', error);
    throw new Error(`Failed to read file: ${filePath}`);
  }
}
```

### **📋 Database Operations**
```typescript
// Database operations pattern
private async queryDatabase(query: string, params: any[]): Promise<any[]> {
  try {
    const result = await this.db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
}
```

## 🎯 **TROUBLESHOOTING**

### **📋 Common Issues**
1. **Server Not Starting**: Check dependencies and configuration
2. **Tool Not Found**: Verify tool registration
3. **Permission Errors**: Check file permissions and API keys
4. **Connection Issues**: Verify transport configuration

### **📋 Debugging Tips**
- **Use MCP Inspector**: Test server functionality
- **Check Logs**: Monitor Claude Desktop logs
- **Validate Input**: Ensure input schemas are correct
- **Test Incrementally**: Build and test step by step

---

**Status**: ✅ **COMPLETE** - MCP 101 cheat sheet ready for use  
**Purpose**: Give Claude comprehensive MCP knowledge  
**Next**: Use this cheat sheet for MCP server development
