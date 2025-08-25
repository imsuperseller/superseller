#!/usr/bin/env node

import axios from 'axios';

class MakeModuleQuery {
  constructor() {
    this.mcpUrl = 'https://us2.make.com/mcp/api/v1/u/e5adf952-1215-4272-8855-cf3ee7299870/sse';
    this.apiToken = '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9';
  }

  async queryModules() {
    try {
      console.log('🔍 Querying Make.com MCP for available modules...');
      
      const response = await axios.post(this.mcpUrl, {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'list_modules',
          arguments: {}
        }
      }, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Available modules:', JSON.stringify(response.data, null, 2));
      return response.data;

    } catch (error) {
      console.error('❌ Error querying modules:', error.message);
      
      // Fallback: try direct API call
      try {
        const apiResponse = await axios.get('https://us2.make.com/api/v2/modules', {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ API modules:', JSON.stringify(apiResponse.data, null, 2));
        return apiResponse.data;
        
      } catch (apiError) {
        console.error('❌ API call also failed:', apiError.message);
        return null;
      }
    }
  }

  async findOpenAIModules() {
    const modules = await this.queryModules();
    
    if (modules && modules.result) {
      const openaiModules = modules.result.filter(module => 
        module.name && module.name.toLowerCase().includes('openai')
      );
      
      console.log('🤖 OpenAI modules found:', openaiModules);
      return openaiModules;
    }
    
    return [];
  }
}

// Main execution
async function main() {
  const query = new MakeModuleQuery();
  await query.findOpenAIModules();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default MakeModuleQuery;
