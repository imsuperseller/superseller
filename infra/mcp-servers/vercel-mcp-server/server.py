
# OBSOLETE: Vercel MCP Server
# This server is no longer used as Vercel MCP now uses NPX package
# 
# Migration: Vercel MCP server now runs via NPX package:
# npx @modelcontextprotocol/server-vercel
#
# Configuration: Managed through Cursor MCP configuration
# File: /Users/shaifriedman/.cursor/mcp.json
#
# Last Updated: 2025-01-10
# Status: OBSOLETE - Use NPX package instead

print('⚠️  OBSOLETE SERVER: Vercel MCP Server')
print('====================================')
print('This server is no longer used.')
print('Vercel MCP now uses NPX package: npx @modelcontextprotocol/server-vercel')
print('Configuration managed through Cursor MCP settings.')
exit(0)

import asyncio
from mcp.server import Server
from mcp.types import Resource, Tool
import subprocess
import os

class VercelMCPServer:
    def __init__(self):
        self.server = Server("vercel-mcp")
        self.setup_tools()
        
    def setup_tools(self):
        @self.server.tool()
        async def create_project(project_name: str, framework: str = "nextjs") -> str:
            """Create a new Vercel project"""
            try:
                result = subprocess.run(["npx", "vercel", "init", project_name, "--yes"], 
                                      capture_output=True, text=True)
                return f"Project {project_name} created successfully"
            except Exception as e:
                return f"Failed to create project: {str(e)}"
        
        @self.server.tool()
        async def deploy_project(project_path: str) -> str:
            """Deploy project to Vercel"""
            try:
                result = subprocess.run(["npx", "vercel", "--prod"], 
                                      cwd=project_path, capture_output=True, text=True)
                return f"Project deployed successfully"
            except Exception as e:
                return f"Failed to deploy project: {str(e)}"
                
    async def run(self):
        await self.server.run()

if __name__ == "__main__":
    server = VercelMCPServer()
    asyncio.run(server.run())
