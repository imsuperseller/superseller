import fs from 'fs';
import path from 'path';

const claudeJsonPath = path.join(process.env.HOME, '.claude.json');
const mcpConfigPath = path.join(process.env.HOME, '.gemini/antigravity/mcp_config.json');

const claudeJson = JSON.parse(fs.readFileSync(claudeJsonPath, 'utf8'));
const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));

if (!claudeJson.mcpServers) claudeJson.mcpServers = {};

for (const [name, config] of Object.entries(mcpConfig.mcpServers)) {
    if (config.serverUrl) {
        // Transform SSE config
        claudeJson.mcpServers[name] = {
            type: 'sse',
            url: config.serverUrl,
            headers: config.headers || {}
        };
    } else {
        // Transform Stdio config
        claudeJson.mcpServers[name] = {
            type: 'stdio',
            command: config.command || 'npx',
            args: config.args || [],
            env: config.env || {}
        };
    }
}

fs.writeFileSync(claudeJsonPath, JSON.stringify(claudeJson, null, 2));
console.log('Successfully merged MCP servers into .claude.json');
console.log('Added/Updated:', Object.keys(mcpConfig.mcpServers).join(', '));
