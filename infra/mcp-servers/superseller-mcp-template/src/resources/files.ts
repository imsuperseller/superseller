/**
 * File Resources
 * Demonstrates resource implementation
 */

import { promises as fs } from 'fs';
import path from 'path';

export const fileResources = [
  {
    uri: 'file:///tmp/example.txt',
    name: 'Example Text File',
    description: 'An example text file for demonstration',
    mimeType: 'text/plain'
  },
  {
    uri: 'file:///tmp/example.json',
    name: 'Example JSON File',
    description: 'An example JSON file for demonstration',
    mimeType: 'application/json'
  }
];

export async function readFileResource(uri: string) {
  if (!uri.startsWith('file://')) {
    throw new Error('Invalid file URI - must start with file://');
  }
  
  try {
    const filePath = uri.replace('file://', '');
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Determine MIME type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'text/plain';
    
    switch (ext) {
      case '.json':
        mimeType = 'application/json';
        break;
      case '.html':
        mimeType = 'text/html';
        break;
      case '.css':
        mimeType = 'text/css';
        break;
      case '.js':
        mimeType = 'application/javascript';
        break;
      case '.md':
        mimeType = 'text/markdown';
        break;
      default:
        mimeType = 'text/plain';
    }
    
    return {
      contents: [
        {
          uri,
          mimeType,
          text: content
        }
      ]
    };
  } catch (error) {
    throw new Error(`Failed to read file resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
