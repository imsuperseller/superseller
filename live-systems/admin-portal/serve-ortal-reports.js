#!/usr/bin/env node

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SIMPLE WEB SERVER FOR ORTAL'S REPORTS
 * 
 * This creates a local web server to serve Ortal's reports
 * so they can be accessed via web browser
 */

class OrtalReportServer {
  constructor() {
    this.port = 8080;
    this.reportsDir = path.join(__dirname, '../data/ortal-deliverables');
    this.server = null;
  }

  async start() {
    console.log('🌐 Starting Ortal Reports Server...\n');
    
    this.server = http.createServer(async (req, res) => {
      try {
        await this.handleRequest(req, res);
      } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });

    this.server.listen(this.port, () => {
      console.log('✅ Ortal Reports Server is running!');
      console.log(`🌐 Local URL: http://localhost:${this.port}`);
      console.log(`🌐 Network URL: http://173.254.201.134:${this.port}`);
      console.log('\n📁 Available Reports:');
      console.log(`   📊 Dashboard: http://localhost:${this.port}/ortal-dashboard.html`);
      console.log(`   👥 Leads Table: http://localhost:${this.port}/ortal-leads-table.html`);
      console.log(`   🎯 Audiences Table: http://localhost:${this.port}/ortal-audiences-table.html`);
      console.log(`   📋 Summary Report: http://localhost:${this.port}/ortal-summary-report.md`);
      console.log(`   📊 Leads CSV: http://localhost:${this.port}/ortal-leads.csv`);
      console.log(`   🎯 Audiences CSV: http://localhost:${this.port}/ortal-custom-audiences.csv`);
      console.log('\n💡 Share the Network URL with Ortal to access from anywhere!');
      console.log('\n⏹️  Press Ctrl+C to stop the server\n');
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      this.server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
      });
    });
  }

  async handleRequest(req, res) {
    const url = req.url;
    
    // Default to dashboard
    if (url === '/' || url === '/index.html') {
      return this.serveFile(res, 'ortal-dashboard.html');
    }

    // Handle specific files
    const fileName = url.substring(1); // Remove leading slash
    const filePath = path.join(this.reportsDir, fileName);

    try {
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        await this.serveFile(res, fileName);
      } else {
        this.serveDirectory(res, url);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.serve404(res, url);
      } else {
        throw error;
      }
    }
  }

  async serveFile(res, fileName) {
    const filePath = path.join(this.reportsDir, fileName);
    const ext = path.extname(fileName).toLowerCase();
    
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.csv': 'text/csv',
      '.md': 'text/markdown',
      '.txt': 'text/plain'
    }[ext] || 'application/octet-stream';

    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      
      res.end(content);
    } catch (error) {
      console.error(`Error reading file ${fileName}:`, error);
      this.serve404(res, fileName);
    }
  }

  async serveDirectory(res, url) {
    try {
      const dirPath = path.join(this.reportsDir, url.substring(1));
      const files = await fs.readdir(dirPath);
      
      const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Ortal Reports Directory</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #fe3d51; }
        .file-list { margin: 20px 0; }
        .file-item { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .file-item a { color: #1eaef7; text-decoration: none; font-weight: bold; }
        .file-item a:hover { text-decoration: underline; }
        .file-size { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>🎯 Ortal's Facebook Lead Generation Reports</h1>
    <p>Generated on: ${new Date().toLocaleDateString()}</p>
    
    <div class="file-list">
        <h2>📁 Available Files:</h2>
        ${files.map(file => {
          const fileUrl = `${url}/${file}`;
          const isHtml = file.endsWith('.html');
          const isCsv = file.endsWith('.csv');
          const isMd = file.endsWith('.md');
          
          let icon = '📄';
          if (isHtml) icon = '🌐';
          if (isCsv) icon = '📊';
          if (isMd) icon = '📋';
          
          return `<div class="file-item">
            ${icon} <a href="${fileUrl}">${file}</a>
            <span class="file-size">(${this.getFileSize(file)})</span>
          </div>`;
        }).join('')}
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-radius: 10px;">
        <h3>🚀 Quick Start:</h3>
        <p><strong>1.</strong> Start with <a href="${url}/ortal-dashboard.html">ortal-dashboard.html</a> for the main overview</p>
        <p><strong>2.</strong> Download <a href="${url}/ortal-leads.csv">ortal-leads.csv</a> for all 5,548 leads</p>
        <p><strong>3.</strong> Use <a href="${url}/ortal-custom-audiences.csv">ortal-custom-audiences.csv</a> for Facebook Ads</p>
    </div>
</body>
</html>`;
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      this.serve404(res, url);
    }
  }

  getFileSize(fileName) {
    const filePath = path.join(this.reportsDir, fileName);
    try {
      const stats = fs.statSync(filePath);
      const bytes = stats.size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } catch {
      return 'Unknown';
    }
  }

  serve404(res, url) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>404 - File Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
        h1 { color: #fe3d51; }
        .back-link { margin: 20px; }
        .back-link a { color: #1eaef7; text-decoration: none; }
    </style>
</head>
<body>
    <h1>404 - File Not Found</h1>
    <p>The file <strong>${url}</strong> was not found.</p>
    <div class="back-link">
        <a href="/">← Back to Ortal's Reports</a>
    </div>
</body>
</html>`;
    
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

async function main() {
  const server = new OrtalReportServer();
  await server.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
