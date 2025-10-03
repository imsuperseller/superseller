/**
 * API Tools
 * Demonstrates external API integration
 */

export const apiTools = [
  {
    name: 'http_get',
    description: 'Make a GET request to a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to make GET request to' },
        headers: { 
          type: 'object', 
          description: 'Optional headers to include',
          additionalProperties: { type: 'string' }
        }
      },
      required: ['url']
    }
  },
  {
    name: 'http_post',
    description: 'Make a POST request to a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to make POST request to' },
        data: { type: 'object', description: 'Data to send in POST request' },
        headers: { 
          type: 'object', 
          description: 'Optional headers to include',
          additionalProperties: { type: 'string' }
        }
      },
      required: ['url', 'data']
    }
  },
  {
    name: 'fetch_json',
    description: 'Fetch JSON data from a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch JSON from' }
      },
      required: ['url']
    }
  }
];

export async function handleApiTool(name: string, args: any) {
  const { url, data, headers = {} } = args;
  
  try {
    switch (name) {
      case 'http_get':
        if (!url) {
          throw new Error('url is required');
        }
        
        const getResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        });
        
        if (!getResponse.ok) {
          throw new Error(`HTTP ${getResponse.status}: ${getResponse.statusText}`);
        }
        
        const getData = await getResponse.text();
        
        return {
          content: [
            {
              type: 'text',
              text: `**HTTP GET Response**\n\nURL: ${url}\nStatus: ${getResponse.status}\n\nResponse:\n\`\`\`\n${getData}\n\`\`\``
            }
          ]
        };
      
      case 'http_post':
        if (!url || data === undefined) {
          throw new Error('url and data are required');
        }
        
        const postResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(data)
        });
        
        if (!postResponse.ok) {
          throw new Error(`HTTP ${postResponse.status}: ${postResponse.statusText}`);
        }
        
        const postData = await postResponse.text();
        
        return {
          content: [
            {
              type: 'text',
              text: `**HTTP POST Response**\n\nURL: ${url}\nStatus: ${postResponse.status}\n\nRequest Data:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nResponse:\n\`\`\`\n${postData}\n\`\`\``
            }
          ]
        };
      
      case 'fetch_json':
        if (!url) {
          throw new Error('url is required');
        }
        
        const jsonResponse = await fetch(url);
        
        if (!jsonResponse.ok) {
          throw new Error(`HTTP ${jsonResponse.status}: ${jsonResponse.statusText}`);
        }
        
        const jsonData = await jsonResponse.json();
        
        return {
          content: [
            {
              type: 'text',
              text: `**JSON Response**\n\nURL: ${url}\n\nData:\n\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\n\`\`\``
            }
          ]
        };
      
      default:
        throw new Error(`Unknown API tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
