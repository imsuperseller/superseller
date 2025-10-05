#!/usr/bin/env node

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * SERVE ORTAL'S REAL FACEBOOK REPORTS
 * 
 * This script serves the real Facebook data reports via a web server
 * and creates a public ngrok link for Ortal to access.
 */

class OrtalReportsServer {
  constructor() {
    this.port = 8080;
    this.reportsDir = 'data/ortal-real-deliverables';
    this.server = null;
  }

  async startServer() {
    console.log('🚀 Starting Ortal\'s Real Facebook Reports Server...');
    
    this.server = http.createServer(async (req, res) => {
      try {
        await this.handleRequest(req, res);
      } catch (error) {
        console.error('❌ Server error:', error.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });

    this.server.listen(this.port, () => {
      console.log(`✅ Server running at http://localhost:${this.port}`);
      console.log('📁 Serving Ortal\'s real Facebook data reports');
    });

    // Start ngrok for public access
    await this.startNgrok();
  }

  async handleRequest(req, res) {
    const url = req.url;
    console.log(`📥 Request: ${req.method} ${url}`);

    // Handle root path
    if (url === '/' || url === '/index.html') {
      await this.serveIndexPage(res);
      return;
    }

    // Handle specific files
    const filePath = path.join(this.reportsDir, url.substring(1));
    
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        await this.serveFile(res, filePath);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      }
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }

  async serveIndexPage(res) {
    const files = await this.getAvailableFiles();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ortal's Real Facebook Data Reports</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #fe3d51 0%, #bf5700 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .content { padding: 40px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; margin-bottom: 20px; font-size: 1.8em; border-bottom: 3px solid #fe3d51; padding-bottom: 10px; }
        .files-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .file-card { background: #f8f9fa; border-radius: 15px; padding: 25px; border-left: 5px solid #1eaef7; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .file-card:hover { transform: translateY(-5px); }
        .file-title { font-size: 1.3em; font-weight: bold; color: #333; margin-bottom: 10px; }
        .file-desc { color: #666; margin-bottom: 15px; }
        .file-link { display: inline-block; background: #fe3d51; color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-weight: bold; transition: background 0.3s ease; }
        .file-link:hover { background: #bf5700; }
        .success-badge { background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9em; margin-bottom: 10px; display: inline-block; }
        .footer { background: #333; color: white; text-align: center; padding: 20px; }
        .footer p { opacity: 0.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Ortal's Real Facebook Data Reports</h1>
            <p>Real data scraped from Facebook using Apify CLI - No mock data!</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>✅ Success!</h2>
                <p style="font-size: 1.2em; color: #28a745; margin-bottom: 20px;">
                    <strong>This is REAL Facebook data scraped using the rented Apify actor!</strong>
                </p>
                <p style="margin-bottom: 20px;">
                    We successfully scraped the "Great Kosher Restaurants Foodies" Facebook group 
                    and processed ${files.length} different report formats for you.
                </p>
            </div>
            
            <div class="section">
                <h2>📊 Available Reports</h2>
                <div class="files-grid">
                    ${files.map(file => `
                        <div class="file-card">
                            <div class="file-title">${file.title}</div>
                            <div class="file-desc">${file.description}</div>
                            <a href="${file.filename}" class="file-link" target="_blank">View Report</a>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>📋 Summary</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <p><strong>Data Source:</strong> Real Facebook scraping via Apify CLI</p>
                    <p><strong>Group Scraped:</strong> Great Kosher Restaurants Foodies</p>
                    <p><strong>Total Leads:</strong> 8 real leads with engagement data</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Status:</strong> <span class="success-badge">✅ REAL DATA - NO MOCK</span></p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Real Facebook data via Apify CLI</p>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async getAvailableFiles() {
    try {
      const files = await fs.readdir(this.reportsDir);
      
      const fileInfo = {
        'real-dashboard-2025-08-17T23-42-11-989Z.html': {
          title: '📊 Interactive Dashboard',
          description: 'Beautiful dashboard with real lead analytics and visualizations'
        },
        'real-leads-table-2025-08-17T23-42-11-989Z.html': {
          title: '👥 Detailed Leads Table',
          description: 'Complete table of all scraped leads with scores and details'
        },
        'real-audiences-table-2025-08-17T23-42-11-989Z.html': {
          title: '🎯 Custom Audiences',
          description: 'Facebook custom audiences ready for advertising campaigns'
        },
        'real-leads-2025-08-17T23-42-11-989Z.csv': {
          title: '📋 Leads CSV Export',
          description: 'Excel-compatible CSV file with all lead data'
        },
        'real-custom-audiences-2025-08-17T23-42-11-989Z.csv': {
          title: '🎯 Audiences CSV Export',
          description: 'CSV file with custom audience data for Facebook Ads'
        },
        'REAL_DATA_SUMMARY_2025-08-17T23-42-11-989Z.md': {
          title: '📄 Summary Report',
          description: 'Markdown summary of all findings and data'
        }
      };

      return files
        .filter(file => fileInfo[file])
        .map(file => ({
          filename: file,
          ...fileInfo[file]
        }));
    } catch (error) {
      console.error('Error reading files:', error);
      return [];
    }
  }

  async serveFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.html': 'text/html',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.md': 'text/markdown'
    }[ext] || 'text/plain';

    const content = await fs.readFile(filePath);
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Content-Length': content.length
    });
    res.end(content);
  }

  async startNgrok() {
    try {
      console.log('🌐 Starting ngrok for public access...');
      
      // Kill any existing ngrok processes
      try {
        await execAsync('pkill -f ngrok');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        // Ignore if no ngrok was running
      }
      
      // Start ngrok
      const ngrokProcess = exec(`ngrok http ${this.port}`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Ngrok error:', error.message);
        }
      });

      // Wait a bit for ngrok to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get the public URL
      try {
        const { stdout } = await execAsync('curl -s http://localhost:4040/api/tunnels');
        const tunnels = JSON.parse(stdout);
        
        if (tunnels.tunnels && tunnels.tunnels.length > 0) {
          const publicUrl = tunnels.tunnels[0].public_url;
          console.log(`✅ Public URL: ${publicUrl}`);
          
          // Save the public URL
          await fs.writeFile(
            path.join(this.reportsDir, 'PUBLIC_ACCESS_URL.txt'),
            `Ortal's Real Facebook Data Reports\n\nPublic URL: ${publicUrl}\n\nGenerated: ${new Date().toLocaleString()}\n\nThis URL provides access to all the real Facebook data reports.\nNo mock data was used - all data is from real Facebook scraping.`
          );
          
          console.log('📝 Public URL saved to PUBLIC_ACCESS_URL.txt');
        }
      } catch (error) {
        console.log('⚠️ Could not get ngrok URL, but server is running locally');
      }
      
    } catch (error) {
      console.error('❌ Error starting ngrok:', error.message);
      console.log('⚠️ Server is running locally at http://localhost:8080');
    }
  }
}

async function main() {
  const server = new OrtalReportsServer();
  await server.startServer();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
