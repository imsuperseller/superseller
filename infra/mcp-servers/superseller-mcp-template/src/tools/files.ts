/**
 * File Tools
 * Demonstrates file system operations
 */

import { promises as fs } from 'fs';
import path from 'path';

export const fileTools = [
  {
    name: 'read_file',
    description: 'Read contents of a text file',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file to read' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a text file',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file to write' },
        content: { type: 'string', description: 'Content to write to the file' }
      },
      required: ['filePath', 'content']
    }
  },
  {
    name: 'list_directory',
    description: 'List contents of a directory',
    inputSchema: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Path to the directory to list' }
      },
      required: ['dirPath']
    }
  },
  {
    name: 'get_file_info',
    description: 'Get information about a file',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file' }
      },
      required: ['filePath']
    }
  }
];

export async function handleFileTool(name: string, args: any) {
  const { filePath, dirPath, content } = args;
  
  try {
    switch (name) {
      case 'read_file':
        if (!filePath) {
          throw new Error('filePath is required');
        }
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: `**File Contents**\n\nPath: ${filePath}\n\nContent:\n\`\`\`\n${fileContent}\n\`\`\``
            }
          ]
        };
      
      case 'write_file':
        if (!filePath || content === undefined) {
          throw new Error('filePath and content are required');
        }
        await fs.writeFile(filePath, content, 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: `**File Written Successfully**\n\nPath: ${filePath}\nSize: ${content.length} characters`
            }
          ]
        };
      
      case 'list_directory':
        if (!dirPath) {
          throw new Error('dirPath is required');
        }
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        const fileList = files.map(file => {
          const type = file.isDirectory() ? '📁' : '📄';
          return `${type} ${file.name}`;
        }).join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `**Directory Contents**\n\nPath: ${dirPath}\n\nFiles:\n${fileList}`
            }
          ]
        };
      
      case 'get_file_info':
        if (!filePath) {
          throw new Error('filePath is required');
        }
        const stats = await fs.stat(filePath);
        const info = {
          path: filePath,
          size: stats.size,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          created: stats.birthtime,
          modified: stats.mtime,
          accessed: stats.atime
        };
        
        return {
          content: [
            {
              type: 'text',
              text: `**File Information**\n\n${JSON.stringify(info, null, 2)}`
            }
          ]
        };
      
      default:
        throw new Error(`Unknown file tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`File operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
